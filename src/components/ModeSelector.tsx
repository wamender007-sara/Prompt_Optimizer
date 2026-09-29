import React from 'react';
import { 
  Zap, 
  Layers, 
  Code2, 
  Target, 
  Sliders,
  Cpu
} from 'lucide-react';
import { CompressionMode } from '../types';

interface ModeSelectorProps {
  currentMode: CompressionMode;
  onSelectMode: (mode: CompressionMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  const modes: {
    id: CompressionMode;
    label: string;
    description: string;
    icon: React.ReactNode;
    tag?: string;
    tagColor?: string;
  }[] = [
    {
      id: 'production_balanced',
      label: 'Production Balanced',
      description: 'High clarity, clean markdown structure, and maximum constraint adherence.',
      icon: <Layers className="h-4 w-4 text-emerald-400" />,
      tag: 'Recommended',
      tagColor: 'bg-emerald-950 text-emerald-300 border-emerald-800'
    },
    {
      id: 'ultra_distilled',
      label: 'Ultra Distilled',
      description: 'Minimal token footprint, telegraphic density, zero conversational overhead.',
      icon: <Zap className="h-4 w-4 text-amber-400" />,
      tag: '60-80% Savings',
      tagColor: 'bg-amber-950 text-amber-300 border-amber-800'
    },
    {
      id: 'structured_xml',
      label: 'Structured XML / Markdown',
      description: 'Explicit <system>, <constraints>, <context>, and <output_schema> sections.',
      icon: <Code2 className="h-4 w-4 text-purple-400" />,
      tag: 'Enterprise Pipeline',
      tagColor: 'bg-purple-950 text-purple-300 border-purple-800'
    },
    {
      id: 'target_gemini',
      label: 'Target: Gemini',
      description: 'Structured system guidelines, tabular data schemas, and high grounding diffs.',
      icon: <Target className="h-4 w-4 text-blue-400" />
    },
    {
      id: 'target_claude',
      label: 'Target: Claude',
      description: 'Explicit XML tags, zero conversational preamble, and formal verification proofs.',
      icon: <Target className="h-4 w-4 text-orange-400" />
    },
    {
      id: 'target_chatgpt',
      label: 'Target: ChatGPT',
      description: 'Operational directives, direct constraint enforcement, and code block focus.',
      icon: <Target className="h-4 w-4 text-teal-400" />
    },
    {
      id: 'target_cursor',
      label: 'Target: Cursor',
      description: '.cursorrules strict syntax, rule-oriented directives, zero placeholder comments.',
      icon: <Target className="h-4 w-4 text-indigo-400" />
    },
    {
      id: 'target_deepseek',
      label: 'Target: DeepSeek',
      description: '<think> chain-of-thought elicitation, boundary condition audits, and logic monads.',
      icon: <Cpu className="h-4 w-4 text-cyan-400" />
    }
  ];

  return (
    <div className="bg-[#111827]/90 border border-slate-800/90 rounded-xl p-3.5 backdrop-blur-md shadow-xl relative overflow-hidden">
      {/* Background Micro Scanline */}
      <div className="absolute inset-0 hud-scanlines pointer-events-none opacity-40"></div>

      <div className="flex items-center justify-between mb-2.5 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Sliders className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            COMPRESSION MODE & TARGET TUNING
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          ACTIVE_MODE: <span className="text-cyan-400 font-bold">{modes.find(m => m.id === currentMode)?.label}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 relative z-10">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all duration-150 active:scale-[0.98] ${
                isActive
                  ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-[0_0_18px_rgba(6,182,212,0.35)] reticle-box'
                  : 'bg-slate-900/70 border-slate-800 hover:border-cyan-800/60 hover:bg-slate-850/80 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className={`p-1 rounded ${isActive ? 'bg-cyan-900/60 border border-cyan-400/50' : 'bg-slate-800/80 border border-slate-700/50'}`}>
                  {mode.icon}
                </div>
                {isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                  </span>
                )}
              </div>
              <span className={`text-xs font-semibold leading-tight line-clamp-1 ${
                isActive ? 'text-cyan-200 font-bold' : 'text-slate-200'
              }`}>
                {mode.label}
              </span>
              {mode.tag && (
                <span className={`mt-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${mode.tagColor}`}>
                  {mode.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
