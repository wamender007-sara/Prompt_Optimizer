import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckSquare, 
  Trash2, 
  Scale, 
  PieChart, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';
import { SynthesisResult } from '../types';

interface AnalyticsDashboardProps {
  synthesis: SynthesisResult | null;
  onToggleDirective?: (directiveId: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  synthesis,
  onToggleDirective
}) => {
  const [activeTab, setActiveTab] = useState<'directives' | 'fluff' | 'conflicts' | 'contributions'>('directives');

  if (!synthesis) {
    return (
      <div className="bg-[#111827]/80 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
        <BarChart3 className="h-10 w-10 mx-auto mb-2 text-slate-600" />
        <p className="text-sm font-semibold">Synthesis Analytics Offline</p>
        <p className="text-xs text-slate-600 mt-1">Compile prompts to view token reduction, fluff analysis, and conflict resolution matrix.</p>
      </div>
    );
  }

  const { metrics, preservedDirectives, fluffRemoved, conflictMatrix, contributions } = synthesis;

  return (
    <div className="reticle-box bg-[#111827]/90 border border-slate-800/90 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl flex flex-col relative">
      {/* 1. Top Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-900/60 border-b border-slate-800/80">
        
        {/* Token Compression Card */}
        <div className="bg-[#0B0F19] p-3 rounded-lg border border-emerald-900/40 hover:border-emerald-500/50 transition-all flex items-center justify-between group">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Token Compression</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-lg font-black font-mono text-white group-hover:text-emerald-300 transition-colors">{metrics.compressedTokens}</span>
              <span className="text-xs font-mono text-slate-500 line-through">{metrics.originalTotalTokens}</span>
            </div>
          </div>
          <div className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-xs font-mono flex items-center space-x-1 shadow-sm shadow-emerald-500/20">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>-{metrics.reductionPercentage}%</span>
          </div>
        </div>

        {/* Latency Saved Card */}
        <div className="bg-[#0B0F19] p-3 rounded-lg border border-cyan-900/40 hover:border-cyan-500/50 transition-all flex items-center justify-between group">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Prefill Latency Saved</span>
            <div className="text-lg font-black font-mono text-cyan-400 mt-0.5 group-hover:text-cyan-300 transition-colors">
              ~{metrics.estimatedLatencySavedMs} <span className="text-xs font-normal text-slate-400">ms/req</span>
            </div>
          </div>
          <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-sm shadow-cyan-500/20">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        {/* Cost Savings Card */}
        <div className="bg-[#0B0F19] p-3 rounded-lg border border-amber-900/40 hover:border-amber-500/50 transition-all flex items-center justify-between group">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Cost Savings (1M Calls)</span>
            <div className="text-lg font-black font-mono text-amber-400 mt-0.5 group-hover:text-amber-300 transition-colors">
              ${metrics.estimatedCostSavedPer1MRuns.toLocaleString()} <span className="text-xs font-normal text-slate-400">saved</span>
            </div>
          </div>
          <div className="p-2 rounded bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/20">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>

        {/* Fluff Eliminated Card */}
        <div className="bg-[#0B0F19] p-3 rounded-lg border border-rose-900/40 hover:border-rose-500/50 transition-all flex items-center justify-between group">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Noise & Tropes Purged</span>
            <div className="text-lg font-black font-mono text-rose-400 mt-0.5 group-hover:text-rose-300 transition-colors">
              {fluffRemoved.length} <span className="text-xs font-normal text-slate-400">phrases</span>
            </div>
          </div>
          <div className="p-2 rounded bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-sm shadow-rose-500/20">
            <Trash2 className="h-4 w-4" />
          </div>
        </div>

      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 pt-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('directives')}
          className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold transition-all border-b-2 font-mono ${
            activeTab === 'directives'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Preserved Directives ({preservedDirectives.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fluff')}
          className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold transition-all border-b-2 font-mono ${
            activeTab === 'fluff'
              ? 'border-rose-400 text-rose-400 bg-rose-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Fluff Purged ({fluffRemoved.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold transition-all border-b-2 font-mono ${
            activeTab === 'conflicts'
              ? 'border-amber-400 text-amber-400 bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="h-3.5 w-3.5" />
          <span>Conflict Matrix ({conflictMatrix.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contributions')}
          className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold transition-all border-b-2 font-mono ${
            activeTab === 'contributions'
              ? 'border-purple-400 text-purple-400 bg-purple-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="h-3.5 w-3.5" />
          <span>Platform Contributions</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="p-4 max-h-[420px] overflow-y-auto">
        
        {/* Preserved Directives */}
        {activeTab === 'directives' && (
          <div className="space-y-2.5">
            <div className="text-xs text-slate-400 mb-2">
              All essential rules, constraints, edge cases, and output schemas isolated from multi-platform inputs and guaranteed in the Master Prompt:
            </div>
            {preservedDirectives.map((d) => {
              const categoryBadge = {
                core_intent: 'bg-cyan-950 text-cyan-300 border-cyan-800',
                hard_constraint: 'bg-emerald-950 text-emerald-300 border-emerald-800',
                edge_case: 'bg-amber-950 text-amber-300 border-amber-800',
                output_format: 'bg-purple-950 text-purple-300 border-purple-800'
              }[d.category] || 'bg-slate-850 text-slate-300 border-slate-700';

              const isRetained = d.retained !== false;

              return (
                <div
                  key={d.id}
                  onClick={() => onToggleDirective?.(d.id)}
                  className={`p-3 rounded-lg bg-[#0B0F19] border transition-all flex items-start space-x-3 ${
                    isRetained
                      ? 'border-slate-800 hover:border-slate-700'
                      : 'border-slate-800/40 opacity-50 bg-slate-950/40'
                  } ${onToggleDirective ? 'cursor-pointer' : ''}`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDirective?.(d.id);
                    }}
                    className={`shrink-0 mt-0.5 p-0.5 rounded transition-colors ${
                      isRetained ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={isRetained ? 'Directive Included in Master Prompt (Click to exclude)' : 'Directive Excluded (Click to include)'}
                  >
                    <ShieldCheck className={`h-4 w-4 ${isRetained ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </button>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${categoryBadge}`}>
                        {d.category.replace('_', ' ')}
                      </span>
                      {d.sourcePlatforms.map((p, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300">
                          {p}
                        </span>
                      ))}
                      {!isRetained && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/40">
                          EXCLUDED FROM MASTER
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${isRetained ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                      {d.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fluff & Noise Purged */}
        {activeTab === 'fluff' && (
          <div className="space-y-2.5">
            <div className="text-xs text-slate-400 mb-2">
              Detected platform boilerplate, polite filler, generic disclaimers, and conversational overhead that degrade prompt performance:
            </div>
            {fluffRemoved.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No conversational fluff detected in active prompt slots.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {fluffRemoved.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-[#0B0F19] border border-rose-950/60 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/40">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          from {item.sourcePlatform}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-300 line-through bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        &ldquo;{item.phrase}&rdquo;
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 italic flex items-center space-x-1">
                      <Info className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span>{item.whyRemoved}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conflict Resolution Matrix */}
        {activeTab === 'conflicts' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Reconciles contradictory platform instructions into a unified, mathematically coherent master directive:
            </div>
            {conflictMatrix.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No contradictory directives detected across platforms.</p>
            ) : (
              conflictMatrix.map((c) => (
                <div key={c.id} className="p-3.5 rounded-lg bg-[#0B0F19] border border-amber-900/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      <span>Discrepancy: {c.nature}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Strategy: {c.resolutionStrategy.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Side-by-side directives */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{c.directiveA.platform}</span>
                      <p className="text-slate-300 mt-0.5 italic">&ldquo;{c.directiveA.text}&rdquo;</p>
                    </div>
                    <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{c.directiveB.platform}</span>
                      <p className="text-slate-300 mt-0.5 italic">&ldquo;{c.directiveB.text}&rdquo;</p>
                    </div>
                  </div>

                  {/* Resolution statement */}
                  <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cyan-300 font-semibold">Harmonized Master Directive: </strong>
                      {c.reconciliation}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Platform Contributions */}
        {activeTab === 'contributions' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Visual breakdown showing the relative weight and unique analytical contributions from each platform prompt:
            </div>
            
            {/* Multi-segment Progress Bar */}
            <div className="h-4 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800 shadow-inner">
              {contributions.map((c, i) => (
                <div
                  key={i}
                  style={{ width: `${c.contributionPercent}%`, backgroundColor: c.color }}
                  title={`${c.platform}: ${c.contributionPercent}%`}
                  className="h-full transition-all duration-500 hover:opacity-80"
                />
              ))}
            </div>

            {/* Platform Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contributions.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#0B0F19] border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-xs font-bold text-slate-200">{c.platform}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {c.contributionPercent}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mb-2">
                      {c.originalTokens} tokens analyzed
                    </div>
                    <div className="space-y-1">
                      {c.uniqueInsightsProvided.map((insight, idx) => (
                        <div key={idx} className="text-xs text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800/80">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
