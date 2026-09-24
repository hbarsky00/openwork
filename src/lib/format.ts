import type { EmploymentType, ExperienceLevel, Job, ApplicationStatus, VerificationLevel, Importance, Visibility } from './types';

export function salary(job: Pick<Job, 'salaryMin' | 'salaryMax' | 'salaryUnit'>): string {
  if (job.salaryUnit === 'hour') return `$${job.salaryMin}–$${job.salaryMax}/hr`;
  const k = (n: number) => `$${Math.round(n / 1000)}k`;
  return `${k(job.salaryMin)}–${k(job.salaryMax)}/yr`;
}

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  fullTime: 'Full time',
  partTime: 'Part time',
  contract: 'Contract',
  apprenticeship: 'Apprenticeship',
};

export const EXPERIENCE_LEVEL_LABEL: Record<ExperienceLevel, string> = {
  entry: 'Entry level',
  mid: 'Mid level',
  senior: 'Senior',
};

export const WORK_LOCATION_LABEL: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
  flexible: 'Flexible',
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  viewed: 'Employer viewed',
  assessment: 'Work sample or assessment',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  notSelected: 'Not selected',
  withdrawn: 'Withdrawn',
};

export const VERIFICATION_LABEL: Record<VerificationLevel, string> = {
  listed: 'Listed employer',
  practicesCompleted: 'Practices completed',
  verifiedPractices: 'Verified practices',
};

export const VERIFICATION_DESCRIPTION: Record<VerificationLevel, string> = {
  listed:
    'This employer has an account and has posted a job. Its workplace information has not been reviewed.',
  practicesCompleted:
    'This employer has completed structured workplace and hiring information for its jobs and finished the platform’s hiring guidance.',
  verifiedPractices:
    'Openwork has checked this employer’s accommodation process, alternative assessment options and onboarding practices against what it publishes.',
};

export const IMPORTANCE_LABEL: Record<Importance, string> = {
  required: 'Required',
  preferred: 'Preferred',
  dontMatter: "Doesn't matter",
};

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  private: 'Private to me',
  matching: 'Used for matching',
  shared: 'Shared with employer',
};

export const VISIBILITY_HELP: Record<Visibility, string> = {
  private: 'Not used by anything. Only you can see it.',
  matching: 'Used to explain why jobs match you. Employers never see it.',
  shared: 'Included when you apply, after you confirm what the employer will see.',
};

export function postedAgo(iso: string, now = new Date('2026-09-24')): string {
  const then = new Date(iso);
  const days = Math.max(0, Math.round((now.getTime() - then.getTime()) / 86_400_000));
  if (days === 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 7) return `Posted ${days} days ago`;
  if (days < 14) return 'Posted 1 week ago';
  if (days < 30) return `Posted ${Math.round(days / 7)} weeks ago`;
  return `Posted ${Math.round(days / 30)} month${days >= 60 ? 's' : ''} ago`;
}

export function longDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
