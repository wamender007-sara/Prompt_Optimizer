import React from 'react';
import { 
  Zap, 
  Layers, 
  Code2, 
  Target, 
  Sliders,
  Cpu,
  Globe
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
    tagClass: string;
    accentColor: string;
    spectrumLetter: string;
  }[] = [
    {
      id: 'production_balanced',
      label: 'Production Balanced',
      description: 'High clarity, clean markdown structure, and maximum constraint adherence.',
      icon: <Layers className="h-4 w-4" />,
      tag: 'Recommended',
      tagClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accentColor: '#10B981',
      spectrumLetter: 'G'
    },
    {
      id: 'ultra_distilled',
      label: 'Ultra Distilled',
      description: 'Minimal token footprint, telegraphic density, zero conversational overhead.',
      icon: <Zap className="h-4 w-4" />,
      tag: '60-80% Savings',
      tagClass: 'bg-amber-50 text-amber-800 border-amber-300',
      accentColor: '#EAB308',
      spectrumLetter: 'Y'
    },
    {
      id: 'structured_xml',
      label: 'Structured XML / Markdown',
      description: 'Explicit <system>, <constraints>, <context>, and <output_schema> sections.',
      icon: <Code2 className="h-4 w-4" />,
      tag: 'Enterprise Pipeline',
      tagClass: 'bg-purple-50 text-purple-700 border-purple-200',
      accentColor: '#8B5CF6',
      spectrumLetter: 'V'
    },
    {
      id: 'target_gemini',
      label: 'Target: Gemini',
      description: 'Structured system guidelines, tabular data schemas, and high grounding diffs.',
      icon: <Target className="h-4 w-4" />,
      tag: 'Multi-Modal',
      tagClass: 'bg-blue-50 text-blue-700 border-blue-200',
      accentColor: '#3B82F6',
      spectrumLetter: 'B'
    },
    {
      id: 'target_claude',
      label: 'Target: Claude',
      description: 'Explicit XML tags, zero conversational preamble, and formal verification proofs.',
      icon: <Target className="h-4 w-4" />,
      tag: 'XML Strict',
      tagClass: 'bg-orange-50 text-orange-700 border-orange-200',
      accentColor: '#F97316',
      spectrumLetter: 'O'
    },
    {
      id: 'target_chatgpt',
      label: 'Target: ChatGPT',
      description: 'Operational directives, direct constraint enforcement, and code block focus.',
      icon: <Target className="h-4 w-4" />,
      tag: 'OpenAI Direct',
      tagClass: 'bg-teal-50 text-teal-700 border-teal-200',
      accentColor: '#059669',
      spectrumLetter: 'G'
    },
    {
      id: 'target_cursor',
      label: 'Target: Cursor',
      description: '.cursorrules strict syntax, rule-oriented directives, zero placeholder comments.',
      icon: <Target className="h-4 w-4" />,
      tag: 'AST Strict',
      tagClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      accentColor: '#6366F1',
      spectrumLetter: 'I'
    },
    {
      id: 'target_deepseek',
      label: 'Target: DeepSeek',
      description: '<think> chain-of-thought elicitation, boundary condition audits, and logic monads.',
      icon: <Cpu className="h-4 w-4" />,
      tag: 'CoT Logic',
      tagClass: 'bg-red-50 text-red-700 border-red-200',
      accentColor: '#EF4444',
      spectrumLetter: 'R'
    },
    {
      id: 'target_perplexity',
      label: 'Target: Perplexity',
      description: 'Online web-grounded synthesis, verifiable source citations, and factual recency.',
      icon: <Globe className="h-4 w-4" />,
      tag: 'Web Grounded',
      tagClass: 'bg-teal-50 text-teal-800 border-teal-300',
      accentColor: '#0D9488',
      spectrumLetter: 'P'
    }
  ];

  return (
    <div className="white-glass-card rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Animated subtle top rainbow sweep line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] vibgyor-ribbon opacity-85" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg vibgyor-ribbon text-white shadow-xs">
            <Sliders className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <span>COMPRESSION MODE & TARGET TUNING</span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200/80">
              VIBGYOR TUNED
            </span>
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          ACTIVE_MODE: <span className="font-bold text-indigo-700 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">{modes.find(m => m.id === currentMode)?.label}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 overflow-hidden ${
                isActive
                  ? 'bg-white shadow-md border-transparent ring-2 ring-indigo-500/80 transform -translate-y-0.5'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-700 shadow-xs hover:shadow-sm hover:-translate-y-0.5'
              }`}
            >
              {/* Active animated rainbow ribbon at the top of the selected card */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[3px] vibgyor-ribbon z-10" />
              )}

              {/* Inactive subtle spectral color line */}
              {!isActive && (
                <div 
                  className="absolute top-0 left-3 right-3 h-[2px] rounded-full opacity-60"
                  style={{ backgroundColor: mode.accentColor }}
                />
              )}

              <div className="flex items-center justify-between w-full mb-1.5">
                <div 
                  className={`p-1.5 rounded-lg ${isActive ? 'text-white' : 'bg-slate-100'}`}
                  style={{ 
                    backgroundColor: isActive ? mode.accentColor : undefined,
                    color: !isActive ? mode.accentColor : undefined 
                  }}
                >
                  {mode.icon}
                </div>
                <div className="flex items-center space-x-1">
                  <span 
                    className={`text-[9px] font-mono font-bold px-1 rounded ${
                      isActive ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {mode.spectrumLetter}
                  </span>
                  {isActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
              </div>

              <span className={`text-xs font-bold leading-tight line-clamp-1 ${
                isActive ? 'text-slate-900 font-extrabold' : 'text-slate-800'
              }`}>
                {mode.label}
              </span>

              {mode.tag && (
                <span className={`mt-2 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border ${
                  isActive ? 'bg-indigo-50 text-indigo-800 border-indigo-200 font-extrabold' : mode.tagClass
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
