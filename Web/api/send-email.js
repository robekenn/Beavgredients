const nodemailer = require("nodemailer");

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Use POST" });
  }

  try {
    const { to, subject, message, html } = req.body ?? {};

    if (!to || !subject || (!message && !html)) {
      return res.status(400).json({
        ok: false,
        error: "Missing fields: to, subject, and message or html",
      });
    }

    // NOTE: For Gmail, you usually need an App Password (not your normal password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: message || undefined,
      html: html ? String(html) : message ? `<pre>${escapeHtml(message)}</pre>` : undefined,
    });

    return res.status(200).json({
      ok: true,
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("send-email error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
};