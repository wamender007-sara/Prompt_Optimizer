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
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center relative overflow-hidden px-4 py-8 selection:bg-purple-500/30 selection:text-purple-200">
      {/* Dynamic 3D Ambient Animated Aurora Blobs */}
      <div className="absolute w-[800px] h-[800px] rounded-full bg-radial from-violet-600/30 via-indigo-600/20 to-transparent blur-[120px] -top-32 -left-32 animate-pulse pointer-events-none" />
      <div className="absolute w-[750px] h-[750px] rounded-full bg-radial from-blue-600/25 via-teal-500/20 to-transparent blur-[130px] top-64 -right-32 animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-radial from-rose-500/20 via-amber-500/15 to-transparent blur-[110px] -bottom-32 left-1/3 animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />

      {/* Cyber Mesh Dot Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(139,92,246,0.15)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Floating 3D Background Decorative Geometric Pills */}
      <div className="absolute top-12 left-12 hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-mono text-purple-300 shadow-xl floating-3d-symbol">
        <Cpu className="h-3.5 w-3.5 text-purple-400" />
        <span>V8 ENGINE OPTIMIZER</span>
      </div>
      <div className="absolute bottom-16 right-16 hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-mono text-emerald-300 shadow-xl floating-3d-symbol" style={{ animationDelay: '1.5s' }}>
        <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
        <span>₹ COST SAVINGS ENGINE</span>
      </div>
      <div className="absolute top-24 right-20 hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-mono text-blue-300 shadow-xl floating-3d-symbol" style={{ animationDelay: '3s' }}>
        <Layers className="h-3.5 w-3.5 text-blue-400" />
        <span>MULTI-MODEL SYNTHESIS</span>
      </div>

      {/* Main 3D Flow Border Card Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Animated Rotating Gradient Glow Border Container */}
        <div className="relative rounded-3xl p-[2px] overflow-hidden shadow-[0_0_50px_-10px_rgba(99,102,241,0.35)]">
          {/* Continuous 360-degree rotating rainbow border */}
          <div className="absolute -inset-[200%] bg-[conic-gradient(from_0deg,#8B5CF6,#3B82F6,#10B981,#F59E0B,#EF4444,#EC4899,#8B5CF6)] animate-[spin_8s_linear_infinite]" />

          {/* Inner Glass Card Content */}
          <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-[22px] p-7 sm:p-9 border border-white/10 flex flex-col shadow-2xl">
            
            {/* Top 3D Brand Icon Emblem */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-16 w-16 rounded-2xl p-[2px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/40 flex items-center justify-center relative group cursor-pointer hover:scale-110 transition-transform duration-300 mb-3">
                <div className="h-full w-full bg-slate-900 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <Sparkles className="h-8 w-8 text-indigo-400 group-hover:rotate-45 transition-transform duration-500" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flow-text-gradient">
                PromptOptimizer
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                Enterprise Multi-Model Prompt Synthesizer &amp; Token Optimization Engine
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / ID Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 focus:bg-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password / Access Key Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Secret Key / Password
                  </label>
                  <span className="text-[10px] font-mono text-indigo-400">
                    Demo Mode Active
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
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 focus:bg-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500/30 h-3.5 w-3.5"
                  />
                  <span>Keep session authenticated</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400 hover:text-indigo-300 cursor-pointer">
                  Need Help?
                </span>
              </div>

              {/* Primary 3D Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-flow-3d w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-2"
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
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-slate-900 px-3 text-slate-500">
                  Instant Developer Access
                </span>
              </div>
            </div>

            {/* 1-Click Instant Demo Access Button */}
            <button
              type="button"
              onClick={handleInstantAccess}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400 transition-all active:scale-95 shadow-xs"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>⚡ 1-Click Launch PromptOptimizer</span>
            </button>

            {/* Badges footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Zero-Data Retention</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>100% Local Compiler</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-8 text-center text-xs text-slate-500 font-mono relative z-10">
        PromptOptimizer &bull; High Animated AI Workspace &bull; v2.0
      </footer>
    </div>
  );
};
