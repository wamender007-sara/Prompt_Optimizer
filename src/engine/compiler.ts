import {
  PromptSlot,
  CompressionMode,
  SynthesisResult,
  DirectiveItem,
  FluffItem,
  ConflictItem,
  PlatformContribution,
  TokenMetrics,
  TestDriveResponse
} from '../types';

// Common fluff / boilerplate tropes
const FLUFF_PATTERNS: { regex: RegExp; category: FluffItem['category']; why: string }[] = [
  {
    regex: /act as (?:a|an)\s+[^.\n]+(?:engineer|architect|director|manager|author|master|specialist|expert)[^.\n]*/gi,
    category: 'boilerplate_persona',
    why: 'Superficial persona framing degrades reasoning consistency and wastes token budget.'
  },
  {
    regex: /with \d+\+?\s+years of experience[^.\n]*/gi,
    category: 'boilerplate_persona',
    why: 'Arbitrary seniority claims do not alter latent model weights; pure token waste.'
  },
  {
    regex: /please (?:make sure to|kindly|feel free to|help me|thoroughly)[^.\n]*/gi,
    category: 'polite_filler',
    why: 'Politeness indicators introduce conversational entropy without adding constraints.'
  },
  {
    regex: /thank you (?:so much )?(?:in advance)?[!.]*/gi,
    category: 'polite_filler',
    why: 'Conversational closing remarks are non-operational in model execution.'
  },
  {
    regex: /i need you to|i want you to|can you please|could you please/gi,
    category: 'polite_filler',
    why: 'Indirect conversational requests are replaced with direct imperative clauses.'
  },
  {
    regex: /don't hesitate to explain|feel free to ask questions/gi,
    category: 'generic_disclaimer',
    why: 'Encourages model chattiness and ungrounded follow-up banter.'
  },
  {
    regex: /have fun with it[!.]*|be descriptive, evocative/gi,
    category: 'redundancy',
    why: 'Vague aesthetic directives diluting factual precision and rigor.'
  },
  {
    regex: /\/\/\s*\.cursorrules context:[^\n]*/gi,
    category: 'boilerplate_persona',
    why: 'Platform-specific editor comment headers stripped for universal portability.'
  },
  {
    regex: /explain things in a compelling narrative[^.\n]*/gi,
    category: 'redundancy',
    why: 'Narrative fluff conflicts with structured analytical decision making.'
  }
];

export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  // Standard rule-of-thumb: ~4 chars per token for English, accounting for symbols and whitespace
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  return Math.max(1, Math.round((chars / 3.8 + words * 0.2) / 1.1));
}

export function compilePrompts(
  slots: PromptSlot[],
  mode: CompressionMode = 'production_balanced'
): SynthesisResult {
  const activeSlots = slots.filter(s => s.enabled && s.prompt.trim().length > 0);
  
  if (activeSlots.length === 0) {
    return {
      id: `synth-${Date.now()}`,
      timestamp: new Date().toISOString(),
      mode,
      masterPrompt: 'No active prompt inputs provided. Please enable at least one platform slot.',
      coreIntent: 'Undefined',
      metrics: {
        originalTotalTokens: 0,
        originalTotalChars: 0,
        compressedTokens: 0,
        compressedChars: 0,
        reductionPercentage: 0,
        estimatedLatencySavedMs: 0,
        estimatedCostSavedPer1MRuns: 0
      },
      preservedDirectives: [],
      fluffRemoved: [],
      conflictMatrix: [],
      contributions: []
    };
  }

  // 1. Calculate original metrics
  const originalTotalChars = activeSlots.reduce((acc, s) => acc + s.prompt.length, 0);
  const originalTotalTokens = activeSlots.reduce((acc, s) => acc + estimateTokens(s.prompt), 0);

  // 2. Extract Fluff and Purge
  const fluffRemoved: FluffItem[] = [];
  const cleanedSlots = activeSlots.map(slot => {
    let cleaned = slot.prompt;
    FLUFF_PATTERNS.forEach((pattern, pIdx) => {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      const matches = slot.prompt.match(regex);
      if (matches) {
        matches.forEach((m, mIdx) => {
          fluffRemoved.push({
            id: `fluff-${slot.id}-${pIdx}-${mIdx}`,
            phrase: m.trim(),
            category: pattern.category,
            sourcePlatform: slot.name,
            whyRemoved: pattern.why
          });
          cleaned = cleaned.replace(m, ' ');
        });
      }
    });
    return {
      ...slot,
      cleanedPrompt: cleaned.replace(/\n{3,}/g, '\n\n').trim()
    };
  });

  // 3. Extract Core Intent & Directives
  const { coreIntent, preservedDirectives, conflictMatrix, uniqueInsightsByPlatform } = extractDirectivesAndConflicts(activeSlots);

  // 4. Synthesize Master Prompt based on mode
  const masterPrompt = generateMasterPrompt(mode, coreIntent, preservedDirectives, conflictMatrix, activeSlots);

  // 5. Calculate Final Metrics
  const compressedChars = masterPrompt.length;
  const compressedTokens = estimateTokens(masterPrompt);
  const reductionPercentage = originalTotalTokens > 0 
    ? Math.max(0, Math.round(((originalTotalTokens - compressedTokens) / originalTotalTokens) * 100))
    : 0;

  // Latency savings: ~18ms per 100 tokens processed in TTFT (Time-To-First-Token) & prefill
  const tokensSaved = Math.max(0, originalTotalTokens - compressedTokens);
  const estimatedLatencySavedMs = Math.round((tokensSaved / 100) * 18);
  // Cost savings: Average modern frontier blend ~$3.00 per 1M input tokens
  const estimatedCostSavedPer1MRuns = Math.round(tokensSaved * 3.0);

  // 6. Platform Contribution Matrix
  const colors: Record<string, string> = {
    chatgpt: '#10A37F',
    claude: '#D97706',
    gemini: '#3B82F6',
    cursor: '#8B5CF6',
    deepseek: '#06B6D4',
    custom: '#EC4899'
  };

  const contributions: PlatformContribution[] = activeSlots.map(slot => {
    const slotTokens = estimateTokens(slot.prompt);
    const weight = originalTotalTokens > 0 ? (slotTokens / originalTotalTokens) * 100 : 0;
    const insights = uniqueInsightsByPlatform[slot.platform] || [
      `Contributed structural criteria and operational parameters.`
    ];

    return {
      platform: slot.name,
      originalTokens: slotTokens,
      contributionPercent: Math.round(weight),
      uniqueInsightsProvided: insights,
      color: colors[slot.platform] || '#6B7280'
    };
  });

  return {
    id: `synth-${Date.now()}`,
    timestamp: new Date().toISOString(),
    mode,
    masterPrompt,
    coreIntent,
    metrics: {
      originalTotalTokens,
      originalTotalChars,
      compressedTokens,
      compressedChars,
      reductionPercentage,
      estimatedLatencySavedMs,
      estimatedCostSavedPer1MRuns
    },
    preservedDirectives,
    fluffRemoved,
    conflictMatrix,
    contributions
  };
}

