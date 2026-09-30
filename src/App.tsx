import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptHistory, HistoryItem } from './components/PromptHistory';
import { ModelPromptInput, ALL_MODEL_CONFIGS } from './components/ModelPromptInput';
import { OptimizedResultView } from './components/OptimizedResultView';
import { PlatformId, CompressionMode, SynthesisResult, PromptSlot } from './types';
import { compilePrompts } from './engine/compiler';

const STORAGE_KEY = 'prompt_optimizer_history_v2';

const INITIAL_SLOTS: PromptSlot[] = [
  {
    id: 'slot-chatgpt',
    platform: 'chatgpt',
    name: 'ChatGPT 4o',
    prompt: `Act as a world-renowned Senior Software Architect with 20+ years of experience.
I need you to thoroughly examine my code. Please make sure to point out any code smells, eliminate all vulnerabilities, and make it look clean and modern.
Follow SOLID principles and please explain every single step kindly as if I am learning. Also feel free to add nice greetings and have fun with it!`,
    enabled: true
  },
  {
    id: 'slot-claude',
    platform: 'claude',
    name: 'Claude 3.5 Sonnet',
    prompt: `Analyze the provided TypeScript snippet with strict adherence to architectural resilience and type soundness.
<constraints>
- Eliminate all usage of 'any', replacing with strict generics, unknown with type guards, or discriminated unions.
- Enforce immutable data structures (Readonly<T>, ReadonlyArray<T>, Object.freeze).
- Flag any asynchronous unhandled rejections or memory leaks.
</constraints>
<output_format>
Output only: 1. Vulnerability Matrix; 2. Refactored Codebase; 3. Verification Proofs.
No conversational preamble or polite pleasantries.`,
    enabled: true
  },
  {
    id: 'slot-gemini',
    platform: 'gemini',
    name: 'Gemini 2.0 / 1.5 Pro',
    prompt: `You are an expert Google engineer specializing in V8 engine optimization and high-throughput Node.js microservices.
Examine this implementation:
1. Benchmark potential and identify hidden CPU spikes, de-optimizations, and GC pressure in V8.
2. Verify cross-service resilience: circuit breaker patterns and exponential backoff with jitter.
3. Produce tabular summaries comparing Before vs. After memory complexity.`,
    enabled: true
  },
  {
    id: 'slot-deepseek',
    platform: 'deepseek',
    name: 'DeepSeek V3 / R1',
    prompt: `Act as an elite algorithmic competitive programming master.
Analyze this logic for edge case overflows, Big-O algorithmic complexity, memory heap allocation bottlenecks, and concurrency deadlocks.
Provide complete refactored code without polite disclaimers.`,
    enabled: false
  },
  {
    id: 'slot-cursor',
    platform: 'cursor',
    name: 'Cursor / Copilot',
    prompt: `// .cursorrules context: High-performance TypeScript Node.js backend
// Focus: Strict AST refactor, zero any, production safety
- Always return exact code replacements, no placeholder comments like '// ... rest of code'.
- Implement strict null checks and exhaustive switch matching with assertNever.
- Add comprehensive JSDoc annotations with @param, @returns, and @throws.`,
    enabled: false
  }
];

const INITIAL_SAMPLE_HISTORY: HistoryItem[] = [
  {
    id: 'sample-hist-1',
    timestamp: Date.now() - 1000 * 60 * 15,
    timeAgo: '15m ago',
    model: 'claude',
    modelName: 'Multi-Model (Claude + GPT-4o)',
    mode: 'production_balanced',
    inputPrompt: `Act as a senior engineer. Please examine this TypeScript code, eliminate any usage of any, ensure immutable data structures, and check for async memory leaks. Do not add polite pleasantries.`,
    optimizedPrompt: `1. Enforce strict typing: replace all 'any' with discriminated unions or generics with guards.\n2. Mandate immutability across all data structures using Readonly<T>.\n3. Audit async workflows for unhandled rejections and EventEmitter leaks.\n4. Output vulnerability risk table and refactored zero-defect codebase.`,
    originalTokens: 46,
    optimizedTokens: 25,
    reductionPercentage: 46,
    coreIntent: 'Strict TypeScript immutability and memory leak audit'
  },
  {
    id: 'sample-hist-2',
    timestamp: Date.now() - 1000 * 60 * 65,
    timeAgo: '1h ago',
    model: 'gemini',
    modelName: 'Gemini 2.0 / 1.5 Pro',
    mode: 'ultra_distilled',
    inputPrompt: `You are an expert Google engineer. Can you please analyze my Node.js microservice architecture for CPU spikes, V8 de-optimizations, and GC pressure? Please provide circuit breaker patterns and latency diffs.`,
    optimizedPrompt: `Analyze Node.js microservice: profile V8 inline cache de-optimizations, GC heap pressure, and CPU hot loops. Implement circuit breaker with exponential jitter. Provide Before/After latency matrix.`,
    originalTokens: 42,
    optimizedTokens: 22,
    reductionPercentage: 48,
    coreIntent: 'V8 engine latency optimization and circuit breaker pattern'
  }
];

