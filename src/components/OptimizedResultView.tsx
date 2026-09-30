import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Zap, 
  Split, 
  Play, 
  Clock,
  DollarSign,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Trash2,
  Layers,
  ArrowRight,
  TrendingDown
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
  const [showFluffDetails, setShowFluffDetails] = useState(false);
  const [showDirectivesDetails, setShowDirectivesDetails] = useState(false);

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
      content = `# Synthesized Master Prompt\n\n**Core Intent:** ${synthesis.coreIntent}\n**Original Tokens:** ${synthesis.metrics.originalTotalTokens}\n**Optimized Tokens:** ${synthesis.metrics.compressedTokens} (-${synthesis.metrics.reductionPercentage}%)\n\n---\n\n${synthesis.masterPrompt}`;
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
    <div className="card-3d overflow-hidden flex flex-col relative w-full shadow-md">
      {/* 3D Flow Border Accent Line */}
      <div className="h-[3.5px] w-full flow-accent-line" />

      {/* Sweep shimmer on compile */}
      {isCompiling && (
        <div className="absolute top-0 left-0 right-0 h-[4px] animate-flow-sweep z-30 pointer-events-none" />
      )}

      {/* Section Header */}
      <div className="p-4 sm:p-5 bg-white/95 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 shadow-xs flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
                  OPTIMIZED MASTER PROMPT (RESULT)
                </h2>
                {synthesis && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 shadow-2xs">
                    <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                    <span>-{synthesis.metrics.reductionPercentage}% TOKENS</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {synthesis ? synthesis.coreIntent : 'High-density synthesis buffer with zero conversational entropy'}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2">
            {synthesis && (
              <>
                {/* View Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold mr-1">
                  <button
                    onClick={() => setActiveTab('prompt')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'prompt' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Optimized Buffer
                  </button>
                  <button
                    onClick={() => setActiveTab('compare')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                      activeTab === 'compare' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Split className="h-3.5 w-3.5" />
                    <span>Compare</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('test')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                      activeTab === 'test' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Test Run</span>
                  </button>
                </div>

                {/* 1-Click Copy */}
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 transition-all shadow-2xs hover:shadow-xs active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-indigo-600" />
                      <span>Copy Master</span>
                    </>
                  )}
                </button>

                {/* Downloads */}
                <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                  <button
                    onClick={() => handleDownload('txt')}
                    title="Download as .txt"
                    className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    .TXT
                  </button>
                  <button
                    onClick={() => handleDownload('md')}
                    title="Download as markdown"
                    className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    .MD
                  </button>
                  <button
                    onClick={() => handleDownload('json')}
                    title="Download JSON report"
                    className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    .JSON
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Prompt Content Buffer */}
      <div className="p-4 sm:p-5 bg-white flex flex-col">
        {!synthesis ? (
          <div className="py-16 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm floating-3d-symbol">
              <Sparkles className="h-8 w-8 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">No optimized prompt generated yet</p>
              <p className="text-xs max-w-sm text-slate-500 mt-1">
                Fill the model boxes above and click &ldquo;Synthesize & Optimize&rdquo; to produce the master prompt and bottom analysis.
              </p>
            </div>
          </div>
        ) : activeTab === 'prompt' ? (
          /* Single Master Buffer View */
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="text-indigo-700 flex items-center space-x-2 font-bold">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SYNTHESIZED_MASTER_BUFFER</span>
              </span>
              <span className="font-semibold text-slate-600">
                {synthesis.metrics.compressedChars} chars &bull; {synthesis.metrics.compressedTokens} tokens
              </span>
            </div>
            <pre className="font-mono text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap select-all p-4 bg-white max-h-[420px] overflow-y-auto">
              {synthesis.masterPrompt}
            </pre>
          </div>
        ) : activeTab === 'compare' ? (
          /* Before vs After View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50/20 overflow-hidden flex flex-col">
              <div className="px-3.5 py-2 bg-rose-100/50 border-b border-rose-200 text-xs font-mono font-bold text-rose-800 flex items-center justify-between">
                <span>BEFORE (ALL MODEL INPUTS)</span>
                <span>{synthesis.metrics.originalTotalTokens} TOKENS</span>
              </div>
              <pre className="p-4 font-mono text-xs leading-relaxed text-slate-700 whitespace-pre-wrap max-h-[380px] overflow-y-auto">
                {originalPrompt}
              </pre>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 overflow-hidden flex flex-col">
              <div className="px-3.5 py-2 bg-emerald-100/50 border-b border-emerald-200 text-xs font-mono font-bold text-emerald-800 flex items-center justify-between">
                <span>AFTER (SYNTHESIZED MASTER)</span>
                <span>{synthesis.metrics.compressedTokens} TOKENS (-{synthesis.metrics.reductionPercentage}%)</span>
              </div>
              <pre className="p-4 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[380px] overflow-y-auto">
                {synthesis.masterPrompt}
              </pre>
            </div>
          </div>
        ) : (
          /* Inline Test Drive */
          <div className="flex flex-col space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                TEST INPUT PAYLOAD:
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                rows={3}
                placeholder="Enter sample text to test prompt execution..."
                className="w-full p-2.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="mt-2.5 flex justify-end">
                <button
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Play className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Executing Simulation...' : 'Simulate Model Response'}</span>
                </button>
              </div>
            </div>

            {testOutput && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600">
                  <span className="font-bold text-indigo-700">SIMULATED EXECUTION RESPONSE</span>
                  {testLatency && <span>LATENCY: {testLatency}ms</span>}
                </div>
                <pre className="p-4 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {testOutput}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* BOTTOM DESIGNED ANALYSIS SECTION                                  */}
      {/* ================================================================= */}
      {synthesis && (
        <div className="p-4 sm:p-5 bg-slate-50/90 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                BOTTOM DESIGNED SYNTHESIS ANALYSIS &amp; IMPACT METRICS
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFluffDetails(!showFluffDetails)}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 transition-all"
              >
                <span>{synthesis.fluffRemoved.length} Fluff Phrases Purged</span>
                {showFluffDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              <button
                onClick={() => setShowDirectivesDetails(!showDirectivesDetails)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 transition-all"
              >
                <span>{synthesis.preservedDirectives.length} Directives Preserved</span>
                {showDirectivesDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* 4 Bottom Designed 3D Analysis Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Token Compression */}
            <div className="analysis-card-3d p-4 bg-white border border-slate-200/80">
              <div className="h-[2.5px] -mt-4 -mx-4 mb-3.5 bg-emerald-500" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>TOKEN COMPRESSION</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  -{synthesis.metrics.reductionPercentage}%
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {synthesis.metrics.compressedTokens}
                </span>
                <span className="text-xs font-mono text-slate-400 line-through">
                  {synthesis.metrics.originalTotalTokens}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(100, 100 - synthesis.metrics.reductionPercentage)}%` }}
                />
              </div>
            </div>

            {/* Card 2: Prefill Latency Saved */}
            <div className="analysis-card-3d p-4 bg-white border border-slate-200/80">
              <div className="h-[2.5px] -mt-4 -mx-4 mb-3.5 bg-blue-500" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>PREFILL LATENCY SAVED</span>
                </span>
                <Clock className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-blue-600 tracking-tight">
                  ~{synthesis.metrics.estimatedLatencySavedMs}
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">ms / request</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                Faster time-to-first-token across API endpoints
              </p>
            </div>

            {/* Card 3: Cost Savings (1M Calls) */}
            <div className="analysis-card-3d p-4 bg-white border border-slate-200/80">
              <div className="h-[2.5px] -mt-4 -mx-4 mb-3.5 bg-amber-500" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>COST SAVINGS (1M CALLS)</span>
                </span>
                <DollarSign className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-amber-600 tracking-tight">
                  ${synthesis.metrics.estimatedCostSavedPer1MRuns}
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">saved</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                Based on standard LLM input token pricing
              </p>
            </div>

            {/* Card 4: Noise & Tropes Purged */}
            <div className="analysis-card-3d p-4 bg-white border border-slate-200/80">
              <div className="h-[2.5px] -mt-4 -mx-4 mb-3.5 bg-rose-500" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>NOISE &amp; TROPES PURGED</span>
                </span>
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-rose-600 tracking-tight">
                  {synthesis.fluffRemoved.length}
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">phrases purged</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                Zero conversational overhead guaranteed
              </p>
            </div>
          </div>

          {/* Expandable Purged Fluff Breakdown */}
          {showFluffDetails && (
            <div className="mt-4 p-3.5 bg-white rounded-xl border border-rose-200 shadow-2xs">
              <div className="text-xs font-mono font-bold text-rose-800 mb-2 flex items-center space-x-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                <span>SPECIFIC PHRASES STRIPPED FOR EFFICIENCY:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {synthesis.fluffRemoved.map((item) => (
                  <div 
                    key={item.id} 
                    className="px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg text-xs flex items-center space-x-1.5"
                    title={`Reason: ${item.whyRemoved}`}
                  >
                    <span className="line-through text-rose-700 font-mono font-semibold">&ldquo;{item.phrase}&rdquo;</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-white rounded text-rose-600 border border-rose-200">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Preserved Directives Breakdown */}
          {showDirectivesDetails && (
            <div className="mt-4 p-3.5 bg-white rounded-xl border border-indigo-200 shadow-2xs">
              <div className="text-xs font-mono font-bold text-indigo-800 mb-2 flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                <span>PRESERVED ESSENTIAL DIRECTIVES (INTEGRITY 100%):</span>
              </div>
              <div className="space-y-1.5">
                {synthesis.preservedDirectives.map((d) => (
                  <div key={d.id} className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-start space-x-2 text-xs">
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-white text-indigo-700 border border-indigo-200 shrink-0">
                      {d.category.replace('_', ' ')}
                    </span>
                    <span className="text-slate-700 font-medium">{d.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
