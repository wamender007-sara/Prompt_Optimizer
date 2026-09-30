import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptHistory, HistoryItem } from './components/PromptHistory';
import { ModelPromptInput, AVAILABLE_MODELS } from './components/ModelPromptInput';
import { OptimizedResultView } from './components/OptimizedResultView';
import { PlatformId, CompressionMode, SynthesisResult, PromptSlot } from './types';
import { compilePrompts } from './engine/compiler';

const STORAGE_KEY = 'prompt_optimizer_history_v2';

// Initial realistic default prompts
const DEFAULT_INITIAL_PROMPT = `Act as a world-renowned Senior Software Architect with 20+ years of experience.
I need you to thoroughly examine my code. Please make sure to point out any code smells, eliminate all vulnerabilities, and make it look clean and modern.
Follow SOLID principles and please explain every single step kindly as if I am learning. Also feel free to add nice greetings and have fun with it!`;

// Initial sample past history so the user sees a rich UI on initial load
const INITIAL_SAMPLE_HISTORY: HistoryItem[] = [
  {
    id: 'sample-hist-1',
    timestamp: Date.now() - 1000 * 60 * 15,
    timeAgo: '15m ago',
    model: 'claude',
    modelName: 'Claude 3.5 Sonnet',
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
  // State: Model, Mode, Prompt
  const [selectedModel, setSelectedModel] = useState<PlatformId>('chatgpt');
  const [selectedMode, setSelectedMode] = useState<CompressionMode>('production_balanced');
  const [promptText, setPromptText] = useState<string>(DEFAULT_INITIAL_PROMPT);

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

  // Execute compilation
  const executeCompilation = useCallback(async (
    textToCompile: string,
    model: PlatformId,
    mode: CompressionMode,
    addToHistory: boolean = true
  ) => {
    if (!textToCompile.trim()) return;

    setIsCompiling(true);
    const activeSlot: PromptSlot = {
      id: `slot-${model}`,
      platform: model,
      name: AVAILABLE_MODELS.find(m => m.id === model)?.name || model,
      prompt: textToCompile,
      enabled: true,
    };

    try {
      let result: SynthesisResult;
      const res = await fetch('/api/analyze-and-compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: [activeSlot], mode })
      });

      if (res.ok) {
        result = await res.json();
      } else {
        result = compilePrompts([activeSlot], mode);
      }

      setSynthesis(result);

      // Add to past history if requested
      if (addToHistory && result && result.masterPrompt) {
        const modelMeta = AVAILABLE_MODELS.find(m => m.id === model);
        const newHistItem: HistoryItem = {
          id: `hist-${Date.now()}`,
          timestamp: Date.now(),
          timeAgo: 'Just now',
          model: model,
          modelName: modelMeta?.name || model,
          mode: mode,
          inputPrompt: textToCompile,
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
      const fallback = compilePrompts([activeSlot], mode);
      setSynthesis(fallback);

      if (addToHistory && fallback && fallback.masterPrompt) {
        const modelMeta = AVAILABLE_MODELS.find(m => m.id === model);
        const newHistItem: HistoryItem = {
          id: `hist-${Date.now()}`,
          timestamp: Date.now(),
          timeAgo: 'Just now',
          model: model,
          modelName: modelMeta?.name || model,
          mode: mode,
          inputPrompt: textToCompile,
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
    executeCompilation(promptText, selectedModel, selectedMode, false);
  }, []);

  // Select item from history
  const handleSelectHistory = (item: HistoryItem) => {
    setSelectedModel(item.model);
    setSelectedMode(item.mode);
    setPromptText(item.inputPrompt);
    // Directly recompile or load saved synthesis
    executeCompilation(item.inputPrompt, item.model, item.mode, false);
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

  // Reset to clean fresh prompt
  const handleReset = () => {
    setSelectedModel('chatgpt');
    setSelectedMode('production_balanced');
    setPromptText('');
    setSynthesis(null);
  };

  // Load quick examples into input
  const handleLoadExample = (exampleId: string) => {
    if (exampleId === 'example-code') {
      const codePrompt = `Act as an expert software engineer. Review my TypeScript functions for code smells, eliminate all any types, replace them with strict generics, and format everything cleanly. Please explain nicely.`;
      setSelectedModel('claude');
      setPromptText(codePrompt);
      executeCompilation(codePrompt, 'claude', selectedMode, true);
    } else if (exampleId === 'example-security') {
      const secPrompt = `You are a high-level application security architect. Thoroughly audit this backend code for OWASP Top 10 vulnerabilities like SQL injection, CSRF, and prototype pollution.`;
      setSelectedModel('chatgpt');
      setPromptText(secPrompt);
      executeCompilation(secPrompt, 'chatgpt', selectedMode, true);
    }
  };

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

        {/* Core Split: Prompt Input for Models (Left) & Result View (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[580px]">
          {/* Left: Input of prompts for different models */}
          <ModelPromptInput
            promptText={promptText}
            selectedModel={selectedModel}
            selectedMode={selectedMode}
            isCompiling={isCompiling}
            onPromptChange={setPromptText}
            onModelChange={(model) => {
              setSelectedModel(model);
            }}
            onModeChange={(mode) => {
              setSelectedMode(mode);
              executeCompilation(promptText, selectedModel, mode, true);
            }}
            onOptimize={() => {
              executeCompilation(promptText, selectedModel, selectedMode, true);
            }}
          />

          {/* Right: Result Part */}
          <OptimizedResultView
            synthesis={synthesis}
            originalPrompt={promptText}
            isCompiling={isCompiling}
            selectedModel={selectedModel}
            selectedMode={selectedMode}
            onRecompile={() => {
              executeCompilation(promptText, selectedModel, selectedMode, true);
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
            <span>Multi-Model AI Active &bull; Flow Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