export const App: React.FC = () => {
  // State: Slots (Separate box for each model)
  const [slots, setSlots] = useState<PromptSlot[]>(INITIAL_SLOTS);
  const [selectedMode, setSelectedMode] = useState<CompressionMode>('production_balanced');

  // State: Synthesis Output & Compiling status
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // State: Past History
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_SAMPLE_HISTORY;
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  // Execute compilation across active model boxes
  const executeCompilation = useCallback(async (
    activeSlots: PromptSlot[],
    mode: CompressionMode,
    addToHistory: boolean = true
  ) => {
    const validSlots = activeSlots.filter(s => s.enabled && s.prompt.trim().length > 0);
    if (validSlots.length === 0) return;

    setIsCompiling(true);

    try {
      let result: SynthesisResult;
      const res = await fetch('/api/analyze-and-compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: validSlots, mode })
      });

      if (res.ok) {
        result = await res.json();
      } else {
        result = compilePrompts(validSlots, mode);
      }

      setSynthesis(result);

      // Add to past history if requested
      if (addToHistory && result && result.masterPrompt) {
        const primaryModel = validSlots[0]?.platform || 'custom';
        const modelNames = validSlots.map(s => s.name).join(' + ');
        const combinedInput = validSlots.map(s => `[${s.name}]: ${s.prompt}`).join('\n\n');

        const newHistItem: HistoryItem = {
          id: `hist-${Date.now()}`,
          timestamp: Date.now(),
          timeAgo: 'Just now',
          model: primaryModel,
          modelName: validSlots.length > 1 ? `Multi-Model (${validSlots.length})` : modelNames,
          mode: mode,
          inputPrompt: combinedInput,
          optimizedPrompt: result.masterPrompt,
          originalTokens: result.metrics.originalTotalTokens,
          optimizedTokens: result.metrics.compressedTokens,
          reductionPercentage: result.metrics.reductionPercentage,
          coreIntent: result.coreIntent || 'Prompt optimization'
        };

        setHistory(prev => [newHistItem, ...prev.filter(h => h.id !== newHistItem.id)].slice(0, 15));
      }
    } catch (err) {
      console.warn('Fallback to client compilation:', err);
      const fallback = compilePrompts(validSlots, mode);
      setSynthesis(fallback);

      if (addToHistory && fallback && fallback.masterPrompt) {
        const primaryModel = validSlots[0]?.platform || 'custom';
        const modelNames = validSlots.map(s => s.name).join(' + ');
        const combinedInput = validSlots.map(s => `[${s.name}]: ${s.prompt}`).join('\n\n');

        const newHistItem: HistoryItem = {
          id: `hist-${Date.now()}`,
          timestamp: Date.now(),
          timeAgo: 'Just now',
          model: primaryModel,
          modelName: validSlots.length > 1 ? `Multi-Model (${validSlots.length})` : modelNames,
          mode: mode,
          inputPrompt: combinedInput,
          optimizedPrompt: fallback.masterPrompt,
          originalTokens: fallback.metrics.originalTotalTokens,
          optimizedTokens: fallback.metrics.compressedTokens,
          reductionPercentage: fallback.metrics.reductionPercentage,
          coreIntent: fallback.coreIntent || 'Prompt optimization'
        };

        setHistory(prev => [newHistItem, ...prev.filter(h => h.id !== newHistItem.id)].slice(0, 15));
      }
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // Initial compilation on mount
  useEffect(() => {
    executeCompilation(slots, selectedMode, false);
  }, []);

  // Slot management
  const handleUpdateSlot = (id: string, updates: Partial<PromptSlot>) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleAddSlot = (platform: PlatformId) => {
    const cfg = ALL_MODEL_CONFIGS[platform];
    const newSlot: PromptSlot = {
      id: `slot-${platform}-${Date.now()}`,
      platform: platform,
      name: cfg?.name || platform,
      prompt: cfg?.samplePrompt || '',
      enabled: true
    };
    setSlots(prev => [...prev, newSlot]);
  };

  const handleRemoveSlot = (id: string) => {
    if (slots.length <= 1) return;
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleFillAllSamples = () => {
    setSlots(prev => prev.map(s => {
      const cfg = ALL_MODEL_CONFIGS[s.platform];
      return {
        ...s,
        prompt: cfg?.samplePrompt || s.prompt,
        enabled: true
      };
    }));
  };

  const handleClearAllSlots = () => {
    setSlots(prev => prev.map(s => ({ ...s, prompt: '' })));
  };

  // Select item from history
  const handleSelectHistory = (item: HistoryItem) => {
    setSelectedMode(item.mode);
    // Restore prompt into matching or first slot
    setSlots(prev => {
      let matched = false;
      const next = prev.map(s => {
        if (!matched && (s.platform === item.model || prev.length === 1)) {
          matched = true;
          return { ...s, prompt: item.inputPrompt, enabled: true };
        }
        return s;
      });
      return next;
    });
    executeCompilation(
      slots.map(s => s.platform === item.model ? { ...s, prompt: item.inputPrompt, enabled: true } : s),
      item.mode,
      false
    );
  };

  // Delete item from history
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Reset to default
  const handleReset = () => {
    setSlots(INITIAL_SLOTS);
    setSelectedMode('production_balanced');
    setSynthesis(null);
  };

  // Quick example loader
  const handleLoadExample = (exampleId: string) => {
    if (exampleId === 'example-code') {
      handleFillAllSamples();
      executeCompilation(INITIAL_SLOTS, selectedMode, true);
    } else {
      handleFillAllSamples();
      executeCompilation(INITIAL_SLOTS, 'ultra_distilled', true);
    }
  };

  // Build original prompt combined string for the Compare view
  const originalPromptCombined = slots
    .filter(s => s.enabled && s.prompt.trim())
    .map(s => `--- [${s.name.toUpperCase()}] ---\n${s.prompt}`)
    .join('\n\n');

  const primaryActivePlatform = slots.find(s => s.enabled)?.platform || 'chatgpt';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-x-hidden mesh-dot-grid selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* 3D Ambient Flowing Animated Aurora Blobs */}
      <div className="aurora-blob-1 -top-24 -left-28" />
      <div className="aurora-blob-2 top-80 -right-36" />
      <div className="aurora-blob-3 -bottom-28 left-1/4" />

      {/* Modern 3D Header */}
      <Header
        onReset={handleReset}
        savedCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        
        {/* Top Section: Past History */}
        <PromptHistory
          history={history}
          onSelectHistory={handleSelectHistory}
          onDeleteHistory={handleDeleteHistory}
          onClearHistory={handleClearHistory}
          onLoadExample={handleLoadExample}
        />

        {/* Core Split: Separate Model Boxes (Left) & Result View (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[580px]">
          {/* Left: Separate input boxes for each model */}
          <ModelPromptInput
            slots={slots}
            selectedMode={selectedMode}
            isCompiling={isCompiling}
            onUpdateSlot={handleUpdateSlot}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
            onModeChange={(mode) => {
              setSelectedMode(mode);
              executeCompilation(slots, mode, true);
            }}
            onOptimize={() => {
              executeCompilation(slots, selectedMode, true);
            }}
            onFillAllSamples={handleFillAllSamples}
            onClearAllSlots={handleClearAllSlots}
          />

          {/* Right: Result Part */}
          <OptimizedResultView
            synthesis={synthesis}
            originalPrompt={originalPromptCombined}
            isCompiling={isCompiling}
            selectedModel={primaryActivePlatform}
            selectedMode={selectedMode}
            onRecompile={() => {
              executeCompilation(slots, selectedMode, true);
            }}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-700">
            PromptOptimizer &bull; Ultra-Simple 3D Multi-Model Prompt Synthesizer
          </p>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dedicated Model Boxes Active &bull; Flow Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
