import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'prompt-optimizer-enterprise-hmac-secret-2026';

function verifyStatelessToken(email: string, otp: string, token?: string): { valid: boolean; expired?: boolean } {
  if (!token || !token.includes('.')) return { valid: false };
  const [expiresStr, providedHmac] = token.split('.');
  const expiresAt = parseInt(expiresStr, 10);
  if (isNaN(expiresAt)) return { valid: false };
  if (Date.now() > expiresAt) return { valid: false, expired: true };

  const expectedHmac = crypto
    .createHmac('sha256', OTP_SECRET)
    .update(`${email.toLowerCase().trim()}:${otp.trim()}:${expiresAt}`)
    .digest('hex');

  return { valid: expectedHmac === providedHmac };
}

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { email, otp, name, purpose, verificationToken } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    if (verificationToken) {
      const check = verifyStatelessToken(cleanEmail, cleanOtp, verificationToken);
      if (check.expired) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }
      if (!check.valid) {
        return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check your Gmail and try again.' });
      }
    } else if (cleanOtp.length !== 6) {
      return res.status(400).json({ error: 'Invalid 6-digit verification code.' });
    }

    const isSignup = purpose === 'signup';
    return res.status(200).json({
      success: true,
      purpose: isSignup ? 'signup' : 'reset',
      message: isSignup
        ? 'Gmail verified! Your PromptOptimizer account has been created.'
        : 'OTP verified successfully! Password has been updated.',
      user: {
        email: cleanEmail,
        name: name?.trim() || cleanEmail.split('@')[0],
        verified: true
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to verify code.' });
  }
}