function extractDirectivesAndConflicts(slots: PromptSlot[]): {
  coreIntent: string;
  preservedDirectives: DirectiveItem[];
  conflictMatrix: ConflictItem[];
  uniqueInsightsByPlatform: Record<string, string[]>;
} {
  const combined = slots.map(s => s.prompt.toLowerCase()).join(' ');

  // Domain-aware detection with robust compound matching
  const isTypeScript = (combined.includes('typescript') || combined.includes('ast refactor')) ||
    (combined.includes('owasp') && combined.includes('vulnerab')) ||
    (combined.includes('solid') && combined.includes('clean code'));
  const isFinance = (combined.includes('earnings') || combined.includes('10-q')) ||
    (combined.includes('gaap') && combined.includes('non-gaap')) ||
    (combined.includes('fcf') && combined.includes('capex'));
  const isSQL = (combined.includes('sql') || combined.includes('postgresql') || combined.includes('mysql') || combined.includes('dba')) &&
    (combined.includes('index') || combined.includes('query') || combined.includes('sargable') || combined.includes('table'));
  const isSupport = (combined.includes('ticket') || combined.includes('incident') || combined.includes('sla')) &&
    (combined.includes('support') || combined.includes('triage') || combined.includes('customer') || combined.includes('escalat'));
  const isSciFi = (combined.includes('sci-fi') || combined.includes('scifi') || combined.includes('worldbuilding') || combined.includes('lore codex')) ||
    (combined.includes('faction') && (combined.includes('stellar') || combined.includes('kardashev') || combined.includes('astrophysic')));

  let coreIntent = 'Deep multi-platform synthesis and high-precision task execution.';
  const preservedDirectives: DirectiveItem[] = [];
  const conflictMatrix: ConflictItem[] = [];
  const uniqueInsightsByPlatform: Record<string, string[]> = {};

  if (isTypeScript) {
    coreIntent = 'Refactor TypeScript backend codebase for cryptographic safety, zero-defect type soundness, and micro-architectural V8 performance.';
    
    preservedDirectives.push(
      {
        id: 'd1',
        category: 'core_intent',
        text: 'Enforce absolute type soundness: purge all `any` usages; mandate discriminated unions and Zod runtime validation.',
        sourcePlatforms: ['Claude', 'Cursor'],
        retained: true
      },
      {
        id: 'd2',
        category: 'hard_constraint',
        text: 'Mitigate OWASP Top 10 vulnerabilities (SQL injection, prototype pollution, ReDoS, and timing attack hazards via `crypto.timingSafeEqual`).',
        sourcePlatforms: ['ChatGPT', 'Claude', 'DeepSeek'],
        retained: true
      },
      {
        id: 'd3',
        category: 'hard_constraint',
        text: 'Eliminate V8 de-optimizations: prevent megamorphic caches and allocate immutable data structures (`Readonly<T>`).',
        sourcePlatforms: ['Gemini', 'Claude'],
        retained: true
      },
      {
        id: 'd4',
        category: 'edge_case',
        text: 'Implement robust error handling monads (`Result<T, E>`) over unchecked throw statements, with exhaustive `assertNever` checks.',
        sourcePlatforms: ['Cursor', 'DeepSeek'],
        retained: true
      },
      {
        id: 'd5',
        category: 'output_format',
        text: 'Provide structured Vulnerability Matrix table (CWE, Severity, Fix), complete drop-in TypeScript implementation, and Before/After Big-O diff.',
        sourcePlatforms: ['Claude', 'Gemini', 'Cursor'],
        retained: true
      }
    );

    conflictMatrix.push(
      {
        id: 'c1',
        directiveA: { platform: 'ChatGPT', text: 'Provide gentle step-by-step explanations for junior developers.' },
        directiveB: { platform: 'Claude & Cursor', text: 'Output zero conversational preamble, strictly production code and vulnerability proof.' },
        nature: 'Verbosity vs. Conciseness',
        reconciliation: 'Eliminated conversational fluff; encoded explanations directly into high-density inline JSDoc annotations and structured vulnerability tables.',
        resolutionStrategy: 'schema_harmonization'
      },
      {
        id: 'c2',
        directiveA: { platform: 'Cursor', text: 'Preserve existing public API signature contracts.' },
        directiveB: { platform: 'DeepSeek', text: 'Replace throwing functions with Result<T, E> return monads.' },
        nature: 'API Signature Incompatibility',
        reconciliation: 'Wrapped internal operations in safe Result monads while providing a backward-compatible adapter envelope for existing Express/HTTP contracts.',
        resolutionStrategy: 'hybrid_compromise'
      }
    );

    uniqueInsightsByPlatform['chatgpt'] = ['Identified high-level OWASP injection attack vectors & SOLID architecture goals.'];
    uniqueInsightsByPlatform['claude'] = ['Enforced strict Zod boundary validation and eliminated implicit `any` types.'];
    uniqueInsightsByPlatform['gemini'] = ['Contributed V8 GC optimization and circuit-breaker telemetry patterns.'];
    uniqueInsightsByPlatform['cursor'] = ['Mandated exact code replacements without `// ... rest of code` ellipses.'];
    uniqueInsightsByPlatform['deepseek'] = ['Isolated cryptographic timing attacks and ReDoS boundary vulnerabilities.'];

  } else if (isFinance) {
    coreIntent = 'Conduct forensic quantitative earnings deconstruction reconciling GAAP vs Non-GAAP, free cash flow dynamics, and downside risk factors.';
    
    preservedDirectives.push(
      {
        id: 'd1',
        category: 'core_intent',
        text: 'Deconstruct revenue quality, SBC expansion, and Non-GAAP reconciliation gaps.',
        sourcePlatforms: ['ChatGPT', 'Claude'],
        retained: true
      },
      {
        id: 'd2',
        category: 'hard_constraint',
        text: 'Calculate Unlevered Free Cash Flow (FCF) with Capex drag breakdown and Rule of 40 scorecard.',
        sourcePlatforms: ['Claude'],
        retained: true
      },
      {
        id: 'd3',
        category: 'hard_constraint',
        text: 'Quantify FX currency headwinds, geographic segment divergence, and forward guidance delta vs consensus.',
        sourcePlatforms: ['Gemini', 'Cursor'],
        retained: true
      },
      {
        id: 'd4',
        category: 'edge_case',
        text: 'Probe accounts receivable aging vs. revenue growth for channel stuffing and deferred revenue depletion.',
        sourcePlatforms: ['DeepSeek'],
        retained: true
      },
      {
        id: 'd5',
        category: 'output_format',
        text: 'Output raw quantitative JSON metrics block followed by Bear/Base/Bull variance table and 4-bullet executive summary.',
        sourcePlatforms: ['Claude', 'Cursor'],
        retained: true
      }
    );

    conflictMatrix.push(
      {
        id: 'c1',
        directiveA: { platform: 'ChatGPT', text: 'Present a compelling, exciting narrative highlighting upside opportunities.' },
        directiveB: { platform: 'DeepSeek & Claude', text: 'Adversarial, cold risk assessment with zero editorial hyperbole.' },
        nature: 'Subjective Optimism vs. Objective Forensic Rigor',
        reconciliation: 'Stripped promotional bias. Partitioned output into factual metric tables with a balanced Bear/Base/Bull probabilistic scenario matrix.',
        resolutionStrategy: 'strictest_rule'
      }
    );

    uniqueInsightsByPlatform['chatgpt'] = ['Framed high-level investment committee takeaways and revenue trajectory.'];
    uniqueInsightsByPlatform['claude'] = ['Supplied forensic SBC reconciliation formulas and Rule of 40 benchmarks.'];
    uniqueInsightsByPlatform['gemini'] = ['Added geographic segment variance and macroeconomic FX exposure tracking.'];
    uniqueInsightsByPlatform['cursor'] = ['Specified strict JSON schema output format for programmatic ingestion.'];
    uniqueInsightsByPlatform['deepseek'] = ['Extracted defensive Q&A rhetoric and channel stuffing red flags.'];

  } else if (isSQL) {
    coreIntent = 'Diagnose database execution bottlenecks, eliminate non-sargable predicates, and synthesize zero-downtime concurrent index DDL.';
    
    preservedDirectives.push(
      {
        id: 'd1',
        category: 'core_intent',
        text: 'Deconstruct query execution plan to eliminate sequential scans and high-cost nested loops.',
        sourcePlatforms: ['ChatGPT', 'Claude'],
        retained: true
      },
      {
        id: 'd2',
        category: 'hard_constraint',
        text: 'Eliminate non-sargable expressions (e.g. `DATE()`, `LOWER()`, leading wildcards `%`) with partial or functional indexes.',
        sourcePlatforms: ['Claude', 'Cursor'],
        retained: true
      },
      {
        id: 'd3',
        category: 'hard_constraint',
        text: 'Ensure all index creations execute `CONCURRENTLY` to avoid production table locks.',
        sourcePlatforms: ['Claude', 'Gemini'],
        retained: true
      },
      {
        id: 'd4',
        category: 'edge_case',
        text: 'Analyze NULL cardinality distributions, multi-tenant skew, and correlated subquery O(N*M) traps.',
        sourcePlatforms: ['DeepSeek'],
        retained: true
      },
      {
        id: 'd5',
        category: 'output_format',
        text: 'Provide Cost Diagnosis table, Optimized ANSI-SQL, Rollback & Migration DDL, and Expected Buffer Cache Plan Diff.',
        sourcePlatforms: ['Claude', 'Cursor'],
        retained: true
      }
    );

    conflictMatrix.push(
      {
        id: 'c1',
        directiveA: { platform: 'ChatGPT', text: 'Explain high-level index concepts in friendly conversational language.' },
        directiveB: { platform: 'Cursor', text: 'No conversational filler, provide SQL blocks directly.' },
        nature: 'Conversational vs. Direct Execution',
        reconciliation: 'Prioritized copy-pasteable SQL and DDL blocks first; replaced chatty descriptions with concise commented header blocks.',
        resolutionStrategy: 'strictest_rule'
      }
    );

    uniqueInsightsByPlatform['chatgpt'] = ['Targeted high-level CTE vs Subquery optimization intent.'];
    uniqueInsightsByPlatform['claude'] = ['Required CONCURRENTLY index DDL and partial index scoping.'];
    uniqueInsightsByPlatform['gemini'] = ['Evaluated write-amplification tradeoffs and work_mem buffer sizing.'];
    uniqueInsightsByPlatform['cursor'] = ['Enforced ANSI-SQL formatting standards and rollback migration pairs.'];
    uniqueInsightsByPlatform['deepseek'] = ['Exposed O(N*M) correlated subquery Cartesian multiplication.'];

  } else if (isSupport) {
    coreIntent = 'Execute systematic ITIL incident triage, classify SLA breach severity, quantify customer churn risk, and draft an accountable resolution.';
    
    preservedDirectives.push(
      {
        id: 'd1',
        category: 'core_intent',
        text: 'Assign ITIL severity (P1-P4) based on SLA downtime blast radius and financial impact.',
        sourcePlatforms: ['Claude'],
        retained: true
      },
      {
        id: 'd2',
        category: 'hard_constraint',
        text: 'Extract system telemetry (HTTP 504s, idempotent payment retries, affected endpoints) and route to responsible squad.',
        sourcePlatforms: ['Gemini', 'Cursor'],
        retained: true
      },
      {
        id: 'd3',
        category: 'edge_case',
        text: 'Audit legal SLA breach penalty risk and ensure SOC2/regulatory compliance without disclosing internal architecture vulnerabilities.',
        sourcePlatforms: ['Cursor', 'DeepSeek'],
        retained: true
      },
      {
        id: 'd4',
        category: 'output_format',
        text: 'Emit structured JSON incident payload followed by an accountable customer response setting concrete update timestamps.',
        sourcePlatforms: ['Claude', 'Cursor'],
        retained: true
      }
    );

    conflictMatrix.push(
      {
        id: 'c1',
        directiveA: { platform: 'ChatGPT', text: 'Draft a warm, apologetic de-escalation response reassuring the customer.' },
        directiveB: { platform: 'DeepSeek', text: 'Avoid admitting liability or committing to unverified claims to prevent legal exposure.' },
        nature: 'Empathy vs Legal Liability Defense',
        reconciliation: 'Balanced empathetic acknowledgment of operational disruption while avoiding premature admissions of fault; committed to concrete investigative checkpoints.',
        resolutionStrategy: 'hybrid_compromise'
      }
    );

    uniqueInsightsByPlatform['chatgpt'] = ['Empathy de-escalation tone and customer reassurance techniques.'];
    uniqueInsightsByPlatform['claude'] = ['ITIL P1-P4 classification rubric and ARR churn risk vectoring.'];
    uniqueInsightsByPlatform['gemini'] = ['Telemetry extraction (504s, idempotency keys) and squad routing.'];
    uniqueInsightsByPlatform['cursor'] = ['Slack/PagerDuty webhook JSON schema definition.'];
    uniqueInsightsByPlatform['deepseek'] = ['SLA penalty credit defense and non-admissive legal phrasing.'];

  } else if (isSciFi) {
    coreIntent = 'Synthesize a hard science-fiction universe codex balancing astrophysical realism, game-theoretic geopolitics, and compelling faction dynamics.';
    
    preservedDirectives.push(
      {
        id: 'd1',
        category: 'core_intent',
        text: 'Ground technological civilization in thermodynamic reality (Kardashev scale, relativistic mechanics, non-FTL or mathematically constrained geometries).',
        sourcePlatforms: ['Claude'],
        retained: true
      },
      {
        id: 'd2',
        category: 'hard_constraint',
        text: 'Model planetary geology, non-carbon xenobiological biochemistries, and binary star orbital mechanics.',
        sourcePlatforms: ['Gemini'],
        retained: true
      },
      {
        id: 'd3',
        category: 'edge_case',
        text: 'Address the Fermi Paradox, relativistic time dilation command latency, and Dark Forest game theory equilibria.',
        sourcePlatforms: ['DeepSeek'],
        retained: true
      },
      {
        id: 'd4',
        category: 'output_format',
        text: 'Structure lore codex with YAML frontmatter, faction doctrine tables, and historical timeline epochs.',
        sourcePlatforms: ['Claude', 'Cursor'],
        retained: true
      }
    );

    conflictMatrix.push(
      {
        id: 'c1',
        directiveA: { platform: 'ChatGPT', text: 'Make it sound cinematic, emotional, and thrilling like space opera.' },
        directiveB: { platform: 'Claude & DeepSeek', text: 'Rigorous astrophysical and game-theoretic consistency; no ungrounded hand-waving.' },
        nature: 'Space Opera Tropes vs Hard Sci-Fi Realism',
        reconciliation: 'Preserved the dramatic human stakes and faction rivalries while grounding all technology in verifiable physics and cold game theory.',
        resolutionStrategy: 'hybrid_compromise'
      }
    );

    uniqueInsightsByPlatform['chatgpt'] = ['Dramatic narrative hooks and faction tension archetypes.'];
    uniqueInsightsByPlatform['claude'] = ['Thermodynamic constraints and transhumanist neuro-ethics.'];
    uniqueInsightsByPlatform['gemini'] = ['Non-carbon xenobiology and orbital planetary mechanics.'];
    uniqueInsightsByPlatform['cursor'] = ['Modular YAML frontmatter schema for RPG integration.'];
    uniqueInsightsByPlatform['deepseek'] = ['Relativistic communications latency and Dark Forest cold war models.'];

  } else {
    // Dynamic custom extraction
    coreIntent = 'Synthesize multi-platform prompt directives into a coherent, high-accuracy master prompt.';
    
    // Scan slots for constraint clauses and bullet points
    slots.forEach(slot => {
      const lines = slot.prompt.split('\n').filter(l => l.trim().length > 0);
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (/^(?:[-*•]|\d+[.)])/.test(trimmed)) {
          const ruleText = trimmed.replace(/^(?:[-*•]|\d+[.)])\s*/, '');
          const lower = ruleText.toLowerCase();
          let category: DirectiveItem['category'] = 'hard_constraint';
          if (lower.includes('output') || lower.includes('format') || lower.includes('json') || lower.includes('table') || lower.includes('schema') || lower.includes('markdown')) {
            category = 'output_format';
          } else if (lower.includes('edge case') || lower.includes('error') || lower.includes('boundary') || lower.includes('fallback') || lower.includes('exception')) {
            category = 'edge_case';
          } else if (lower.includes('objective') || lower.includes('goal') || lower.includes('intent') || lower.includes('primary')) {
            category = 'core_intent';
          }
          preservedDirectives.push({
            id: `cd-${slot.id}-${idx}`,
            category,
            text: ruleText,
            sourcePlatforms: [slot.name],
            retained: true
          });
        } else {
          // Detect strong imperative constraint sentences
          const imperativeRegex = /\b(must|ensure|always|never|do not|require|strictly|only|enforce|validate|mitigate|prevent|avoid)\b/i;
          if (imperativeRegex.test(trimmed) && trimmed.length > 15) {
            preservedDirectives.push({
              id: `cd-${slot.id}-${idx}`,
              category: 'hard_constraint',
              text: trimmed,
              sourcePlatforms: [slot.name],
              retained: true
            });
          }
        }
      });
      uniqueInsightsByPlatform[slot.platform] = [
        `Provided platform-specific framing and operational directives.`
      ];
    });

    if (preservedDirectives.length === 0) {
      preservedDirectives.push({
        id: 'cd-1',
        category: 'core_intent',
        text: 'Extract and execute the core objective with maximal precision and zero token waste.',
        sourcePlatforms: slots.map(s => s.name),
        retained: true
      });
    }

    if (slots.length >= 2) {
      conflictMatrix.push({
        id: 'c-generic',
        directiveA: { platform: slots[0]?.name || 'Platform 1', text: 'Default verbose response style.' },
        directiveB: { platform: slots[1]?.name || 'Platform 2', text: 'Direct, structured output request.' },
        nature: 'Formatting & Density',
        reconciliation: 'Unified into concise, structured Markdown with high information density.',
        resolutionStrategy: 'schema_harmonization'
      });
    }
  }

  return { coreIntent, preservedDirectives, conflictMatrix, uniqueInsightsByPlatform };
}

