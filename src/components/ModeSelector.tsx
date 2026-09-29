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
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'ultra_distilled',
      label: 'Ultra Distilled',
      description: 'Minimal token footprint, telegraphic density, zero conversational overhead.',
      icon: <Zap className="h-4 w-4 text-amber-500" />,
      tag: '60-80% Savings',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'structured_xml',
      label: 'Structured XML / Markdown',
      description: 'Explicit <system>, <constraints>, <context>, and <output_schema> sections.',
      icon: <Code2 className="h-4 w-4 text-purple-600" />,
      tag: 'Enterprise Pipeline',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'target_gemini',
      label: 'Target: Gemini',
      description: 'Structured system guidelines, tabular data schemas, and high grounding diffs.',
      icon: <Target className="h-4 w-4 text-sky-500" />
    },
    {
      id: 'target_claude',
      label: 'Target: Claude',
      description: 'Explicit XML tags, zero conversational preamble, and formal verification proofs.',
      icon: <Target className="h-4 w-4 text-amber-600" />
    },
    {
      id: 'target_chatgpt',
      label: 'Target: ChatGPT',
      description: 'Operational directives, direct constraint enforcement, and code block focus.',
      icon: <Target className="h-4 w-4 text-teal-600" />
    },
    {
      id: 'target_cursor',
      label: 'Target: Cursor',
      description: '.cursorrules strict syntax, rule-oriented directives, zero placeholder comments.',
      icon: <Target className="h-4 w-4 text-indigo-600" />
    },
    {
      id: 'target_deepseek',
      label: 'Target: DeepSeek',
      description: '<think> chain-of-thought elicitation, boundary condition audits, and logic monads.',
      icon: <Cpu className="h-4 w-4 text-cyan-600" />
    }
  ];

  return (
    <div className="prism-glass rounded-2xl p-4 border border-white/80 shadow-md shadow-purple-500/5 backdrop-blur-xl relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-purple-100 text-purple-700 border border-purple-200">
            <Sliders className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            COMPRESSION MODE & TARGET TUNING
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          ACTIVE_MODE: <span className="font-bold text-purple-700 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200">{modes.find(m => m.id === currentMode)?.label}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 border-transparent transform -translate-y-0.5'
                  : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-purple-300 text-slate-700 shadow-sm hover:shadow hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100/80'}`}>
                  {React.cloneElement(mode.icon as React.ReactElement, {
                    className: `h-4 w-4 ${isActive ? 'text-white' : ''}`
                  })}
                </div>
                {isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                )}
              </div>
              <span className={`text-xs font-bold leading-tight line-clamp-1 ${
                isActive ? 'text-white' : 'text-slate-800'
              }`}>
                {mode.label}
              </span>
              {mode.tag && (
                <span className={`mt-2 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border ${
                  isActive ? 'bg-white/20 text-white border-white/30' : mode.tagColor
                }`}>
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
