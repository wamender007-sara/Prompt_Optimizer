import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Power, 
  Columns, 
  Copy, 
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { PromptSlot, PlatformId } from '../types';
import { estimateTokens } from '../engine/compiler';

interface PromptSlotManagerProps {
  slots: PromptSlot[];
  onUpdateSlot: (id: string, updates: Partial<PromptSlot>) => void;
  onAddSlot: () => void;
  onRemoveSlot: (id: string) => void;
  onCompile?: () => void;
  isCompiling?: boolean;
}

// VIBGYOR aligned platform color themes
const PLATFORM_THEMES: Record<PlatformId, { color: string; border: string; bg: string; text: string; letter: string }> = {
  chatgpt: {
    color: '#10B981', // G - Green
    border: 'border-emerald-300',
    bg: 'bg-emerald-50 text-emerald-800',
    text: 'text-emerald-700',
    letter: 'G'
  },
  claude: {
    color: '#F97316', // O - Orange
    border: 'border-orange-300',
    bg: 'bg-orange-50 text-orange-800',
    text: 'text-orange-700',
    letter: 'O'
  },
  gemini: {
    color: '#3B82F6', // B - Blue
    border: 'border-blue-300',
    bg: 'bg-blue-50 text-blue-800',
    text: 'text-blue-700',
    letter: 'B'
  },
  cursor: {
    color: '#6366F1', // I - Indigo
    border: 'border-indigo-300',
    bg: 'bg-indigo-50 text-indigo-800',
    text: 'text-indigo-700',
    letter: 'I'
  },
  deepseek: {
    color: '#0284C7', // B/Cyan
    border: 'border-sky-300',
    bg: 'bg-sky-50 text-sky-800',
    text: 'text-sky-700',
    letter: 'B'
  },
  perplexity: {
    color: '#0D9488', // Teal
    border: 'border-teal-300',
    bg: 'bg-teal-50 text-teal-800',
    text: 'text-teal-700',
    letter: 'P'
  },
  custom: {
    color: '#8B5CF6', // V - Violet
    border: 'border-purple-300',
    bg: 'bg-purple-50 text-purple-800',
    text: 'text-purple-700',
    letter: 'V'
  }
};

