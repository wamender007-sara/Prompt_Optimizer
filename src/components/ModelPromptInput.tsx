import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Zap, 
  Layers, 
  Code2, 
  FileText,
  SlidersHorizontal,
  Flame,
  Plus
} from 'lucide-react';
import { PlatformId, CompressionMode, PromptSlot } from '../types';
import { estimateTokens } from '../engine/compiler';

export interface ModelOption {
  id: PlatformId;
  name: string;
  provider: string;
  badge: string;
  themeColor: string;
  accentClass: string;
  lightBg: string;
  borderColor: string;
  iconLetter: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT 4o',
    provider: 'OpenAI',
    badge: 'GPT-4o',
    themeColor: '#10B981',
    accentClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    lightBg: 'bg-emerald-500/10',
    borderColor: 'border-emerald-400',
    iconLetter: 'G',
    description: 'Concise imperative commands & clean structure'
  },
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    badge: 'Sonnet',
    themeColor: '#F97316',
    accentClass: 'text-orange-700 bg-orange-50 border-orange-200',
    lightBg: 'bg-orange-500/10',
    borderColor: 'border-orange-400',
    iconLetter: 'C',
    description: 'XML delimited constraints & precise boundary proofs'
  },
  {
    id: 'gemini',
    name: 'Gemini 2.0 / 1.5 Pro',
    provider: 'Google',
    badge: 'Gemini',
    themeColor: '#3B82F6',
    accentClass: 'text-blue-700 bg-blue-50 border-blue-200',
    lightBg: 'bg-blue-500/10',
    borderColor: 'border-blue-400',
    iconLetter: 'G',
    description: 'System-level architecture & high-throughput reasoning'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek V3 / R1',
    provider: 'DeepSeek',
    badge: 'DeepSeek',
    themeColor: '#06B6D4',
    accentClass: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    lightBg: 'bg-cyan-500/10',
    borderColor: 'border-cyan-400',
    iconLetter: 'D',
    description: 'Algorithmic math, code logic & zero conversational fluff'
  },
  {
    id: 'cursor',
    name: 'Cursor / Copilot',
    provider: 'Anysphere',
    badge: 'Cursor',
    themeColor: '#6366F1',
    accentClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    lightBg: 'bg-indigo-500/10',
    borderColor: 'border-indigo-400',
    iconLetter: 'C',
    description: 'Direct code replacements with .cursorrules patterns'
  },
  {
    id: 'custom',
    name: 'Universal / Custom',
    provider: 'Standard AI',
    badge: 'Universal',
    themeColor: '#8B5CF6',
    accentClass: 'text-purple-700 bg-purple-50 border-purple-200',
    lightBg: 'bg-purple-500/10',
    borderColor: 'border-purple-400',
    iconLetter: 'U',
    description: 'Model-agnostic high-density distillation'
  },
  {
    id: 'perplexity',
    name: 'Perplexity Pro',
    provider: 'Perplexity',
    badge: 'Perplexity',
    themeColor: '#0D9488',
    accentClass: 'text-teal-700 bg-teal-50 border-teal-200',
    lightBg: 'bg-teal-500/10',
    borderColor: 'border-teal-400',
    iconLetter: 'P',
    description: 'Fact-retrieval synthesis with verifiable citations'
  }
];

const COMPRESSION_MODES: { id: CompressionMode; label: string; icon: string; desc: string }[] = [
  { id: 'production_balanced', label: 'Balanced', icon: '⚡', desc: 'Preserves critical logic, cuts filler' },
  { id: 'ultra_distilled', label: 'Ultra Distilled', icon: '🎯', desc: 'Maximum compression & token efficiency' },
  { id: 'structured_xml', label: 'Structured XML', icon: '📐', desc: 'Strict tags & clear separation' },
];

const SAMPLE_PROMPTS: Record<PlatformId, string> = {
  chatgpt: `Act as a world-renowned Senior Software Architect with 20+ years of experience.
I need you to thoroughly examine my code. Please make sure to point out any code smells, eliminate all vulnerabilities, and make it look clean and modern.
Follow SOLID principles and please explain every single step kindly as if I am learning. Also feel free to add nice greetings and have fun with it!`,

  claude: `You are an expert AI assistant. Could you please review my TypeScript backend code?
I want you to be very detailed. Please ensure no 'any' types are used, enforce immutability, check for potential memory leaks with event listeners, and ensure inputs are strictly validated.
Please format the output nicely with tables and provide invariant verification proofs.`,

  gemini: `Hey there! Can you please analyze my Node.js microservice architecture?
I need an expert Google engineer to benchmark potential CPU spikes, identify V8 de-optimizations, and evaluate memory garbage collection pressure.
Please include circuit breaker designs, exponential backoff formulas, and before/after latency comparisons.`,

  deepseek: `Act as an elite algorithmic competitive programming master.
Analyze this logic for edge case overflows, Big-O algorithmic complexity, memory heap allocation bottlenecks, and concurrency deadlocks.
Provide complete refactored code without polite disclaimers.`,

  cursor: `// .cursorrules context: High-performance TypeScript Node.js backend
// Focus: Strict AST refactor, zero any, production safety
- Always return exact code replacements, no placeholder comments like '// ... rest of code'.
- Implement strict null checks and exhaustive switch matching with assertNever.
- Add comprehensive JSDoc annotations.`,

  perplexity: `Search academic literature and verified documentation for optimal garbage collection tuning in Node.js V8. Extract empirical benchmarks and compare Mark-Sweep vs Scavenge pauses. Cite authoritative sources directly.`,

  custom: `Please act as a professional developer. Review my prompt and rewrite it to be shorter, faster, and more direct without losing any essential directives or schema requirements.`
};