export function generateMasterPrompt(
  mode: CompressionMode,
  coreIntent: string,
  directives: DirectiveItem[],
  conflicts: ConflictItem[],
  slots: PromptSlot[]
): string {
  const constraintsList = directives
    .filter(d => d.retained)
    .map((d, i) => `${i + 1}. [${d.category.toUpperCase().replace('_', ' ')}] ${d.text}`)
    .join('\n');

  switch (mode) {
    case 'ultra_distilled': {
      // 60-80% token savings: telegraphic, dense, zero filler
      const telegraphic = directives
        .filter(d => d.retained)
        .map(d => `• ${d.text}`)
        .join('\n');

      return `TASK: ${coreIntent}
MANDATES:
${telegraphic}
OUTPUT: Production-ready code/tables/artifacts only. Zero pleasantries. Zero conversational filler.`;
    }

    case 'structured_xml': {
      // Enterprise XML tags
      return `<system>
You are an authoritative, zero-defect synthesis engine.
Target Objective: ${coreIntent}
</system>

<constraints>
${directives.filter(d => d.category === 'hard_constraint').map(d => `  <rule>${d.text}</rule>`).join('\n')}
</constraints>

<edge_cases>
${directives.filter(d => d.category === 'edge_case').map(d => `  <edge_case>${d.text}</edge_case>`).join('\n')}
</edge_cases>

<reconciliation_rules>
${conflicts.map(c => `  <resolution conflict="${c.nature}">${c.reconciliation}</resolution>`).join('\n')}
</reconciliation_rules>

<output_schema>
Strict adherence to the requested deliverable format. No conversational boilerplate.
Provide verifiable, deterministic, copy-paste ready artifacts.
</output_schema>`;
    }

    case 'target_gemini': {
      return `### System Directive: Gemini Multi-Modal Engine
**Primary Objective**: ${coreIntent}

#### Execution Guidelines & Grounding:
${constraintsList}

#### Conflict Harmonization:
${conflicts.map(c => `- **${c.nature}**: ${c.reconciliation}`).join('\n')}

#### Structured Delivery:
- Structure outputs utilizing high-readability Markdown data tables.
- Include explicit before/after performance diffs and quantitative metrics.
- Maintain high logical grounding without speculative hallucinations.`;
    }

    case 'target_claude': {
      return `<system_instructions>
Act with absolute intellectual rigor, adhering to structural clarity and mathematical/formal correctness.
Objective: ${coreIntent}

<guidelines>
${directives.map(d => `- ${d.text}`).join('\n')}
</guidelines>

<reconciliation>
${conflicts.map(c => `- ${c.nature}: ${c.reconciliation}`).join('\n')}
</reconciliation>

<output_format>
Emit strictly the final technical artifacts. No introductory banter ("Sure, here is..."), no concluding pleasantries. Use code blocks with exact language specifiers.
</output_format>
</system_instructions>`;
    }

    case 'target_chatgpt': {
      return `### Operational Directive
**Objective**: ${coreIntent}

### Essential Requirements:
${constraintsList}

### Resolution Matrix:
${conflicts.map(c => `- **${c.nature}**: ${c.reconciliation}`).join('\n')}

### Output Standard:
- Deliver production-ready code and structured tabular breakdowns.
- Format all code in standard syntax-highlighted blocks.
- Ensure all constraints are verified before final output generation.`;
    }

    case 'target_cursor': {
      return `// .cursorrules Master Specification
// Target: ${coreIntent}
// Strict Mode: Enabled

[CONSTRAINTS]
${directives.map(d => `- ${d.text}`).join('\n')}

[CONFLICT_RESOLUTIONS]
${conflicts.map(c => `- ${c.nature} => ${c.reconciliation}`).join('\n')}

[RULES]
- Return complete drop-in replacements only. No '// ... rest of code' placeholders.
- Maintain zero conversational filler; code and structured schema only.
- Adhere strictly to language idioms and defensive boundary assertions.`;
    }

    case 'target_deepseek': {
      return `<think>
Deconstruct the target objective: ${coreIntent}
Verify boundary assumptions, failure modes, and game-theoretic/mathematical soundness.
Check all edge cases:
${directives.filter(d => d.category === 'edge_case').map(d => `- ${d.text}`).join('\n')}
Harmonize contradictory directives:
${conflicts.map(c => `- ${c.nature}: ${c.reconciliation}`).join('\n')}
</think>

Execute the final synthesis with unyielding deterministic precision based on:
${constraintsList}

Deliver only verified, high-density artifacts.`;
    }

    case 'production_balanced':
    default: {
      return `## Master System Prompt: High-Precision Multi-Platform Synthesis

### 1. Core Objective
${coreIntent}

### 2. Preserved Critical Directives
${constraintsList}

### 3. Reconciled Conflict Directives
${conflicts.map(c => `- **${c.nature}**: ${c.reconciliation}`).join('\n')}

### 4. Output Specification
- **Clean Markdown / Code**: Provide direct, drop-in replacement artifacts.
- **Zero Conversational Overhead**: Omit boilerplate pleasantries, disclaimers, and generic commentary.
- **Verification Guarantee**: Ensure all boundary conditions and security constraints are satisfied.`;
    }
  }
}

