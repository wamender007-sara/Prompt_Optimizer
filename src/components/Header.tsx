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
    <header className="border-b border-slate-200/80 bg-white/75 backdrop-blur-xl sticky top-0 z-40 relative shadow-[0_4px_20px_-4px_rgba(124,58,237,0.06)]">
      {/* Top Shimmering Aurora Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-violet-600 via-sky-400 to-pink-500 opacity-90"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-violet-500/20 flex items-center justify-center relative group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <Sparkles className="h-5 w-5 text-violet-600 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-purple-900 to-slate-800 bg-clip-text text-transparent">
                PromptOptimizer
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-full bg-purple-100 text-purple-700 border border-purple-200 shadow-sm">
                AURORA v4.8
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <span className="hidden sm:inline font-medium">Luminescent Multi-Platform Prompt Synthesizer</span>
              <span className="hidden md:inline font-mono text-[10px] text-slate-500 flex items-center space-x-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>SYS_LATENCY: 12ms // MEM: OPTIMAL</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls: Presets Dropdown & Action Buttons */}
        <div className="flex items-center space-x-2.5">
          
          {/* Preset Selector */}
          <div className="flex items-center space-x-2 bg-slate-50/90 border border-slate-200/90 hover:border-purple-400 rounded-xl px-3 py-1.5 shadow-sm transition-all duration-200">
            <Layers className="h-4 w-4 text-purple-600 hidden sm:block" />
            <span className="text-xs font-mono font-semibold text-slate-500 hidden md:inline">PRESET:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="" disabled className="bg-white text-slate-500">Select Preset Scenario</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-white text-slate-800">
                  {preset.title}
                </option>
              ))}
            </select>
          </div>

          {/* Reset / Clear */}
          <button
            onClick={onReset}
            title="Reset to default slots"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-sm hover:shadow active:scale-95"
          >
            <History className="h-4 w-4 text-purple-600" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                {historyCount}
              </span>
            )}
          </button>

          {/* Engine Status Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-mono font-medium shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Compiler Ready</span>
          </div>

        </div>

      </div>
    </header>
  );
};
