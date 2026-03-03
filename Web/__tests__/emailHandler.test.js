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

// simple res mock for express-style handlers (req, res)
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
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

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ ok: false, error: "Use POST" });
  });

  test("returns 400 if missing fields", async () => {
    const req = { method: "POST", body: { to: "", subject: "", message: "" } };
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ ok: false, error: "Missing fields" });
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

    expect(sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: "to@example.com",
      subject: "Hello",
      text: "Test message",
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, messageId: "abc123" });
  });

  test("returns 500 when nodemailer throws (no noisy console)", async () => {
    // ✅ Silence console.error for THIS test only
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
    expect(res.json).toHaveBeenCalledWith({ ok: false, error: "fail" });

    consoleSpy.mockRestore();
  });
});