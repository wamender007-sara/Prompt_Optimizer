import React from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  LogOut,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  savedCount: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  savedCount,
  onLogout,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl sticky top-0 z-40 relative shadow-[0_4px_25px_-5px_rgba(99,102,241,0.06)]">
      {/* Top Animated Continuous Flow Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[3.5px] flow-accent-line z-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3.5">
          {/* 3D Floating Emblem */}
          <div className="h-10 w-10 rounded-xl p-[2px] flow-accent-line shadow-md shadow-indigo-500/25 flex items-center justify-center relative group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="h-full w-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <Sparkles className="h-5 w-5 text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-lg tracking-tight flow-text-gradient">
                PromptOptimizer
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-xs flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>3D &bull; FLOW ENGINE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Multi-Model AI Prompt Distillation &bull; ₹ Rupee Cost Savings
            </p>
          </div>
        </div>

        {/* Right Controls: Actions, Status & Logout */}
        <div className="flex items-center space-x-2.5">
          
          {/* Reset / New Prompt */}
          <button
            onClick={onReset}
            title="Start fresh prompt"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-200 hover:border-indigo-300 active:scale-95 shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Prompt</span>
          </button>

          {/* Compiler Active Status Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-700 font-mono font-bold shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Ready</span>
          </div>

          {/* Logout / Exit button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Lock & return to Animated Login"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all active:scale-95 shadow-2xs"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-600" />
              <span className="hidden sm:inline">Lock / Logout</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
