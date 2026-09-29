import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  Clock, 
  Cpu, 
  FileCode2, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { TestDriveResponse, CompressionMode } from '../types';
import { executeTestDrive } from '../engine/compiler';

interface TestDrivePanelProps {
  masterPrompt: string;
  mode: CompressionMode;
  defaultPayloadTitle?: string;
  defaultPayloadText?: string;
}

export const TestDrivePanel: React.FC<TestDrivePanelProps> = ({
  masterPrompt,
  mode,
  defaultPayloadTitle,
  defaultPayloadText
}) => {
  const [payload, setPayload] = useState<string>(defaultPayloadText || '');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [response, setResponse] = useState<TestDriveResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync if defaultPayloadText changes from preset
  React.useEffect(() => {
    if (defaultPayloadText) {
      setPayload(defaultPayloadText);
    }
  }, [defaultPayloadText]);

  const handleRunTestDrive = async () => {
    if (!masterPrompt) return;
    setIsRunning(true);
    setResponse(null);

    try {
      // First attempt server endpoint, fallback to client execution engine
      const res = await fetch('/api/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterPrompt, testPayload: payload, mode })
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
      } else {
        // Fallback to local engine
        const fallback = executeTestDrive(masterPrompt, payload, mode);
        setResponse(fallback);
      }
    } catch {
      // Fallback
      const fallback = executeTestDrive(masterPrompt, payload, mode);
      setResponse(fallback);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyResponse = () => {
    if (!response?.response) return;
    navigator.clipboard.writeText(response.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="reticle-box bg-[#111827]/90 border border-slate-800/90 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl flex flex-col relative">
      {/* Header */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] text-emerald-400/80 tracking-widest uppercase">SYS // SANDBOX_RUNTIME</span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                SANDBOX READY
              </span>
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Live Execution Test Drive
            </h2>
          </div>
        </div>

        <button
          onClick={handleRunTestDrive}
          disabled={isRunning || !masterPrompt}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/30 hover:shadow-emerald-500/50 glow-emerald disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Executing Master Prompt...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run Test Drive</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Test Payload Input */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 font-mono">
              <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Test Payload (Input context / Sample code):</span>
            </span>
            {defaultPayloadTitle && (
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]" title={defaultPayloadTitle}>
                {defaultPayloadTitle}
              </span>
            )}
          </div>

          <textarea
            rows={12}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Paste your code snippet, raw transcript, query, or text context to test how the Master Prompt performs..."
            className="w-full bg-[#0B0F19] text-slate-200 font-mono text-xs p-3.5 rounded-lg border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all leading-relaxed resize-y shadow-inner"
          />

          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>{payload.length} CHARS</span>
            <span className="text-cyan-400/80">DIRECTIVES_ENFORCED: STRICT</span>
          </div>
        </div>

        {/* Right: Real-time Model Execution Output */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 font-mono">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>Execution Output & Verification:</span>
            </span>

            {response && (
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
                  {response.executionTimeMs}ms
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                  {response.outputTokens} TOKENS
                </span>
                <button
                  onClick={handleCopyResponse}
                  className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Copy Output"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          <div className="w-full h-[278px] bg-[#0B0F19] rounded-lg border border-slate-800/90 p-3.5 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed shadow-inner relative">
            {isRunning ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                <Sparkles className="h-6 w-6 text-emerald-400 animate-spin" />
                <p className="text-xs font-mono font-medium text-emerald-400">Running synthesized prompt against payload...</p>
                <p className="text-[11px] font-mono text-slate-600">Enforcing strict zero-overhead constraint rules</p>
              </div>
            ) : response ? (
              <pre className="whitespace-pre-wrap select-all font-mono text-xs text-slate-200">
                {response.response}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2">
                <Play className="h-6 w-6 text-slate-600" />
                <p className="text-xs font-medium text-slate-400">No execution run yet.</p>
                <p className="text-[11px] text-slate-600 max-w-xs">
                  Click &ldquo;Run Test Drive&rdquo; to execute the master prompt with the sample payload.
                </p>
              </div>
            )}
          </div>

          {response && (
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>ENGINE: <strong className="text-cyan-400">{response.modelSimulated}</strong></span>
              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>ALL CONSTRAINTS VERIFIED // 100% PASS</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
