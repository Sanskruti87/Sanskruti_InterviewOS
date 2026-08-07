'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  Brain,
  Star,
  AlertCircle,
  TrendingUp,
  Award,
  Download,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Target,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInterviewStore } from '@/hooks/use-interview-store';

const ChartContainer = dynamic(() => import('@/components/feedback/charts'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
      Loading charts...
    </div>
  ),
});

export default function FeedbackPage() {
  const router = useRouter();
  const { feedback, candidate, reset } = useInterviewStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!feedback) {
      router.push('/dashboard');
    }
  }, [feedback, router]);

  const radarData = useMemo(() => {
    if (!feedback) return [];
    return [
      { subject: 'Technical', value: feedback.topicScores.technical, fullMark: 100 },
      { subject: 'Prompt Eng', value: feedback.topicScores.promptEngineering, fullMark: 100 },
      { subject: 'RAG', value: feedback.topicScores.rag, fullMark: 100 },
      { subject: 'Vector DBs', value: feedback.topicScores.vectorDatabases, fullMark: 100 },
      { subject: 'AI Agents', value: feedback.topicScores.aiAgents, fullMark: 100 },
      { subject: 'MCP', value: feedback.topicScores.mcp, fullMark: 100 },
      { subject: 'Deployment', value: feedback.topicScores.deployment, fullMark: 100 },
      { subject: 'Communication', value: feedback.topicScores.communication, fullMark: 100 },
      { subject: 'Confidence', value: feedback.topicScores.confidence, fullMark: 100 },
      { subject: 'Reasoning', value: feedback.topicScores.reasoning, fullMark: 100 },
      { subject: 'Readiness', value: feedback.topicScores.readiness, fullMark: 100 },
    ];
  }, [feedback]);

  const barData = useMemo(() => {
    if (!feedback) return [];
    return [
      { name: 'Technical', score: feedback.topicScores.technical },
      { name: 'Prompt Eng', score: feedback.topicScores.promptEngineering },
      { name: 'RAG', score: feedback.topicScores.rag },
      { name: 'Vector DBs', score: feedback.topicScores.vectorDatabases },
      { name: 'AI Agents', score: feedback.topicScores.aiAgents },
      { name: 'MCP', score: feedback.topicScores.mcp },
      { name: 'Deployment', score: feedback.topicScores.deployment },
      { name: 'Communication', score: feedback.topicScores.communication },
      { name: 'Confidence', score: feedback.topicScores.confidence },
      { name: 'Reasoning', score: feedback.topicScores.reasoning },
      { name: 'Readiness', score: feedback.topicScores.readiness },
    ];
  }, [feedback]);

  if (!mounted || !feedback || !candidate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No feedback available.</p>
            <Button className="mt-4" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const score = feedback.overallScore;
  const scoreColor =
    score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';
  const scoreBg =
    score >= 75 ? 'bg-success/10' : score >= 50 ? 'bg-warning/10' : 'bg-destructive/10';
  const scoreLabel =
    score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 50 ? 'Developing' : 'Needs Work';

  const handleDownload = () => {
    const report = {
      candidate: candidate.member,
      interviewDate: new Date().toISOString(),
      overallScore: feedback.overallScore,
      summary: feedback.summary,
      strengths: feedback.strengths,
      gaps: feedback.gaps,
      improvementAreas: feedback.improvementAreas,
      recommendedPath: feedback.recommendedPath,
      topicScores: feedback.topicScores,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-feedback-${candidate.member.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewInterview = () => {
    reset();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Interview Feedback</h1>
              <p className="text-sm text-muted-foreground">
                {candidate.member.name} · {candidate.member.jobRole}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download Report
            </Button>
            <Button size="sm" onClick={handleNewInterview}>
              <RotateCcw className="h-4 w-4" />
              New Interview
            </Button>
          </div>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`mb-6 p-8 ${scoreBg}`}>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-6">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(score / 100) * 276.46} 276.46`}
                      className={scoreColor}
                    />
                  </svg>
                  <div className={`text-3xl font-bold ${scoreColor}`}>{score}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">Overall Readiness</h2>
                    <Badge variant="secondary">{scoreLabel}</Badge>
                  </div>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    {feedback.summary}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-medium">Interview Complete</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Target className="h-4 w-4 text-primary" />
                Topic Scores
              </h3>
              <div className="h-[320px]">
                <ChartContainer type="radar" data={radarData} />
              </div>
            </Card>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <TrendingUp className="h-4 w-4 text-primary" />
                Score Breakdown
              </h3>
              <div className="h-[320px]">
                <ChartContainer type="bar" data={barData} />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Strengths & Gaps */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-success">
                <Star className="h-4 w-4" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-destructive">
                <AlertCircle className="h-4 w-4" />
                Gaps & Weaknesses
              </h3>
              <ul className="space-y-2">
                {feedback.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    {g}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Improvement Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              Improvement Areas
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {feedback.improvementAreas.map((area, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {area}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recommended Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <BookOpen className="h-4 w-4 text-primary" />
              Recommended Learning Path
            </h3>
            <div className="space-y-3">
              {feedback.recommendedPath.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Detailed Scores Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Brain className="h-4 w-4 text-primary" />
              Detailed Scores
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(feedback.topicScores).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                  <Progress
                    value={value}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
