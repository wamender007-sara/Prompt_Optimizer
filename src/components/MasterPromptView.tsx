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
    <div className="reticle-box bg-[#111827]/90 border border-cyan-900/40 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl flex flex-col h-full relative">
      {/* Animatic Laser Sweep Line on Compiling */}
      {isCompiling && (
        <div className="animate-laser h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full absolute top-0 left-0 z-30 pointer-events-none" />
      )}

      {/* Top Header */}
      <div className="p-3.5 bg-slate-900/95 border-b border-cyan-900/30 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-cyan-950/90 border border-cyan-500/50 text-cyan-400 shadow-sm shadow-cyan-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] text-cyan-400/80 tracking-widest uppercase">SYS // CORE_SYNTHESIZER</span>
              {synthesis && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
                  {synthesis.metrics.compressedTokens} TOKENS (-{synthesis.metrics.reductionPercentage}%)
                </span>
              )}
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
              <span>Accurate Master Prompt</span>
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
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-800/50 hover:border-cyan-500/80 rounded-lg text-xs font-semibold text-cyan-200 transition-all shadow-sm hover:shadow-cyan-500/20"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Copy Master</span>
                  </>
                )}
              </button>

              {/* Downloads */}
              <div className="flex items-center bg-slate-950 border border-cyan-900/40 rounded-lg p-0.5">
                <button
                  onClick={() => handleDownload('txt')}
                  title="Download as .txt"
                  className="px-2 py-1 text-[11px] font-mono font-medium text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition-colors"
                >
                  .TXT
                </button>
                <button
                  onClick={() => handleDownload('md')}
                  title="Download as .md"
                  className="px-2 py-1 text-[11px] font-mono font-medium text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition-colors"
                >
                  .MD
                </button>
                <button
                  onClick={() => handleDownload('json')}
                  title="Download as .json (Full Synthesis Report)"
                  className="px-2 py-1 text-[11px] font-mono font-medium text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition-colors"
                >
                  .JSON
                </button>
              </div>
            </>
          )}

          {/* Re-compile button */}
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-600/30 hover:shadow-cyan-500/50 glow-cyan disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
            <span>{isCompiling ? 'Compiling...' : 'Synthesize Now'}</span>
          </button>
        </div>
      </div>

      {/* Synthesis Core Intent Banner */}
      {synthesis && (
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-cyan-900/30 flex items-center space-x-2 text-xs text-slate-300">
          <Target className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-cyan-400 font-mono text-[11px]">CORE INTENT:</span>
          <span className="truncate text-slate-200">{synthesis.coreIntent}</span>
        </div>
      )}

      {/* Main Master Prompt Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        {synthesis?.masterPrompt ? (
          <div className="relative rounded-lg border border-cyan-900/40 bg-[#0B0F19] overflow-hidden">
            {/* Terminal bar */}
            <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="text-cyan-400/80 flex items-center space-x-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ACTIVE_COMPILED_BUFFER</span>
              </span>
              <span>SYNTHESIS_ENGINE // V1.0</span>
            </div>
            <pre className="font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap select-all p-4 bg-transparent">
              {synthesis.masterPrompt}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-3">
            <Sparkles className="h-8 w-8 text-cyan-600/50" />
            <p className="text-sm font-medium text-slate-400">Ready to compile master prompt.</p>
            <p className="text-xs max-w-sm text-slate-600">
              Click &ldquo;Synthesize Now&rdquo; above to extract common intent, strip fluff, and harmonize platform directives.
            </p>
          </div>
        )}
      </div>

      {/* Footer bar */}
      {synthesis && (
        <div className="px-4 py-2 bg-slate-950/80 border-t border-cyan-900/30 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>LEN: <strong className="text-slate-200">{synthesis.metrics.compressedChars}</strong> CHARS</span>
            <span>TOKENS: <strong className="text-cyan-400">{synthesis.metrics.compressedTokens}</strong></span>
          </div>
          <div className="text-emerald-400 font-semibold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>ZERO CONVERSATIONAL OVERHEAD GUARANTEED</span>
          </div>
        </div>
      )}
    </div>
  );
};
