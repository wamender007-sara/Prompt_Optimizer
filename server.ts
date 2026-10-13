import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { compilePrompts, executeTestDrive } from './src/engine/compiler';
import { PRESET_SCENARIOS } from './src/data/presets';
import { PromptSlot, CompressionMode } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 3001;
const OTP_SECRET = process.env.OTP_SECRET || 'prompt-optimizer-enterprise-hmac-secret-2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    engine: 'PromptOptimizer Multi-Platform Compiler v2.0',
    timestamp: new Date().toISOString(),
    supportedPlatforms: ['chatgpt', 'claude', 'gemini', 'cursor', 'deepseek', 'custom'],
    compressionModes: [
      'production_balanced',
      'ultra_distilled',
      'structured_xml',
      'target_gemini',
      'target_claude',
      'target_chatgpt',
      'target_cursor',
      'target_deepseek'
    ]
  });
});

// Presets API
app.get('/api/presets', (_req: Request, res: Response) => {
  res.json({ presets: PRESET_SCENARIOS });
});

// Analyze & Compile API
app.post('/api/analyze-and-compile', (req: Request, res: Response) => {
  try {
    const { slots, mode } = req.body as { slots: PromptSlot[]; mode?: CompressionMode };
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'Missing or invalid "slots" array in request body.' });
    }

    const synthesis = compilePrompts(slots, mode || 'production_balanced');
    return res.json(synthesis);
  } catch (error: any) {
    console.error('Compilation error:', error);
    return res.status(500).json({ error: error?.message || 'Internal synthesis failure' });
  }
});

// In-memory OTP storage with timestamp
const otpStore: Record<string, { otp: string; expiresAt: number; purpose?: string }> = {};

// Cryptographic HMAC helper for stateless verification
function createVerificationToken(email: string, otp: string, expiresAt: number): string {
  const hmac = crypto
    .createHmac('sha256', OTP_SECRET)
    .update(`${email.toLowerCase().trim()}:${otp.trim()}:${expiresAt}`)
    .digest('hex');
  return `${expiresAt}.${hmac}`;
}

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

// Local server file storage for user histories and registered users
const DATA_DIR = path.join(__dirname, '.data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // ignore if read-only fs
  }
}
const USER_HISTORY_FILE = path.join(DATA_DIR, 'user_history.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

interface RegisteredUser {
  email: string;
  name?: string;
  passwordHash: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

function hashPassword(password: string): string {
  return crypto.createHmac('sha256', OTP_SECRET).update(password).digest('hex');
}

function readRegisteredUsers(): Record<string, RegisteredUser> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }
  return {};
}

function writeRegisteredUsers(data: Record<string, RegisteredUser>) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

function readUserHistories(): Record<string, any[]> {
  try {
    if (fs.existsSync(USER_HISTORY_FILE)) {
      const raw = fs.readFileSync(USER_HISTORY_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading user history file:', err);
  }
  return {};
}

function writeUserHistories(data: Record<string, any[]>) {
  try {
    fs.writeFileSync(USER_HISTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing user history file:', err);
  }
}

// Send real OTP email to user's Gmail (for both Sign-Up and Password Reset)
async function sendOtpEmail(toEmail: string, otp: string, purpose: 'signup' | 'reset' = 'reset', userName?: string): Promise<boolean> {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  const isSignup = purpose === 'signup';
  console.log(`[AUTH] 📧 Dispatched 6-digit ${isSignup ? 'SIGN-UP' : 'PASSWORD RESET'} OTP for ${toEmail}: ${otp}`);

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

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
        text: `${greeting}\n\nYour 6-digit verification code is: ${otp}.\n\n${bodyInstruction}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
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

      console.log(`[AUTH] ✅ Email successfully sent via Gmail SMTP to ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error(`[AUTH] ❌ Failed to dispatch email via Gmail SMTP:`, err?.message || err);
      return false;
    }
  } else {
    console.log(`[AUTH] 💡 Notice: GMAIL_USER and GMAIL_APP_PASSWORD are not set in .env. Add them to .env to enable direct Gmail inbox delivery.`);
    return false;
  }
}

// 1. Send OTP to Gmail (Supports both Sign-Up and Password Reset)
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { email, purpose, name } = req.body as {
      email?: string;
      purpose?: 'signup' | 'reset';
      name?: string;
    };

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid Gmail address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const authPurpose: 'signup' | 'reset' = purpose === 'signup' ? 'signup' : 'reset';
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore[cleanEmail] = { otp: generatedOtp, expiresAt, purpose: authPurpose };
    const verificationToken = createVerificationToken(cleanEmail, generatedOtp, expiresAt);

    // Dispatch real email via Gmail SMTP in background
    sendOtpEmail(cleanEmail, generatedOtp, authPurpose, name).catch(err => {
      console.error('[AUTH] Background email send error:', err?.message || err);
    });

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      purpose: authPurpose,
      verificationToken,
      message: authPurpose === 'signup'
        ? `A 6-digit sign-up verification code has been dispatched to ${cleanEmail}. Please check your Gmail inbox.`
        : `A 6-digit OTP verification code has been dispatched to ${cleanEmail}. Please check your Gmail inbox.`,
      expiresInSeconds: 600
    });
  } catch (err: any) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: err?.message || 'Failed to send verification code.' });
  }
});

