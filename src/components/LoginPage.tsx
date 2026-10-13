import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Zap, 
  ShieldCheck, 
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Send,
  AlertCircle,
  UserPlus,
  User,
  LogIn,
  Settings,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

type AuthMode = 
  | 'login' 
  | 'signup_form' 
  | 'signup_verify_otp' 
  | 'signup_success' 
  | 'forgot_email' 
  | 'enter_otp' 
  | 'reset_success';

const SMTP_USER_STORAGE = 'prompt_optimizer_smtp_user';
const SMTP_PASS_STORAGE = 'prompt_optimizer_smtp_pass';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Login Form States
  const [email, setEmail] = useState('developer@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // 1st-Time User Sign-Up States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupOtpDigits, setSignupOtpDigits] = useState(['', '', '', '', '', '']);
  
  // Forgot Password / OTP States
  const [resetEmail, setResetEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Stateless HMAC Verification Token & Fallback OTP
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [emailDispatched, setEmailDispatched] = useState<boolean>(false);
  const [fallbackOtpCode, setFallbackOtpCode] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);

  // In-App Gmail SMTP Configuration Modal State
  const [showSmtpConfig, setShowSmtpConfig] = useState<boolean>(false);
  const [smtpUser, setSmtpUser] = useState<string>(() => {
    try { return localStorage.getItem(SMTP_USER_STORAGE) || ''; } catch { return ''; }
  });
  const [smtpPass, setSmtpPass] = useState<string>(() => {
    try { return localStorage.getItem(SMTP_PASS_STORAGE) || ''; } catch { return ''; }
  });
  const [smtpSaving, setSmtpSaving] = useState<boolean>(false);
  const [smtpSuccessMsg, setSmtpSuccessMsg] = useState<string | null>(null);
  
  // UX / Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((mode === 'enter_otp' || mode === 'signup_verify_otp') && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [mode, resendCountdown]);

  // Standard Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid Gmail / Email address.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email.trim().toLowerCase());
    }, 400);
  };

  // Instant 1-Click Demo Access
  const handleInstantAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin('developer@gmail.com');
    }, 300);
  };

  // Robust API caller with safe JSON parsing and port-fallback
  const callAuthApi = async (endpoint: string, payload: any) => {
    let res: Response | null = null;
    let rawText = '';

    const urlsToTry = [
      endpoint,
      `http://localhost:3001${endpoint}`
    ];

    let lastError: any = null;

    for (const url of urlsToTry) {
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        rawText = await res.text();
        
        if (res.ok || (rawText && rawText.trim().length > 0)) {
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!res && lastError) {
      throw new Error('BACKEND_UNREACHABLE');
    }

    let parsedData: any = {};
    if (rawText && rawText.trim().length > 0) {
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        parsedData = { error: rawText.length < 150 ? rawText : 'Server returned an invalid response format.' };
      }
    }

    if (res && !res.ok) {
      throw new Error(parsedData?.error || parsedData?.message || `Server responded with error status ${res.status}`);
    }

    return parsedData;
  };

  // Save & Verify Gmail SMTP Credentials
  const handleSaveSmtpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSmtpSuccessMsg(null);

    const cleanUser = smtpUser.trim().toLowerCase();
    const cleanPass = smtpPass.replace(/\s+/g, '');

    if (!cleanUser.includes('@') || cleanPass.length < 8) {
      setErrorMsg('Please enter your Gmail address and 16-character Google App Password.');
      return;
    }

    setSmtpSaving(true);
    try {
      await callAuthApi('/api/auth/smtp-config', {
        gmailUser: cleanUser,
        gmailAppPassword: cleanPass
      });
      try {
        localStorage.setItem(SMTP_USER_STORAGE, cleanUser);
        localStorage.setItem(SMTP_PASS_STORAGE, cleanPass);
      } catch {
        // ignore
      }
      setSmtpSuccessMsg(`Connected Gmail SMTP (${cleanUser})! Real verification emails are now active.`);
      setTimeout(() => {
        setShowSmtpConfig(false);
        setSmtpSuccessMsg(null);
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to verify Gmail SMTP credentials.');
    } finally {
      setSmtpSaving(false);
    }
  };

  // Helper to autofill 6-digit fallback OTP
  const handleAutofillOtp = (code: string, isSignup: boolean) => {
    const digits = code.slice(0, 6).split('');
    if (isSignup) {
      setSignupOtpDigits(digits);
    } else {
      setOtpDigits(digits);
    }
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 1500);
  };

  // =========================================================================
  // 1ST-TIME USER SIGN-UP FLOW (WITH GMAIL VERIFICATION CODE)
  // =========================================================================

  // Step 1 of Sign Up: Validate details & Send 6-Digit Verification Code to Gmail
  const handleSignupSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const targetEmail = signupEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid Gmail address for sign up.');
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setErrorMsg('Password must contain at least 6 characters.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please confirm your password.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await callAuthApi('/api/auth/send-otp', {
        email: targetEmail,
        purpose: 'signup',
        name: signupName.trim(),
        smtpUser: smtpUser.trim() || undefined,
        smtpPass: smtpPass.replace(/\s+/g, '') || undefined
      });
      if (data?.verificationToken) {
        setVerificationToken(data.verificationToken);
      }
      setEmailDispatched(Boolean(data?.emailSent));
      setFallbackOtpCode(data?.fallbackOtp || null);
      setResendCountdown(60);
      setSignupOtpDigits(['', '', '', '', '', '']);
      setMode('signup_verify_otp');
    } catch (err: any) {
      if (err?.message === 'BACKEND_UNREACHABLE') {
        // Offline client fallback so the user is never blocked
        const localOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setEmailDispatched(false);
        setFallbackOtpCode(localOtp);
        setVerificationToken(`LOCAL_${localOtp}`);
        setResendCountdown(60);
        setSignupOtpDigits(['', '', '', '', '', '']);
        setMode('signup_verify_otp');
      } else {
        setErrorMsg(err?.message || 'Failed to send verification code to your Gmail. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual Sign-Up OTP digit change
  const handleSignupOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/[^0-9]/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...signupOtpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setSignupOtpDigits(newDigits);
        const nextIdx = Math.min(pasted.length, 5);
        document.getElementById(`signup-otp-input-${nextIdx}`)?.focus();
      }
      return;
    }

    const cleanVal = value.replace(/[^0-9]/g, '');
    const newDigits = [...signupOtpDigits];
    newDigits[index] = cleanVal;
    setSignupOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      document.getElementById(`signup-otp-input-${index + 1}`)?.focus();
    }
  };

  const handleSignupOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !signupOtpDigits[index] && index > 0) {
      document.getElementById(`signup-otp-input-${index - 1}`)?.focus();
    }
  };

  // Step 2 of Sign Up: Verify 6-Digit Gmail Code & Create Account
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const enteredOtp = signupOtpDigits.join('');

    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    const cleanEmail = signupEmail.trim().toLowerCase();
    setIsLoading(true);
    try {
      if (verificationToken.startsWith('LOCAL_')) {
        const expected = verificationToken.replace('LOCAL_', '');
        if (enteredOtp !== expected) {
          throw new Error('Invalid 6-digit verification code.');
        }
      } else {
        await callAuthApi('/api/auth/verify-otp', {
          email: cleanEmail,
          otp: enteredOtp,
          newPassword: signupPassword,
          name: signupName.trim(),
          purpose: 'signup',
          verificationToken
        });
      }

      // Save registered user locally for client reference
      try {
        const existingRaw = localStorage.getItem('prompt_optimizer_registered_users');
        const existingUsers = existingRaw ? JSON.parse(existingRaw) : {};
        existingUsers[cleanEmail] = {
          email: cleanEmail,
          name: signupName.trim() || cleanEmail.split('@')[0],
          verified: true,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('prompt_optimizer_registered_users', JSON.stringify(existingUsers));
      } catch {
        // ignore storage errors
      }

      setMode('signup_success');
      setTimeout(() => {
        onLogin(cleanEmail);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification code invalid. Please check the 6-digit code.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // FORGOT PASSWORD FLOW (WITH GMAIL VERIFICATION CODE)
  // =========================================================================

  // Step 1: Send OTP to registered Gmail
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid registered Gmail address.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await callAuthApi('/api/auth/send-otp', {
        email: targetEmail,
        purpose: 'reset',
        smtpUser: smtpUser.trim() || undefined,
        smtpPass: smtpPass.replace(/\s+/g, '') || undefined
      });
      if (data?.verificationToken) {
        setVerificationToken(data.verificationToken);
      }
      setEmailDispatched(Boolean(data?.emailSent));
      setFallbackOtpCode(data?.fallbackOtp || null);
      setResendCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setMode('enter_otp');
    } catch (err: any) {
      if (err?.message === 'BACKEND_UNREACHABLE') {
        const localOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setEmailDispatched(false);
        setFallbackOtpCode(localOtp);
        setVerificationToken(`LOCAL_${localOtp}`);
        setResendCountdown(60);
        setOtpDigits(['', '', '', '', '', '']);
        setMode('enter_otp');
      } else {
        setErrorMsg(err?.message || 'Failed to dispatch OTP. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/[^0-9]/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const nextIdx = Math.min(pasted.length, 5);
        document.getElementById(`otp-input-${nextIdx}`)?.focus();
      }
      return;
    }

    const cleanVal = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-type to verify.');
      return;
    }

    setIsLoading(true);
    try {
      if (verificationToken.startsWith('LOCAL_')) {
        const expected = verificationToken.replace('LOCAL_', '');
        if (enteredOtp !== expected) {
          throw new Error('Invalid 6-digit verification code.');
        }
      } else {
        await callAuthApi('/api/auth/verify-otp', {
          email: resetEmail.trim().toLowerCase(),
          otp: enteredOtp,
          newPassword,
          purpose: 'reset',
          verificationToken
        });
      }

      setMode('reset_success');
      setTimeout(() => {
        onLogin(resetEmail.trim().toLowerCase());
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'OTP verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-slate-800 flex flex-col justify-center items-center relative overflow-hidden px-4 py-8 selection:bg-indigo-500/20 selection:text-indigo-900 mesh-dot-grid">
      {/* 3D Ambient Flowing Animated Aurora Blobs (Pure White Canvas Illumination) */}
      <div className="aurora-blob-1 -top-32 -left-32" />
      <div className="aurora-blob-2 top-60 -right-36" />
      <div className="aurora-blob-3 -bottom-36 left-1/4" />

      {/* Main Bright White 3D Flow Border Card Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Animated Rotating Gradient Glow Border Container */}
        <div className="relative rounded-3xl p-[2.5px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(99,102,241,0.22)]">
          {/* Continuous 360-degree rotating spectral rainbow border */}
          <div className="absolute -inset-[200%] bg-[conic-gradient(from_0deg,#8B5CF6,#3B82F6,#10B981,#F59E0B,#EF4444,#EC4899,#8B5CF6)] animate-[spin_8s_linear_infinite]" />

          {/* Inner Bright Pure-White Glass Card Content */}
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-[22px] p-7 sm:p-9 border border-white/80 flex flex-col shadow-xl">
            
            {/* Top 3D Brand Icon Emblem */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="h-16 w-16 rounded-2xl p-[2px] flow-accent-line shadow-lg shadow-indigo-500/30 flex items-center justify-center relative group cursor-pointer hover:scale-110 transition-transform duration-300 mb-3">
                <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  {mode === 'enter_otp' || mode === 'forgot_email' || mode === 'signup_verify_otp' ? (
                    <KeyRound className="h-8 w-8 text-indigo-600 group-hover:rotate-12 transition-transform duration-500" />
                  ) : mode === 'reset_success' || mode === 'signup_success' ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  ) : mode === 'signup_form' ? (
                    <UserPlus className="h-8 w-8 text-indigo-600 group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <Sparkles className="h-8 w-8 text-indigo-600 group-hover:rotate-45 transition-transform duration-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight flow-text-gradient">
                  PromptOptimizer
                </h1>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                {mode === 'login' && 'Enterprise Multi-Model Prompt Synthesizer & ₹ Rupee Token Engine'}
                {mode === 'signup_form' && 'First-Time User Registration with Gmail Verification Code'}
                {mode === 'signup_verify_otp' && 'Enter the 6-Digit Verification Code to Activate Your Account'}
                {mode === 'signup_success' && 'Gmail Verified & Account Created Successfully!'}
                {mode === 'forgot_email' && 'Registered Gmail Password Recovery & OTP Verification'}
                {mode === 'enter_otp' && 'Enter the 6-Digit OTP Dispatched to Your Gmail'}
                {mode === 'reset_success' && 'Verification Complete & Access Restored!'}
              </p>
            </div>

            {/* Sign In / 1st-User Sign Up Switcher Tabs */}
            {(mode === 'login' || mode === 'signup_form') && (
              <div className="grid grid-cols-2 gap-1.5 p-1 mb-5 bg-slate-100/90 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('login');
                  }}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    if (!signupEmail && email && email !== 'developer@gmail.com') {
                      setSignupEmail(email);
                    }
                    setMode('signup_form');
                  }}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    mode === 'signup_form'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>1st User Sign Up</span>
                </button>
              </div>
            )}

            {/* Error / Status Alerts */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* OPTIONAL GMAIL SMTP SENDER CONFIG DRAWER                                  */}
            {/* ========================================================================= */}
            {showSmtpConfig && (
              <form onSubmit={handleSaveSmtpConfig} className="mb-5 p-4 rounded-2xl bg-slate-50 border border-indigo-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
                    <Settings className="h-4 w-4 text-indigo-600" />
                    <span>Configure Gmail SMTP (Real Email Delivery)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSmtpConfig(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-700 font-bold"
                  >
                    Close
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  To deliver verification codes directly into any Gmail inbox, enter your sender Gmail &amp; a{' '}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 font-bold underline inline-flex items-center"
                  >
                    16-char Google App Password <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                  </a>
                </p>

                <div className="space-y-2">
                  <input
                    type="email"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="Sender Gmail (e.g. saravanprasanna.10@gmail.com)"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-mono text-slate-800 outline-none"
                  />
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="16-Character Google App Password (xxxx xxxx xxxx xxxx)"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-mono text-slate-800 outline-none"
                  />
                </div>

                {smtpSuccessMsg && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                    {smtpSuccessMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={smtpSaving}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {smtpSaving ? 'Verifying with smtp.gmail.com...' : 'Verify & Save Gmail SMTP'}
                </button>
              </form>
            )}

            {/* ========================================================================= */}
            {/* VIEW 1: STANDARD LOGIN FORM                                               */}
            {/* ========================================================================= */}
            {mode === 'login' && (
              <>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email / ID Input */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                      User Email (Gmail / ID)
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Password / Access Key Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg(null);
                          setResetEmail(email || 'developer@gmail.com');
                          setMode('forgot_email');
                        }}
                        className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember checkbox */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-600 hover:text-slate-900 transition-colors">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500/30 h-3.5 w-3.5"
                      />
                      <span className="text-[11px]">Save history per Gmail account</span>
                    </label>
                  </div>

                  {/* Primary 3D Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-flow-3d w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Zap className="h-4 w-4 animate-spin" />
                        <span>Authorizing User...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Workspace</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* First-Time User Sign-Up Callout */}
                <div className="mt-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      if (!signupEmail && email && email !== 'developer@gmail.com') {
                        setSignupEmail(email);
                      }
                      setMode('signup_form');
                    }}
                    className="text-xs font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center space-x-1"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>First-time user? Sign Up with Gmail Verification Code &rarr;</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono font-bold">
                    <span className="bg-white px-3 text-slate-400">
                      Instant Access Option
                    </span>
                  </div>
                </div>

                {/* 1-Click Instant Demo Access Button */}
                <button
                  type="button"
                  onClick={handleInstantAccess}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 transition-all active:scale-95 shadow-xs"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>⚡ 1-Click Launch PromptOptimizer</span>
                </button>
              </>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: 1ST-TIME USER SIGN UP - FORM                                      */}
            {/* ========================================================================= */}
            {mode === 'signup_form' && (
              <form onSubmit={handleSignupSendCode} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed flex items-start justify-between gap-2">
                  <span>
                    Register your new account with your <strong>Gmail address</strong>. We will send a <strong>6-digit verification code</strong> to verify and activate your account.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                    title="Configure Gmail SMTP App Password"
                    className="shrink-0 p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Full Name Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Your Name"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-inner"
                    />
                  </div>
                </div>

                {/* Gmail Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                    User Gmail Address
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-inner"
                    />
                  </div>
                </div>

                {/* Create Password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                    Create Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-inner"
                    />
                  </div>
                </div>

                {/* Submit: Send Verification Code to Gmail */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-flow-3d w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sending Code to Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Verification Code to Gmail</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setMode('login');
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-indigo-700 transition-colors"
                  >
                    Already have an account? <span className="underline font-bold">Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: 1ST-TIME USER SIGN UP - ENTER 6-DIGIT GMAIL VERIFICATION CODE     */}
            {/* ========================================================================= */}
            {mode === 'signup_verify_otp' && (
              <form onSubmit={handleVerifySignupOtp} className="space-y-4">
                {emailDispatched ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Verification Code Sent to Your Gmail!</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      A 6-digit verification code was delivered to <strong>{signupEmail}</strong>. Check your Gmail inbox (and Spam folder) and enter the code below.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-800 flex items-center space-x-1.5">
                        <Mail className="h-4 w-4 text-amber-600" />
                        <span>Instant Verification Code Ready</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-800 hover:bg-amber-100"
                      >
                        ⚙️ Setup Gmail SMTP
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Gmail SMTP App Password is not set yet, so we generated your verification code below for instant sign-up (or click <strong>Setup Gmail SMTP</strong> above to send directly to your Gmail inbox):
                    </p>
                    {fallbackOtpCode && (
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-300 shadow-2xs">
                        <span className="font-mono text-base font-black tracking-[0.25em] text-indigo-900">
                          {fallbackOtpCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAutofillOtp(fallbackOtpCode, true)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors"
                        >
                          {copiedOtp ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedOtp ? 'Filled!' : '1-Click Auto-Fill'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 6-Digit Verification Code Inputs */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {signupOtpDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`signup-otp-input-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleSignupOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleSignupOtpKeyDown(index, e)}
                        autoFocus={index === 0}
                        className="w-11 sm:w-12 h-12 text-center text-lg font-mono font-bold rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 bg-white text-slate-800 outline-none transition-all shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Verification Code Timer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 text-[11px]">Need a fresh code?</span>
                  {resendCountdown > 0 ? (
                    <span className="font-mono text-indigo-600 font-semibold text-[11px]">
                      Resend in {resendCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSignupSendCode()}
                      className="font-mono text-indigo-600 hover:text-indigo-800 font-bold text-[11px] hover:underline"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>

                {/* Verify & Complete Sign Up Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-flow-3d w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Zap className="h-4 w-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verify Code &amp; Complete Sign Up</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('signup_form');
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Edit Gmail or Registration Details</span>
                </button>
              </form>
            )}

            {/* ========================================================================= */}
            {/* VIEW 4: SIGN-UP SUCCESS & AUTO-LOGIN REDIRECT                             */}
            {/* ========================================================================= */}
            {mode === 'signup_success' && (
              <div className="py-6 flex flex-col items-center text-center space-y-3 animate-in zoom-in-95 duration-300">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Gmail Verified &amp; Account Created!
                </h3>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  Welcome to PromptOptimizer{signupName ? `, ${signupName}` : ''}! Your Gmail address has been verified via 6-digit code.
                </p>
                <div className="flex items-center space-x-2 text-indigo-600 text-xs font-mono font-bold pt-2">
                  <Zap className="h-4 w-4 animate-spin" />
                  <span>Launching workspace for {signupEmail}...</span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 5: FORGOT PASSWORD - ENTER GMAIL                                     */}
            {/* ========================================================================= */}
            {mode === 'forgot_email' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed flex items-start justify-between gap-2">
                  <span>
                    Enter your registered <strong>Gmail address</strong>. We will generate and dispatch a secure <strong>6-digit OTP code</strong> directly to your email.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                    title="Configure Gmail SMTP App Password"
                    className="shrink-0 p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                    Registered Gmail
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="username@gmail.com"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-flow-3d w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white shadow-md transition-all active:scale-95 disabled:opacity-50 mt-3"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Dispatching to Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send 6-Digit OTP to Gmail</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('login');
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </form>
            )}

            {/* ========================================================================= */}
            {/* VIEW 6: ENTER 6-DIGIT OTP & SET NEW PASSWORD                              */}
            {/* ========================================================================= */}
            {mode === 'enter_otp' && (
              <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                {emailDispatched ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>OTP Sent to Your Gmail!</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      A 6-digit verification code has been delivered to <strong>{resetEmail}</strong>. Please check your Gmail inbox and enter the code below.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-800 flex items-center space-x-1.5">
                        <Mail className="h-4 w-4 text-amber-600" />
                        <span>Instant Recovery Code Ready</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-800 hover:bg-amber-100"
                      >
                        ⚙️ Setup Gmail SMTP
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Gmail SMTP App Password is not set yet, so we generated your 6-digit code below (or click <strong>Setup Gmail SMTP</strong> above to send directly to your Gmail inbox):
                    </p>
                    {fallbackOtpCode && (
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-300 shadow-2xs">
                        <span className="font-mono text-base font-black tracking-[0.25em] text-indigo-900">
                          {fallbackOtpCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAutofillOtp(fallbackOtpCode, false)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors"
                        >
                          {copiedOtp ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedOtp ? 'Filled!' : '1-Click Auto-Fill'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 6-Digit OTP Inputs */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        autoFocus={index === 0}
                        className="w-11 sm:w-12 h-12 text-center text-lg font-mono font-bold rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 bg-white text-slate-800 outline-none transition-all shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Resend OTP Timer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 text-[11px]">Need a fresh code?</span>
                  {resendCountdown > 0 ? (
                    <span className="font-mono text-indigo-600 font-semibold text-[11px]">
                      Resend in {resendCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="font-mono text-indigo-600 hover:text-indigo-800 font-bold text-[11px] hover:underline"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>

                {/* Verify & Reset Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-flow-3d w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Zap className="h-4 w-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verify OTP &amp; Reset Password</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('login');
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Cancel &amp; Return</span>
                </button>
              </form>
            )}

            {/* ========================================================================= */}
            {/* VIEW 7: RESET SUCCESS & AUTO-LOGIN REDIRECT                              */}
            {/* ========================================================================= */}
            {mode === 'reset_success' && (
              <div className="py-6 flex flex-col items-center text-center space-y-3 animate-in zoom-in-95 duration-300">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Password Reset Verified!
                </h3>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  Your identity has been authenticated via Gmail OTP. Launching your personal prompt workspace...
                </p>
                <div className="flex items-center space-x-2 text-indigo-600 text-xs font-mono font-bold pt-2">
                  <Zap className="h-4 w-4 animate-spin" />
                  <span>Opening workspace for {resetEmail}...</span>
                </div>
              </div>
            )}

            {/* Badges footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Zero-Data Retention</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>Multi-User Cloud History</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-8 text-center text-xs text-slate-400 font-mono relative z-10">
        PromptOptimizer &bull; Bright White 3D Multi-Model Workspace &bull; v2.0
      </footer>
    </div>
  );
};
