import { PresetScenario } from '../types';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'ts-refactor-security',
    title: 'TypeScript Refactoring & Security Audit',
    description: 'Synthesizes enterprise-grade TypeScript refactoring, OWASP vulnerability detection, AST typing, and runtime safety constraints.',
    tags: ['Security', 'TypeScript', 'Node.js', 'Clean Code'],
    slots: [
      {
        platform: 'chatgpt',
        name: 'ChatGPT 4o',
        prompt: `Act as a world-renowned Staff Software Engineer and Senior Application Security Architect with 20+ years of experience.
I need you to thoroughly examine my TypeScript backend code.
Please make sure to point out any code smells and refactor it to look super clean, modern, and idiomatic.
Follow SOLID principles and clean architecture.
Also check for OWASP Top 10 vulnerabilities like SQL injection, prototype pollution, and SSRF.
Please provide your explanations kindly and step-by-step so a junior developer could understand.
Don't hesitate to explain why TypeScript types are beneficial.
Format the output nicely with markdown code blocks and give me a summary at the end.`
      },
      {
        platform: 'claude',
        name: 'Claude 3.5 Sonnet',
        prompt: `Analyze the provided TypeScript snippet with strict adherence to architectural resilience and type soundness.
<constraints>
- Eliminate all usage of 'any', replacing with strict generics, unknown with type guards, or discriminated unions.
- Enforce immutable data structures (Readonly<T>, ReadonlyArray<T>, Object.freeze).
- Flag any asynchronous unhandled rejections, race conditions, or memory leaks with EventEmitters/closures.
- Audit input validation boundaries; require Zod or Valibot schema validations.
</constraints>
<output_format>
Output only:
1. Vulnerability & Risk Matrix (Table with Severity: Critical/High/Med, Location, CWE ID, Mitigation).
2. Refactored Zero-Defect Codebase.
3. Invariant Verification Proofs.
No conversational preamble or polite pleasantries.`
      },
      {
        platform: 'gemini',
        name: 'Gemini 1.5 Pro',
        prompt: `You are an expert Google engineer specializing in V8 engine optimization and high-throughput Node.js microservices.
Examine this TypeScript implementation.
Key objectives:
1. Benchmark potential and identify hidden CPU spikes, de-optimizations, and GC pressure in V8 (avoid megamorphic inline caches and object allocations in hot loops).
2. Verify cross-service resilience: implement circuit breaker patterns, exponential backoff with jitter, and structured telemetry tags.
3. Produce tabular summaries comparing Before vs. After memory complexity and algorithmic Big-O.
Be objective, comprehensive, and provide actionable patch diffs.`
      },
      {
        platform: 'cursor',
        name: 'Cursor / Copilot',
        prompt: `// .cursorrules context: High-performance TypeScript Node.js backend
// Focus: Strict AST refactor, zero any, production safety
- Always return exact code replacements, no placeholder comments like '// ... rest of code'.
- Implement strict null checks and exhaustive switch matching with 'assertNever'.
- Add comprehensive JSDoc annotations with @param, @returns, and @throws.
- Optimize imports using ES module imports only, organize alphabetically.
- Do not add explanations unless specifically asked; preserve existing public API signature contracts.`
      },
      {
        platform: 'deepseek',
        name: 'DeepSeek R1',
        prompt: `Begin by reasoning step-by-step inside your thinking process.
Scrutinize every line of the TypeScript source code for latent boundary errors:
- Off-by-one errors in buffer indexing.
- Timing attack vulnerabilities in cryptographic string comparisons (force crypto.timingSafeEqual).
- ReDoS (Regular Expression Denial of Service) in custom regex patterns.
- Concurrency deadlocks when acquiring async mutex locks.
Verify each edge case rigorously before synthesizing the optimal refactored implementation.
Ensure runtime failure modes return Result<T, E> monads rather than throwing unchecked exceptions.`
      }
    ],
    samplePayload: {
      title: 'Vulnerable User Authentication & Session Handler',
      description: 'A messy Express/TypeScript route with raw string queries, unsafe type assertions, prototype pollution vectors, and plain errors.',
      input: `import express from 'express';
const router = express.Router();

router.post('/api/auth/session-sync', async (req: any, res: any) => {
  try {
    const { token, userMeta, permissions } = req.body;
    
    // Insecure query concatenation
    const user = await db.query("SELECT * FROM users WHERE auth_token = '" + token + "'");
    
    // Prototype pollution & unsafe assign
    const mergedProfile = Object.assign({}, user[0], userMeta);
    
    // Unsafe type coercion
    if (permissions && permissions.role == 'admin') {
      mergedProfile.isAdmin = true;
    }
    
    // Regex prone to ReDoS on unbounded strings
    const validEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(mergedProfile.email);
    
    res.json({ status: 'ok', user: mergedProfile, verified: validEmail });
  } catch (e) {
    res.status(500).send(e.message);
  }
});`
    }
  },
  {
    id: 'financial-earnings-analysis',
    title: 'Financial Earnings Analysis',
    description: 'Compresses multi-analyst prompts into a high-precision financial deconstruction master prompt focusing on GAAP vs Non-GAAP, free cash flow, and risk factors.',
    tags: ['Finance', 'Earnings Call', 'DCF', 'SEC Filings', 'Risk Analysis'],
    slots: [
      {
        platform: 'chatgpt',
        name: 'ChatGPT 4o',
        prompt: `Act as a Wall Street hedge fund senior equity research director.
I am going to provide you with the quarterly earnings transcript and 10-Q filing notes for a public tech company.
I want you to tell me how the company did this quarter.
Break down their revenue, net income, and what management said about the future guidance.
Explain things in a compelling narrative that an investment committee can easily grasp.
Highlight exciting upside opportunities and mention any red flags in passing.
Please make it professional and engaging!`
      },
      {
        platform: 'claude',
        name: 'Claude 3.5 Sonnet',
        prompt: `Conduct a rigorous forensic financial analysis of the provided corporate earnings data.
<directives>
1. GAAP vs Non-GAAP Reconciliation: Scrutinize SBC (Stock-Based Compensation), one-off restructuring charges, and amortization of intangibles.
2. Free Cash Flow (FCF) Health: Compute Unlevered FCF, evaluate working capital drag, and check Capex vs. Depreciation trajectory.
3. Unit Economics & Margins: Deconstruct gross margin, operating margin expansion/compression, and Rule of 40 score.
4. Capital Allocation: Audit share repurchases, debt covenants, maturity walls, and weighted-average cost of capital (WACC).
</directives>
Format output strictly with quantitative tables (Variance YoY & QoQ bps), zero editorial hyperbole, and an explicit Bear/Base/Bull probability matrix.`
      },
      {
        platform: 'gemini',
        name: 'Gemini 1.5 Pro',
        prompt: `You are a financial quantitative intelligence assistant.
Parse the earnings report against broader macroeconomic indicators and supply-chain logistics.
Analyze:
- Segment-level geographic revenue divergence (North America, APAC, EMEA).
- Forward guidance revision delta relative to Bloomberg consensus estimates.
- Currency FX headwinds / tailwinds impact on constant-currency operating income.
Present the synthesis using structured markdown data tables with exact basis point changes and KPI scorecards.`
      },
      {
        platform: 'cursor',
        name: 'Cursor / Copilot',
        prompt: `// Financial Model Output Specification
// Schema: JSON + Markdown summary table
Extract key financial metrics with strict precision:
- Revenue, Cost of Goods Sold, Gross Profit, Operating Expenses (R&D, S&M, G&A), Operating Income, Net Income, Diluted EPS.
- Segment breakdowns with YoY growth percentages rounded to 2 decimal places.
- Extract any management quotes regarding AI Capex and infrastructure commitments.
- Output raw structured JSON block first, followed by a 4-bullet executive action takeaway.`
      },
      {
        platform: 'deepseek',
        name: 'DeepSeek R1',
        prompt: `Deeply deliberate on management's tone and defensive rhetoric during the Q&A session.
Identify evasion patterns, non-answers, and linguistic shifts compared to prior quarters.
Check for:
- Accounts receivable aging vs revenue growth discrepancies (signaling channel stuffing).
- Deferred revenue depletion mask.
- Customer concentration risk and churn in key enterprise accounts.
Synthesize a cold, adversarial risk assessment report before concluding on target fair value.`
      }
    ],
    samplePayload: {
      title: 'CloudScale Inc. (Q3 2026 Earnings Transcript Excerpt)',
      description: 'Q3 Earnings excerpt with revenue beat, SBC surge, hidden FX headwinds, and aggressive guidance questions.',
      input: `CloudScale Inc. (NASDAQ: CSCL) - Q3 2026 Results Summary:
- Total Revenue: $1,420M (+18% YoY), Consensus was $1,390M.
- GAAP Net Loss: $(42M) vs $(15M) Q3 2025.
- Non-GAAP Net Income: $184M (+12% YoY), reconciling $210M in Stock-Based Compensation (up 38% YoY) and $16M acquisition fees.
- Free Cash Flow: $85M (down from $140M Q3 2025 due to $95M AI GPU cluster datacenter buildout).
- Total Remaining Performance Obligation (RPO): $4.1B (+9% YoY, decelerating from +24% in Q2).
- Operating Margin: GAAP -3.0%, Non-GAAP +13.0%.
CEO remarks in Q&A: "While enterprise deal scrutiny extended sales cycles from 65 days to 88 days in EMEA, our enterprise AI platform bookings doubled. We are taking a prudent view on Q4 guidance at $1,450M-$1,470M."`
    }
  },
  {
    id: 'sql-dba-query-optimizer',
    title: 'SQL DBA Query Optimizer & Index Architect',
    description: 'Synthesizes relational query tuning, EXPLAIN ANALYZE execution plan decomposition, index design (B-tree, BRIN, GIN), and transaction isolation.',
    tags: ['Database', 'PostgreSQL', 'MySQL', 'Performance', 'DBA'],
    slots: [
      {
        platform: 'chatgpt',
        name: 'ChatGPT 4o',
        prompt: `Act as a senior friendly Database Administrator.
I have a very slow SQL query that is taking forever to run on production.
Can you please help me optimize it?
Explain what indexes I should create and why they work.
Give me a high-level explanation that my engineering manager will understand.
Please rewrite the query to make it faster and tell me if CTEs or subqueries are better.
Thank you so much in advance!`
      },
      {
        platform: 'claude',
        name: 'Claude 3.5 Sonnet',
        prompt: `Perform an exhaustive relational query optimization and indexing strategy analysis for PostgreSQL 16+.
<requirements>
1. Execution Plan Deconstruction: Identify sequential scans, high-cost nested loops, disk-spilling HashJoins, and buffer cache misses.
2. Index Architecture: Propose covering indexes (INCLUDE clause), partial indexes (WHERE condition), and appropriate index types (B-Tree, GIN, BRIN).
3. Anti-pattern Elimination: Replace non-sargable predicates (e.g., functions on indexed columns, leading wildcards, implicit type casts).
4. Locking & Concurrency: Ensure proposed DDL uses 'CONCURRENTLY' for zero-downtime index creation; check for deadlock hazards.
</requirements>
Format: 1. Cost & Bottleneck Diagnosis. 2. Optimized SQL. 3. Zero-Downtime Migration DDL. 4. Expected Plan Diff.`
      },
      {
        platform: 'gemini',
        name: 'Gemini 1.5 Pro',
        prompt: `You are an enterprise Database Architect specializing in distributed SQL engines and cloud Aurora / Cloud Spanner engines.
Analyze the target query against write-amplification tradeoffs and memory work_mem constraints.
Assess:
- Partition pruning feasibility.
- Temporary table vs lateral join performance under heavy multi-tenant concurrency.
- Storage footprint impact of additional composite indexes.
Provide a clear comparative table of memory buffers and estimated I/O reads.`
      },
      {
        platform: 'cursor',
        name: 'Cursor / Copilot',
        prompt: `-- SQL Optimization Rules
-- Database: PostgreSQL
- Rewrite query using strict ANSI-SQL standards.
- Prefer window functions or JOINs over correlated subqueries.
- Output clean SQL with capitalized keywords and 2-space indentation.
- Provide rollback DDL scripts alongside migration scripts.
- No conversational filler, provide SQL blocks directly.`
      },
      {
        platform: 'deepseek',
        name: 'DeepSeek R1',
        prompt: `Formulate a rigorous mathematical plan model before emitting SQL.
Examine selectivity, cardinality estimates, and data skew in foreign key distributions:
- Are there NULL-heavy columns triggering full table scans?
- Is there a correlated subquery executing O(N*M) times instead of hash aggregation O(N+M)?
- How does the query behave under VACUUM bloat or stale planner statistics (ANALYZE)?
Produce the single most optimal deterministic query and verify edge cases where dataset size scales 100x.`
      }
    ],
    samplePayload: {
      title: 'Slow Multi-Tenant Order Analytics Query',
      description: 'Slow un-sargable query with leading wildcards, correlated subquery, missing covering index, and non-concurrent DDL.',
      input: `SELECT 
  o.id,
  o.customer_id,
  (SELECT c.name FROM customers c WHERE c.id = o.customer_id) as customer_name,
  o.order_total,
  o.created_at,
  COUNT(i.id) as item_count
FROM orders o
JOIN order_items i ON i.order_id = o.id
WHERE 
  DATE(o.created_at) >= '2026-01-01'
  AND LOWER(o.status) = 'completed'
  AND o.tenant_id = 42
  AND o.customer_id IN (
    SELECT customer_id FROM user_profiles WHERE email LIKE '%@gmail.com'
  )
GROUP BY o.id, o.customer_id, o.order_total, o.created_at
ORDER BY o.created_at DESC
LIMIT 50;`
    }
  },
  {
    id: 'support-ticket-triage',
    title: 'Support Ticket Triage & Incident Resolution',
    description: 'Synthesizes enterprise customer support triage, severity escalation (P1/P2/P3), root cause classification, sentiment detection, and SLA guarantees.',
    tags: ['Customer Support', 'ITIL', 'Incident Management', 'SLA', 'Escalation'],
    slots: [
      {
        platform: 'chatgpt',
        name: 'ChatGPT 4o',
        prompt: `Act as a warm, empathetic Senior Customer Experience Manager.
A customer just sent an angry support ticket.
Please draft a polite and comforting response apologizing for the inconvenience.
Make sure they feel heard and valued.
De-escalate the situation and tell them we are working on it.
Keep the tone upbeat, caring, and understanding.`
      },
      {
        platform: 'claude',
        name: 'Claude 3.5 Sonnet',
        prompt: `Execute an objective ITIL incident classification and structured triage protocol.
<guidelines>
1. Severity Determination: Assign P1 (Critical Outage), P2 (Degraded/High), P3 (Minor), or P4 (Informational) based on SLA impact and blast radius.
2. Root Cause & Technical Categorization: Identify whether issue belongs to Auth, Billing, Data Pipeline, Infrastructure, or Third-Party Provider.
3. Churn Risk & Sentiment Vector: Quantify sentiment polarity (-1.0 to +1.0) and ARR at risk.
4. Actionable Response: Generate a crisp, accountable customer communication that cites specific investigation steps, avoids empty promises, and sets clear next-update timestamps.
</guidelines>
Output strictly as a validated JSON object matching the defined incident triage schema.`
      },
      {
        platform: 'gemini',
        name: 'Gemini 1.5 Pro',
        prompt: `You are an automated Site Reliability Engineering (SRE) incident dispatcher.
Extract system telemetry triggers from the user report:
- Extract error codes, HTTP statuses (500, 502, 504), API endpoints, and timestamps.
- Match against ongoing active status page incidents.
- Map to internal engineering squad ownership (e.g., #team-payments, #team-core-infra).
Present an incident briefing summary with bulleted action items for the on-call engineer.`
      },
      {
        platform: 'cursor',
        name: 'Cursor / Copilot',
        prompt: `// Incident Triage Output Rules
// Target: Internal Slack / PagerDuty webhook payload
Generate structured triage payload:
- ticket_id, priority, affected_service, customer_tier (Enterprise / Pro / Free).
- Reproduction steps extracted from text.
- Suggested customer reply draft adhering to SOC2 compliance and zero disclosure of internal architecture flaws.
Format as Markdown with copy-paste ready blocks.`
      },
      {
        platform: 'deepseek',
        name: 'DeepSeek R1',
        prompt: `Reason thoroughly through legal liability and contract breach (SLA credit penalty) implications:
- Did the user mention data loss, unauthorized access, or regulatory breach (GDPR/HIPAA)?
- Is there implicit threat of litigation or public social media escalation?
- Isolate the factual core of the bug from emotional distress.
Provide an internal legal-risk flag and a balanced, non-admissive resolution pathway.`
      }
    ],
    samplePayload: {
      title: 'Enterprise Customer Furious About Double Billing & API Downtime',
      description: 'Angry tier-1 enterprise ticket threatening churn and chargebacks due to payment double-billing and 504 Gateway errors.',
      input: `Ticket #88412 - Urgent: Critical Payment Gateway Failure & Overcharge!
Account: FinTech Global Enterprise ($120k/yr ARR) - Contact: Marcus Vance (VP Tech)
Message:
"This is completely unacceptable. Since 08:30 UTC today, your /v2/charge API has been throwing intermittent 504 Gateway Timeouts on our checkout.
To make matters worse, our customers were charged TWICE on retry because your idempotency keys appear to be failing silently!
We have received over 200 angry complaints and our CEO is considering initiating credit card chargebacks and terminating our contract immediately for breach of our 99.99% SLA.
We need an immediate technical explanation, a confirmation that double-charges are reversed, and a root cause analysis within 2 hours. Do NOT send me an automated canned response!"`
    }
  },
  {
    id: 'scifi-worldbuilding',
    title: 'Sci-Fi Worldbuilding & Lore Synthesis',
    description: 'Synthesizes complex hard sci-fi worldbuilding, astrophysical plausibility, speculative geopolitics, technology trees, and faction philosophies.',
    tags: ['Creative', 'Worldbuilding', 'Hard Sci-Fi', 'Lore', 'Game Design'],
    slots: [
      {
        platform: 'chatgpt',
        name: 'ChatGPT 4o',
        prompt: `Act as a creative sci-fi author and veteran Dungeon Master.
Help me build an epic, immersive science fiction universe!
Give me cool ideas for futuristic factions, space stations, and mysterious alien technologies.
Make it sound super cinematic, emotional, and thrilling like Mass Effect meets Dune.
Include interesting character archetypes, faction rivalries, and dramatic plot hooks that players will love.
Be descriptive, evocative, and have fun with it!`
      },
      {
        platform: 'claude',
        name: 'Claude 3.5 Sonnet',
        prompt: `Construct a hard science-fiction worldbuilding codex with rigorous astrophysical and sociopolitical consistency.
<constraints>
1. Kardashev Scale & Energy Economics: Ground propulsion (e.g. antimatter-catalyzed fusion, magnetic sail deceleration, laser thermal) in verifiable thermodynamics. No faster-than-light (FTL) unless mathematically grounded in Alcubierre geometries with negative energy constraints.
2. Political Sociology: Detail resource supply chains (rare isotopes, volatile water ice on Jovian moons, dyson swarm orbital habitats), currency backing, and governing philosophies.
3. Transhumanist Ethics: Detail biological senescence, cybernetic neuro-prosthetics, and legal personhood of artificial intelligences.
</constraints>
Organize into an encyclopedia-grade dossier with historical timeline epochs and faction tables.`
      },
      {
        platform: 'gemini',
        name: 'Gemini 1.5 Pro',
        prompt: `You are a planetary science and xenobiology design engine.
Focus on environmental ecology and planetary geology:
- Atmospheric composition, gravity, day/night cycles, orbital mechanics around binary star systems.
- Non-carbon based xenobiological biochemistry (e.g., ammonia solvents, silicon polymers, sulfur-reducing synthetics).
- Environmental hazards, radiation belts, and bio-luminescent flora adaptations.
Synthesize structured ecological dossiers with tabular taxonomies.`
      },
      {
        platform: 'cursor',
        name: 'Cursor / Copilot',
        prompt: `// Sci-Fi Lore Bible Schema
// Output: Clean Markdown with YAML frontmatter
Structure:
- faction_name, ideological_creed, military_doctrine, technological_tier, primary_territory.
- Key historical inflection points (The Collapse, The Treaty of Ganymede).
- Keep descriptions concise, high-density, and modular for RPG game design integration.`
      },
      {
        platform: 'deepseek',
        name: 'DeepSeek R1',
        prompt: `Think deeply about the game-theoretic balance of power in an asymmetric stellar civilization.
Analyze the Fermi Paradox solutions in-universe (Dark Forest theory, Berserker probes, Great Filters).
Scrutinize:
- How does relativistic time dilation affect empire cohesion and command hierarchies over 50 light-year distances?
- What prevents rogue relativistic kinetic kill vehicles (RKKVs) from sterilizing homeworlds?
Construct a logically unyielding geopolitical cold war equilibrium.`
      }
    ],
    samplePayload: {
      title: 'The Kuiper Belt Autocracy & The Sun-Forge Ascendancy',
      description: 'A conflict scenario between orbital dyson-ring sun worshippers and autonomous cryo-miners on Sedna.',
      input: `World Concept Seed:
Year 2390 CE. Humanity is divided between two post-Earth civilization blocs:
1. The Sun-Forge Ascendancy: Controls Mercury's mega-solar swarms and orbital laser foundries. They worship thermodynamic acceleration and cybernetic mind-uploading.
2. The Kuiper Commonwealth: Radical ice-miners and biological gene-tailors living in hollowed-out asteroids beyond Neptune. They reject central AI networks and communicate via tight-beam laser relays with 14-hour lag.
A mysterious interstellar derelict ship made of non-baryonic matter has just entered the Oort cloud traveling at 0.12c, broadcasting a mathematical proof that contradicts human quantum mechanics.`
    }
  }
];
