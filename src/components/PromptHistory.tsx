import React, { useRef } from 'react';
import { 
  History, 
  Trash2, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  Zap,
  Clock,
  Layers
} from 'lucide-react';
import { PlatformId, CompressionMode } from '../types';

export interface HistoryItem {
  id: string;
  timestamp: number;
  timeAgo: string;
  model: PlatformId;
  modelName: string;
  mode: CompressionMode;
  inputPrompt: string;
  optimizedPrompt: string;
  originalTokens: number;
  optimizedTokens: number;
  reductionPercentage: number;
  coreIntent: string;
}

interface PromptHistoryProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
  onLoadExample?: (exampleId: string) => void;
}

const MODEL_COLOR_MAP: Record<PlatformId, { bg: string; text: string; border: string; glow: string }> = {
  chatgpt: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-300', glow: 'shadow-emerald-500/20' },
  claude: { bg: 'bg-orange-500/10', text: 'text-orange-700', border: 'border-orange-300', glow: 'shadow-orange-500/20' },
  gemini: { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-300', glow: 'shadow-blue-500/20' },
  deepseek: { bg: 'bg-cyan-500/10', text: 'text-cyan-700', border: 'border-cyan-300', glow: 'shadow-cyan-500/20' },
  cursor: { bg: 'bg-indigo-500/10', text: 'text-indigo-700', border: 'border-indigo-300', glow: 'shadow-indigo-500/20' },
  perplexity: { bg: 'bg-teal-500/10', text: 'text-teal-700', border: 'border-teal-300', glow: 'shadow-teal-500/20' },
  custom: { bg: 'bg-purple-500/10', text: 'text-purple-700', border: 'border-purple-300', glow: 'shadow-purple-500/20' },
};

export const PromptHistory: React.FC<PromptHistoryProps> = ({
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearHistory,
  onLoadExample
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative z-20">
      {/* 3D Container with subtle top flow line */}
      <div className="card-3d overflow-hidden relative">
        <div className="h-[3px] w-full flow-accent-line" />

        {/* Section Header */}
        <div className="px-5 py-3 bg-white/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-xs flex items-center justify-center">
              <History className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  PAST PROMPT HISTORY
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {history.length} {history.length === 1 ? 'SAVED RUN' : 'SAVED RUNS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Click any card to instantly restore original inputs and optimized output
              </p>
            </div>
          </div>

          {/* Action buttons (Scroll & Clear) */}
          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={scrollLeft}
                  title="Scroll Left"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all active:scale-95 bg-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={scrollRight}
                  title="Scroll Right"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all active:scale-95 bg-white"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onClearHistory}
                  title="Wipe and flash all stored memory history"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all active:scale-95 shadow-2xs ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>⚡ Flash Memory</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Horizontal Scrolling Card Deck */}
        <div className="p-4 bg-slate-50/50">
          {history.length === 0 ? (
            <div className="py-6 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-white/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">No prompt runs recorded yet</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Your optimized prompts will automatically appear here for quick 1-click reloading.
                  </p>
                </div>
              </div>

              {onLoadExample && (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onLoadExample('example-code')}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all active:scale-95 shadow-2xs"
                  >
                    Load Code Refactor
                  </button>
                  <button
                    onClick={() => onLoadExample('example-security')}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all active:scale-95 shadow-2xs"
                  >
                    Load Security Audit
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div 
              ref={scrollContainerRef}
              className="flex space-x-3.5 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x snap-mandatory"
            >
              {history.map((item) => {
                const colors = MODEL_COLOR_MAP[item.model] || MODEL_COLOR_MAP.custom;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectHistory(item)}
                    className="history-card-3d snap-start shrink-0 w-72 sm:w-80 p-3.5 cursor-pointer relative group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Meta info */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {item.modelName}
                          </span>
                          <span className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
                            <Clock className="h-3 w-3" />
                            <span>{item.timeAgo}</span>
                          </span>
                        </div>

                        {/* Token Reduction Pill */}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 shadow-2xs">
                          <Zap className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                          <span>-{item.reductionPercentage}%</span>
                        </span>
                      </div>

                      {/* Prompt Snippet */}
                      <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-200/60 mb-2.5">
                        <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed">
                          &ldquo;{item.inputPrompt}&rdquo;
                        </p>
                      </div>

                      {/* Core Intent */}
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                        <Layers className="h-3 w-3 text-indigo-500 shrink-0" />
                        <span className="truncate font-medium">{item.coreIntent}</span>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.originalTokens} → <strong className="text-slate-700">{item.optimizedTokens}</strong> tokens
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center space-x-0.5">
                          <RotateCcw className="h-3 w-3 group-hover:-rotate-45 transition-transform" />
                          <span>Restore</span>
                        </span>
                        <button
                          onClick={(e) => onDeleteHistory(item.id, e)}
                          title="Remove item"
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all ml-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
