import type {
  Candidate,
  CurriculumDay,
  Difficulty,
  InterviewState,
  TopicScore,
} from '@/types';
import { getCurriculumDay, getModuleForDay, getCurriculum } from '@/services/parser/data-parser';

const MIN_QUESTIONS = 8;
const MIN_DAYS = 4;
const MAX_FOLLOWUPS = 2;

export function createInitialState(sessionId: string, candidate: Candidate): InterviewState {
  return {
    sessionId,
    candidate,
    messages: [],
    askedDays: [],
    currentDay: null,
    currentTopic: null,
    currentDifficulty: 'fundamental',
    questionsAsked: 0,
    topicScores: [],
    strengths: [],
    weaknesses: [],
    skippedConcepts: [],
    followUpCount: 0,
    done: false,
    feedback: null,
  };
}

export function getPassedDays(candidate: Candidate): number[] {
  return candidate.missions.filter((m) => m.passed).map((m) => m.day);
}

export function getSkippedDays(candidate: Candidate): number[] {
  return candidate.missions.filter((m) => m.skipped).map((m) => m.day);
}

export function getFailedDays(candidate: Candidate): number[] {
  return candidate.missions.filter((m) => m.passed === false).map((m) => m.day);
}

export function getWeakDays(candidate: Candidate): number[] {
  return candidate.missions
    .filter((m) => m.passed && (m.attempts ?? 1) >= 4)
    .map((m) => m.day);
}

export function getStrongDays(candidate: Candidate): number[] {
  return candidate.missions
    .filter((m) => m.passed && (m.attempts ?? 1) === 1)
    .map((m) => m.day);
}

function pickNextDay(state: InterviewState): number {
  const candidate = state.candidate;
  const weakDays = getWeakDays(candidate);
  const skippedDays = getSkippedDays(candidate);
  const failedDays = getFailedDays(candidate);
  const allDays = getCurriculum().days.map((d) => d.day);

  const priorityPool = [...failedDays, ...skippedDays, ...weakDays].filter(
    (d) => !state.askedDays.includes(d)
  );

  if (priorityPool.length > 0) {
    return priorityPool[Math.floor(Math.random() * priorityPool.length)];
  }

  const remaining = allDays.filter((d) => !state.askedDays.includes(d));
  if (remaining.length > 0) {
    return remaining[Math.floor(Math.random() * remaining.length)];
  }

  return allDays[Math.floor(Math.random() * allDays.length)];
}

export function selectNextTopic(state: InterviewState): CurriculumDay | null {
  const nextDay = pickNextDay(state);
  return getCurriculumDay(nextDay);
}

