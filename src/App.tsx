import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptSlotManager } from './components/PromptSlotManager';
import { ModeSelector } from './components/ModeSelector';
import { MasterPromptView } from './components/MasterPromptView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TestDrivePanel } from './components/TestDrivePanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PRESET_SCENARIOS } from './data/presets';
import { PromptSlot, CompressionMode, SynthesisResult } from './types';
import { compilePrompts, generateMasterPrompt, estimateTokens } from './engine/compiler';

const STORAGE_KEY = 'prompt_optimizer_history_v1';

export const App: React.FC = () => {
  const initialPreset = PRESET_SCENARIOS[0];

  // State: Slots
  const [slots, setSlots] = useState<PromptSlot[]>(
    initialPreset.slots.map((s, idx) => ({
      id: `slot-${idx + 1}`,
      platform: s.platform,
      name: s.name,
      prompt: s.prompt,
      enabled: true,
    }))
  );

  // State: Preset selection
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [currentPayload, setCurrentPayload] = useState(initialPreset.samplePayload);

  // State: Compression Mode
  const [currentMode, setCurrentMode] = useState<CompressionMode>('production_balanced');

  // State: Synthesis Output
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // State: History Drawer
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<SynthesisResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Compile Handler (Server-first with client fallback)
  const executeCompilation = useCallback(async (activeSlots: PromptSlot[], mode: CompressionMode) => {
    setIsCompiling(true);
    try {
      const res = await fetch('/api/analyze-and-compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: activeSlots, mode })
      });

      let result: SynthesisResult;
      if (res.ok) {
        result = await res.json();
      } else {
        result = compilePrompts(activeSlots, mode);
      }

      setSynthesis(result);

      // Append to history
      setHistory(prev => {
        const next = [result, ...prev.slice(0, 49)];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.warn('LocalStorage save failed', e);
        }
        return next;
      });

    } catch (err) {
      console.warn('Using client-side compiler fallback:', err);
      const fallback = compilePrompts(activeSlots, mode);
      setSynthesis(fallback);
      setHistory(prev => [fallback, ...prev.slice(0, 49)]);
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // Initial compilation on mount
  useEffect(() => {
    executeCompilation(slots, currentMode);
  }, []);

  // Preset Selection Handler
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find(p => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setCurrentPayload(preset.samplePayload);

    const newSlots: PromptSlot[] = preset.slots.map((s, idx) => ({
      id: `slot-${idx + 1}`,
      platform: s.platform,
      name: s.name,
      prompt: s.prompt,
      enabled: true,
    }));

    setSlots(newSlots);
    executeCompilation(newSlots, currentMode);
  };

  // Mode Selection Handler
  const handleSelectMode = (mode: CompressionMode) => {
    setCurrentMode(mode);
    executeCompilation(slots, mode);
  };

  // Update Slot
  const handleUpdateSlot = (id: string, updates: Partial<PromptSlot>) => {
    setSlots(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      if ('enabled' in updates) {
        executeCompilation(next, currentMode);
      }
      return next;
    });
  };

  // Add Custom Slot
  const handleAddSlot = () => {
    const newId = `slot-custom-${Date.now()}`;
    const newSlot: PromptSlot = {
      id: newId,
      platform: 'custom',
      name: `Custom Slot ${slots.length + 1}`,
      prompt: '',
      enabled: true,
    };
    setSlots(prev => [...prev, newSlot]);
  };

  // Remove Slot
  const handleRemoveSlot = (id: string) => {
    if (slots.length <= 1) return;
    const next = slots.filter(s => s.id !== id);
    setSlots(next);
    executeCompilation(next, currentMode);
  };

  // Toggle Preserved Directive in Master Prompt
  const handleToggleDirective = (directiveId: string) => {
    if (!synthesis) return;
    const updatedDirectives = synthesis.preservedDirectives.map(d =>
      d.id === directiveId ? { ...d, retained: d.retained === false } : d
    );
    const updatedMasterPrompt = generateMasterPrompt(
      currentMode,
      synthesis.coreIntent,
      updatedDirectives,
      synthesis.conflictMatrix,
      slots
    );
    const compressedChars = updatedMasterPrompt.length;
    const compressedTokens = estimateTokens(updatedMasterPrompt);
    const reductionPercentage = synthesis.metrics.originalTotalTokens > 0
      ? Math.max(0, Math.round(((synthesis.metrics.originalTotalTokens - compressedTokens) / synthesis.metrics.originalTotalTokens) * 100))
      : 0;

    setSynthesis({
      ...synthesis,
      masterPrompt: updatedMasterPrompt,
      preservedDirectives: updatedDirectives,
      metrics: {
        ...synthesis.metrics,
        compressedTokens,
        compressedChars,
        reductionPercentage
      }
    });
  };

  // Reset to default
  const handleReset = () => {
    handleSelectPreset(PRESET_SCENARIOS[0].id);
  };

  // Restore history snapshot
  const handleRestoreHistory = (item: SynthesisResult) => {
    setSynthesis(item);
    setCurrentMode(item.mode);
    setIsHistoryOpen(false);
  };

  // Clear History
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  // Delete single history item
  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => {
      const next = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans relative overflow-x-hidden hud-grid-dots">
      {/* Ambient Cyber Auras */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <Header
        presets={PRESET_SCENARIOS}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Preset Description Banner */}
        <div className="reticle-box bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-purple-950/40 border border-cyan-900/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-sm relative">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                ACTIVE PRESET
              </span>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {PRESET_SCENARIOS.find(p => p.id === selectedPresetId)?.title}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {PRESET_SCENARIOS.find(p => p.id === selectedPresetId)?.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {PRESET_SCENARIOS.find(p => p.id === selectedPresetId)?.tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-900/50 shadow-sm">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Compression Mode Selector */}
        <ModeSelector
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
        />

        {/* Top Split: Multi-Platform Slots & Master Prompt Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Slots */}
          <PromptSlotManager
            slots={slots}
            onUpdateSlot={handleUpdateSlot}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
          />

          {/* Right: Master Prompt View */}
          <MasterPromptView
            synthesis={synthesis}
            isCompiling={isCompiling}
            onCompile={() => executeCompilation(slots, currentMode)}
          />
        </div>

        {/* Middle: Synthesis Analytics & Deconstruction Dashboard */}
        <AnalyticsDashboard
          synthesis={synthesis}
          onToggleDirective={handleToggleDirective}
        />

        {/* Bottom: Live Execution Test Drive */}
        <TestDrivePanel
          masterPrompt={synthesis?.masterPrompt || ''}
          mode={currentMode}
          defaultPayloadTitle={currentPayload?.title}
          defaultPayloadText={currentPayload?.input}
        />

      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestoreHistory}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F19] py-4 text-center text-xs text-slate-500">
        <p>PromptOptimizer — Multi-Platform Prompt Compressor & Accurate Synthesizer</p>
      </footer>
    </div>
  );
};
