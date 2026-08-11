const { Resend } = require("resend");

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "notifications@sunlo.app";

const resend = apiKey ? new Resend(apiKey) : null;

async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn("Resend not configured; email skipped.", { to, subject });
    return null;
  }
  if (!to || !subject || !html) {
    throw new Error("to, subject, and html are required");
  }
  try {
    const result = await resend.emails.send({ from: fromEmail, to, subject, html });
    return result;
  } catch (err) {
    console.error("Resend send error:", err);
    throw err;
  }
}

module.exports = { sendEmail, fromEmail };
