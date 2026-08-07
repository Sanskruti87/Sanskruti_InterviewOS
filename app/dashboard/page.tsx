'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search,
  Star,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Play,
  Award,
  Target,
  BookOpen,
} from 'lucide-react';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCandidates, getCurriculum } from '@/services/parser/data-parser';
import { useInterviewStore } from '@/hooks/use-interview-store';
import type { Candidate } from '@/types';

function getReadinessScore(candidate: Candidate): number {
  const { signals, missions } = candidate;
  const totalMissions = missions.length;
  const passed = missions.filter((m) => m.passed).length;
  const skipped = missions.filter((m) => m.skipped).length;
  const firstTryRatio = signals.missionsFirstTry / Math.max(signals.missionsCompleted, 1);
  const commitRatio = signals.commitDays / 31;
  const passRatio = passed / Math.max(totalMissions, 1);
  const skipPenalty = skipped / Math.max(totalMissions, 1);

  const score =
    passRatio * 40 +
    firstTryRatio * 25 +
    commitRatio * 20 +
    (1 - skipPenalty) * 15;

  return Math.round(Math.min(100, Math.max(0, score)));
}

function getWeakAreas(candidate: Candidate): string[] {
  return candidate.missions
    .filter((m) => m.passed && (m.attempts ?? 1) >= 4)
    .map((m) => m.title);
}

function getStrongAreas(candidate: Candidate): string[] {
  return candidate.missions
    .filter((m) => m.passed && (m.attempts ?? 1) === 1)
    .map((m) => m.title);
}

function getSkippedAreas(candidate: Candidate): string[] {
  return candidate.missions
    .filter((m) => m.skipped)
    .map((m) => m.title);
}

export default function DashboardPage() {
  const router = useRouter();
  const candidates = useMemo(() => getCandidates().candidates, []);
  const curriculum = useMemo(() => getCurriculum(), []);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('readiness');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const startSession = useInterviewStore((s) => s.startSession);

  const filtered = useMemo(() => {
    let list = candidates.filter(
      (c) =>
        c.member.name.toLowerCase().includes(search.toLowerCase()) ||
        c.member.jobRole.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'readiness') {
      list = [...list].sort((a, b) => getReadinessScore(b) - getReadinessScore(a));
    } else if (sortBy === 'experience') {
      list = [...list].sort((a, b) => b.member.yearsExperience - a.member.yearsExperience);
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.member.name.localeCompare(b.member.name));
    }

    return list;
  }, [candidates, search, sortBy]);

  const selected = selectedId
    ? candidates.find((c) => c.member.id === selectedId)
    : null;

  const handleStart = (candidate: Candidate) => {
    startSession(candidate);
    router.push('/interview');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Select a candidate profile to start an AI-powered technical interview.
            Each profile includes curriculum history, strengths, and gaps.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{candidates.length}</div>
                <div className="text-sm text-muted-foreground">Candidates</div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{curriculum.days.length}</div>
                <div className="text-sm text-muted-foreground">Curriculum Days</div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Award className="h-5 w-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">{curriculum.modules.length}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Target className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">11</div>
                <div className="text-sm text-muted-foreground">Score Dimensions</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="readiness">Readiness Score</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Candidate Grid */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filtered.map((candidate, i) => {
            const score = getReadinessScore(candidate);
            const weak = getWeakAreas(candidate);
            const strong = getStrongAreas(candidate);
            const skipped = getSkippedAreas(candidate);
            const isSelected = selectedId === candidate.member.id;

            return (
              <motion.div
                key={candidate.member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Card
                  className={`cursor-pointer p-5 transition-all hover:border-primary/40 ${
                    isSelected ? 'border-primary ring-1 ring-primary/20' : ''
                  }`}
                  onClick={() => setSelectedId(candidate.member.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {candidate.member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{candidate.member.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {candidate.member.jobRole}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={score >= 75 ? 'default' : score >= 50 ? 'secondary' : 'destructive'}
                    >
                      {score}%
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="font-semibold text-foreground">
                        {candidate.signals.missionsCompleted}
                      </div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="font-semibold text-foreground">
                        {candidate.signals.missionsFirstTry}
                      </div>
                      <div className="text-muted-foreground">First Try</div>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="font-semibold text-foreground">
                        {candidate.signals.commitDays}/31
                      </div>
                      <div className="text-muted-foreground">Commit Days</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Readiness</span>
                      <span className="font-medium">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 space-y-3 border-t border-border/40 pt-4"
                    >
                      {strong.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                            <Star className="h-3 w-3" />
                            Strong Areas
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {strong.slice(0, 3).map((s) => (
                              <Badge key={s} variant="outline" className="text-xs text-success border-success/30">
                                {s}
                              </Badge>
                            ))}
                            {strong.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{strong.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {weak.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-warning">
                            <AlertCircle className="h-3 w-3" />
                            Weak Areas
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {weak.slice(0, 3).map((w) => (
                              <Badge key={w} variant="outline" className="text-xs text-warning border-warning/30">
                                {w}
                              </Badge>
                            ))}
                            {weak.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{weak.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {skipped.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                            <Clock className="h-3 w-3" />
                            Skipped
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {skipped.slice(0, 3).map((s) => (
                              <Badge key={s} variant="outline" className="text-xs text-destructive border-destructive/30">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          {candidate.member.education} · {candidate.member.yearsExperience} yrs exp
                        </span>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStart(candidate);
                          }}
                          className="gap-1.5"
                        >
                          <Play className="h-3 w-3" />
                          Start Interview
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No candidates found.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
