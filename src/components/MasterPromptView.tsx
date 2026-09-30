import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Target
} from 'lucide-react';
import { SynthesisResult } from '../types';

interface MasterPromptViewProps {
  synthesis: SynthesisResult | null;
  isCompiling: boolean;
  onCompile: () => void;
}

export const MasterPromptView: React.FC<MasterPromptViewProps> = ({
  synthesis,
  isCompiling,
  onCompile
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!synthesis?.masterPrompt) return;
    navigator.clipboard.writeText(synthesis.masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'txt' | 'md' | 'json') => {
    if (!synthesis) return;
    let filename = `master-prompt-${synthesis.mode}-${Date.now()}`;
    let content = '';
    let mimeType = 'text/plain';

    if (format === 'txt') {
      filename += '.txt';
      content = synthesis.masterPrompt;
      mimeType = 'text/plain';
    } else if (format === 'md') {
      filename += '.md';
      content = `# Master Prompt: ${synthesis.coreIntent}\n\n**Mode:** ${synthesis.mode}\n**Tokens:** ${synthesis.metrics.compressedTokens}\n**Reduction:** ${synthesis.metrics.reductionPercentage}%\n\n---\n\n${synthesis.masterPrompt}`;
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

  return (
    <div className="white-glass-card rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col h-full relative">
      {/* Top Animated Continuous VIBGYOR Accent Line */}
      <div className="h-[3px] w-full vibgyor-ribbon" />

      {/* Animatic Rainbow Shimmer Sweep Line on Compiling */}
      {isCompiling && (
        <div className="absolute top-0 left-0 right-0 h-[4px] animate-vibgyor-sweep z-30 pointer-events-none" />
      )}

      {/* Top Header */}
      <div className="p-3.5 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg vibgyor-ribbon text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] text-indigo-700 font-bold tracking-wider uppercase">SYS // VIBGYOR_SYNTHESIZER</span>
              {synthesis && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  {synthesis.metrics.compressedTokens} TOKENS (-{synthesis.metrics.reductionPercentage}%)
                </span>
              )}
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Accurate Master Prompt
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {synthesis && (
            <>
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-2xs hover:shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Copy Master</span>
                  </>
                )}
              </button>

              {/* Downloads */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                <button
                  onClick={() => handleDownload('txt')}
                  title="Download as .txt"
                  className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-all"
                >
                  .TXT
                </button>
                <button
                  onClick={() => handleDownload('md')}
                  title="Download as .md"
                  className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-all"
                >
                  .MD
                </button>
                <button
                  onClick={() => handleDownload('json')}
                  title="Download as .json (Full Synthesis Report)"
                  className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-all"
                >
                  .JSON
                </button>
              </div>
            </>
          )}

          {/* Re-compile button with animated VIBGYOR rainbow styling */}
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="btn-vibgyor-animated flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50 shadow-md"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
            <span>{isCompiling ? 'Synthesizing...' : 'Synthesize Now'}</span>
          </button>
        </div>
      </div>

      {/* Synthesis Core Intent Banner */}
      {synthesis && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-violet-50/90 via-indigo-50/70 to-blue-50/50 border-b border-indigo-100/80 flex items-center space-x-2 text-xs text-indigo-950">
          <Target className="h-4 w-4 text-indigo-600 shrink-0" />
          <span className="font-semibold text-indigo-700 font-mono text-[11px]">CORE INTENT:</span>
          <span className="truncate text-slate-700 font-medium">{synthesis.coreIntent}</span>
        </div>
      )}

      {/* Main Master Prompt Content */}
      <div className="p-4 flex-1 overflow-y-auto bg-white">
        {synthesis?.masterPrompt ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden relative">
            {/* Terminal bar */}
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="text-indigo-700 flex items-center space-x-1.5 font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ACTIVE_COMPILED_BUFFER</span>
              </span>
              <span>SYNTHESIS_ENGINE // VIBGYOR ANIMATED</span>
            </div>
            <pre className="font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap select-all p-4 bg-white">
              {synthesis.masterPrompt}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
            <Sparkles className="h-8 w-8 text-indigo-400" />
            <p className="text-sm font-semibold text-slate-700">Ready to synthesize master prompt.</p>
            <p className="text-xs max-w-sm text-slate-500">
              Click &ldquo;Synthesize Now&rdquo; above to extract core intent, purge redundant fluff, and harmonize platform directives.
            </p>
          </div>
        )}
      </div>

      {/* Footer bar */}
      {synthesis && (
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-200/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>LEN: <strong className="text-slate-800">{synthesis.metrics.compressedChars}</strong> CHARS</span>
            <span>TOKENS: <strong className="text-indigo-700">{synthesis.metrics.compressedTokens}</strong></span>
          </div>
          <div className="text-emerald-700 font-semibold flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>ZERO CONVERSATIONAL OVERHEAD GUARANTEED</span>
          </div>
        </div>
      )}
    </div>
  );
};
