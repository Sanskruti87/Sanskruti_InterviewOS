'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Brain,
  Clock,
  Target,
  Layers,
  Loader2,
  AlertCircle,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { Navbar } from '@/components/common/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useInterviewStore } from '@/hooks/use-interview-store';
import { toast } from 'sonner';
import type { InterviewMessage, Difficulty } from '@/types';

const difficultyColors: Record<Difficulty, string> = {
  fundamental: 'bg-success/10 text-success border-success/30',
  intermediate: 'bg-info/10 text-info border-info/30',
  advanced: 'bg-warning/10 text-warning border-warning/30',
  'deep-dive': 'bg-destructive/10 text-destructive border-destructive/30',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Brain className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-muted/50 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const router = useRouter();
  const {
    sessionId,
    candidate,
    messages,
    askedDays,
    currentDay,
    currentTopic,
    currentDifficulty,
    questionsAsked,
    done,
    isThinking,
    error,
    addMessage,
    updateState,
    setThinking,
    setError,
    setFeedback,
    reset,
  } = useInterviewStore();

  const [input, setInput] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!sessionId || !candidate) {
      router.push('/dashboard');
      return;
    }
    startInterview();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const startInterview = useCallback(async () => {
    if (!sessionId || !candidate) return;

    setThinking(true);
    setError(null);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, candidate }),
      });

      if (!res.ok) throw new Error('Failed to start interview');

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      addMessage({
        role: 'interviewer',
        content: data.reply,
        timestamp: Date.now(),
        topic: data.state?.currentTopic,
        day: data.state?.currentDay,
        difficulty: data.state?.difficulty,
      });

      updateState({
        askedDays: data.state?.askedDays ?? [],
        currentDay: data.state?.currentDay ?? null,
        currentTopic: data.state?.currentTopic ?? null,
        currentDifficulty: data.state?.difficulty ?? 'fundamental',
        questionsAsked: data.state?.questionsAsked ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to start interview');
    } finally {
      setThinking(false);
    }
  }, [sessionId, candidate, addMessage, updateState, setThinking, setError]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !sessionId || isThinking || done) return;

    const userMessage = input.trim();
    setInput('');

    addMessage({
      role: 'candidate',
      content: userMessage,
      timestamp: Date.now(),
    });

    setThinking(true);
    setError(null);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMessage }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      addMessage({
        role: 'interviewer',
        content: data.reply,
        timestamp: Date.now(),
        topic: data.state?.currentTopic,
        day: data.state?.currentDay,
        difficulty: data.state?.difficulty,
      });

      updateState({
        askedDays: data.state?.askedDays ?? askedDays,
        currentDay: data.state?.currentDay ?? null,
        currentTopic: data.state?.currentTopic ?? null,
        currentDifficulty: data.state?.difficulty ?? 'fundamental',
        questionsAsked: data.state?.questionsAsked ?? questionsAsked,
      });

      if (data.done && data.feedback) {
        setFeedback(data.feedback);
        toast.success('Interview complete! Redirecting to feedback...');
        setTimeout(() => router.push('/feedback'), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to send response');
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  }, [
    input,
    sessionId,
    isThinking,
    done,
    addMessage,
    setThinking,
    setError,
    updateState,
    askedDays,
    questionsAsked,
    setFeedback,
    router,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">
              No candidate selected. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.min(100, (questionsAsked / 8) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                Interview: {candidate.member.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {candidate.member.jobRole}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { reset(); router.push('/dashboard'); }}>
            <RotateCcw className="h-4 w-4" />
            End Session
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Chat Area */}
          <div className="flex flex-col">
            <Card className="flex h-[calc(100vh-280px)] min-h-[500px] flex-col">
              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto scrollbar-thin p-4"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MessageBubble msg={msg} candidateName={candidate.member.name} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <TypingIndicator />
                  </motion.div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-border/40 p-4">
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer..."
                    disabled={isThinking || done}
                    className="min-h-[60px] resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isThinking || done}
                    size="icon"
                    className="h-[60px] shrink-0"
                  >
                    {isThinking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Press Cmd/Ctrl + Enter to send
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Timer */}
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Interview Timer
              </div>
              <div className="mt-2 text-2xl font-bold tabular-nums">
                {formatTime(elapsed)}
              </div>
            </Card>

            {/* Progress */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {questionsAsked}/8+ questions
                </span>
              </div>
              <Progress value={progress} className="mt-2 h-2" />
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                {askedDays.length} curriculum areas covered
              </div>
            </Card>

            {/* Current Topic */}
            {currentTopic && (
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  Current Topic
                </div>
                <div className="mt-2 font-semibold">{currentTopic}</div>
                {currentDay && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Curriculum Day {currentDay}
                  </div>
                )}
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={difficultyColors[currentDifficulty as Difficulty] ?? ''}
                  >
                    {currentDifficulty}
                  </Badge>
                </div>
              </Card>
            )}

            {/* Covered Topics */}
            {askedDays.length > 0 && (
              <Card className="p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Areas Covered
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {askedDays.map((day) => (
                    <Badge key={day} variant="secondary" className="text-xs">
                      Day {day}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  candidateName,
}: {
  msg: InterviewMessage;
  candidateName: string;
}) {
  const isInterviewer = msg.role === 'interviewer';

  return (
    <div className={`flex ${isInterviewer ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[80%] gap-2`}>
        {isInterviewer && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
        <div>
          <div
            className={`rounded-2xl px-4 py-3 ${
              isInterviewer
                ? 'bg-muted/50'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
          </div>
          {msg.topic && (
            <div className="mt-1 flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
              <Layers className="h-3 w-3" />
              {msg.topic}
            </div>
          )}
        </div>
        {!isInterviewer && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <span className="text-xs font-bold">
              {candidateName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
