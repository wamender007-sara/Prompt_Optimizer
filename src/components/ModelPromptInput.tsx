import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Zap, 
  Plus,
  Power,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Copy,
  Layers,
  Filter
} from 'lucide-react';
import { PlatformId, CompressionMode, PromptSlot } from '../types';
import { estimateTokens } from '../engine/compiler';

export interface ModelConfig {
  id: PlatformId;
  name: string;
  provider: string;
  badge: string;
  themeColor: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  iconLetter: string;
  samplePrompt: string;
  placeholder: string;
}

export const ALL_MODEL_CONFIGS: Record<PlatformId, ModelConfig> = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT 4o',
    provider: 'OpenAI',
    badge: 'GPT-4o',
    themeColor: '#10B981',
    accentBorder: 'border-emerald-300 hover:border-emerald-400 focus-within:border-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeText: 'text-emerald-700',
    iconLetter: 'G',
    samplePrompt: `Act as a world-renowned Senior Software Architect with 20+ years of experience.
I need you to thoroughly examine my code. Please make sure to point out any code smells, eliminate all vulnerabilities, and make it look clean and modern.
Follow SOLID principles and please explain every single step kindly as if I am learning. Also feel free to add nice greetings and have fun with it!`,
    placeholder: 'Enter prompt for ChatGPT (e.g. system instructions, persona, clean code requirements)...'
  },
  claude: {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    badge: 'Claude 3.5',
    themeColor: '#F97316',
    accentBorder: 'border-orange-300 hover:border-orange-400 focus-within:border-orange-500',
    badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
    badgeText: 'text-orange-700',
    iconLetter: 'C',
    samplePrompt: `Analyze the provided TypeScript snippet with strict adherence to architectural resilience and type soundness.
<constraints>
- Eliminate all usage of 'any', replacing with strict generics, unknown with type guards, or discriminated unions.
- Enforce immutable data structures (Readonly<T>, ReadonlyArray<T>, Object.freeze).
- Flag any asynchronous unhandled rejections or memory leaks.
</constraints>
<output_format>
Output only: 1. Vulnerability Matrix; 2. Refactored Codebase; 3. Verification Proofs.
No conversational preamble or polite pleasantries.`,
    placeholder: 'Enter prompt for Claude (e.g. XML tags <constraints>, strict guardrails, zero pleasantries)...'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini 2.0 / 1.5 Pro',
    provider: 'Google',
    badge: 'Gemini 2.0',
    themeColor: '#3B82F6',
    accentBorder: 'border-blue-300 hover:border-blue-400 focus-within:border-blue-500',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    badgeText: 'text-blue-700',
    iconLetter: 'G',
    samplePrompt: `You are an expert Google engineer specializing in V8 engine optimization and high-throughput Node.js microservices.
Examine this implementation:
1. Benchmark potential and identify hidden CPU spikes, de-optimizations, and GC pressure in V8.
2. Verify cross-service resilience: circuit breaker patterns and exponential backoff with jitter.
3. Produce tabular summaries comparing Before vs. After memory complexity.`,
    placeholder: 'Enter prompt for Gemini (e.g. high-throughput architecture, benchmark goals, V8 optimizations)...'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek V3 / R1',
    provider: 'DeepSeek',
    badge: 'DeepSeek',
    themeColor: '#06B6D4',
    accentBorder: 'border-cyan-300 hover:border-cyan-400 focus-within:border-cyan-500',
    badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    badgeText: 'text-cyan-700',
    iconLetter: 'D',
    samplePrompt: `Act as an elite algorithmic competitive programming master.
Analyze this logic for edge case overflows, Big-O algorithmic complexity, memory heap allocation bottlenecks, and concurrency deadlocks.
Provide complete refactored code without polite disclaimers.`,
    placeholder: 'Enter prompt for DeepSeek (e.g. mathematical bounds, algorithmic logic, edge-case proofs)...'
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor / Copilot',
    provider: 'Anysphere',
    badge: 'Cursor',
    themeColor: '#6366F1',
    accentBorder: 'border-indigo-300 hover:border-indigo-400 focus-within:border-indigo-500',
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    badgeText: 'text-indigo-700',
    iconLetter: 'C',
    samplePrompt: `// .cursorrules context: High-performance TypeScript Node.js backend
// Focus: Strict AST refactor, zero any, production safety
- Always return exact code replacements, no placeholder comments like '// ... rest of code'.
- Implement strict null checks and exhaustive switch matching with assertNever.
- Add comprehensive JSDoc annotations with @param, @returns, and @throws.`,
    placeholder: 'Enter prompt for Cursor (e.g. .cursorrules patterns, exact replacement directives)...'
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity Pro',
    provider: 'Perplexity',
    badge: 'Perplexity',
    themeColor: '#0D9488',
    accentBorder: 'border-teal-300 hover:border-teal-400 focus-within:border-teal-500',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
    badgeText: 'text-teal-700',
    iconLetter: 'P',
    samplePrompt: `Search authoritative engineering documentation and benchmarks for optimal garbage collection tuning in Node.js V8. Extract empirical data comparing Mark-Sweep vs Scavenge pauses. Cite official V8 sources directly.`,
    placeholder: 'Enter prompt for Perplexity (e.g. citation requirements, empirical research criteria)...'
  },
  custom: {
    id: 'custom',
    name: 'Universal / Custom Model',
    provider: 'Custom AI',
    badge: 'Universal',
    themeColor: '#8B5CF6',
    accentBorder: 'border-purple-300 hover:border-purple-400 focus-within:border-purple-500',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
    badgeText: 'text-purple-700',
    iconLetter: 'U',
    samplePrompt: `Analyze this codebase thoroughly. Remove all conversational filler, preserve core constraints, structure output with clear tables, and enforce deterministic output schemas.`,
    placeholder: 'Enter custom universal prompt directives...'
  }
};

