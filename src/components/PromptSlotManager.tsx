import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Power, 
  Columns, 
  Copy, 
  Check
} from 'lucide-react';
import { PromptSlot, PlatformId } from '../types';
import { estimateTokens } from '../engine/compiler';

interface PromptSlotManagerProps {
  slots: PromptSlot[];
  onUpdateSlot: (id: string, updates: Partial<PromptSlot>) => void;
  onAddSlot: () => void;
  onRemoveSlot: (id: string) => void;
}

const PLATFORM_THEMES: Record<PlatformId, { color: string; border: string; bg: string; text: string }> = {
  chatgpt: {
    color: '#10A37F',
    border: 'border-emerald-600/60',
    bg: 'bg-emerald-950/20',
    text: 'text-emerald-400'
  },
  claude: {
    color: '#D97706',
    border: 'border-amber-600/60',
    bg: 'bg-amber-950/20',
    text: 'text-amber-400'
  },
  gemini: {
    color: '#3B82F6',
    border: 'border-blue-600/60',
    bg: 'bg-blue-950/20',
    text: 'text-blue-400'
  },
  cursor: {
    color: '#8B5CF6',
    border: 'border-purple-600/60',
    bg: 'bg-purple-950/20',
    text: 'text-purple-400'
  },
  deepseek: {
    color: '#06B6D4',
    border: 'border-cyan-600/60',
    bg: 'bg-cyan-950/20',
    text: 'text-cyan-400'
  },
  custom: {
    color: '#EC4899',
    border: 'border-pink-600/60',
    bg: 'bg-pink-950/20',
    text: 'text-pink-400'
  }
};

export const PromptSlotManager: React.FC<PromptSlotManagerProps> = ({
  slots,
  onUpdateSlot,
  onAddSlot,
  onRemoveSlot
}) => {
  const [activeSlotId, setActiveSlotId] = useState<string>(slots[0]?.id || '');
  const [viewMode, setViewMode] = useState<'tabs' | 'grid'>('tabs');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Synchronize activeSlotId if selected slot was removed or changed
  React.useEffect(() => {
    if (!slots.some(s => s.id === activeSlotId) && slots.length > 0) {
      setActiveSlotId(slots[0].id);
    }
  }, [slots, activeSlotId]);

  const activeSlot = slots.find(s => s.id === activeSlotId) || slots[0];

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-[#111827]/90 border border-slate-800/90 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl reticle-box relative">
      {/* Top Bar with Slot Tabs and Controls */}
      <div className="p-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Bot className="h-4 w-4" />
          </div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            MULTI-PLATFORM INPUT SLOTS ({slots.filter(s => s.enabled).length}/{slots.length} ACTIVE)
          </h2>
        </div>

        {/* View switcher & Add slot */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('tabs')}
              className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                viewMode === 'tabs' ? 'bg-slate-800 text-cyan-400 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Focus View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1 rounded text-xs font-mono transition-colors flex items-center space-x-1 ${
                viewMode === 'grid' ? 'bg-slate-800 text-cyan-400 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="h-3 w-3" />
              <span>Side-by-Side</span>
            </button>
          </div>

          <button
            onClick={onAddSlot}
            className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Add Slot</span>
          </button>
        </div>
      </div>

      {/* Tabs list (when in tabs mode) */}
      {viewMode === 'tabs' && (
        <div className="flex overflow-x-auto border-b border-slate-800/80 px-3 pt-2 bg-slate-900/60 gap-1.5 scrollbar-thin relative z-10">
          {slots.map((slot) => {
            const theme = PLATFORM_THEMES[slot.platform] || PLATFORM_THEMES.custom;
            const isCurrent = slot.id === activeSlot?.id;
            const tokenCount = estimateTokens(slot.prompt);

            return (
              <button
                key={slot.id}
                onClick={() => setActiveSlotId(slot.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg text-xs font-mono transition-all border-t border-l border-r ${
                  isCurrent
                    ? `${theme.bg} ${theme.border} text-white font-bold border-b-transparent shadow-[0_0_12px_rgba(6,182,212,0.15)]`
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                } ${!slot.enabled ? 'opacity-40 line-through' : ''}`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: theme.color, boxShadow: `0 0 6px ${theme.color}` }}
                />
                <span>{slot.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-400 border border-slate-800">
                  {tokenCount}t
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 relative z-10">
        {viewMode === 'tabs' && activeSlot && (
          <div className="space-y-3">
            {/* Slot toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={activeSlot.name}
                  onChange={(e) => onUpdateSlot(activeSlot.id, { name: e.target.value })}
                  className="bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-slate-100 px-2.5 py-1 rounded focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                <span className="text-xs text-slate-500 font-mono">
                  {estimateTokens(activeSlot.prompt)} tokens • {activeSlot.prompt.length} chars
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyPrompt(activeSlot.id, activeSlot.prompt)}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-900 border border-slate-800 hover:border-cyan-800 rounded transition-colors active:scale-95"
                  title="Copy prompt"
                >
                  {copiedId === activeSlot.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => onUpdateSlot(activeSlot.id, { enabled: !activeSlot.enabled })}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-mono font-bold transition-all border ${
                    activeSlot.enabled 
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Power className="h-3 w-3" />
                  <span>{activeSlot.enabled ? 'ACTIVE' : 'BYPASSED'}</span>
                </button>
                {slots.length > 1 && (
                  <button
                    onClick={() => onRemoveSlot(activeSlot.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 hover:border-rose-900 rounded transition-colors active:scale-95"
                    title="Delete slot"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Prompt Editor Textarea */}
            <div className="relative">
              <textarea
                rows={8}
                value={activeSlot.prompt}
                onChange={(e) => onUpdateSlot(activeSlot.id, { prompt: e.target.value })}
                placeholder={`Enter prompt directives for ${activeSlot.name}...`}
                className="w-full bg-[#0B0F19] text-slate-200 font-mono text-xs p-3.5 rounded-lg border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all leading-relaxed resize-y shadow-inner"
              />
            </div>
          </div>
        )}

        {/* Side-by-side Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {slots.map((slot) => {
              const theme = PLATFORM_THEMES[slot.platform] || PLATFORM_THEMES.custom;
              const tokenCount = estimateTokens(slot.prompt);

              return (
                <div 
                  key={slot.id} 
                  className={`flex flex-col rounded-lg border ${theme.border} bg-[#0B0F19]/80 overflow-hidden ${
                    !slot.enabled ? 'opacity-40' : ''
                  }`}
                >
                  <div className="p-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.color }} />
                      <span className="text-xs font-bold text-slate-200">{slot.name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                        {tokenCount}t
                      </span>
                      <button
                        onClick={() => onUpdateSlot(slot.id, { enabled: !slot.enabled })}
                        className={`p-1 rounded text-xs ${
                          slot.enabled ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                        title="Toggle slot"
                      >
                        <Power className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    value={slot.prompt}
                    onChange={(e) => onUpdateSlot(slot.id, { prompt: e.target.value })}
                    className="w-full bg-transparent text-slate-300 font-mono text-[11px] p-2.5 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
