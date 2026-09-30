import React from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Layers
} from 'lucide-react';
import { PresetScenario } from '../types';

interface HeaderProps {
  presets: PresetScenario[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
}

const VIBGYOR_SPECTRUM = [
  { letter: 'V', name: 'Violet', color: '#8B5CF6', dotClass: 'dot-v' },
  { letter: 'I', name: 'Indigo', color: '#6366F1', dotClass: 'dot-i' },
  { letter: 'B', name: 'Blue', color: '#3B82F6', dotClass: 'dot-b' },
  { letter: 'G', name: 'Green', color: '#10B981', dotClass: 'dot-g' },
  { letter: 'Y', name: 'Yellow', color: '#EAB308', dotClass: 'dot-y' },
  { letter: 'O', name: 'Orange', color: '#F97316', dotClass: 'dot-o' },
  { letter: 'R', name: 'Red', color: '#EF4444', dotClass: 'dot-r' },
];

export const Header: React.FC<HeaderProps> = ({
  presets,
  selectedPresetId,
  onSelectPreset,
  onReset,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-40 relative shadow-[0_4px_20px_-4px_rgba(99,102,241,0.08)]">
      {/* Top Animated Continuous VIBGYOR 7-Color Rainbow Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-[4px] vibgyor-ribbon z-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl p-[2px] vibgyor-ribbon shadow-md shadow-indigo-500/25 flex items-center justify-center relative group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="h-full w-full bg-white rounded-[9px] flex items-center justify-center relative overflow-hidden">
              <Sparkles className="h-5 w-5 text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight vibgyor-animated-text">
                PromptOptimizer
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-full bg-white text-indigo-800 border border-indigo-200/80 shadow-xs flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>VIBGYOR ANIMATED</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <span className="hidden sm:inline font-medium text-slate-600">Pure White & Animated Spectrum Synthesizer</span>
              <span className="hidden md:inline font-mono text-[10px] text-slate-300">|</span>
              
              {/* Animated Sequential Pulsing 7 VIBGYOR Dots */}
              <div className="hidden md:flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/70" title="VIBGYOR Active Wave Spectrum">
                {VIBGYOR_SPECTRUM.map((item) => (
                  <span
                    key={item.letter}
                    className={`w-2.5 h-2.5 rounded-full inline-block cursor-pointer shadow-xs ${item.dotClass}`}
                    style={{ backgroundColor: item.color }}
                    title={`${item.letter} - ${item.name}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right Controls: Presets Dropdown & Action Buttons */}
        <div className="flex items-center space-x-2.5">
          
          {/* Preset Selector */}
          <div className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl px-3 py-1.5 shadow-xs transition-all duration-200">
            <Layers className="h-4 w-4 text-indigo-600 hidden sm:block" />
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
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/70 hover:border-slate-300 active:scale-95 bg-white shadow-xs"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Engine Status Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-mono font-semibold shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Compiler Online</span>
          </div>

        </div>

      </div>
    </header>
  );
};
