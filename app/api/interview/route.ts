import { NextRequest, NextResponse } from 'next/server';
import {
  createInitialState,
  startInterview,
  processTurn,
  generateFeedback,
} from '@/services/interview/engine';
import type { InterviewState, InterviewRequest } from '@/types';

export const runtime = 'nodejs';

const sessions = new Map<string, InterviewState>();

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InterviewRequest;

    if (!body.sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    let state = sessions.get(body.sessionId);

    if (!state && body.candidate) {
      state = createInitialState(body.sessionId, body.candidate);
      sessions.set(body.sessionId, state);
      const result = startInterview(state);
      sessions.set(body.sessionId, result.state);
      return NextResponse.json({
        reply: result.reply,
        done: false,
        state: {
          questionsAsked: result.state.questionsAsked,
          currentDay: result.state.currentDay,
          currentTopic: result.state.currentTopic,
          difficulty: result.state.currentDifficulty,
          askedDays: result.state.askedDays,
        },
      });
    }

    if (!state) {
      return NextResponse.json(
        { error: 'Session not found. Include candidate object to start.' },
        { status: 404 }
      );
    }

    if (state.done) {
      return NextResponse.json({
        reply: 'This interview session has already concluded.',
        done: true,
        feedback: state.feedback,
      });
    }

    const result = processTurn(state, body.message ?? '');
    sessions.set(body.sessionId, result.state);

    return NextResponse.json({
      reply: result.reply,
      done: result.done,
      feedback: result.done ? result.state.feedback : undefined,
      state: {
        questionsAsked: result.state.questionsAsked,
        currentDay: result.state.currentDay,
        currentTopic: result.state.currentTopic,
        difficulty: result.state.currentDifficulty,
        askedDays: result.state.askedDays,
      },
    });
  } catch (err) {
    console.error('Interview API error:', err);
    return NextResponse.json(
      { error: 'Internal server error during interview processing.' },
      { status: 500 }
    );
  }
}
