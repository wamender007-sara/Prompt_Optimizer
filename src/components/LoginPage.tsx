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
  Layers,
  Cpu,
  IndianRupee,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Send,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

type AuthMode = 'login' | 'forgot_email' | 'enter_otp' | 'reset_success';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Login Form States
  const [email, setEmail] = useState('developer@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Forgot Password / OTP States
  const [resetEmail, setResetEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  
  // UX / Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === 'enter_otp' && resendCountdown > 0) {
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
    }, 500);
  };

  // Instant 1-Click Demo Access
  const handleInstantAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin('developer@gmail.com');
    }, 350);
  };

  // Step 1: Send OTP to registered Gmail
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid registered Gmail address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch OTP to Gmail.');
      }

      setPreviewOtp(data.previewOtp || '849201');
      setStatusMsg(data.message || `6-digit OTP code dispatched to ${targetEmail}`);
      setResendCountdown(60);
      setMode('enter_otp');
    } catch (err: any) {
      // Fallback in case backend is offline
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setPreviewOtp(mockOtp);
      setStatusMsg(`Demo Mode: Dispatched 6-digit OTP to ${targetEmail}`);
      setResendCountdown(60);
      setMode('enter_otp');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
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

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  // Quick auto-fill simulated OTP
  const handleQuickAutoFillOtp = () => {
    if (previewOtp) {
      setOtpDigits(previewOtp.split('').slice(0, 6));
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP verification code.');
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
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
          otp: enteredOtp,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP code.');
      }

      setMode('reset_success');
      setTimeout(() => {
        onLogin(resetEmail.trim().toLowerCase());
      }, 1600);
    } catch (err: any) {
      // If preview OTP matches, allow reset in offline fallback
      if (previewOtp && enteredOtp === previewOtp) {
        setMode('reset_success');
        setTimeout(() => {
          onLogin(resetEmail.trim().toLowerCase());
        }, 1600);
      } else {
        setErrorMsg(err?.message || 'OTP verification failed. Please try again.');
      }
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

      {/* Floating 3D Background Decorative Geometric Pills on White */}
      <div className="absolute top-12 left-12 hidden lg:flex items-center space-x-2 px-3.5 py-2 rounded-full bg-white/85 border border-purple-200/80 backdrop-blur-md text-[11px] font-mono font-bold text-purple-700 shadow-md floating-3d-symbol">
        <Cpu className="h-4 w-4 text-purple-600" />
        <span>V8 ENGINE OPTIMIZER</span>
      </div>
      <div className="absolute bottom-16 right-16 hidden lg:flex items-center space-x-2 px-3.5 py-2 rounded-full bg-white/85 border border-emerald-200/80 backdrop-blur-md text-[11px] font-mono font-bold text-emerald-700 shadow-md floating-3d-symbol" style={{ animationDelay: '1.5s' }}>
        <IndianRupee className="h-4 w-4 text-emerald-600" />
        <span>₹ RUPEE COST ENGINE</span>
      </div>
      <div className="absolute top-24 right-20 hidden lg:flex items-center space-x-2 px-3.5 py-2 rounded-full bg-white/85 border border-blue-200/80 backdrop-blur-md text-[11px] font-mono font-bold text-blue-700 shadow-md floating-3d-symbol" style={{ animationDelay: '3s' }}>
        <Layers className="h-4 w-4 text-blue-600" />
        <span>MULTI-USER CLOUD HISTORY</span>
      </div>

      {/* Main Bright White 3D Flow Border Card Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Animated Rotating Gradient Glow Border Container */}
        <div className="relative rounded-3xl p-[2.5px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(99,102,241,0.22)]">
          {/* Continuous 360-degree rotating spectral rainbow border */}
          <div className="absolute -inset-[200%] bg-[conic-gradient(from_0deg,#8B5CF6,#3B82F6,#10B981,#F59E0B,#EF4444,#EC4899,#8B5CF6)] animate-[spin_8s_linear_infinite]" />

          {/* Inner Bright Pure-White Glass Card Content */}
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-[22px] p-7 sm:p-9 border border-white/80 flex flex-col shadow-xl">
            
            {/* Top 3D Brand Icon Emblem */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-16 w-16 rounded-2xl p-[2px] flow-accent-line shadow-lg shadow-indigo-500/30 flex items-center justify-center relative group cursor-pointer hover:scale-110 transition-transform duration-300 mb-3">
                <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  {mode === 'enter_otp' || mode === 'forgot_email' ? (
                    <KeyRound className="h-8 w-8 text-indigo-600 group-hover:rotate-12 transition-transform duration-500" />
                  ) : mode === 'reset_success' ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
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
                {mode === 'forgot_email' && 'Registered Gmail Password Recovery & OTP Verification'}
                {mode === 'enter_otp' && 'Enter the 6-Digit OTP Dispatched to Your Gmail'}
                {mode === 'reset_success' && 'Verification Complete & Access Restored!'}
              </p>
            </div>

            {/* Error / Status Alerts */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
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

                {/* Divider */}
                <div className="relative my-5">
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
            {/* VIEW 2: FORGOT PASSWORD - ENTER GMAIL                                     */}
            {/* ========================================================================= */}
            {mode === 'forgot_email' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                  Enter your registered <strong>Gmail address</strong>. We will generate and dispatch a secure <strong>6-digit OTP code</strong> to verify your ownership.
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
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">Quick fill demo account:</span>
                    <button
                      type="button"
                      onClick={() => setResetEmail('developer@gmail.com')}
                      className="text-[10px] font-mono text-indigo-600 hover:underline font-semibold"
                    >
                      developer@gmail.com
                    </button>
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
                      <span>Sending OTP to Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send 6-Digit OTP</span>
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
            {/* VIEW 3: ENTER 6-DIGIT OTP & SET NEW PASSWORD                             */}
            {/* ========================================================================= */}
            {mode === 'enter_otp' && (
              <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                {/* Simulated Gmail Notification Badge / Preview banner */}
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                      <Mail className="h-3.5 w-3.5 text-amber-600" />
                      <span>Gmail OTP Dispatch Active</span>
                    </div>
                    {previewOtp && (
                      <span className="px-2 py-0.5 rounded font-mono font-black text-amber-900 bg-amber-200/80 text-[11px]">
                        CODE: {previewOtp}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-800/90 leading-tight">
                    An OTP was sent to <strong>{resetEmail}</strong>. Enter the 6 digits below or auto-fill:
                  </p>
                  {previewOtp && (
                    <button
                      type="button"
                      onClick={handleQuickAutoFillOtp}
                      className="w-full py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-colors shadow-2xs"
                    >
                      ⚡ Auto-Fill 6-Digit OTP ({previewOtp})
                    </button>
                  )}
                </div>

                {/* 6-Digit OTP Inputs */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider text-center">
                    Enter 6-Digit Code
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
                  <span className="text-slate-500 text-[11px]">Didn't get code?</span>
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
                      Resend OTP Now
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
                      <span>Verifying &amp; Resetting...</span>
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
            {/* VIEW 4: RESET SUCCESS & AUTO-LOGIN REDIRECT                              */}
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
                  <span>Opening user profile for {resetEmail}...</span>
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
