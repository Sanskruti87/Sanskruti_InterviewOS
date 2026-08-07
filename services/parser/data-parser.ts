import curriculumData from '@/data/curriculum.json';
import candidatesData from '@/data/candidates.json';
import type {
  Curriculum,
  CandidatesFile,
  Candidate,
  CurriculumDay,
  CurriculumModule,
} from '@/types';

export function getCurriculum(): Curriculum {
  return curriculumData as unknown as Curriculum;
}

export function getCandidates(): CandidatesFile {
  return candidatesData as unknown as CandidatesFile;
}

export function getCandidateById(id: string): Candidate | null {
  const data = getCandidates();
  return data.candidates.find((c) => c.member.id === id) ?? null;
}

export function getCurriculumDay(day: number): CurriculumDay | null {
  return getCurriculum().days.find((d) => d.day === day) ?? null;
}

export function getModuleForDay(day: number): CurriculumModule | null {
  return getCurriculum().modules.find((m) => m.days.includes(day)) ?? null;
}

export function getAllCandidateIds(): string[] {
  return getCandidates().candidates.map((c) => c.member.id);
}