function generateQuestionForDay(day: CurriculumDay, difficulty: Difficulty, candidate: Candidate): string {
  const objective = day.objectives[Math.floor(Math.random() * day.objectives.length)];
  const tool = day.tools[Math.floor(Math.random() * day.tools.length)];
  const name = candidate.member.name.split(' ')[0];
  const role = candidate.member.jobRole;

  const templates: Record<Difficulty, string[]> = {
    fundamental: [
      `Let's start with something foundational. ${name}, in your ${role} role, how would you explain what ${day.title} is about and why it matters in an AI pipeline?`,
      `I'd like to understand your grasp of the basics here. Can you walk me through what ${day.title} means to you and what you took away from it?`,
      `To kick things off on this topic — ${day.title}. What's the core concept here, in your own words?`,
    ],
    intermediate: [
      `Good. Now let's go a bit deeper on ${day.title}. ${name}, how would you actually use ${tool} in a real project? What does the workflow look like?`,
      `Let's build on that. When working with ${day.title}, what are the key design decisions you'd need to make? Specifically around ${tool}.`,
      `Okay, ${name}. You mentioned ${day.title}. Walk me through how you'd implement this in practice. What would your approach be with ${tool}?`,
    ],
    advanced: [
      `Let's push further. ${name}, imagine you're architecting a system that uses ${day.title} at scale. What are the main challenges you'd anticipate, and how would you address them?`,
      `Here's a harder one. If you had to optimize ${day.title} for both cost and latency, what trade-offs would you consider? How does ${tool} factor in?`,
      `Let's get into the weeds. ${name}, what are the failure modes you've seen (or would expect) when working with ${day.title}? How do you mitigate them?`,
    ],
    'deep-dive': [
      `Excellent. Let's really dig in now. ${name}, compare two approaches to ${day.title} — what would influence your choice? Be specific about architecture and tooling.`,
      `You're clearly comfortable here. So tell me — what's a non-obvious insight about ${day.title} that most engineers get wrong? How does ${tool} play into it?`,
      `Let's stress-test your understanding. ${name}, if a junior engineer asked you to explain the hardest part of ${day.title}, what would you tell them and why?`,
    ],
  };

  const pool = templates[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateFollowUp(
  state: InterviewState,
  quality: 'shallow' | 'strong' | 'weak' | 'good'
): string {
  const day = state.currentDay ? getCurriculumDay(state.currentDay) : null;
  if (!day) return "Let's move to the next topic.";

  const name = state.candidate.member.name.split(' ')[0];
  const tool = day.tools[Math.floor(Math.random() * day.tools.length)];

  const followUps: Record<typeof quality, string[]> = {
    shallow: [
      `That's a start, ${name}, but I want more depth. Can you elaborate on the specifics of how ${tool} works in this context? What's happening under the hood?`,
      `I hear you, but let's go deeper. Walk me through the actual implementation details. What would the code or architecture look like?`,
      `Okay, but I need more technical substance here. What are the concrete steps or components involved in ${day.title}?`,
    ],
    weak: [
      `I think there might be a gap here. Let me ask it differently — what is the core purpose of ${day.title}? What problem does it solve?`,
      `No worries, let's clarify. ${name}, in simple terms, what is ${tool} and why would someone use it?`,
      `Let's take a step back. Can you explain the basic concept behind ${day.title}? What's the fundamental idea?`,
    ],
    good: [
      `Good answer. Let's build on that — how would this work in a production environment with real constraints?`,
      `Nice. Now, what would you do differently if the data volume was 10x larger? How does ${tool} handle that?`,
      `Solid. What are the edge cases or limitations you'd watch out for with ${day.title}?`,
    ],
    strong: [
      `Excellent. You clearly know this well. Let's make it harder — what are the advanced trade-offs and architectural decisions here?`,
      `Great answer, ${name}. How would you architect this for a team of 20 engineers? What changes at that scale?`,
      `Impressive. Let's go deeper — what's a non-obvious challenge or insight about ${day.title} that most people miss?`,
    ],
  };

  const pool = followUps[quality];
  return pool[Math.floor(Math.random() * pool.length)];
}

function evaluateAnswer(answer: string, difficulty: Difficulty): 'shallow' | 'strong' | 'weak' | 'good' {
  const trimmed = answer.trim();
  const words = trimmed.split(/\s+/).length;
  const hasKeywords = /because|therefore|however|specifically|approach|architecture|implement|design|optimize|trade-?off|challenge|scale|production/i.test(trimmed);
  const hasVague = /stuff|things|something|whatever|kind of|sort of|i think maybe|not sure|don't know/i.test(trimmed);

  if (words < 8 || hasVague) return 'weak';
  if (words < 25 && !hasKeywords) return 'shallow';
  if (words >= 40 && hasKeywords) return 'strong';
  return 'good';
}

function updateDifficulty(current: Difficulty, quality: 'shallow' | 'strong' | 'weak' | 'good'): Difficulty {
  const levels: Difficulty[] = ['fundamental', 'intermediate', 'advanced', 'deep-dive'];
  const idx = levels.indexOf(current);

  if (quality === 'strong' && idx < 3) return levels[idx + 1];
  if (quality === 'weak' && idx > 0) return levels[idx - 1];
  return current;
}

function scoreTopic(day: number, quality: 'shallow' | 'strong' | 'weak' | 'good', difficulty: Difficulty): number {
  const base: Record<typeof quality, number> = { weak: 30, shallow: 50, good: 70, strong: 90 };
  const diffBonus: Record<Difficulty, number> = { fundamental: 0, intermediate: 5, advanced: 10, 'deep-dive': 15 };
  return Math.min(100, base[quality] + diffBonus[difficulty]);
}

export function processTurn(
  state: InterviewState,
  candidateMessage: string
): { reply: string; done: boolean; state: InterviewState } {
  const newState = { ...state };
  newState.messages = [...state.messages];
  newState.topicScores = [...state.topicScores];

  if (candidateMessage) {
    newState.messages.push({
      role: 'candidate',
      content: candidateMessage,
      timestamp: Date.now(),
    });

    const quality = evaluateAnswer(candidateMessage, state.currentDifficulty);
    const score = scoreTopic(state.currentDay ?? 0, quality, state.currentDifficulty);
    const day = state.currentDay ?? 0;
    const existing = newState.topicScores.find((t) => t.day === day);
    if (existing) {
      existing.score = Math.round((existing.score + score) / 2);
    } else {
      newState.topicScores.push({
        topic: state.currentTopic ?? 'Unknown',
        day,
        score,
        difficulty: state.currentDifficulty,
      });
    }

    if (quality === 'strong' || quality === 'good') {
      if (!newState.strengths.includes(state.currentTopic ?? '')) {
        newState.strengths.push(state.currentTopic ?? '');
      }
    } else if (quality === 'weak') {
      if (!newState.weaknesses.includes(state.currentTopic ?? '')) {
        newState.weaknesses.push(state.currentTopic ?? '');
      }
    }

    newState.currentDifficulty = updateDifficulty(state.currentDifficulty, quality);

    const shouldFollowUp =
      state.followUpCount < MAX_FOLLOWUPS &&
      (quality === 'shallow' || quality === 'weak' || quality === 'strong');

    if (shouldFollowUp && quality === 'strong' && state.followUpCount < 1) {
      newState.followUpCount = state.followUpCount + 1;
      const reply = generateFollowUp(newState, 'strong');
      newState.messages.push({ role: 'interviewer', content: reply, timestamp: Date.now() });
      newState.questionsAsked = state.questionsAsked + 1;
      return { reply, done: false, state: newState };
    }

    if (shouldFollowUp && (quality === 'shallow' || quality === 'weak')) {
      newState.followUpCount = state.followUpCount + 1;
      const reply = generateFollowUp(newState, quality);
      newState.messages.push({ role: 'interviewer', content: reply, timestamp: Date.now() });
      newState.questionsAsked = state.questionsAsked + 1;
      return { reply, done: false, state: newState };
    }
  }

  newState.followUpCount = 0;

  if (state.questionsAsked >= MIN_QUESTIONS && newState.askedDays.length >= MIN_DAYS) {
    newState.done = true;
    const reply = `Thank you, ${state.candidate.member.name.split(' ')[0]}. That concludes our interview. I've reviewed your responses across ${newState.askedDays.length} curriculum areas and ${state.questionsAsked} questions. Let me compile your feedback.`;
    newState.messages.push({ role: 'interviewer', content: reply, timestamp: Date.now() });
    newState.feedback = generateFeedback(newState);
    return { reply, done: true, state: newState };
  }

  const nextDay = selectNextTopic(newState);
  if (!nextDay) {
    newState.done = true;
    newState.feedback = generateFeedback(newState);
    return { reply: 'Interview completed.', done: true, state: newState };
  }

  newState.currentDay = nextDay.day;
  newState.currentTopic = nextDay.title;
  newState.currentDifficulty = 'fundamental';

  if (!newState.askedDays.includes(nextDay.day)) {
    newState.askedDays = [...newState.askedDays, nextDay.day];
  }

  const reply = generateQuestionForDay(nextDay, 'fundamental', newState.candidate);
  newState.messages.push({
    role: 'interviewer',
    content: reply,
    timestamp: Date.now(),
    topic: nextDay.title,
    day: nextDay.day,
    difficulty: 'fundamental',
  });
  newState.questionsAsked = state.questionsAsked + 1;

  return { reply, done: false, state: newState };
}

export function startInterview(state: InterviewState): { reply: string; state: InterviewState } {
  const newState = { ...state };
  const name = newState.candidate.member.name.split(' ')[0];
  const role = newState.candidate.member.jobRole;
  const exp = newState.candidate.member.yearsExperience;

  const welcome = `Welcome, ${name}. I'm your AI interview agent today. I'll be conducting a technical interview based on your AI engineering curriculum.\n\nI see you're a ${role} with ${exp} years of experience. I'll ask you questions across several curriculum areas, and I want you to answer as thoroughly as you can. If something's unclear, just say so — this is a conversation, not an exam.\n\nLet's begin with our first topic.`;

  newState.messages.push({
    role: 'interviewer',
    content: welcome,
    timestamp: Date.now(),
  });

  const firstDay = selectNextTopic(newState);
  if (firstDay) {
    newState.currentDay = firstDay.day;
    newState.currentTopic = firstDay.title;
    newState.currentDifficulty = 'fundamental';
    newState.askedDays = [firstDay.day];

    const firstQuestion = generateQuestionForDay(firstDay, 'fundamental', newState.candidate);
    newState.messages.push({
      role: 'interviewer',
      content: firstQuestion,
      timestamp: Date.now() + 1,
      topic: firstDay.title,
      day: firstDay.day,
      difficulty: 'fundamental',
    });
    newState.questionsAsked = 1;

    const fullReply = `${welcome}\n\n${firstQuestion}`;
    return { reply: fullReply, state: newState };
  }

  return { reply: welcome, state: newState };
}

export function generateFeedback(state: InterviewState): import('@/types').InterviewFeedback {
  const scores = state.topicScores;
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : 50;

  const topicMap = new Map<string, number[]>();
  scores.forEach((s) => {
    const key = getModuleForDay(s.day)?.title ?? 'General';
    if (!topicMap.has(key)) topicMap.set(key, []);
    topicMap.get(key)!.push(s.score);
  });

  function avgFor(moduleTitle: string): number {
    const arr = topicMap.get(moduleTitle);
    if (!arr || arr.length === 0) return 50;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }

  const strengths = state.strengths.filter(Boolean);
  const gaps = state.weaknesses.filter(Boolean);

  const skipped = state.candidate.missions
    .filter((m) => m.skipped)
    .map((m) => m.title);

  const improvementAreas: string[] = [];
  if (gaps.length > 0) improvementAreas.push(`Deepen understanding of: ${gaps.join(', ')}`);
  if (skipped.length > 0) improvementAreas.push(`Review skipped topics: ${skipped.join(', ')}`);
  if (avgScore < 60) improvementAreas.push('Focus on fundamental concepts before advancing');
  if (improvementAreas.length === 0) improvementAreas.push('Continue practicing advanced scenarios');

  const recommendedPath: string[] = [];
  const weakDays = getWeakDays(state.candidate);
  const skippedDays = getSkippedDays(state.candidate);

  if (skippedDays.length > 0) {
    recommendedPath.push(`Complete skipped curriculum days: ${skippedDays.join(', ')}`);
  }
  if (weakDays.length > 0) {
    recommendedPath.push(`Revisit and strengthen weak areas: days ${weakDays.join(', ')}`);
  }
  recommendedPath.push('Practice explaining complex topics in simple terms');
  recommendedPath.push('Build a portfolio project demonstrating RAG + agents + MCP');

  return {
    summary: `${state.candidate.member.name} demonstrated ${avgScore >= 75 ? 'strong' : avgScore >= 60 ? 'solid' : 'developing'} understanding across ${state.askedDays.length} curriculum areas. The interview covered ${state.questionsAsked} questions with ${scores.length} scored responses. ${strengths.length > 0 ? `Key strengths were shown in: ${strengths.join(', ')}.` : ''} ${gaps.length > 0 ? `Areas needing attention: ${gaps.join(', ')}.` : ''}`,
    strengths: strengths.length > 0 ? strengths : ['Consistent participation across curriculum'],
    gaps: gaps.length > 0 ? gaps : ['No significant gaps identified in this interview'],
    next: recommendedPath,
    overallScore: avgScore,
    topicScores: {
      technical: avgScore,
      promptEngineering: avgFor('LLM Core, Prompting & Fine-Tuning'),
      rag: avgFor('Embeddings & Vector Search'),
      vectorDatabases: avgFor('Embeddings & Vector Search'),
      aiAgents: avgFor('Agentic AI & MCP'),
      mcp: avgFor('Agentic AI & MCP'),
      deployment: avgFor('Evaluation, Security & Deployment'),
      communication: Math.round(avgScore * 0.9),
      confidence: Math.round(avgScore * 0.85),
      reasoning: Math.round(avgScore * 0.95),
      readiness: avgScore >= 75 ? Math.round(avgScore * 1.05) : Math.round(avgScore * 0.9),
    },
    improvementAreas,
    recommendedPath,
  };
}
