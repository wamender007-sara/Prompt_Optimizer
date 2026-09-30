import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptSlotManager } from './components/PromptSlotManager';
import { ModeSelector } from './components/ModeSelector';
import { MasterPromptView } from './components/MasterPromptView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TestDrivePanel } from './components/TestDrivePanel';
import { PRESET_SCENARIOS } from './data/presets';
import { PromptSlot, CompressionMode, SynthesisResult } from './types';
import { compilePrompts, generateMasterPrompt, estimateTokens } from './engine/compiler';

export const App: React.FC = () => {
  const initialPreset = PRESET_SCENARIOS[0];

  // Clean wipe any legacy history from browser storage for a fresh webpage experience
  useEffect(() => {
    try {
      localStorage.removeItem('prompt_optimizer_history_v1');
    } catch {
      // ignore
    }
  }, []);

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

    } catch (err) {
      console.warn('Using client-side compiler fallback:', err);
      const fallback = compilePrompts(activeSlots, mode);
      setSynthesis(fallback);
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

  const VIBGYOR_TAG_CLASSES = [
    'badge-vibgyor-v', // Violet
    'badge-vibgyor-i', // Indigo
    'badge-vibgyor-b', // Blue
    'badge-vibgyor-g', // Green
    'badge-vibgyor-y', // Yellow
    'badge-vibgyor-o', // Orange
    'badge-vibgyor-r', // Red
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans relative overflow-x-hidden white-aurora-dots">
      {/* Floating Ambient Animated VIBGYOR Spectral Aurora Blobs on Pure White */}
      <div className="vibgyor-ambient-vi -top-24 -left-24" />
      <div className="vibgyor-ambient-bg top-80 -right-32" />
      <div className="vibgyor-ambient-yor -bottom-24 left-1/4" />

      {/* Navigation Header (Fresh, without history) */}
      <Header
        presets={PRESET_SCENARIOS}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        
        {/* Preset Description Banner */}
        <div className="white-glass-card rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md relative overflow-hidden">
          {/* Subtle animated rainbow accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3px] vibgyor-ribbon" />

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-[10px] text-indigo-700 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
                ACTIVE PRESET
              </span>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {PRESET_SCENARIOS.find(p => p.id === selectedPresetId)?.title}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
              {PRESET_SCENARIOS.find(p => p.id === selectedPresetId)?.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {PRESET_SCENARIOS.find(p => p.id === selectedPresetId)?.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-2xs transition-transform hover:scale-105 ${
                  VIBGYOR_TAG_CLASSES[idx % VIBGYOR_TAG_CLASSES.length]
                }`}
              >
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

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md py-4 text-center text-xs text-slate-500 relative z-10">
        <p className="font-semibold text-slate-700">
          PromptOptimizer — White Canvas with Animated VIBGYOR Spectrum Design
        </p>
        <div className="flex items-center justify-center space-x-1.5 mt-1.5">
          <span className="w-2.5 h-2.5 rounded-full dot-v" style={{ backgroundColor: '#8B5CF6' }} title="Violet" />
          <span className="w-2.5 h-2.5 rounded-full dot-i" style={{ backgroundColor: '#6366F1' }} title="Indigo" />
          <span className="w-2.5 h-2.5 rounded-full dot-b" style={{ backgroundColor: '#3B82F6' }} title="Blue" />
          <span className="w-2.5 h-2.5 rounded-full dot-g" style={{ backgroundColor: '#10B981' }} title="Green" />
          <span className="w-2.5 h-2.5 rounded-full dot-y" style={{ backgroundColor: '#EAB308' }} title="Yellow" />
          <span className="w-2.5 h-2.5 rounded-full dot-o" style={{ backgroundColor: '#F97316' }} title="Orange" />
          <span className="w-2.5 h-2.5 rounded-full dot-r" style={{ backgroundColor: '#EF4444' }} title="Red" />
          <span className="text-[10px] font-mono text-slate-400 ml-1 font-semibold">VIBGYOR ANIMATED ENGINE</span>
        </div>
      </footer>
    </div>
  );
};
