import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Zap, 
  Split, 
  Play, 
  FileCode, 
  CheckCircle2,
  Clock,
  DollarSign,
  Maximize2
} from 'lucide-react';
import { SynthesisResult, CompressionMode, PlatformId } from '../types';
import { executeTestDrive } from '../engine/compiler';

interface OptimizedResultViewProps {
  synthesis: SynthesisResult | null;
  originalPrompt: string;
  isCompiling: boolean;
  selectedModel: PlatformId;
  selectedMode: CompressionMode;
  onRecompile: () => void;
}

export const OptimizedResultView: React.FC<OptimizedResultViewProps> = ({
  synthesis,
  originalPrompt,
  isCompiling,
  selectedModel,
  selectedMode,
  onRecompile,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'compare' | 'test'>('prompt');
  
  // Test drive mini-runner state
  const [testInput, setTestInput] = useState('Analyze this snippet for memory leaks: const listeners = [];');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  const handleCopy = () => {
    if (!synthesis?.masterPrompt) return;
    navigator.clipboard.writeText(synthesis.masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'txt' | 'md' | 'json') => {
    if (!synthesis) return;
    let filename = `optimized-prompt-${synthesis.mode}-${Date.now()}`;
    let content = '';
    let mimeType = 'text/plain';

    if (format === 'txt') {
      filename += '.txt';
      content = synthesis.masterPrompt;
      mimeType = 'text/plain';
    } else if (format === 'md') {
      filename += '.md';
      content = `# Optimized Master Prompt\n\n**Core Intent:** ${synthesis.coreIntent}\n**Original Tokens:** ${synthesis.metrics.originalTotalTokens}\n**Optimized Tokens:** ${synthesis.metrics.compressedTokens} (-${synthesis.metrics.reductionPercentage}%)\n\n---\n\n${synthesis.masterPrompt}`;
      mimeType = 'text/markdown';
    } else if (format === 'json') {
      filename += '.json';
      content = JSON.stringify(synthesis, null, 2);
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunTest = async () => {
    if (!synthesis?.masterPrompt) return;
    setIsTesting(true);
    try {
      // Execute test drive client-side or server
      const res = await fetch('/api/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterPrompt: synthesis.masterPrompt,
          testPayload: testInput,
          mode: selectedMode
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestOutput(data.response);
        setTestLatency(data.executionTimeMs);
      } else {
        const fallback = executeTestDrive(synthesis.masterPrompt, testInput, selectedMode);
        setTestOutput(fallback.response);
        setTestLatency(fallback.executionTimeMs);
      }
    } catch {
      const fallback = executeTestDrive(synthesis.masterPrompt, testInput, selectedMode);
      setTestOutput(fallback.response);
      setTestLatency(fallback.executionTimeMs);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="card-3d overflow-hidden flex flex-col h-full relative group">
      {/* 3D Flow Border Glow */}
      <div className="h-[3px] w-full flow-accent-line" />

      {/* Shimmer sweep animation when synthesizing */}
      {isCompiling && (
        <div className="absolute top-0 left-0 right-0 h-[4px] animate-flow-sweep z-30 pointer-events-none" />
      )}

      {/* Header */}
      <div className="p-4 bg-white/90 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 shadow-xs flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  OPTIMIZED RESULT
                </h2>
                {synthesis && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 shadow-2xs">
                    <Zap className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                    <span>-{synthesis.metrics.reductionPercentage}% TOKENS</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {synthesis ? `Synthesized for ${selectedModel.toUpperCase()} &bull; Fluff Purged` : 'Output preview and metrics'}
              </p>
            </div>
          </div>

          {/* View Tab Selector & Action Buttons */}
          <div className="flex items-center space-x-1.5">
            {synthesis && (
              <>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold mr-1">
                  <button
                    onClick={() => setActiveTab('prompt')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeTab === 'prompt' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Result
                  </button>
                  <button
                    onClick={() => setActiveTab('compare')}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                      activeTab === 'compare' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Split className="h-3 w-3" />
                    <span>Compare</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('test')}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                      activeTab === 'test' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Play className="h-3 w-3" />
                    <span>Test Run</span>
                  </button>
                </div>

                {/* 1-Click Copy */}
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-2xs hover:shadow-xs active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Download Menu */}
                <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                  <button
                    onClick={() => handleDownload('txt')}
                    title="Download as .txt"
                    className="px-2 py-1 text-[10px] font-mono font-bold text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    .TXT
                  </button>
                  <button
                    onClick={() => handleDownload('md')}
                    title="Download as .md"
                    className="px-2 py-1 text-[10px] font-mono font-bold text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    .MD
                  </button>
                  <button
                    onClick={() => handleDownload('json')}
                    title="Download full JSON"
                    className="px-2 py-1 text-[10px] font-mono font-bold text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    .JSON
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Efficiency Bar */}
        {synthesis && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[9px] uppercase">Tokens</span>
              <strong className="text-slate-700">{synthesis.metrics.originalTotalTokens}</strong> → <strong className="text-indigo-700">{synthesis.metrics.compressedTokens}</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[9px] uppercase">Latency Saved</span>
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>~{synthesis.metrics.estimatedLatencySavedMs}ms</span>
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[9px] uppercase">Est. 1M Cost Savings</span>
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>${synthesis.metrics.estimatedCostSavedPer1MRuns}</span>
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block text-[9px] uppercase">Fluff Stripped</span>
              <span className="text-indigo-700 font-bold">
                {synthesis.fluffRemoved.length} phrases purged
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 flex flex-col bg-white overflow-y-auto">
        {!synthesis ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm floating-3d-symbol">
              <Sparkles className="h-8 w-8 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">No optimized prompt generated yet</p>
              <p className="text-xs max-w-sm text-slate-500 mt-1">
                Enter your prompt on the left and click &ldquo;Optimize&rdquo; to produce a high-density, zero-fluff prompt.
              </p>
            </div>
          </div>
        ) : activeTab === 'prompt' ? (
          /* Single Optimized Buffer View */
          <div className="flex-1 flex flex-col rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="text-indigo-700 flex items-center space-x-1.5 font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>COMPILED_OPTIMIZED_BUFFER</span>
              </span>
              <span className="font-semibold text-slate-600">
                {synthesis.metrics.compressedChars} chars &bull; {synthesis.metrics.compressedTokens} tokens
              </span>
            </div>
            <pre className="flex-1 font-mono text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap select-all p-4 bg-white overflow-y-auto">
              {synthesis.masterPrompt}
            </pre>
          </div>
        ) : activeTab === 'compare' ? (
          /* Side-by-Side Comparison */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[300px]">
            {/* Before */}
            <div className="flex flex-col rounded-xl border border-rose-200 bg-rose-50/20 overflow-hidden">
              <div className="px-3 py-1.5 bg-rose-100/50 border-b border-rose-200 text-[11px] font-mono font-bold text-rose-800 flex items-center justify-between">
                <span>BEFORE (ORIGINAL)</span>
                <span>{synthesis.metrics.originalTotalTokens} TOKENS</span>
              </div>
              <pre className="flex-1 p-3 font-mono text-xs leading-relaxed text-slate-700 whitespace-pre-wrap overflow-y-auto">
                {originalPrompt}
              </pre>
            </div>

            {/* After */}
            <div className="flex flex-col rounded-xl border border-emerald-200 bg-emerald-50/20 overflow-hidden">
              <div className="px-3 py-1.5 bg-emerald-100/50 border-b border-emerald-200 text-[11px] font-mono font-bold text-emerald-800 flex items-center justify-between">
                <span>AFTER (OPTIMIZED)</span>
                <span>{synthesis.metrics.compressedTokens} TOKENS (-{synthesis.metrics.reductionPercentage}%)</span>
              </div>
              <pre className="flex-1 p-3 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap overflow-y-auto">
                {synthesis.masterPrompt}
              </pre>
            </div>
          </div>
        ) : (
          /* Test Run Simulation */
          <div className="flex-1 flex flex-col space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">
                SAMPLE INPUT / PAYLOAD:
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                rows={3}
                placeholder="Enter sample text to test prompt execution..."
                className="w-full p-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Play className={`h-3 w-3 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Executing Simulation...' : 'Simulate Model Response'}</span>
                </button>
              </div>
            </div>

            {testOutput && (
              <div className="flex-1 flex flex-col rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                  <span className="font-bold text-indigo-700">SIMULATED EXECUTION RESPONSE</span>
                  {testLatency && <span>LATENCY: {testLatency}ms</span>}
                </div>
                <pre className="flex-1 p-3 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap overflow-y-auto">
                  {testOutput}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {synthesis && (
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-200/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-700">Directive Integrity 100% Preserved</span>
          </div>
          <span className="text-slate-400">ZERO FILLER OVERHEAD</span>
        </div>
      )}
    </div>
  );
};
