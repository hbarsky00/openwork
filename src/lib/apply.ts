import type { Application, CandidateProfile, Job } from './types';

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
      hiringPreferences: [],
      accommodationRequest: interviewNeed.trim() ? { options: [], custom: interviewNeed.trim() } : null,
    },
  };
}
