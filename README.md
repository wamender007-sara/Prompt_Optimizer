# PromptOptimizer — Multi-Platform Prompt Compressor & Accurate Synthesizer

**PromptOptimizer** is an enterprise-grade developer workbench and synthesis engine designed to analyze, compress, and synthesize multiple prompts from different AI platforms (ChatGPT, Claude, Gemini, Cursor/Copilot, DeepSeek, and custom sources) into a single, high-accuracy Master Prompt.

---

## 🚀 Key Features

### 1. Multi-Platform Prompt Compiler & Analysis Engine (`server.ts` & `src/engine/compiler.ts`)
- **Multi-Slot Ingestion:** Accepts 5+ platform-specific prompts (ChatGPT, Claude, Gemini, Cursor, DeepSeek, Custom).
- **Core Intent Extraction:** Automatically extracts the central objective and domain-specific mission across inputs.
- **Fluff & Noise Purger:** Isolates and purges platform-specific boilerplate ("Act as an award-winning 10x engineer..."), polite conversational filler, and generic disclaimers.
- **Directives Isolation:** Categorizes and preserves essential directives (Core Intent, Hard Constraints, Edge Cases, Output Schemas).
- **Discrepancy Harmonization:** Automatically detects contradictory instructions across platforms and reconciles them using mathematical strategies (Strictest Rule, Schema Harmonization, Hybrid Compromise).

### 2. Compression Modes & Target Platform Tuning
- **Production Balanced:** High clarity, clean markdown structure, and maximum constraint adherence.
- **Ultra Distilled:** Minimal token footprint, telegraphic density, zero conversational overhead (60–80% token savings).
- **Structured XML / Markdown:** Explicit `<system>`, `<constraints>`, `<context>`, and `<output_schema>` sections for enterprise pipelines.
- **Target Platform Tuned:**
  - **Gemini:** System instructions, tabular schemas, and grounding diffs.
  - **Claude:** Intellectual rigor, `<system_instructions>`, and formal verification proofs.
  - **ChatGPT:** Operational imperative directives with syntax code blocks.
  - **Cursor:** Strict `.cursorrules` syntax, zero placeholder comments.
  - **DeepSeek:** Step-by-step `<think>` chain-of-thought elicitation, boundary condition audits, and logic monads.

### 3. Synthesis Analytics & Deconstruction Dashboard
- **Token Reduction Metrics:** Live comparison of original tokens/chars vs. compressed master prompt, estimated prefill latency savings (ms), and cost savings ($ per 1M calls).
- **Preserved Directives Checklist:** Essential rules extracted and retained categorized by Core Task, Hard Constraints, Edge Cases, and Output Formats.
- **Fluff & Noise Purged:** Specific list of platform tropes and redundant phrases purged with reason why removed.
- **Conflict Resolution Matrix:** Transparent explanation of how conflicting directives across platforms were reconciled.
- **Platform Contribution Matrix:** Visual multi-segment progress bar and unique analytical insights provided by each platform.

### 4. Live Execution Test Drive
- Test the synthesized master prompt in real-time with sample payloads (vulnerable TypeScript authentication route, corporate Q3 earnings transcript, un-sargable SQL query, angry customer support incident, or sci-fi world seed).
- Instant verification of constraint enforcement, execution time (ms), and output token metrics.

### 5. 5 Real-World Multi-Platform Presets & Local History
- **TypeScript Refactoring & Security Audit** (ChatGPT, Claude, Gemini, Cursor, DeepSeek)
- **Financial Earnings Analysis**
- **SQL DBA Query Optimizer & Index Architect**
- **Support Ticket Triage & Incident Resolution**
- **Sci-Fi Worldbuilding & Lore Synthesis**
- Auto-saving local history drawer with 1-click restore, clipboard copying, and downloads (`.txt`, `.md`, `.json`).

---

## 🛠️ Quickstart

### Development Mode:
```bash
npm run dev
```
Runs both the backend server (`http://localhost:3001`) and Vite frontend (`http://localhost:5173`).

### Production Mode:
```bash
npm run build
npm start
```
Starts the full-stack server on `http://localhost:3001` serving both the API and client application.
