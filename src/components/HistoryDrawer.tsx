import React from 'react';
import { 
  X, 
  History, 
  RotateCcw, 
  Trash2, 
  Copy, 
  Check, 
  TrendingDown
} from 'lucide-react';
import { SynthesisResult } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: SynthesisResult[];
  onRestore: (item: SynthesisResult) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onClearHistory,
  onDeleteHistoryItem
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white border-l border-slate-200 text-slate-800 flex flex-col h-full shadow-2xl z-10">
        
        {/* Top Animated VIBGYOR Rainbow Ribbon */}
        <div className="h-[4px] w-full vibgyor-ribbon" />

        {/* Header */}
        <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
              <History className="h-4 w-4" />
            </div>
            <h2 className="font-bold text-sm text-slate-900">Synthesis History</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono font-bold">
              {history.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors font-medium"
                title="Clear all history"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-2">
              <History className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No history logged yet.</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Every time you synthesize prompts, an automatic snapshot is saved here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow transition-all flex flex-col space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 text-[11px]">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.mode.replace('target_', '')}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-0.5">
                      <TrendingDown className="h-2.5 w-2.5" />
                      <span>-{item.metrics.reductionPercentage}%</span>
                    </span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-800 line-clamp-2">
                  {item.coreIntent}
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2">
                  <span>Tokens: {item.metrics.compressedTokens} (orig: {item.metrics.originalTotalTokens})</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onRestore(item)}
                    className="flex items-center space-x-1 text-xs font-semibold text-indigo-700 hover:text-indigo-800 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Restore</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopy(item.id, item.masterPrompt)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Copy Master Prompt"
                    >
                      {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center font-medium">
          Persisted locally in browser storage
        </div>

      </div>
    </div>
  );
};
