import { WORKPLACE_EVIDENCE_FEATURES } from './access';
import { jobNeedsInfo } from './jobs';
import { matchJob, matchTier } from './match';
import type { AppState } from '../state/store';
import type { CandidateProfile, Employer, Job } from './types';

export interface AttentionItem {
  id: string;
  /** Plain sentence. Always a real count from real state; never a projection. */
  text: string;
  to: string;
  tone: 'urgent' | 'todo' | 'info';
}

/** Applications an employer can see. Prepared ones never reach them. */
const visible = (a: { status: string }) => a.status !== 'prepared';

/**
 * "What needs my attention?" — derived from state every render, so it can
 * never drift from reality or show a number nothing backs.
 */
export function employerAttention(state: AppState, employer: Employer): AttentionItem[] {
  const jobs = state.jobs.filter((j) => j.employerId === employer.id);
  const jobIds = new Set(jobs.map((j) => j.id));
  const apps = state.applications.filter((a) => visible(a) && jobIds.has(a.jobId) && a.status !== 'withdrawn');
  const out: AttentionItem[] = [];

  const toReview = apps.filter((a) => a.status === 'applied');
  if (toReview.length) out.push({ id: 'review', text: `${toReview.length} candidate${toReview.length === 1 ? '' : 's'} to review`, to: '/employer/candidates?status=applied', tone: 'urgent' });

  const requests = apps.filter((a) => a.shared.accommodationRequest && ['applied', 'viewed', 'assessment', 'interview'].includes(a.status));
  if (requests.length) out.push({ id: 'req', text: `${requests.length} interview accommodation request${requests.length === 1 ? '' : 's'} to confirm`, to: '/employer/candidates', tone: 'urgent' });

  const interviews = apps.filter((a) => a.status === 'interview' || a.status === 'assessment');
  if (interviews.length) out.push({ id: 'iv', text: `${interviews.length} interview${interviews.length === 1 ? '' : 's'} or work sample${interviews.length === 1 ? '' : 's'} in progress`, to: '/employer/interviews', tone: 'todo' });

  const needs = jobs.filter((j) => j.status !== 'closed' && jobNeedsInfo(j));
  if (needs.length) out.push({ id: 'needs', text: `${needs.length} job${needs.length === 1 ? '' : 's'} need information before candidates can compare them`, to: '/employer/jobs?tab=needs', tone: 'todo' });

  const openQ = state.questions.filter((q) => jobIds.has(q.jobId) && !q.answer);
  if (openQ.length) out.push({ id: 'q', text: `${openQ.length} candidate question${openQ.length === 1 ? '' : 's'} unanswered`, to: '/employer#questions', tone: 'todo' });

  const unanswered = WORKPLACE_EVIDENCE_FEATURES.filter((f) => !employer.accessibility[f.id]).length;
  if (unanswered) out.push({ id: 'wa', text: `${unanswered} workplace accessibility question${unanswered === 1 ? '' : 's'} unanswered`, to: '/employer/accessibility', tone: 'info' });

  if (employer.ats?.status === 'requested') out.push({ id: 'ats', text: `${employer.ats.provider} integration requested. Imports stay one-off until it is live.`, to: '/employer/connect', tone: 'info' });
  if (!employer.companyVerified) out.push({ id: 'ver', text: 'Company not verified yet. A work email at your domain verifies it.', to: '/employer/settings', tone: 'info' });

  return out;
}

export interface JobMatchCounts {
  potential: number;
  strong: number;
}

/**
 * Candidates who turned discovery on, scored against one job. Counts are of
 * real profiles only. Nothing here reads a private or matching-only answer
 * out to the employer; it only ranks.
 */
export function discoverableFor(state: AppState, job: Job, employer: Employer): { candidate: CandidateProfile; tier: ReturnType<typeof matchTier> }[] {
  const applied = new Set(state.applications.filter((a) => a.jobId === job.id).map((a) => a.candidateId));
  return state.candidates
    .filter((c) => c.discoverable && !applied.has(c.id))
    .map((c) => ({ candidate: c, tier: matchTier(matchJob(c, job, employer)) }))
    .filter((x) => x.tier !== 'new')
    .sort((a, b) => ['strong', 'good', 'review'].indexOf(a.tier) - ['strong', 'good', 'review'].indexOf(b.tier));
}

export function jobMatchCounts(state: AppState, job: Job, employer: Employer): JobMatchCounts {
  const rows = discoverableFor(state, job, employer);
  return { potential: rows.length, strong: rows.filter((r) => r.tier === 'strong').length };
}

/** What an employer may see about a candidate before an application exists. */
export function publicCandidateFacts(c: CandidateProfile): { headline: string; location: string; skills: string[]; strengths: string[]; years: number } {
  const years = c.experience.reduce((n, e) => n + Math.max(0, (e.endYear ?? new Date().getFullYear()) - e.startYear), 0);
  return { headline: c.headline, location: c.location, skills: c.skills, strengths: c.strengths, years };
}
