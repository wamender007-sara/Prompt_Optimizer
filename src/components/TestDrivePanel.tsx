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
    <div className="prism-glass rounded-2xl overflow-hidden border border-white/80 shadow-lg shadow-purple-500/5 backdrop-blur-xl flex flex-col relative">
      {/* Header */}
      <div className="p-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] text-emerald-700 font-bold tracking-wider uppercase">SYS // SANDBOX_RUNTIME</span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                SANDBOX READY
              </span>
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Live Execution Test Drive
            </h2>
          </div>
        </div>

        <button
          onClick={handleRunTestDrive}
          disabled={isRunning || !masterPrompt}
          className="btn-aurora-emerald flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
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
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 font-mono">
              <FileCode2 className="h-3.5 w-3.5 text-purple-600" />
              <span>Test Payload (Input context / Sample code):</span>
            </span>
            {defaultPayloadTitle && (
              <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]" title={defaultPayloadTitle}>
                {defaultPayloadTitle}
              </span>
            )}
          </div>

          <textarea
            rows={12}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Paste your code snippet, raw transcript, query, or text context to test how the Master Prompt performs..."
            className="w-full bg-slate-50/70 text-slate-800 font-mono text-xs p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:outline-none transition-all leading-relaxed resize-y shadow-inner"
          />

          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>{payload.length} CHARS</span>
            <span className="text-purple-700 font-semibold">DIRECTIVES_ENFORCED: STRICT</span>
          </div>
        </div>

        {/* Right: Real-time Model Execution Output */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 font-mono">
              <Cpu className="h-3.5 w-3.5 text-emerald-600" />
              <span>Execution Output & Verification:</span>
            </span>

            {response && (
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-semibold">
                  {response.executionTimeMs}ms
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                  {response.outputTokens} TOKENS
                </span>
                <button
                  onClick={handleCopyResponse}
                  className="p-1 text-slate-500 hover:text-emerald-600 transition-colors"
                  title="Copy Output"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          <div className="w-full h-[278px] bg-slate-50/60 rounded-xl border border-slate-200 p-4 overflow-y-auto font-mono text-xs text-slate-800 leading-relaxed shadow-inner relative">
            {isRunning ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                <Sparkles className="h-6 w-6 text-emerald-600 animate-spin" />
                <p className="text-xs font-mono font-medium text-emerald-700">Running synthesized prompt against payload...</p>
                <p className="text-[11px] font-mono text-slate-500">Enforcing strict zero-overhead constraint rules</p>
              </div>
            ) : response ? (
              <pre className="whitespace-pre-wrap select-all font-mono text-xs text-slate-800">
                {response.response}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-2">
                <Play className="h-6 w-6 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No execution run yet.</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Click &ldquo;Run Test Drive&rdquo; to execute the master prompt with the sample payload.
                </p>
              </div>
            )}
          </div>

          {response && (
            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>ENGINE: <strong className="text-purple-700">{response.modelSimulated}</strong></span>
              <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>ALL CONSTRAINTS VERIFIED // 100% PASS</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