// 2. Verify OTP (Supports both Sign-Up Account Creation and Password Reset)
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, name, purpose, verificationToken } = req.body as {
      email?: string;
      otp?: string;
      newPassword?: string;
      name?: string;
      purpose?: 'signup' | 'reset';
      verificationToken?: string;
    };

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();
    const record = otpStore[cleanEmail];

    let isVerified = false;

    // Check in-memory store first
    if (record) {
      if (Date.now() > record.expiresAt) {
        delete otpStore[cleanEmail];
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }
      if (record.otp === cleanOtp) {
        isVerified = true;
        delete otpStore[cleanEmail];
      }
    }

    // Fallback to cryptographic stateless verification token (for serverless environments)
    if (!isVerified && verificationToken) {
      const tokenCheck = verifyStatelessToken(cleanEmail, cleanOtp, verificationToken);
      if (tokenCheck.expired) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }
      if (tokenCheck.valid) {
        isVerified = true;
      }
    }

    if (!isVerified) {
      return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check your Gmail and try again.' });
    }

    // Persist user account in .data/users.json
    const users = readRegisteredUsers();
    const now = new Date().toISOString();
    const existing = users[cleanEmail];

    users[cleanEmail] = {
      email: cleanEmail,
      name: name?.trim() || existing?.name || cleanEmail.split('@')[0],
      passwordHash: newPassword ? hashPassword(newPassword) : (existing?.passwordHash || ''),
      verified: true,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    writeRegisteredUsers(users);

    const isSignup = purpose === 'signup' || record?.purpose === 'signup';

    return res.json({
      success: true,
      purpose: isSignup ? 'signup' : 'reset',
      message: isSignup
        ? 'Gmail verified! Your PromptOptimizer account has been created.'
        : 'OTP verified successfully! Password has been updated.',
      user: {
        email: cleanEmail,
        name: users[cleanEmail].name,
        verified: true
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to verify code.' });
  }
});

// 3. User-Specific History API (Local Server / Cloud Server Persistence)
app.get('/api/history', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string || 'default_user').toLowerCase().trim();
    const allHistories = readUserHistories();
    const userHistory = allHistories[userId] || [];
    return res.json({ userId, history: userHistory });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch user history' });
  }
});

app.post('/api/history', (req: Request, res: Response) => {
  try {
    const { userId, history } = req.body as { userId?: string; history?: any[] };
    if (!userId || !Array.isArray(history)) {
      return res.status(400).json({ error: 'Invalid userId or history array' });
    }

    const cleanUserId = userId.toLowerCase().trim();
    const allHistories = readUserHistories();
    allHistories[cleanUserId] = history.slice(0, 30); // Store up to 30 runs per user
    writeUserHistories(allHistories);

    // Set cookie for browser persistence
    res.cookie('prompt_user_id', cleanUserId, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: false });

    return res.json({ success: true, savedRuns: history.length, userId: cleanUserId });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save user history' });
  }
});

// Test Drive API
app.post('/api/test-drive', (req: Request, res: Response) => {
  try {
    const { masterPrompt, testPayload, mode } = req.body as {
      masterPrompt: string;
      testPayload: string;
      mode?: CompressionMode;
    };

    if (!masterPrompt) {
      return res.status(400).json({ error: 'Missing "masterPrompt" string in request body.' });
    }

    const result = executeTestDrive(masterPrompt, testPayload || '', mode || 'production_balanced');
    return res.json(result);
  } catch (error: any) {
    console.error('Test drive execution error:', error);
    return res.status(500).json({ error: error?.message || 'Test drive execution failure' });
  }
});

// Static File Serving for built React frontend
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

// 404 handler for API routes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🚀 PromptOptimizer Multi-Platform Compiler Server active!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`========================================================\n`);
});
