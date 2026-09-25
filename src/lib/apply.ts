import { matchJob, matchTier } from './match';
import type { Application, CandidateProfile, Employer, Job } from './types';

/** A job with no employer questions can be sent in one tap by a signed-in candidate. */
export function canQuickApply(job: Job, profile: CandidateProfile | null): profile is CandidateProfile {
  return !!profile && job.status === 'published' && job.screeningQuestions.length === 0;
}

/** One place that builds what the employer receives. Apply page and quick apply share it. */
export function buildApplication(job: Job, profile: CandidateProfile | null, answers: Record<string, string>, interviewNeed: string): Application {
  const today = new Date().toISOString().slice(0, 10);
  const sharedNeeds = profile ? Object.entries(profile.accessNeeds).filter(([, n]) => n.visibility === 'shared').map(([k]) => k) : [];
  return {
    id: `app-${Date.now().toString(36)}`,
    jobId: job.id,
    candidateId: profile?.id ?? 'pending',
    submittedOn: today,
    status: 'applied',
    history: [{ status: 'applied', on: today, note: 'Application submitted.' }],
    answers,
    shared: {
      profile: true,
      resume: !!profile?.resumeFileName,
      workExamples: false,
      sharedPreferences: [],
      sharedAccessNeeds: sharedNeeds,
      hiringPreferences: profile?.privacy.hiringPreferences === 'shared' ? profile.hiringPreferences : [],
      accommodationRequest: interviewNeed.trim() ? { options: [], custom: interviewNeed.trim() } : null,
    },
    sentBy: 'candidate',
  };
}

/** Why a job is not eligible for Openwork to act on. Null = eligible. */
export function autoApplyBlocker(job: Job, employer: Employer, profile: CandidateProfile): string | null {
  const r = profile.autoRules;
  if (job.status !== 'published') return 'closed';
  if (!job.acceptsAutoApply) return 'employer does not accept applications sent by Openwork';
  const hourly = job.salaryUnit === 'hour' ? job.salaryMin : job.salaryMin / 2080;
  if (r.minPay != null && hourly < r.minPay) return `pay below your $${r.minPay}/hr floor`;
  if (r.arrangements.length && !r.arrangements.includes(job.environment.workLocation ?? '')) return 'work arrangement outside your rules';
  if (r.types.length && !r.types.includes(job.employmentType)) return 'employment type outside your rules';
  const result = matchJob(profile, job, employer);
  const tier = matchTier(result);
  if (r.onlyStrongMatches && tier !== 'strong' && tier !== 'good') return 'not a strong or good match';
  if (r.requireNeedsConfirmed) {
    const required = Object.entries(profile.accessNeeds).filter(([, n]) => n.importance === 'required').map(([k]) => k);
    const unmet = required.filter((id) => !result.confirmed.some((c) => c.kind === 'need' && c.id === id));
    if (unmet.length) return `${unmet.length} required need${unmet.length === 1 ? '' : 's'} not confirmed by the employer`;
  }
  return null;
}

/**
 * One day's run for one candidate. Review mode does nothing. Assist prepares
 * applications for approval. Auto sends when there are no employer questions
 * (questions always need the person) and prepares the rest. Never more than
 * dailyCap, never a job already applied to or prepared.
 */
export function planAutoApply(profile: CandidateProfile, jobs: Job[], employers: Employer[], existing: Application[]): Application[] {
  if (profile.assistMode === 'review') return [];
  const taken = new Set(existing.filter((a) => a.candidateId === profile.id).map((a) => a.jobId));
  const out: Application[] = [];
  for (const job of jobs) {
    if (out.length >= profile.autoRules.dailyCap) break;
    if (taken.has(job.id)) continue;
    const employer = employers.find((e) => e.id === job.employerId);
    if (!employer || autoApplyBlocker(job, employer, profile)) continue;
    const app = buildApplication(job, profile, {}, '');
    const canSend = profile.assistMode === 'auto' && job.screeningQuestions.length === 0;
    out.push({
      ...app,
      id: `${app.id}-${out.length}`,
      status: canSend ? 'applied' : 'prepared',
      sentBy: 'openwork',
      history: [canSend ? { status: 'applied', on: app.submittedOn, note: 'Sent by Openwork within your rules.' } : { status: 'prepared', on: app.submittedOn, note: 'Prepared by Openwork. Waiting for your approval.' }],
    });
  }
  return out;
}

