// All transactional email goes through Resend (https://resend.com — free
// tier: 100 emails/day, 3,000/month, no credit card required).
//
// Required env vars:
//   RESEND_API_KEY   — from the Resend dashboard
//   EMAIL_FROM       — must be on a domain you've verified in Resend,
//                      e.g. "They Code It <no-reply@theycodeit.com>".
//                      Until you verify a domain, Resend only lets you send
//                      to your own account's email address — fine for
//                      testing, not for real users.
//
// NOTE on password reset / email confirmation: those emails are sent
// directly by Supabase Auth (not by this module) when the frontend calls
// supabase.auth.resetPasswordForEmail() / signUp(). Supabase's default
// email sending is rate-limited and not meant for production. Before
// going live, go to Supabase Dashboard -> Authentication -> Emails -> SMTP
// Settings and plug in Resend's SMTP credentials there too, so *all*
// outgoing auth email (not just the ones this file sends) is reliable.
//
// If RESEND_API_KEY is not set, every function here logs to the console
// and resolves without throwing — so the rest of the app keeps working in
// local dev without an email provider configured.

let resendClient = null;
if (process.env.RESEND_API_KEY) {
  const { Resend } = require('resend');
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM || 'They Code It <no-reply@example.com>';

async function send({ to, subject, html }) {
  if (!resendClient) {
    console.log(`[email:skipped — RESEND_API_KEY not set] to=${to} subject="${subject}"`);
    return { skipped: true };
  }
  try {
    const { data, error } = await resendClient.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('Resend send error:', error.message || error);
      return { skipped: false, error };
    }
    return { skipped: false, data };
  } catch (e) {
    // Never let an email failure break the underlying request (enrollment
    // approval, payment confirmation, etc. must still succeed even if the
    // notification email doesn't go out).
    console.error('Email send threw:', e.message);
    return { skipped: false, error: e };
  }
}

function wrap(title, bodyHtml) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color:#0f172a; margin-bottom: 16px;">${title}</h2>
      <div style="color:#334155; font-size: 15px; line-height: 1.6;">${bodyHtml}</div>
      <p style="color:#94a3b8; font-size: 12px; margin-top: 32px;">They Code It — Computer Academy</p>
    </div>
  `;
}

async function sendEnrollmentApproved({ to, studentName, courseTitle }) {
  return send({
    to,
    subject: 'Your enrollment has been approved',
    html: wrap('Enrollment Approved', `
      <p>Hi ${studentName},</p>
      <p>Your enrollment in <strong>${courseTitle}</strong> has been approved. You can log in to your student dashboard to see batch details and next steps.</p>
    `),
  });
}

async function sendPaymentConfirmed({ to, studentName, courseTitle, amount, transactionRef }) {
  return send({
    to,
    subject: 'Payment received',
    html: wrap('Payment Confirmed', `
      <p>Hi ${studentName},</p>
      <p>We've received your payment of <strong>Rs ${Number(amount).toLocaleString()}</strong> for <strong>${courseTitle}</strong>.</p>
      ${transactionRef ? `<p>Reference: ${transactionRef}</p>` : ''}
      <p>You can view or print your voucher from your student dashboard.</p>
    `),
  });
}

async function sendInstructorWelcome({ to, name, tempPassword }) {
  return send({
    to,
    subject: 'Your instructor account has been created',
    html: wrap('Welcome to They Code It', `
      <p>Hi ${name},</p>
      <p>An instructor account has been created for you.</p>
      <p><strong>Email:</strong> ${to}<br/><strong>Temporary password:</strong> ${tempPassword}</p>
      <p>Please log in and change this password as soon as possible.</p>
    `),
  });
}

module.exports = { send, sendEnrollmentApproved, sendPaymentConfirmed, sendInstructorWelcome };