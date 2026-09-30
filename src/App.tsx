import React, { useState, useEffect, useCallback } from 'react';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { PromptHistory, HistoryItem } from './components/PromptHistory';
import { ModelPromptInput, ALL_MODEL_CONFIGS } from './components/ModelPromptInput';
import { OptimizedResultView } from './components/OptimizedResultView';
import { PlatformId, CompressionMode, SynthesisResult, PromptSlot } from './types';
import { compilePrompts } from './engine/compiler';

const STORAGE_KEY = 'prompt_optimizer_history_v2';
const AUTH_KEY = 'prompt_optimizer_auth_session';

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

export const App: React.FC = () => {
  // State: Authentication (starts at the high-animated login page)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // State: Slots (Separate box for each model)
  const [slots, setSlots] = useState<PromptSlot[]>(INITIAL_SLOTS);
  const [selectedMode, setSelectedMode] = useState<CompressionMode>('production_balanced');

  // State: Synthesis Output & Compiling status
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // State: Past History (Flashed / cleared on user request)
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Flash / purge previous stored history keys from browser memory
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('prompt_optimizer_history_v1');
      localStorage.removeItem('prompt_optimizer_history');
    } catch {
      // ignore
    }
  }, []);

  // Save fresh history to localStorage when user creates runs
  useEffect(() => {
    try {
      if (history.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
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

  // Flash / wipe all history completely
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('prompt_optimizer_history_v1');
      localStorage.removeItem('prompt_optimizer_history');
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

  // Login handler
  const handleLogin = () => {
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem(AUTH_KEY, 'true');
    } catch {
      // ignore
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
  };

  // Build original prompt combined string for the Compare view
  const originalPromptCombined = slots
    .filter(s => s.enabled && s.prompt.trim())
    .map(s => `--- [${s.name.toUpperCase()}] ---\n${s.prompt}`)
    .join('\n\n');

  const primaryActivePlatform = slots.find(s => s.enabled)?.platform || 'chatgpt';

  // If not authenticated, render the high animated Login Page!
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-x-hidden mesh-dot-grid selection:bg-indigo-500/20 selection:text-indigo-900 animate-in fade-in duration-300">
      {/* 3D Ambient Flowing Animated Aurora Blobs */}
      <div className="aurora-blob-1 -top-24 -left-28" />
      <div className="aurora-blob-2 top-80 -right-36" />
      <div className="aurora-blob-3 -bottom-28 left-1/4" />

      {/* Modern 3D Header */}
      <Header
        onReset={handleReset}
        savedCount={history.length}
        onLogout={handleLogout}
      />

      {/* Main Content Area: Flow from Top (Inputs) to Bottom (Optimized Result & Analysis) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        
        {/* Top Section: Past History (Flashed / Ready for new runs) */}
        <PromptHistory
          history={history}
          onSelectHistory={handleSelectHistory}
          onDeleteHistory={handleDeleteHistory}
          onClearHistory={handleClearHistory}
          onLoadExample={handleLoadExample}
        />

        {/* Top Main: Input of Models at the Top (Separate boxes for each model) */}
        <section aria-label="Model Inputs" className="w-full">
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
        </section>

        {/* Bottom Main: Optimized Prompt at the Bottom with Bottom Designed Analysis in ₹ */}
        <section aria-label="Optimized Result & Analysis" className="w-full">
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
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-700">
            PromptOptimizer &bull; Ultra-Simple 3D Multi-Model Prompt Synthesizer
          </p>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>₹ Rupee Cost Engine Active &bull; Flow Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
