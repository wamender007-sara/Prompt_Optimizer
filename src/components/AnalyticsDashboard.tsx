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
    <div className="prism-glass rounded-2xl overflow-hidden border border-white/80 shadow-lg shadow-purple-500/5 backdrop-blur-xl flex flex-col relative">
      {/* 1. Top Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 bg-slate-50/60 border-b border-slate-200/80">
        
        {/* Token Compression Card */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all flex items-center justify-between shadow-sm hover:shadow-md group">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Token Compression</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-xl font-extrabold font-mono text-slate-900 group-hover:text-emerald-600 transition-colors">{metrics.compressedTokens}</span>
              <span className="text-xs font-mono text-slate-400 line-through">{metrics.originalTotalTokens}</span>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs font-mono flex items-center space-x-1 shadow-sm">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>-{metrics.reductionPercentage}%</span>
          </div>
        </div>

        {/* Latency Saved Card */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-sky-200 hover:border-sky-300 transition-all flex items-center justify-between shadow-sm hover:shadow-md group">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Prefill Latency Saved</span>
            <div className="text-xl font-extrabold font-mono text-sky-600 mt-0.5 group-hover:text-sky-700 transition-colors">
              ~{metrics.estimatedLatencySavedMs} <span className="text-xs font-normal text-slate-500">ms/req</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-sm">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        {/* Cost Savings Card */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200 hover:border-amber-300 transition-all flex items-center justify-between shadow-sm hover:shadow-md group">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Cost Savings (1M Calls)</span>
            <div className="text-xl font-extrabold font-mono text-amber-600 mt-0.5 group-hover:text-amber-700 transition-colors">
              ${metrics.estimatedCostSavedPer1MRuns.toLocaleString()} <span className="text-xs font-normal text-slate-500">saved</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shadow-sm">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>

        {/* Fluff Eliminated Card */}
        <div className="bg-white/90 p-3.5 rounded-xl border border-rose-200 hover:border-rose-300 transition-all flex items-center justify-between shadow-sm hover:shadow-md group">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Noise & Tropes Purged</span>
            <div className="text-xl font-extrabold font-mono text-rose-600 mt-0.5 group-hover:text-rose-700 transition-colors">
              {fluffRemoved.length} <span className="text-xs font-normal text-slate-500">phrases</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shadow-sm">
            <Trash2 className="h-4 w-4" />
          </div>
        </div>

      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200/80 bg-slate-100/40 px-4 pt-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('directives')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold transition-all border-b-2 font-mono rounded-t-xl ${
            activeTab === 'directives'
              ? 'border-purple-600 text-purple-700 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Preserved Directives ({preservedDirectives.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fluff')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold transition-all border-b-2 font-mono rounded-t-xl ${
            activeTab === 'fluff'
              ? 'border-rose-500 text-rose-700 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Fluff Purged ({fluffRemoved.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold transition-all border-b-2 font-mono rounded-t-xl ${
            activeTab === 'conflicts'
              ? 'border-amber-500 text-amber-700 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
          }`}
        >
          <Scale className="h-3.5 w-3.5" />
          <span>Conflict Matrix ({conflictMatrix.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contributions')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold transition-all border-b-2 font-mono rounded-t-xl ${
            activeTab === 'contributions'
              ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
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
            <div className="text-xs text-slate-500 mb-2">
              All essential rules, constraints, edge cases, and output schemas isolated from multi-platform inputs and guaranteed in the Master Prompt:
            </div>
            {preservedDirectives.map((d) => {
              const categoryBadge = {
                core_intent: 'bg-purple-100 text-purple-700 border-purple-200',
                hard_constraint: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                edge_case: 'bg-amber-100 text-amber-700 border-amber-200',
                output_format: 'bg-sky-100 text-sky-700 border-sky-200'
              }[d.category] || 'bg-slate-100 text-slate-700 border-slate-200';

              const isRetained = d.retained !== false;

              return (
                <div
                  key={d.id}
                  onClick={() => onToggleDirective?.(d.id)}
                  className={`p-3.5 rounded-xl border transition-all flex items-start space-x-3 ${
                    isRetained
                      ? 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300'
                      : 'border-slate-200/50 opacity-50 bg-slate-50'
                  } ${onToggleDirective ? 'cursor-pointer' : ''}`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDirective?.(d.id);
                    }}
                    className={`shrink-0 mt-0.5 p-0.5 rounded transition-colors ${
                      isRetained ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={isRetained ? 'Directive Included in Master Prompt (Click to exclude)' : 'Directive Excluded (Click to include)'}
                  >
                    <ShieldCheck className={`h-4 w-4 ${isRetained ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </button>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${categoryBadge}`}>
                        {d.category.replace('_', ' ')}
                      </span>
                      {d.sourcePlatforms.map((p, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          {p}
                        </span>
                      ))}
                      {!isRetained && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          EXCLUDED FROM MASTER
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${isRetained ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}`}>
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
            <div className="text-xs text-slate-500 mb-2">
              Detected platform boilerplate, polite filler, generic disclaimers, and conversational overhead that degrade prompt performance:
            </div>
            {fluffRemoved.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No conversational fluff detected in active prompt slots.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {fluffRemoved.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white border border-rose-200/80 shadow-sm flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          from {item.sourcePlatform}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-600 line-through bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                        &ldquo;{item.phrase}&rdquo;
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 italic flex items-center space-x-1">
                      <Info className="h-3 w-3 text-purple-600 shrink-0" />
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
            <div className="text-xs text-slate-500 mb-2">
              Reconciles contradictory platform instructions into a unified, mathematically coherent master directive:
            </div>
            {conflictMatrix.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No contradictory directives detected across platforms.</p>
            ) : (
              conflictMatrix.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-white border border-amber-200/90 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 flex items-center space-x-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Discrepancy: {c.nature}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                      Strategy: {c.resolutionStrategy.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Side-by-side directives */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{c.directiveA.platform}</span>
                      <p className="text-slate-700 mt-0.5 italic">&ldquo;{c.directiveA.text}&rdquo;</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{c.directiveB.platform}</span>
                      <p className="text-slate-700 mt-0.5 italic">&ldquo;{c.directiveB.text}&rdquo;</p>
                    </div>
                  </div>

                  {/* Resolution statement */}
                  <div className="p-3 rounded-lg bg-purple-50/80 border border-purple-200 text-xs text-purple-900 flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-purple-800 font-bold">Harmonized Master Directive: </strong>
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
            <div className="text-xs text-slate-500">
              Visual breakdown showing the relative weight and unique analytical contributions from each platform prompt:
            </div>
            
            {/* Multi-segment Progress Bar */}
            <div className="h-3.5 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200 shadow-inner">
              {contributions.map((c, i) => (
                <div
                  key={i}
                  style={{ width: `${c.contributionPercent}%`, backgroundColor: c.color }}
                  title={`${c.platform}: ${c.contributionPercent}%`}
                  className="h-full transition-all duration-500 hover:opacity-85"
                />
              ))}
            </div>

            {/* Platform Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contributions.map((c, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-xs font-bold text-slate-800">{c.platform}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {c.contributionPercent}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mb-2">
                      {c.originalTokens} tokens analyzed
                    </div>
                    <div className="space-y-1">
                      {c.uniqueInsightsProvided.map((insight, idx) => (
                        <div key={idx} className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
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
