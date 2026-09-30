import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Zap, 
  Plus,
  Power,
  RotateCcw,
  Check,
  Copy,
  Layers,
  ArrowDown,
  ChevronDown,
  ChevronUp
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
    placeholder: 'Enter prompt for ChatGPT (system instructions, persona, clean code requirements)...'
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
    placeholder: 'Enter prompt for Claude (XML tags <constraints>, strict guardrails, zero pleasantries)...'
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
    placeholder: 'Enter prompt for Gemini (high-throughput architecture, benchmark goals, V8 optimizations)...'
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
    placeholder: 'Enter prompt for DeepSeek (mathematical bounds, algorithmic logic, edge-case proofs)...'
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
    placeholder: 'Enter prompt for Cursor (.cursorrules patterns, exact replacement directives)...'
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
    placeholder: 'Enter prompt for Perplexity (citation requirements, empirical research criteria)...'
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterModel, setFilterModel] = useState<string>('all');

  const handleCopySlot = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const activeSlots = slots.filter(s => s.enabled);
  const totalTokens = activeSlots.reduce((acc, s) => acc + estimateTokens(s.prompt), 0);

  const existingPlatforms = new Set(slots.map(s => s.platform));
  const availableToAdd = Object.values(ALL_MODEL_CONFIGS).filter(c => !existingPlatforms.has(c.id));

  const visibleSlots = filterModel === 'all' 
    ? slots 
    : slots.filter(s => s.platform === filterModel);

  return (
    <div className="card-3d overflow-hidden flex flex-col relative w-full shadow-sm">
      {/* 3D Flow Border Accent Line */}
      <div className="h-[3.5px] w-full flow-accent-line" />

      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-white/95 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-xs flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                  INPUT OF PROMPTS FOR DIFFERENT MODELS
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                  {activeSlots.length}/{slots.length} ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Each model has its own dedicated input box &bull; Synthesized into the master prompt below
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onFillAllSamples}
              title="Fill all active boxes with sample prompts"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all active:scale-95 shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Fill Samples</span>
            </button>

            <button
              onClick={onClearAllSlots}
              title="Clear all prompt boxes"
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl transition-all active:scale-95 shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>

            {availableToAdd.length > 0 && (
              <div className="relative group/add">
                <button
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all active:scale-95 shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Box</span>
                </button>
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 hidden group-hover/add:block z-40">
                  <div className="text-[10px] font-mono font-bold text-slate-400 px-2 py-1 uppercase">
                    Add Model Box:
                  </div>
                  {availableToAdd.map(cfg => (
                    <button
                      key={cfg.id}
                      onClick={() => onAddSlot(cfg.id)}
                      className="w-full text-left px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <span 
                        className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-2xs"
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

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1">
          <button
            onClick={() => setFilterModel('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all border ${
                  isFilter
                    ? `${cfg.badgeBg} font-bold shadow-xs`
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: cfg.themeColor }}
                />
                <span>{cfg.badge}</span>
                {!s.enabled && <span className="text-[10px] text-slate-400 font-mono">(Disabled)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Separate Model Boxes (At the Top) */}
      <div className="p-4 sm:p-5 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleSlots.map((slot) => {
            const cfg = ALL_MODEL_CONFIGS[slot.platform] || ALL_MODEL_CONFIGS.custom;
            const tokens = estimateTokens(slot.prompt);
            const chars = slot.prompt.length;

            return (
              <div
                key={slot.id}
                className={`model-card-3d flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                  slot.enabled 
                    ? `bg-white ${cfg.accentBorder} shadow-sm` 
                    : 'bg-slate-100/80 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  {/* Top 3D Color Stripe for this Model */}
                  <div 
                    className="h-[3px] w-full"
                    style={{ backgroundColor: cfg.themeColor }}
                  />

                  {/* Model Box Header */}
                  <div className="p-3 bg-slate-50/90 border-b border-slate-200/70 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0"
                        style={{ backgroundColor: cfg.themeColor }}
                      >
                        {cfg.iconLetter}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="text-xs font-bold text-slate-900 leading-none">
                            {cfg.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {cfg.provider}
                          </span>
                        </div>
                        <div className="mt-0.5">
                          {slot.enabled ? (
                            <span className="text-[10px] font-mono font-semibold text-emerald-700">
                              {tokens} tokens &bull; {chars} chars
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400">
                              (Inactive)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Box Actions */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onUpdateSlot(slot.id, { prompt: cfg.samplePrompt, enabled: true })}
                        title={`Fill with sample for ${cfg.badge}`}
                        className="px-2 py-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-all active:scale-95"
                      >
                        Sample
                      </button>

                      {slot.prompt && (
                        <button
                          onClick={() => handleCopySlot(slot.id, slot.prompt)}
                          title="Copy prompt text"
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-all"
                        >
                          {copiedId === slot.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      )}

                      {slot.prompt && (
                        <button
                          onClick={() => onUpdateSlot(slot.id, { prompt: '' })}
                          title="Clear this box"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}

                      <button
                        onClick={() => onUpdateSlot(slot.id, { enabled: !slot.enabled })}
                        title={slot.enabled ? "Disable this box" : "Enable this box"}
                        className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
                          slot.enabled 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs' 
                            : 'bg-slate-200 text-slate-400 border-slate-300'
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>

                      {slots.length > 1 && (
                        <button
                          onClick={() => onRemoveSlot(slot.id)}
                          title="Remove box"
                          className="p-1 text-slate-300 hover:text-rose-500 rounded transition-all"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dedicated Textarea for this model */}
                  <div className="p-3 bg-white">
                    <textarea
                      value={slot.prompt}
                      onChange={(e) => onUpdateSlot(slot.id, { prompt: e.target.value })}
                      placeholder={cfg.placeholder}
                      rows={5}
                      disabled={!slot.enabled}
                      className="w-full p-2.5 text-xs font-mono leading-relaxed text-slate-800 placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 resize-y transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-3 py-1.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{cfg.badge} Engine Slot</span>
                  <span>{slot.prompt.trim() ? 'Ready' : 'Empty'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar of Input Area: Mode Selector & 3D Flow Optimize Action */}
      <div className="p-4 sm:p-5 bg-white/95 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Mode Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-mono font-bold text-slate-400 px-2 uppercase hidden md:inline">
            Mode:
          </span>
          {COMPRESSION_MODES.map((m) => {
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                title={m.desc}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Flow Optimize Action pointing to bottom */}
        <button
          onClick={onOptimize}
          disabled={isCompiling || totalTokens === 0}
          className="btn-flow-3d w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all active:scale-95"
        >
          <Sparkles className={`h-4 w-4 ${isCompiling ? 'animate-spin' : ''}`} />
          <span>
            {isCompiling ? 'Synthesizing Prompts...' : `Synthesize & Optimize ${activeSlots.length} Models (${totalTokens} Tok)`}
          </span>
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
