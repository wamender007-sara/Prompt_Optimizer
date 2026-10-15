import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptHistory, HistoryItem } from './components/PromptHistory';
import { ModelPromptInput, ALL_MODEL_CONFIGS } from './components/ModelPromptInput';
import { OptimizedResultView } from './components/OptimizedResultView';
import { PlatformId, CompressionMode, SynthesisResult, PromptSlot } from './types';
import { compilePrompts } from './engine/compiler';

const HISTORY_STORAGE_KEY = 'prompt_optimizer_history_v2';

const INITIAL_SLOTS: PromptSlot[] = [
  {
    id: 'slot-chatgpt',
    platform: 'chatgpt',
    name: 'ChatGPT 4o',
    prompt: '',
    enabled: true
  },
  {
    id: 'slot-claude',
    platform: 'claude',
    name: 'Claude 3.5 Sonnet',
    prompt: '',
    enabled: true
  },
  {
    id: 'slot-gemini',
    platform: 'gemini',
    name: 'Gemini 2.0 / 1.5 Pro',
    prompt: '',
    enabled: true
  }
];

export const App: React.FC = () => {
  // Slots (Separate box for each model)
  const [slots, setSlots] = useState<PromptSlot[]>(INITIAL_SLOTS);
  const [selectedMode, setSelectedMode] = useState<CompressionMode>('production_balanced');

  // Synthesis Output & Compiling status
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // Past History
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Synchronize history changes to LocalStorage and Server
  const syncHistoryToStorage = useCallback(async (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch {
      // ignore
    }

    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default_workspace',
          history: newHistory
        })
      });
    } catch {
      // ignore
    }
  }, []);

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

        setHistory(prev => {
          const updated = [newHistItem, ...prev.filter(h => h.id !== newHistItem.id)].slice(0, 30);
          syncHistoryToStorage(updated);
          return updated;
        });
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

        setHistory(prev => {
          const updated = [newHistItem, ...prev.filter(h => h.id !== newHistItem.id)].slice(0, 30);
          syncHistoryToStorage(updated);
          return updated;
        });
      }
    } finally {
      setIsCompiling(false);
    }
  }, [syncHistoryToStorage]);

  // (no auto-compile on mount – the result panel stays blank until the user clicks Synthesize)

  // Update specific model box
  const handleUpdateSlot = (id: string, updates: Partial<PromptSlot>) => {
    setSlots(prev => prev.map(slot => (slot.id === id ? { ...slot, ...updates } : slot)));
  };

  // Add a new model box
  const handleAddSlot = (platform: PlatformId) => {
    const config = ALL_MODEL_CONFIGS[platform];
    const newSlot: PromptSlot = {
      id: `slot-${platform}-${Date.now()}`,
      platform,
      name: config?.name || 'Custom Model',
      prompt: '',
      enabled: true
    };
    setSlots(prev => [...prev, newSlot]);
  };

  // Remove a model box
  const handleRemoveSlot = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  // Quick fill samples
  const handleFillAllSamples = () => {
    const sampleSlots = INITIAL_SLOTS.map(s => ({
      ...s,
      prompt: ALL_MODEL_CONFIGS[s.platform]?.samplePrompt || '',
      enabled: true
    }));
    setSlots(sampleSlots);
    return sampleSlots;
  };

  // Clear all slots
  const handleClearAllSlots = () => {
    setSlots(prev => prev.map(s => ({ ...s, prompt: '' })));
    setSynthesis(null);
  };

  // Select item from history to restore
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
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      syncHistoryToStorage(updated);
      return updated;
    });
  };

  // Wipe all history
  const handleClearHistory = () => {
    setHistory([]);
    syncHistoryToStorage([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
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
    const sampleSlots = handleFillAllSamples();
    if (exampleId === 'example-code') {
      executeCompilation(sampleSlots, selectedMode, true);
    } else {
      executeCompilation(sampleSlots, 'ultra_distilled', true);
    }
  };

  // Build original prompt combined string for the Compare view
  const originalPromptCombined = slots
    .filter(s => s.enabled && s.prompt.trim())
    .map(s => `--- [${s.name.toUpperCase()}] ---\n${s.prompt}`)
    .join('\n\n');

  const primaryActivePlatform = slots.find(s => s.enabled)?.platform || 'chatgpt';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative mesh-dot-grid selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Ambient Background Layer (isolated fixed container so it never affects scroll or layout) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="aurora-blob-1 -top-24 -left-28" />
        <div className="aurora-blob-2 top-80 -right-36" />
        <div className="aurora-blob-3 -bottom-28 left-1/4" />
      </div>

      {/* Modern 3D Header */}
      <Header
        onReset={handleReset}
        savedCount={history.length}
      />

      {/* Main Content Area: Flow from Top (Inputs) to Bottom (Optimized Result & Analysis) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        
        {/* Top Section: Past History */}
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
              setTimeout(() => {
                document.getElementById('optimized-result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            onFillAllSamples={handleFillAllSamples}
            onClearAllSlots={handleClearAllSlots}
          />
        </section>

        {/* Bottom Main: Optimized Prompt at the Bottom with Bottom Designed Analysis in ₹ */}
        <section id="optimized-result-section" aria-label="Optimized Result & Analysis" className="w-full scroll-mt-20">
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
      <footer className="border-t border-slate-200/80 bg-white/95 py-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-700">
            PromptOptimizer &bull; Ultra-Simple 3D Multi-Model Prompt Synthesizer
          </p>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>₹ Rupee Token Engine Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
