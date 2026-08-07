'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InterviewState, InterviewMessage, InterviewFeedback, Candidate } from '@/types';

interface InterviewStore {
  sessionId: string | null;
  candidate: Candidate | null;
  messages: InterviewMessage[];
  askedDays: number[];
  currentDay: number | null;
  currentTopic: string | null;
  currentDifficulty: string;
  questionsAsked: number;
  topicScores: { topic: string; day: number; score: number; difficulty: string }[];
  strengths: string[];
  weaknesses: string[];
  done: boolean;
  feedback: InterviewFeedback | null;
  isThinking: boolean;
  error: string | null;

  startSession: (candidate: Candidate) => void;
  addMessage: (msg: InterviewMessage) => void;
  updateState: (partial: Partial<InterviewState>) => void;
  setThinking: (val: boolean) => void;
  setError: (err: string | null) => void;
  setFeedback: (fb: InterviewFeedback) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  candidate: null,
  messages: [],
  askedDays: [],
  currentDay: null,
  currentTopic: null,
  currentDifficulty: 'fundamental',
  questionsAsked: 0,
  topicScores: [],
  strengths: [],
  weaknesses: [],
  done: false,
  feedback: null,
  isThinking: false,
  error: null,
};

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set) => ({
      ...initialState,

      startSession: (candidate) =>
        set({
          ...initialState,
          sessionId: crypto.randomUUID(),
          candidate,
          isThinking: true,
        }),

      addMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),

      updateState: (partial) => set((s) => ({ ...s, ...partial })),

      setThinking: (val) => set({ isThinking: val }),
      setError: (err) => set({ error: err }),
      setFeedback: (fb) => set({ feedback: fb, done: true }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'interview-os-store',
      partialize: (s) => ({
        sessionId: s.sessionId,
        candidate: s.candidate,
        messages: s.messages,
        askedDays: s.askedDays,
        currentDay: s.currentDay,
        currentTopic: s.currentTopic,
        currentDifficulty: s.currentDifficulty,
        questionsAsked: s.questionsAsked,
        topicScores: s.topicScores,
        strengths: s.strengths,
        weaknesses: s.weaknesses,
        done: s.done,
        feedback: s.feedback,
      }),
    }
  )
);