interface ModelPromptInputProps {
  promptText: string;
  selectedModel: PlatformId;
  selectedMode: CompressionMode;
  isCompiling: boolean;
  onPromptChange: (text: string) => void;
  onModelChange: (model: PlatformId) => void;
  onModeChange: (mode: CompressionMode) => void;
  onOptimize: () => void;
}

export const ModelPromptInput: React.FC<ModelPromptInputProps> = ({
  promptText,
  selectedModel,
  selectedMode,
  isCompiling,
  onPromptChange,
  onModelChange,
  onModeChange,
  onOptimize,
}) => {
  const [copied, setCopied] = useState(false);

  const activeModelMeta = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];
  const tokenCount = estimateTokens(promptText);
  const charCount = promptText.length;

  const handleCopy = () => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    onPromptChange('');
  };

  const handleLoadSample = () => {
    const sample = SAMPLE_PROMPTS[selectedModel] || SAMPLE_PROMPTS.chatgpt;
    onPromptChange(sample);
  };

  return (
    <div className="card-3d overflow-hidden flex flex-col h-full relative group">
      {/* 3D Flow Border Glow */}
      <div className="h-[3px] w-full flow-accent-line" />

      {/* Top Header: Model Selection */}
      <div className="p-4 bg-white/90 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm transition-transform duration-300 hover:rotate-12"
              style={{ backgroundColor: activeModelMeta.themeColor }}
            >
              {activeModelMeta.iconLetter}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  INPUT PROMPT
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${activeModelMeta.accentClass}`}>
                  {activeModelMeta.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Targeting: {activeModelMeta.provider} &bull; {activeModelMeta.description}
              </p>
            </div>
          </div>

          {/* Quick Actions (Sample, Clear, Copy) */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleLoadSample}
              title="Insert realistic sample prompt"
              className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all active:scale-95 shadow-2xs"
            >
              <Sparkles className="h-3 w-3 text-indigo-600" />
              <span>Try Sample</span>
            </button>
            {promptText && (
              <>
                <button
                  onClick={handleCopy}
                  title="Copy current input"
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all active:scale-95 bg-white"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={handleClear}
                  title="Clear text"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-all active:scale-95 bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3D Model Picker Tabs */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
          {AVAILABLE_MODELS.map((model) => {
            const isSelected = model.id === selectedModel;
            return (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all duration-200 relative group/btn ${
                  isSelected
                    ? 'bg-white shadow-md border-2 scale-[1.02] z-10'
                    : 'bg-slate-50/70 hover:bg-white hover:shadow-xs border border-slate-200 text-slate-600'
                }`}
                style={{
                  borderColor: isSelected ? model.themeColor : undefined,
                }}
              >
                <span 
                  className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black text-white mb-1 shadow-2xs"
                  style={{ backgroundColor: model.themeColor }}
                >
                  {model.iconLetter}
                </span>
                <span className={`text-[11px] font-bold tracking-tight truncate max-w-full ${
                  isSelected ? 'text-slate-900' : 'text-slate-600'
                }`}>
                  {model.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Textarea Input */}
      <div className="p-4 flex-1 flex flex-col bg-white">
        <div className="relative flex-1 flex flex-col">
          <textarea
            value={promptText}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={`Enter or paste your raw prompt for ${activeModelMeta.name} here...\n\nExample: "Act as an expert... examine my code... make sure to explain everything nicely..."\n\nPromptOptimizer will strip conversational fluff, extract pure intent, and synthesize high-density directives.`}
            rows={10}
            className="w-full flex-1 p-3.5 text-xs sm:text-sm font-mono leading-relaxed text-slate-800 placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50/90 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all shadow-inner"
          />

          {/* Quick Counter pill floating in bottom right */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
            <span className="flex items-center space-x-1.5">
              <Zap className="h-3 w-3 text-amber-500" />
              <span>ESTIMATED TOKENS: <strong className="text-slate-700">{tokenCount}</strong></span>
              <span className="text-slate-300">&bull;</span>
              <span>CHARS: <strong className="text-slate-700">{charCount}</strong></span>
            </span>

            {promptText.trim().length > 0 && (
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <Check className="h-3 w-3" />
                <span>Ready to optimize</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mode Selector & 3D Action Optimize Button */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
          disabled={isCompiling || !promptText.trim()}
          className="btn-flow-3d flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
        >
          <Sparkles className={`h-4 w-4 ${isCompiling ? 'animate-spin' : ''}`} />
          <span>{isCompiling ? 'Synthesizing...' : `Optimize for ${activeModelMeta.badge}`}</span>
        </button>
      </div>
    </div>
  );
};
