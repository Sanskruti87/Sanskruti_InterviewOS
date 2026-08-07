export type DayType = 'SETUP' | 'BUILD' | 'AI_CORE' | 'LEARN' | 'SHIP_IT' | 'OPTIMIZE' | 'CAPSTONE';

export interface CurriculumModule {
  n: number;
  title: string;
  days: number[];
}

export interface CurriculumDay {
  day: number;
  title: string;
  type: DayType;
  tools: string[];
  objectives: string[];
}

export interface Curriculum {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface CandidateMission {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface Candidate {
  member: CandidateMember;
  missions: CandidateMission[];
  signals: CandidateSignals;
}

export interface CandidatesFile {
  candidates: Candidate[];
}

export type Difficulty = 'fundamental' | 'intermediate' | 'advanced' | 'deep-dive';

export type MessageRole = 'interviewer' | 'candidate';

export interface InterviewMessage {
  role: MessageRole;
  content: string;
  timestamp: number;
  topic?: string;
  day?: number;
  difficulty?: Difficulty;
}

export interface TopicScore {
  topic: string;
  day: number;
  score: number;
  difficulty: Difficulty;
}

export interface InterviewState {
  sessionId: string;
  candidate: Candidate;
  messages: InterviewMessage[];
  askedDays: number[];
  currentDay: number | null;
  currentTopic: string | null;
  currentDifficulty: Difficulty;
  questionsAsked: number;
  topicScores: TopicScore[];
  strengths: string[];
  weaknesses: string[];
  skippedConcepts: string[];
  followUpCount: number;
  done: boolean;
  feedback: InterviewFeedback | null;
}

export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  overallScore: number;
  topicScores: {
    technical: number;
    promptEngineering: number;
    rag: number;
    vectorDatabases: number;
    aiAgents: number;
    mcp: number;
    deployment: number;
    communication: number;
    confidence: number;
    reasoning: number;
    readiness: number;
  };
  improvementAreas: string[];
  recommendedPath: string[];
}

export interface InterviewRequest {
  sessionId: string;
  candidate?: Candidate;
  message?: string;
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: InterviewFeedback;
  state?: {
    questionsAsked: number;
    currentDay: number | null;
    currentTopic: string | null;
    difficulty: Difficulty;
    askedDays: number[];
  };
}
