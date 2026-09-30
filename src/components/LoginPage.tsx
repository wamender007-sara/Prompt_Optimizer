import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 600);
  };

  const handleInstantAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 400);
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
        <span>MULTI-MODEL SYNTHESIS</span>
      </div>

      {/* Main Bright White 3D Flow Border Card Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Animated Rotating Gradient Glow Border Container */}
        <div className="relative rounded-3xl p-[2.5px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(99,102,241,0.2)]">
          {/* Continuous 360-degree rotating spectral rainbow border */}
          <div className="absolute -inset-[200%] bg-[conic-gradient(from_0deg,#8B5CF6,#3B82F6,#10B981,#F59E0B,#EF4444,#EC4899,#8B5CF6)] animate-[spin_8s_linear_infinite]" />

          {/* Inner Bright Pure-White Glass Card Content */}
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-[22px] p-7 sm:p-9 border border-white/80 flex flex-col shadow-xl">
            
            {/* Top 3D Brand Icon Emblem */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-16 w-16 rounded-2xl p-[2px] flow-accent-line shadow-lg shadow-indigo-500/30 flex items-center justify-center relative group cursor-pointer hover:scale-110 transition-transform duration-300 mb-3">
                <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <Sparkles className="h-8 w-8 text-indigo-600 group-hover:rotate-45 transition-transform duration-500" />
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
                Enterprise Multi-Model Prompt Synthesizer &amp; ₹ Rupee Token Engine
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / ID Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Access Email / Developer ID
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@enterprise.ai"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono shadow-inner"
                  />
                </div>
              </div>

              {/* Password / Access Key Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                    Secret Key / Password
                  </label>
                  <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                    Instant Demo Mode
                  </span>
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
                  <span className="text-[11px]">Keep session authenticated</span>
                </label>
                <span className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer">
                  Need Help?
                </span>
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
                    <span>Authorizing Session...</span>
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
                  Instant Developer Access
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

            {/* Badges footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Zero-Data Retention</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>100% Local Compiler</span>
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
