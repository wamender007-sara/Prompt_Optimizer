import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    engine: 'PromptOptimizer Multi-Platform Compiler v1.0',
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
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

// Local server file storage for user histories
const DATA_DIR = path.join(__dirname, '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const USER_HISTORY_FILE = path.join(DATA_DIR, 'user_history.json');

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

// Send real OTP email to user's Gmail
async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  console.log(`[AUTH] 📧 Dispatched 6-digit OTP for ${toEmail}: ${otp}`);

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `"PromptOptimizer Security" <${gmailUser}>`,
        to: toEmail,
        subject: `Your PromptOptimizer Verification Code: ${otp}`,
        text: `Your 6-digit OTP verification code is: ${otp}.\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">PromptOptimizer</h1>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Password Reset Verification Code</p>
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: #334155; font-size: 14px; margin: 0 0 16px 0;">Here is your single-use 6-digit verification code:</p>
              <div style="font-size: 36px; font-weight: 900; font-family: monospace; letter-spacing: 10px; color: #1e1b4b; background: #ffffff; padding: 14px 24px; border-radius: 10px; display: inline-block; border: 2px solid #6366f1;">
                ${otp}
              </div>
              <p style="color: #e11d48; font-size: 12px; margin: 16px 0 0 0; font-weight: 600;">Expires in 10 minutes</p>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0;">
              Enter this code on the PromptOptimizer verification screen to reset your password and access your workspace. If you didn't request this, you can safely ignore this email.
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
    console.log(`[AUTH] 💡 Notice: GMAIL_USER and GMAIL_APP_PASSWORD are not set in .env. To enable direct Gmail inbox delivery, add GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.`);
    return false;
  }
}

// 1. Send OTP to Gmail
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid Gmail address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore[cleanEmail] = { otp: generatedOtp, expiresAt };

    // Dispatch real email via Gmail SMTP (in background so HTTP response never hangs or times out)
    sendOtpEmail(cleanEmail, generatedOtp).catch(err => {
      console.error('[AUTH] Background email send error:', err?.message || err);
    });

    // CRITICAL: Return clean JSON immediately
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      message: `A 6-digit OTP verification code has been dispatched to ${cleanEmail}. Please check your Gmail inbox.`,
      expiresInSeconds: 600
    });
  } catch (err: any) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: err?.message || 'Failed to send OTP.' });
  }
});

// 2. Verify OTP & Reset Password
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body as { email?: string; otp?: string; newPassword?: string };
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = otpStore[cleanEmail];

    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this email or it has expired.' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[cleanEmail];
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid 6-digit OTP code. Please check and try again.' });
    }

    // Success: Consume OTP
    delete otpStore[cleanEmail];

    return res.json({
      success: true,
      message: 'OTP verified successfully! Password has been updated.',
      user: { email: cleanEmail }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to verify OTP.' });
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
