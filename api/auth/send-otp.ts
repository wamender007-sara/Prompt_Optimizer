import crypto from 'crypto';
import nodemailer from 'nodemailer';

const OTP_SECRET = process.env.OTP_SECRET || 'prompt-optimizer-enterprise-hmac-secret-2026';

function createVerificationToken(email: string, otp: string, expiresAt: number): string {
  const hmac = crypto
    .createHmac('sha256', OTP_SECRET)
    .update(`${email.toLowerCase().trim()}:${otp.trim()}:${expiresAt}`)
    .digest('hex');
  return `${expiresAt}.${hmac}`;
}

async function sendOtpEmail(
  toEmail: string,
  otp: string,
  purpose: 'signup' | 'reset' = 'reset',
  userName?: string,
  overrideSmtp?: { gmailUser?: string; gmailAppPassword?: string }
): Promise<{ sent: boolean; error?: string }> {
  const rawUser = overrideSmtp?.gmailUser || process.env.GMAIL_USER || process.env.SMTP_USER || '';
  const rawPass = overrideSmtp?.gmailAppPassword || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '';

  const gmailUser = rawUser.trim();
  const gmailPass = rawPass.replace(/\s+/g, '');

  const isPlaceholder =
    !gmailUser ||
    !gmailPass ||
    gmailUser.includes('your_email') ||
    gmailPass.includes('your_16_character');

  if (isPlaceholder) {
    console.log(`[AUTH] Generated 6-digit ${purpose.toUpperCase()} OTP for ${toEmail}: ${otp} (SMTP not configured)`);
    return { sent: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const isSignup = purpose === 'signup';
    const subject = isSignup
      ? `Welcome to PromptOptimizer — Your Sign-Up Verification Code: ${otp}`
      : `Your PromptOptimizer Verification Code: ${otp}`;

    const subtitle = isSignup
      ? 'New Account Sign-Up Verification Code'
      : 'Password Reset Verification Code';

    const greeting = userName ? `Hi ${userName},` : 'Hello,';
    const bodyInstruction = isSignup
      ? 'Enter this 6-digit verification code on the PromptOptimizer Sign-Up screen to verify your Gmail address and activate your workspace.'
      : 'Enter this code on the PromptOptimizer verification screen to reset your password and access your workspace.';

    await transporter.sendMail({
      from: `"PromptOptimizer Security" <${gmailUser}>`,
      to: toEmail,
      subject,
      text: `${greeting}\n\nYour 6-digit verification code is: ${otp}.\n\n${bodyInstruction}\n\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">PromptOptimizer</h1>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">${subtitle}</p>
          </div>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #334155; font-size: 14px; margin: 0 0 16px 0;">${greeting} Here is your single-use 6-digit verification code:</p>
            <div style="font-size: 36px; font-weight: 900; font-family: monospace; letter-spacing: 10px; color: #1e1b4b; background: #ffffff; padding: 14px 24px; border-radius: 10px; display: inline-block; border: 2px solid #6366f1;">
              ${otp}
            </div>
            <p style="color: #e11d48; font-size: 12px; margin: 16px 0 0 0; font-weight: 600;">Expires in 10 minutes</p>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0;">
            ${bodyInstruction} If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `
    });
    return { sent: true };
  } catch (err: any) {
    console.error('[AUTH] Email error:', err);
    return { sent: false, error: err?.message || 'SMTP_ERROR' };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { email, purpose, name, smtpUser, smtpPass } = req.body || {};
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid Gmail address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const authPurpose: 'signup' | 'reset' = purpose === 'signup' ? 'signup' : 'reset';
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const verificationToken = createVerificationToken(cleanEmail, generatedOtp, expiresAt);

    const dispatchResult = await sendOtpEmail(
      cleanEmail,
      generatedOtp,
      authPurpose,
      name,
      smtpUser && smtpPass ? { gmailUser: smtpUser, gmailAppPassword: smtpPass } : undefined
    );

    return res.status(200).json({
      success: true,
      purpose: authPurpose,
      emailSent: dispatchResult.sent,
      smtpStatus: dispatchResult.sent ? 'sent_to_gmail' : (dispatchResult.error || 'smtp_not_configured'),
      fallbackOtp: dispatchResult.sent ? undefined : generatedOtp,
      verificationToken,
      message: dispatchResult.sent
        ? `A 6-digit verification code has been delivered to ${cleanEmail}. Please check your Gmail inbox.`
        : `Gmail SMTP is not configured yet. Configure your Google App Password or use the instant verification code to complete ${authPurpose === 'signup' ? 'sign up' : 'verification'}.`,
      expiresInSeconds: 600
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to send verification code.' });
  }
}
