# InterviewOS — AI Interview Platform

A production-ready AI Interview Agent that conducts realistic technical interviews based on curriculum data and candidate profiles. Built for the ABTalks Vibe Coding Hackathon.

## Overview

InterviewOS is not a chatbot or a quiz app. It is an adaptive AI interview agent that behaves like a senior AI engineering interviewer. It conducts conversational technical interviews, asks adaptive follow-up questions, tracks strengths and weaknesses across curriculum topics, and generates structured feedback with scores across 11 dimensions.

### Key Features

- **Adaptive AI Interviewer** — Questions adapt in real-time based on answer quality. Strong answers increase difficulty; weak answers trigger conceptual clarification.
- **Curriculum-Aware** — Questions are generated from actual curriculum data covering 31 days and 8 modules (RAG, embeddings, agents, MCP, deployment, and more).
- **Candidate Personalization** — The interviewer uses candidate profile data (passed missions, skipped topics, weak areas) to personalize the interview flow.
- **Intelligent Follow-Ups** — Shallow answers get depth probes; strong answers get harder challenges; weak answers get conceptual clarification.
- **Strength & Weakness Tracking** — The engine builds a profile across every question, tracking which topics the candidate excels at and where they struggle.
- **Structured Feedback** — After each interview, get a detailed report with overall readiness score, 11 topic-specific scores, strengths, gaps, improvement areas, and a recommended learning path.
- **Downloadable Reports** — Export interview feedback as JSON for integration with other systems.

## Architecture

```
app/
  api/interview/     — API route for interview session management
  dashboard/         — Candidate selection dashboard
  feedback/          — Structured feedback report with charts
  interview/         — Interactive interview workspace
  page.tsx           — Landing page
  layout.tsx         — Root layout

components/
  common/            — Navbar, Footer, ThemeProvider
  feedback/          — Chart components (recharts, dynamically imported)
  ui/                — shadcn/ui component library

services/
  interview/         — Interview engine (state machine, question generation, evaluation, feedback)
  parser/            — Data parser for curriculum and candidate JSON

hooks/
  use-interview-store.ts — Zustand store with persistence

types/
  index.ts           — Shared TypeScript types

data/
  curriculum.json    — 31-day AI engineering curriculum
  candidates.json     — 20 candidate profiles with mission history
```

### Interview Engine

The engine (`services/interview/engine.ts`) is a modular state machine that:

1. **Reads curriculum and candidate data** via the parser service layer
2. **Selects topics intelligently** — prioritizes failed, skipped, and weak areas
3. **Generates questions** from curriculum objectives and tools, templated by difficulty level
4. **Evaluates answers** based on word count, keyword usage, and vagueness indicators
5. **Generates adaptive follow-ups** — shallow/weak answers get clarification; strong answers get harder challenges
6. **Tracks state** — asked days, topic scores, strengths, weaknesses, difficulty progression
7. **Generates structured feedback** with 11 scoring dimensions and a recommended learning path

### Difficulty Progression

- `fundamental` → `intermediate` → `advanced` → `deep-dive`
- Strong answers increase difficulty; weak answers decrease it
- Maximum 2 follow-ups per topic before moving to the next curriculum day

### Interview Constraints

- Minimum 8 questions
- At least 4 different curriculum days covered
- Questions generated from curriculum objectives and tools

## Tech Stack

- **Next.js 15** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** with shadcn/ui components
- **Framer Motion** for animations
- **Zustand** for state management (with persistence)
- **Recharts** for data visualization
- **Lucide React** for icons
- **Sonner** for toast notifications

## Installation

```bash
npm install
```

## Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Build

```bash
npm run build
```

## Deployment

The project is deployment-ready for Vercel:

1. Push the repository to GitHub
2. Import the project in Vercel
3. Deploy — no environment variables required for the base functionality

## Data Integration

The curriculum and candidate data are stored as local JSON files in `/data`. The parser service layer (`services/parser/data-parser.ts`) reads these files, so you can swap them with your own curriculum and candidate profiles.

### Curriculum Format

```json
{
  "cohort": "string",
  "modules": [{ "n": number, "title": "string", "days": number[] }],
  "days": [{ "day": number, "title": "string", "type": "string", "tools": string[], "objectives": string[] }]
}
```

### Candidate Format

```json
{
  "candidates": [{
    "member": { "id": "string", "name": "string", "jobRole": "string", "yearsExperience": number, "education": "string", "status": "string" },
    "missions": [{ "day": number, "title": "string", "passed": boolean, "skipped": boolean, "attempts": number }],
    "signals": { "commitDays": number, "missionsCompleted": number, "missionsFirstTry": number }
  }]
}
```

## Future Scope

- **LLM Integration** — Replace the template-based question generation with an actual LLM (OpenAI, Anthropic) via the modular AI service layer
- **Voice Interviews** — Add speech-to-text and text-to-speech for voice-based interviews
- **Multi-turn Deep Dives** — Allow the agent to spend more time on a single topic with progressive depth
- **Candidate History** — Track interview history and improvement over time
- **Custom Curricula** — Allow users to upload their own curriculum data
- **Team Management** — Support multiple interviewers and candidate pools
- **Export Formats** — PDF and CSV export in addition to JSON
