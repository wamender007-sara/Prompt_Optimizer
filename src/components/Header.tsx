import React from 'react';
import { 
  Sparkles, 
  History, 
  RotateCcw, 
  Layers
} from 'lucide-react';
import { PresetScenario } from '../types';

interface HeaderProps {
  presets: PresetScenario[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenHistory: () => void;
  onReset: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  presets,
  selectedPresetId,
  onSelectPreset,
  onOpenHistory,
  onReset,
  historyCount
}) => {
  return (
    <header className="border-b border-cyan-900/40 bg-[#0B0F19]/95 backdrop-blur-md sticky top-0 z-40 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      {/* Top Animatic Laser Sweep Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-slate-800/40 overflow-hidden">
        <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-laser"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center relative group cursor-pointer">
            <div className="h-full w-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <Sparkles className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PromptOptimizer
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                HUD v1.0
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="hidden sm:inline">Multi-Platform Prompt Compressor & Accurate Master Synthesizer</span>
              <span className="hidden md:inline font-mono text-[10px] text-cyan-500/80 flex items-center space-x-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>SYS_LATENCY: 12ms // MEM_BUFFER: OPTIMAL</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls: Presets Dropdown & Action Buttons */}
        <div className="flex items-center space-x-3">
          
          {/* Preset Selector */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-cyan-900/40 hover:border-cyan-500/50 rounded-lg px-2.5 py-1.5 shadow-inner transition-colors">
            <Layers className="h-4 w-4 text-cyan-400 hidden sm:block" />
            <span className="text-xs font-mono text-slate-400 hidden md:inline">PRESET:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">Select Preset Scenario</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-slate-900 text-slate-200">
                  {preset.title}
                </option>
              ))}
            </select>
          </div>

          {/* Reset / Clear */}
          <button
            onClick={onReset}
            title="Reset to default slots"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-900/40 hover:border-cyan-500/50 rounded-lg text-xs font-medium text-slate-200 transition-all shadow-sm active:scale-95"
          >
            <History className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Engine Status Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Compiler Online</span>
          </div>

        </div>

      </div>

      {/* Bottom Glow Border Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
    </header>
  );
};
