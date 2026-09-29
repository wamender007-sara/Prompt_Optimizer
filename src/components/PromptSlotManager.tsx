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
    border: 'border-emerald-200',
    bg: 'bg-emerald-50 text-emerald-700',
    text: 'text-emerald-700'
  },
  claude: {
    color: '#D97706',
    border: 'border-amber-200',
    bg: 'bg-amber-50 text-amber-700',
    text: 'text-amber-700'
  },
  gemini: {
    color: '#2563EB',
    border: 'border-blue-200',
    bg: 'bg-blue-50 text-blue-700',
    text: 'text-blue-700'
  },
  cursor: {
    color: '#7C3AED',
    border: 'border-purple-200',
    bg: 'bg-purple-50 text-purple-700',
    text: 'text-purple-700'
  },
  deepseek: {
    color: '#0284C7',
    border: 'border-sky-200',
    bg: 'bg-sky-50 text-sky-700',
    text: 'text-sky-700'
  },
  custom: {
    color: '#DB2777',
    border: 'border-pink-200',
    bg: 'bg-pink-50 text-pink-700',
    text: 'text-pink-700'
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
    <div className="prism-glass rounded-2xl overflow-hidden border border-white/80 shadow-lg shadow-purple-500/5 backdrop-blur-xl relative">
      {/* Top Bar with Slot Tabs and Controls */}
      <div className="p-3.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 border border-purple-200">
            <Bot className="h-4 w-4" />
          </div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            MULTI-PLATFORM INPUT SLOTS ({slots.filter(s => s.enabled).length}/{slots.length} ACTIVE)
          </h2>
        </div>

        {/* View switcher & Add slot */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('tabs')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                viewMode === 'tabs' ? 'bg-white text-purple-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Focus View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all flex items-center space-x-1 ${
                viewMode === 'grid' ? 'bg-white text-purple-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Columns className="h-3 w-3" />
              <span>Side-by-Side</span>
            </button>
          </div>

          <button
            onClick={onAddSlot}
            className="btn-aurora flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Slot</span>
          </button>
        </div>
      </div>

      {/* Tabs list (when in tabs mode) */}
      {viewMode === 'tabs' && (
        <div className="flex overflow-x-auto border-b border-slate-200/80 px-3 pt-2 bg-slate-100/40 gap-1.5 scrollbar-thin">
          {slots.map((slot) => {
            const theme = PLATFORM_THEMES[slot.platform] || PLATFORM_THEMES.custom;
            const isCurrent = slot.id === activeSlot?.id;
            const tokenCount = estimateTokens(slot.prompt);

            return (
              <button
                key={slot.id}
                onClick={() => setActiveSlotId(slot.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-t-xl text-xs font-mono transition-all border-t-2 ${
                  isCurrent
                    ? 'bg-white border-t-purple-600 border-x border-slate-200 text-slate-900 font-bold shadow-sm'
                    : 'bg-transparent border-t-transparent border-x-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
                } ${!slot.enabled ? 'opacity-40 line-through' : ''}`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
                <span>{slot.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {tokenCount}t
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4">
        {viewMode === 'tabs' && activeSlot && (
          <div className="space-y-3">
            {/* Slot toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={activeSlot.name}
                  onChange={(e) => onUpdateSlot(activeSlot.id, { name: e.target.value })}
                  className="bg-white border border-slate-200 font-mono text-xs font-bold text-slate-800 px-3 py-1.5 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 shadow-sm"
                />
                <span className="text-xs text-slate-500 font-mono">
                  {estimateTokens(activeSlot.prompt)} tokens • {activeSlot.prompt.length} chars
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyPrompt(activeSlot.id, activeSlot.prompt)}
                  className="p-1.5 text-slate-500 hover:text-purple-600 bg-white border border-slate-200 hover:border-purple-300 rounded-xl transition-all shadow-sm active:scale-95"
                  title="Copy prompt"
                >
                  {copiedId === activeSlot.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => onUpdateSlot(activeSlot.id, { enabled: !activeSlot.enabled })}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all border shadow-sm ${
                    activeSlot.enabled 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  <Power className="h-3 w-3" />
                  <span>{activeSlot.enabled ? 'ACTIVE' : 'BYPASSED'}</span>
                </button>
                {slots.length > 1 && (
                  <button
                    onClick={() => onRemoveSlot(activeSlot.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-300 rounded-xl transition-all shadow-sm active:scale-95"
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
                className="w-full bg-slate-50/70 text-slate-800 font-mono text-xs p-4 rounded-xl border border-slate-200 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:outline-none transition-all leading-relaxed resize-y shadow-inner"
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
                  className={`flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ${
                    !slot.enabled ? 'opacity-40' : ''
                  }`}
                >
                  <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.color }} />
                      <span className="text-xs font-bold text-slate-800">{slot.name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded-md">
                        {tokenCount}t
                      </span>
                      <button
                        onClick={() => onUpdateSlot(slot.id, { enabled: !slot.enabled })}
                        className={`p-1 rounded text-xs ${
                          slot.enabled ? 'text-emerald-600' : 'text-slate-400'
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
                    className="w-full bg-transparent text-slate-700 font-mono text-[11px] p-3 focus:outline-none resize-none leading-relaxed"
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
