/**
 * @file __tests__/emailHandler.test.js
 *
 * Tests for Web/api/send-email.js (Vercel serverless function style)
 */

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

const nodemailer = require("nodemailer");
const handler = require("../api/send-email.js");

// simple res mock for express/next-style handlers (req, res)
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res); // ✅ add this for current handler
  return res;
}

describe("api/send-email.js", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.SMTP_USER = "smtp_user";
    process.env.SMTP_PASS = "smtp_pass";
    process.env.EMAIL_FROM = "from@example.com";
  });

  test("returns 405 for non-POST", async () => {
    const req = { method: "GET", body: {} };
    const res = mockRes();

    await handler(req, res);

    // If your handler calls setHeader, verify it safely
    expect(res.setHeader).toHaveBeenCalledWith("Allow", "POST");
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ ok: false, error: "Use POST" });
  });

  test("returns 400 if missing fields", async () => {
    const req = { method: "POST", body: { to: "", subject: "", message: "" } };
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    // ✅ Allow either the old message OR the newer detailed message
    const payload = res.json.mock.calls[0][0];
    expect(payload.ok).toBe(false);
    expect(payload.error).toMatch(/^Missing fields/);
  });

  test("returns 200 when email sends", async () => {
    const sendMail = jest.fn().mockResolvedValue({ messageId: "abc123" });
    nodemailer.createTransport.mockReturnValue({ sendMail });

    const req = {
      method: "POST",
      body: {
        to: "to@example.com",
        subject: "Hello",
        message: "Test message",
      },
    };
    const res = mockRes();

    await handler(req, res);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ Your current handler might include html as well (fallback or explicit)
    const mailArg = sendMail.mock.calls[0][0];

    expect(mailArg).toMatchObject({
      from: process.env.EMAIL_FROM,
      to: "to@example.com",
      subject: "Hello",
      text: "Test message",
    });

    // If your handler adds HTML fallback, accept it (don’t require it)
    // Uncomment if you WANT to assert it:
    // expect(mailArg.html).toBeDefined();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, messageId: "abc123" });
  });

  test("returns 500 when nodemailer throws (no noisy console)", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const sendMail = jest.fn().mockRejectedValue(new Error("fail"));
    nodemailer.createTransport.mockReturnValue({ sendMail });

    const req = {
      method: "POST",
      body: {
        to: "to@example.com",
        subject: "Hello",
        message: "Test message",
      },
    };
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    const payload = res.json.mock.calls[0][0];
    expect(payload).toEqual({ ok: false, error: "fail" });

    consoleSpy.mockRestore();
  });
});