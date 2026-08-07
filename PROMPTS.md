# PROMPTS.md — AI Development Process Log

## Project Planning

**Goal:** Build an adaptive AI interview platform that conducts realistic technical interviews using curriculum and candidate data, with structured feedback generation.

**Key Decisions:**
- Use Next.js App Router for file-based routing and server-side API routes
- Use Zustand with persistence for interview state management across page transitions
- Use local JSON files for curriculum and candidate data (replaceable later)
- Build a modular interview engine as a state machine, not a chatbot
- Generate questions from curriculum objectives and tools, templated by difficulty
- Evaluate answers using heuristics (word count, keyword density, vagueness) as a placeholder for LLM evaluation

## Architecture

**Clean Architecture Layers:**
1. **Data Layer** — JSON files in `/data` with curriculum and candidate profiles
2. **Parser Layer** — `services/parser/data-parser.ts` reads and types the JSON data
3. **Engine Layer** — `services/interview/engine.ts` implements the interview state machine
4. **API Layer** — `app/api/interview/route.ts` exposes the engine as a POST endpoint
5. **State Layer** — `hooks/use-interview-store.ts` manages client-side state with Zustand + persistence
6. **UI Layer** — React components for dashboard, interview workspace, and feedback

**State Flow:**
- Client starts session → API creates state → engine generates welcome + first question
- Client sends answer → API processes turn → engine evaluates, scores, generates next question or follow-up
- When minimum questions and days are met → engine generates feedback → client redirects to feedback page

## UI Generation

**Design Language:**
- Inspired by Vercel, Linear, OpenAI, and Stripe Dashboard
- Dark-mode-first with glassmorphism accents
- Blue primary color, no purple/violet hues
- 8px spacing system, 150% body line height, 120% heading line height
- Framer Motion for page transitions, card hover animations, and typing indicators

**Pages Built:**
1. **Landing Page** — Hero, features grid, how-it-works steps, interview process preview, FAQ accordion, CTA
2. **Dashboard** — Candidate cards with readiness scores, search, sort, expandable details with strengths/weaknesses/skipped areas
3. **Interview Workspace** — Chat interface with typing indicator, sidebar with timer/progress/current topic/difficulty badge/covered topics
4. **Feedback Page** — Overall score ring, radar chart, bar chart, strengths/gaps lists, improvement areas, recommended learning path, detailed scores, download report

## Interview Engine

**Question Generation:**
- Templates per difficulty level (fundamental, intermediate, advanced, deep-dive)
- Each template uses candidate name, role, curriculum day title, tools, and objectives
- Random selection from template pool to avoid repetition

**Answer Evaluation:**
- `weak` — less than 8 words or contains vague language ("stuff", "things", "not sure")
- `shallow` — less than 25 words without technical keywords
- `good` — 25+ words with some technical keywords
- `strong` — 40+ words with technical keywords (because, therefore, architecture, trade-off, etc.)

**Follow-Up Logic:**
- `strong` answers → harder follow-up (deep-dive challenge)
- `shallow` answers → depth probe (ask for specifics)
- `weak` answers → conceptual clarification (step back to basics)
- `good` answers → move to next topic
- Maximum 2 follow-ups per topic before moving on

**Topic Selection:**
- Priority: failed days → skipped days → weak days (4+ attempts) → remaining days
- Avoids repeating already-asked days
- Falls back to random selection from all days if all have been covered

**Scoring:**
- Base scores: weak=30, shallow=50, good=70, strong=90
- Difficulty bonus: fundamental=0, intermediate=+5, advanced=+10, deep-dive=+15
- Topic scores averaged across multiple questions on the same day
- Overall score = average of all topic scores

## Feedback Engine

**11 Scoring Dimensions:**
1. Technical (average of all topic scores)
2. Prompt Engineering (module: LLM Core, Prompting & Fine-Tuning)
3. RAG (module: Embeddings & Vector Search)
4. Vector Databases (module: Embeddings & Vector Search)
5. AI Agents (module: Agentic AI & MCP)
6. MCP (module: Agentic AI & MCP)
7. Deployment (module: Evaluation, Security & Deployment)
8. Communication (90% of overall)
9. Confidence (85% of overall)
10. Reasoning (95% of overall)
11. Readiness (105% of overall if >=75, else 90%)

**Feedback Sections:**
- Summary paragraph with candidate name, areas covered, questions asked, strengths, gaps
- Strengths list (topics where answer quality was good/strong)
- Gaps list (topics where answer quality was weak)
- Improvement areas (derived from gaps, skipped topics, and overall score)
- Recommended learning path (skipped days, weak days, practice recommendations)

## Testing

**Build Verification:**
- Production build (`npm run build`) passes with all 8 pages generating successfully
- Recharts components dynamically imported with `ssr: false` to avoid SSR issues
- Progress component replaced with custom implementation to avoid SWC bundling bug in Next.js 13.5.1

**Manual Testing Path:**
1. Landing page → click "Start an Interview" → dashboard loads with candidate cards
2. Dashboard → search/filter candidates → click a card to expand → click "Start Interview"
3. Interview → AI sends welcome + first question → type answer → AI evaluates and responds
4. Continue answering → after 8+ questions across 4+ days → interview concludes
5. Feedback page → overall score, charts, strengths/gaps, improvement areas, learning path
6. Download report → JSON file downloads with full feedback data

## Refinements

**Issues Resolved:**
- **SSR crash with recharts** — recharts components break during server-side page data collection; fixed by extracting charts into a separate component and dynamically importing it with `ssr: false`
- **SWC bundling bug with @radix-ui/react-progress** — the SWC compiler in Next.js 13.5.1 produces invalid minified output for the Progress component; fixed by replacing with a simple div-based implementation
- **Zustand persistence hydration** — added `mounted` state guard on feedback page to prevent hydration mismatches
- **metadataBase warning** — added `metadataBase` to layout metadata to resolve Open Graph URL resolution warning