// Live Execution Test Drive Simulator
export function executeTestDrive(
  masterPrompt: string,
  testPayload: string,
  mode: CompressionMode
): TestDriveResponse {
  const start = Date.now();
  const lowerPrompt = masterPrompt.toLowerCase();
  const lowerPayload = testPayload.toLowerCase();

  let response = '';

  // 1. Domain evaluation with payload prioritization
  if (lowerPayload.includes('session-sync') || (!lowerPayload.includes('cloudscale') && !lowerPayload.includes('orders') && !lowerPayload.includes('ticket') && !lowerPayload.includes('kuiper') && (lowerPrompt.includes('typescript') || lowerPrompt.includes('owasp')))) {
    response = `### 1. Vulnerability & Risk Matrix
| Severity | Location | CWE ID | Description & Attack Vector | Mitigation Applied |
| :--- | :--- | :--- | :--- | :--- |
| **CRITICAL** | Line 9 | CWE-89 | Raw SQL String Concatenation (\`auth_token = '\` + token) | Replaced with parameterized prepared statements |
| **HIGH** | Line 12 | CWE-1321 | Prototype Pollution via unvalidated \`Object.assign\` | Implemented strict Zod schema parsing & \`Object.freeze\` |
| **HIGH** | Line 15 | CWE-20 | Loose equality coercion \`role == 'admin'\` privilege escalation | Enforced discriminated union with strict constant checks |
| **MEDIUM** | Line 19 | CWE-1333 | Inefficient ReDoS regular expression on email validation | Replaced with standard RFC-compliant Zod email validation |
| **MEDIUM** | Line 23 | CWE-209 | Raw internal error leakage in HTTP response (\`e.message\`) | Sanitized error handling with structured telemetry |

### 2. Refactored Zero-Defect Codebase
\`\`\`typescript
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

export const authRouter: Router = express.Router();

// 1. Strict Input Schema Validation
const SessionSyncSchema = z.object({
  token: z.string().min(32).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  userMeta: z.object({
    displayName: z.string().max(50).optional(),
    avatarUrl: z.string().url().optional(),
  }).strict(),
  permissions: z.object({
    role: z.enum(['user', 'manager', 'admin']),
  }).strict(),
});

type SessionSyncInput = z.infer<typeof SessionSyncSchema>;

interface SafeUserProfile {
  readonly id: string;
  readonly email: string;
  readonly displayName?: string;
  readonly role: 'user' | 'manager' | 'admin';
}

type Result<T, E = Error> = 
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// 2. Hardened Route Handler
authRouter.post('/api/auth/session-sync', async (req: Request, res: Response): Promise<void> => {
  const parseResult = SessionSyncSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'INVALID_PAYLOAD', details: parseResult.error.format() });
    return;
  }

  const { token, userMeta, permissions } = parseResult.data;

  try {
    // Parameterized SQL query prevents CWE-89
    const dbResult = await db.query<SafeUserProfile>(
      'SELECT id, email, display_name, role FROM users WHERE auth_token = $1 LIMIT 1',
      [token]
    );

    const user = dbResult.rows[0];
    if (!user) {
      res.status(401).json({ error: 'UNAUTHORIZED_SESSION' });
      return;
    }

    // Immutable Profile Synthesis - Prototype Pollution immune
    const safeProfile: SafeUserProfile = Object.freeze({
      id: user.id,
      email: user.email,
      displayName: userMeta.displayName ?? user.displayName,
      role: permissions.role === 'admin' ? 'admin' : user.role,
    });

    res.status(200).json({
      status: 'ok',
      user: safeProfile,
      verified: true,
    });
  } catch (err: unknown) {
    // Telemetry logged internally; zero sensitive leakage to client
    logger.error('Session sync failure', { err });
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
});
\`\`\`

### 3. V8 & Invariant Verification Proofs
- **Memory Allocations**: All user profiles wrapped in \`Object.freeze\`, maintaining single monomorphic hidden class in V8.
- **Big-O Complexity**: Input validation reduced from potentially catastrophic ReDoS $O(2^n)$ down to linear $O(n)$ deterministic parsing.
- **Cryptographic Bounds**: Token verified with length bounds (32–128) before reaching query pipeline.`;
  } else if (lowerPayload.includes('cloudscale') || lowerPrompt.includes('financial') || lowerPrompt.includes('earnings')) {
    response = `### Forensic Quantitative Analysis: CloudScale Inc. (Q3 2026)

#### 1. Structured KPI Data Block (JSON)
\`\`\`json
{
  "ticker": "CSCL",
  "quarter": "Q3 2026",
  "revenue_actual_usd_m": 1420,
  "revenue_consensus_usd_m": 1390,
  "revenue_yoy_growth_pct": 18.0,
  "gaap_net_income_usd_m": -42,
  "non_gaap_net_income_usd_m": 184,
  "sbc_usd_m": 210,
  "sbc_yoy_growth_pct": 38.1,
  "fcf_usd_m": 85,
  "fcf_yoy_decline_pct": -39.3,
  "ai_capex_drag_usd_m": 95,
  "rpo_usd_m": 4100,
  "rpo_yoy_growth_pct": 9.0,
  "operating_margin_gaap_pct": -3.0,
  "operating_margin_non_gaap_pct": 13.0
}
\`\`\`

#### 2. Forensic Reconciliation & Warning Signs
- **Stock-Based Compensation (SBC) Distortion**: SBC surged **+38.1% YoY** ($210M), outpacing top-line revenue growth (+18%). Non-GAAP profitability is almost entirely subsidized by dilution rather than core operational efficiency.
- **Free Cash Flow Compression**: FCF dropped **-39.3% YoY** ($140M -> $85M) as $95M was redirected into AI GPU clusters with uncertain ROI timelines.
- **RPO Deceleration**: Total Remaining Performance Obligation slowed dramatically from **+24% in Q2 to +9% in Q3**, signaling an enterprise bookings slowdown confirmed by EMEA sales cycle extension (65 -> 88 days).

#### 3. Probabilistic Scenario Matrix
| Scenario | Probability | Revenue Target (FY27) | Implied Fair Value | Core Thesis Driver |
| :--- | :--- | :--- | :--- | :--- |
| **Bull** | 20% | $6.4B (+22%) | $78.00 | Enterprise AI bookings accelerate; datacenter capex converts to high-margin recurring ARR. |
| **Base** | 55% | $5.9B (+14%) | $56.00 | EMEA friction persists; steady cloud migration with moderating guidance. |
| **Bear** | 25% | $5.3B (+5%) | $38.00 | Further RPO deceleration; ongoing SBC dilution depresses GAAP earnings; AI capex writedown. |`;
  } else if (lowerPayload.includes('orders') || lowerPrompt.includes('sql') || lowerPrompt.includes('dba')) {
    response = `### Relational Query Optimization: PostgreSQL 16+

#### 1. Bottleneck & Anti-Pattern Diagnosis
- **Non-Sargable Predicates**: \`DATE(o.created_at)\` and \`LOWER(o.status)\` prevent the query planner from using standard B-tree indexes, forcing full sequential scans.
- **Correlated Subquery in SELECT**: \`(SELECT c.name FROM customers c WHERE c.id = o.customer_id)\` triggers an $O(N)$ execution lookup per row instead of a single hash join.
- **Leading Wildcard (\`%@gmail.com\`)**: Prevents B-Tree index scan on \`email\`; forces full table scan over \`user_profiles\`.

#### 2. Optimized Production SQL
\`\`\`sql
-- Single pass hash-aggregation with sargable date bounds
SELECT 
  o.id,
  o.customer_id,
  c.name AS customer_name,
  o.order_total,
  o.created_at,
  COUNT(i.id) AS item_count
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items i ON i.order_id = o.id
WHERE 
  o.tenant_id = 42
  AND o.status = 'completed' -- Enforce lowercase storage via check constraint
  AND o.created_at >= '2026-01-01 00:00:00+00' -- Sargable range scan
  AND EXISTS (
    SELECT 1 
    FROM user_profiles u 
    WHERE u.customer_id = o.customer_id 
      AND u.email_domain = 'gmail.com' -- Extracted generated column
  )
GROUP BY o.id, o.customer_id, c.name, o.order_total, o.created_at
ORDER BY o.created_at DESC
LIMIT 50;
\`\`\`

#### 3. Zero-Downtime Migration DDL
\`\`\`sql
-- Create covering composite index CONCURRENTLY to avoid read/write locks
CREATE INDEX CONCURRENTLY idx_orders_tenant_status_created_covering
ON orders (tenant_id, status, created_at DESC)
INCLUDE (customer_id, order_total);

CREATE INDEX CONCURRENTLY idx_order_items_order_id
ON order_items (order_id);
\`\`\`

#### 4. Expected Execution Plan Diff
- **Before**: Sequential scan on \`orders\` ($Cost: 18450.20$), nested loop on \`customers\` ($50 \\times 12.4$).
- **After**: Index Scan using \`idx_orders_tenant_status_created_covering\` ($Cost: 42.15$), Hash Join on \`order_items\` ($Cost: 110.80$). Speedup: **~120x**.`;
  } else if (lowerPayload.includes('ticket') || lowerPrompt.includes('incident') || lowerPrompt.includes('triage')) {
    response = `### ITIL Incident Triage & Resolution Protocol

#### 1. Structured Incident Webhook (JSON)
\`\`\`json
{
  "ticket_id": "88412",
  "severity": "P1_CRITICAL",
  "sla_status": "AT_RISK",
  "affected_service": "payment_gateway",
  "endpoint": "/v2/charge",
  "http_status_codes": [504],
  "root_cause_hypothesis": "Idempotency cache eviction race condition causing duplicate charges on timeout retry",
  "customer_tier": "Enterprise",
  "arr_at_risk_usd": 120000,
  "churn_probability": 0.78,
  "assigned_squad": "#team-payments",
  "action_required": "Emergency rollback / idempotency key hotfix & automated ledger charge reversal"
}
\`\`\`

#### 2. Accountable Enterprise Customer Reply Draft
**Subject**: [URGENT P1 Investigation] Investigation & Charge Reversal Status - Ticket #88412

Dear Marcus,

I am writing directly from our Senior Engineering Incident Team regarding the 504 Gateway Timeouts and duplicate charge reports on your checkout pipeline today.

We understand the critical severity of this issue for FinTech Global and apologize for the operational impact. Here is our direct action status:

1. **Duplicate Charges Reversal**: Our billing operations squad has initiated an automated audit across all transactions processed between 08:30 UTC and 10:15 UTC. Any detected duplicate charges will be reversed at the processor level with zero customer penalty fees by **12:00 UTC**.
2. **Gateway Stability**: We have isolated the intermittent 504 errors on \`/v2/charge\` to an idempotency cache lock contention and deployed a mitigation patch at **10:45 UTC**. Error rates have returned below 0.01%.
3. **Next Technical Update & RCA**: Our Principal Architect will deliver a comprehensive Technical Post-Mortem and SLA credit evaluation to you by **14:00 UTC today**.

We will remain in continuous direct communication until full reconciliation is confirmed.

Sincerely,  
**Engineering Incident Operations Team**`;
  } else if (lowerPayload.includes('kuiper') || lowerPayload.includes('sedna') || lowerPrompt.includes('sci-fi') || lowerPrompt.includes('worldbuilding') || lowerPrompt.includes('codex')) {
    response = `---
codex_id: "SOL-2390-ASTRO"
epoch: "Post-Earth Expansion, Epoch IV"
thermodynamic_tier: "Kardashev Type 1.8"
verification: "Astrophysical & Game-Theoretic Invariants Verified"
---

### 1. Faction Doctrine & Geopolitical Matrix

| Faction | Primary Territory | Energy & Industrial Base | Military / Strategic Doctrine | Governing Philosophy |
| :--- | :--- | :--- | :--- | :--- |
| **Sun-Forge Ascendancy** | Mercury Orbit & Venusian Lagrange Swarms | Relativistic Laser Foundries & Dyson Swarm Collector Rings | Relativistic Kinetic Kill Vehicles (RKKV) & Laser Thermal Deceleration | Thermodynamic Accelerationism & Neural Mind-Upload |
| **Kuiper Commonwealth** | Sedna, Eris & Oort Cloud Halo | Volatile Water-Ice Hydrocarbons & Antimatter Catalyzed Fusion | Deep-Cold Stealth Arrays & Asymmetric Autonomous Drone Clouds | Radical Biological Autonomy & Distributed Sub-Light Enclaves |

### 2. Astrophysical & Relativistic Invariants
- **Command Latency**: Tight-beam laser communications between Mercury Lagrange nodes and Sedna incur an average **13.84 to 14.62 light-hour round-trip propagation lag**. Centralized governance is mathematically impossible; all field units execute on local autonomous doctrine trees.
- **Relativistic Mechanics**: The anomalous non-baryonic derelict traveling at **0.12c** represents kinetic impact energy equivalent to $1.8 \\times 10^{22}$ Joules. Direct interception requires $4.2 \\times 10^{15}$ kg of antimatter reaction mass under constant 3g deceleration.
- **Fermi Paradox Equilibrium**: Cold war stability is maintained through mutual Dark Forest deterrence: neither faction dares emit high-intensity omnidirectional radio beacons lest latent interstellar lurkers pinpoint Sol coordinates.

### 3. Lore Codex Entry: Derelict Echo-7
\`\`\`yaml
object_designation: "ANOMALY-OORT-7"
velocity: "0.1204 c"
matter_composition: "Non-baryonic strangelet matrix"
quantum_anomaly: "Violates Bell inequality at macroscopic scale (r = 4.2 km)"
broadcast_frequency: "1.420 GHz (Neutral Hydrogen line)"
payload_excerpt: "Zero-point boundary solution confirms thermodynamic decay bypass."
status: "Joint containment taskforce mobilized under strict radio-silence protocol."
\`\`\``;
  } else {
    const payloadSnippet = testPayload.trim() 
      ? testPayload.trim().split('\n').slice(0, 3).join(' ') 
      : 'Active directives verified.';

    response = `### Master Prompt Execution Output

#### 1. Core Synthesis & Analysis
The synthesized instructions successfully processed your payload against all active constraints.

\`\`\`json
{
  "status": "SUCCESS",
  "constraints_verified": true,
  "edge_cases_mitigated": true,
  "compliance": "STRICT",
  "payload_sample": "${payloadSnippet.slice(0, 80).replace(/"/g, '\\"')}"
}
\`\`\`

#### 2. Operational Artifact
- **Directive Enforcement**: Preserved all essential intent while eliminating redundant conversational filler.
- **Boundary Verification**: Verified input parameters and satisfied formatting specifications.
- **Deterministic Delivery**: Produced clean, structured output formatted strictly according to the active mode (${mode}).`;
  }

  const executionTimeMs = Math.max(12, Date.now() - start + Math.floor(Math.random() * 80 + 40));
  const outputTokens = estimateTokens(response);

  return {
    response,
    executionTimeMs,
    outputTokens,
    modelSimulated: 'Gemini 1.5 Pro / Claude 3.5 Sonnet Engine (Synthesized)'
  };
}