const COMPRESSION_MODES: { id: CompressionMode; label: string; icon: string; desc: string }[] = [
  { id: 'production_balanced', label: 'Balanced', icon: '⚡', desc: 'Preserves critical logic, cuts filler' },
  { id: 'ultra_distilled', label: 'Ultra Distilled', icon: '🎯', desc: 'Maximum compression & token efficiency' },
  { id: 'structured_xml', label: 'Structured XML', icon: '📐', desc: 'Strict tags & clear separation' },
];

interface ModelPromptInputProps {
  slots: PromptSlot[];
  selectedMode: CompressionMode;
  isCompiling: boolean;
  onUpdateSlot: (id: string, updates: Partial<PromptSlot>) => void;
  onAddSlot: (platform: PlatformId) => void;
  onRemoveSlot: (id: string) => void;
  onModeChange: (mode: CompressionMode) => void;
  onOptimize: () => void;
  onFillAllSamples: () => void;
  onClearAllSlots: () => void;
}

export const ModelPromptInput: React.FC<ModelPromptInputProps> = ({
  slots,
  selectedMode,
  isCompiling,
  onUpdateSlot,
  onAddSlot,
  onRemoveSlot,
  onModeChange,
  onOptimize,
  onFillAllSamples,
  onClearAllSlots,
}) => {
  // Collapsed states per slot
  const [collapsedSlots, setCollapsedSlots] = useState<Record<string, boolean>>({});
  const [filterModel, setFilterModel] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleCollapse = (id: string) => {
    setCollapsedSlots(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopySlot = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Calculate active counts and tokens
  const activeSlots = slots.filter(s => s.enabled);
  const totalTokens = activeSlots.reduce((acc, s) => acc + estimateTokens(s.prompt), 0);
  const totalChars = activeSlots.reduce((acc, s) => acc + s.prompt.length, 0);

  // Available models not yet added (for Add Model dropdown)
  const existingPlatforms = new Set(slots.map(s => s.platform));
  const availableToAdd = Object.values(ALL_MODEL_CONFIGS).filter(c => !existingPlatforms.has(c.id));

  // Filtered slots for view
  const visibleSlots = filterModel === 'all' 
    ? slots 
    : slots.filter(s => s.platform === filterModel);

  return (
    <div className="card-3d overflow-hidden flex flex-col h-full relative group">
      {/* 3D Flow Border Line */}
      <div className="h-[3px] w-full flow-accent-line" />

      {/* Top Header: Multi-Model Status & Quick Actions */}
      <div className="p-4 bg-white/95 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-xs flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  SEPARATE MODEL PROMPT BOXES
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeSlots.length}/{slots.length} ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Each model has its own dedicated box &bull; Synthesizes into one master prompt
              </p>
            </div>
          </div>

          {/* Action buttons: Fill Samples, Clear All, Add Model */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onFillAllSamples}
              title="Fill all active boxes with realistic model prompts"
              className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all active:scale-95 shadow-2xs"
            >
              <Sparkles className="h-3 w-3 text-indigo-600" />
              <span>Fill Samples</span>
            </button>

            <button
              onClick={onClearAllSlots}
              title="Clear all prompt boxes"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-all active:scale-95 bg-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {availableToAdd.length > 0 && (
              <div className="relative group/add">
                <button
                  className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all active:scale-95 shadow-2xs"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Box</span>
                </button>
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 hidden group-hover/add:block z-30">
                  <div className="text-[10px] font-mono font-bold text-slate-400 px-2 py-1 uppercase">
                    Add Model Box:
                  </div>
                  {availableToAdd.map(cfg => (
                    <button
                      key={cfg.id}
                      onClick={() => onAddSlot(cfg.id)}
                      className="w-full text-left px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <span 
                        className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ backgroundColor: cfg.themeColor }}
                      >
                        {cfg.iconLetter}
                      </span>
                      <span className="truncate">{cfg.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Filter Bar (All or Specific Model Box) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-0.5">
          <button
            onClick={() => setFilterModel('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
              filterModel === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Boxes ({slots.length})
          </button>
          {slots.map(s => {
            const cfg = ALL_MODEL_CONFIGS[s.platform] || ALL_MODEL_CONFIGS.custom;
            const isFilter = filterModel === s.platform;
            return (
              <button
                key={s.id}
                onClick={() => setFilterModel(isFilter ? 'all' : s.platform)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all border ${
                  isFilter
                    ? `${cfg.badgeBg} font-bold shadow-xs`
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span 
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: cfg.themeColor }}
                />
                <span>{cfg.badge}</span>
                {!s.enabled && <span className="text-[9px] text-slate-400">(Off)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main List of SEPARATE MODEL BOXES */}
      <div className="p-4 flex-1 flex flex-col space-y-4 bg-slate-50/60 overflow-y-auto max-h-[620px]">
        {visibleSlots.map((slot) => {
          const cfg = ALL_MODEL_CONFIGS[slot.platform] || ALL_MODEL_CONFIGS.custom;
          const isCollapsed = !!collapsedSlots[slot.id];
          const tokens = estimateTokens(slot.prompt);
          const chars = slot.prompt.length;

          return (
            <div
              key={slot.id}
              className={`rounded-2xl border transition-all duration-300 relative shadow-xs overflow-hidden ${
                slot.enabled 
                  ? `bg-white ${cfg.accentBorder} shadow-sm` 
                  : 'bg-slate-100/70 border-slate-200 opacity-60'
              }`}
            >
              {/* Distinctive Top 3D Color Stripe for this Model */}
              <div 
                className="h-[3px] w-full"
                style={{ backgroundColor: cfg.themeColor }}
              />

              {/* Box Header */}
              <div className="p-3 bg-slate-50/80 border-b border-slate-200/70 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  {/* Model Icon Emblem */}
                  <div 
                    className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0"
                    style={{ backgroundColor: cfg.themeColor }}
                  >
                    {cfg.iconLetter}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xs font-bold text-slate-900">
                        {cfg.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({cfg.provider})
                      </span>
                      {slot.enabled ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tokens} TOKENS
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-200">
                          DISABLED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Box Controls (Power Toggle, Sample, Clear, Collapse, Remove) */}
                <div className="flex items-center space-x-1.5">
                  {/* Load Sample into this box */}
                  <button
                    onClick={() => onUpdateSlot(slot.id, { prompt: cfg.samplePrompt, enabled: true })}
                    title={`Load sample prompt for ${cfg.badge}`}
                    className="px-2 py-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-all active:scale-95"
                  >
                    Sample
                  </button>

                  {/* Copy content */}
                  {slot.prompt && (
                    <button
                      onClick={() => handleCopySlot(slot.id, slot.prompt)}
                      title="Copy prompt text"
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-all"
                    >
                      {copiedId === slot.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}

                  {/* Clear box text */}
                  {slot.prompt && (
                    <button
                      onClick={() => onUpdateSlot(slot.id, { prompt: '' })}
                      title="Clear this box"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}

                  {/* Power toggle */}
                  <button
                    onClick={() => onUpdateSlot(slot.id, { enabled: !slot.enabled })}
                    title={slot.enabled ? "Disable this model box" : "Enable this model box"}
                    className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
                      slot.enabled 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs' 
                        : 'bg-slate-200 text-slate-400 border-slate-300'
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>

                  {/* Collapse / Expand */}
                  <button
                    onClick={() => toggleCollapse(slot.id)}
                    title={isCollapsed ? "Expand box" : "Collapse box"}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-all"
                  >
                    {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                  </button>

                  {/* Remove box if extra */}
                  {slots.length > 1 && (
                    <button
                      onClick={() => onRemoveSlot(slot.id)}
                      title="Delete this model box"
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition-all ml-0.5"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* Dedicated Textarea for this model */}
              {!isCollapsed && (
                <div className="p-3 bg-white">
                  <textarea
                    value={slot.prompt}
                    onChange={(e) => onUpdateSlot(slot.id, { prompt: e.target.value })}
                    placeholder={cfg.placeholder}
                    rows={4}
                    disabled={!slot.enabled}
                    className="w-full p-2.5 text-xs font-mono leading-relaxed text-slate-800 placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 resize-y transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5 px-1">
                    <span>
                      CHARS: <strong className="text-slate-600">{chars}</strong> &bull; TOKENS: <strong className="text-slate-700">{tokens}</strong>
                    </span>
                    <span className="text-slate-400 italic">
                      Dedicated {cfg.badge} Slot
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mode Selector & 3D Action Optimize Button */}
      <div className="p-4 bg-slate-50/90 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Compact Mode Pill Selector */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {COMPRESSION_MODES.map((m) => {
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                title={m.desc}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Optimize Button with Flow Animated Colors */}
        <button
          onClick={onOptimize}
          disabled={isCompiling || totalTokens === 0}
          className="btn-flow-3d flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
        >
          <Sparkles className={`h-4 w-4 ${isCompiling ? 'animate-spin' : ''}`} />
          <span>
            {isCompiling ? 'Synthesizing...' : `Synthesize ${activeSlots.length} Models (${totalTokens} Tok)`}
          </span>
        </button>
      </div>
    </div>
  );
};