export const PromptSlotManager: React.FC<PromptSlotManagerProps> = ({
  slots,
  onUpdateSlot,
  onAddSlot,
  onRemoveSlot,
  onCompile,
  isCompiling = false
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
    <div className="white-glass-card rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      {/* Top Animated Continuous VIBGYOR Accent Line */}
      <div className="h-[3px] w-full vibgyor-ribbon" />

      {/* Top Bar with Slot Tabs and Controls */}
      <div className="p-3.5 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg vibgyor-ribbon text-white shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <span>MULTI-PLATFORM INPUT SLOTS</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {slots.filter(s => s.enabled).length}/{slots.length} ACTIVE
            </span>
          </h2>
        </div>

        {/* View switcher, Add slot, and Synthesize Now */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('tabs')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                viewMode === 'tabs' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Focus View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all flex items-center space-x-1 ${
                viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Columns className="h-3 w-3" />
              <span>Side-by-Side</span>
            </button>
          </div>

          <button
            onClick={onAddSlot}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs transition-all active:scale-95"
            title="Add a new custom model slot"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Slot</span>
          </button>

          {onCompile && (
            <button
              onClick={onCompile}
              disabled={isCompiling}
              className="btn-vibgyor-animated flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold shadow-sm"
              title="Synthesize and optimize all prompts"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
              <span>{isCompiling ? 'Synthesizing...' : 'Synthesize Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs list (when in tabs mode) */}
      {viewMode === 'tabs' && (
        <div className="flex overflow-x-auto border-b border-slate-200/80 px-3 pt-2 bg-slate-50/60 gap-1.5 scrollbar-thin">
          {slots.map((slot) => {
            const theme = PLATFORM_THEMES[slot.platform] || PLATFORM_THEMES.custom;
            const isCurrent = slot.id === activeSlot?.id;
            const tokenCount = estimateTokens(slot.prompt);

            return (
              <div
                key={slot.id}
                onClick={() => setActiveSlotId(slot.id)}
                className={`group flex items-center space-x-1.5 px-3 py-2 rounded-t-xl text-xs font-mono transition-all border-t-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-white border-x border-slate-200 text-slate-900 font-bold shadow-xs'
                    : 'bg-transparent border-t-transparent border-x-transparent text-slate-500 hover:text-slate-800 hover:bg-white/80'
                } ${!slot.enabled ? 'opacity-40 line-through' : ''}`}
                style={{
                  borderTopColor: isCurrent ? theme.color : 'transparent'
                }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-xs shrink-0"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="truncate max-w-[120px]">{slot.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {tokenCount}t
                </span>
                {slots.length > 1 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSlot(slot.id);
                    }}
                    className="p-0.5 rounded hover:bg-rose-100 hover:text-rose-600 text-slate-400 opacity-60 group-hover:opacity-100 transition-all ml-0.5"
                    title={`Remove ${slot.name} (x)`}
                    aria-label={`Remove ${slot.name}`}
                  >
                    <X className="h-3 w-3 stroke-[2.5]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="p-0.5 rounded text-slate-300 opacity-30 cursor-not-allowed ml-0.5"
                    title="Cannot remove the only model"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 bg-white">
        {viewMode === 'tabs' && activeSlot && (
          <div className="space-y-3">
            {/* Slot toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={activeSlot.name}
                  onChange={(e) => onUpdateSlot(activeSlot.id, { name: e.target.value })}
                  className="bg-white border border-slate-200 font-mono text-xs font-bold text-slate-800 px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs"
                />
                <select
                  value={activeSlot.platform}
                  onChange={(e) => onUpdateSlot(activeSlot.id, { platform: e.target.value as PlatformId })}
                  className="bg-white border border-slate-200 font-mono text-[11px] font-semibold text-slate-700 px-2 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
                >
                  <option value="chatgpt">ChatGPT</option>
                  <option value="claude">Claude</option>
                  <option value="gemini">Gemini</option>
                  <option value="cursor">Cursor</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="perplexity">Perplexity</option>
                  <option value="custom">Custom</option>
                </select>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  {estimateTokens(activeSlot.prompt)} tokens • {activeSlot.prompt.length} chars
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyPrompt(activeSlot.id, activeSlot.prompt)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-all shadow-xs active:scale-95"
                  title="Copy prompt"
                >
                  {copiedId === activeSlot.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => onUpdateSlot(activeSlot.id, { enabled: !activeSlot.enabled })}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all border shadow-xs ${
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
                    className="flex items-center space-x-1 px-2 py-1 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-300 rounded-xl transition-all shadow-xs active:scale-95 text-xs font-mono"
                    title={`Remove ${activeSlot.name} (x)`}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                )}
              </div>
            </div>

            {/* Prompt Editor Textarea on Pure White */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 shadow-inner transition-all">
              <div 
                className="h-[2.5px] w-full"
                style={{ backgroundColor: PLATFORM_THEMES[activeSlot.platform]?.color || '#8B5CF6' }}
              />
              <textarea
                rows={8}
                value={activeSlot.prompt}
                onChange={(e) => onUpdateSlot(activeSlot.id, { prompt: e.target.value })}
                placeholder={`Enter prompt directives for ${activeSlot.name}...`}
                className="w-full bg-white text-slate-900 font-mono text-xs p-4 focus:outline-none transition-all leading-relaxed resize-y"
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
                  className={`flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden ${
                    !slot.enabled ? 'opacity-40' : ''
                  }`}
                >
                  <div 
                    className="h-[2.5px] w-full"
                    style={{ backgroundColor: theme.color }}
                  />
                  {/* Card Header with Name, Tokens, Power, and (X) Remove Button */}
                  <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate pr-1">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
                      <span className="text-xs font-bold text-slate-800 truncate">{slot.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded-md">
                        {tokenCount}t
                      </span>
                      <button
                        onClick={() => onUpdateSlot(slot.id, { enabled: !slot.enabled })}
                        className={`p-1 rounded text-xs hover:bg-slate-200/50 transition-colors ${
                          slot.enabled ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                        title={slot.enabled ? 'Disable slot' : 'Enable slot'}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>
                      {slots.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => onRemoveSlot(slot.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all active:scale-95 ml-0.5"
                          title={`Remove ${slot.name} (x)`}
                          aria-label={`Remove ${slot.name}`}
                        >
                          <X className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="p-1 rounded text-slate-300 opacity-40 cursor-not-allowed ml-0.5"
                          title="Cannot remove the only model"
                          aria-label="Cannot remove model"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    value={slot.prompt}
                    onChange={(e) => onUpdateSlot(slot.id, { prompt: e.target.value })}
                    className="w-full bg-white text-slate-800 font-mono text-[11px] p-3 focus:outline-none resize-none leading-relaxed"
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
