import type { HiringOptionId } from './access';
import { jobSatisfies, matchJob, rankScore } from './match';
import type { CandidateProfile, Employer, Job } from './types';

/**
 * Search is URL state. Every filter lives in the query string so results are
 * shareable and the back button behaves.
 */
export interface SearchParams {
  q: string;
  where: string;
  arrangement: string[]; // workLocation values
  type: string[]; // employmentType
  level: string[]; // experienceLevel
  posted: string; // '7' | '14' | '30' | ''
  minPay: string; // hourly-equivalent dollars
  practice: HiringOptionId[];
  /** Access-feature ids. A job passes only when the feature is CONFIRMED. */
  need: string[];
  sort: 'recommended' | 'newest' | 'pay';
}

export const EMPTY_SEARCH: SearchParams = {
  q: '',
  where: '',
  arrangement: [],
  type: [],
  level: [],
  posted: '',
  minPay: '',
  practice: [],
  need: [],
  sort: 'recommended',
};

export function readSearch(sp: URLSearchParams): SearchParams {
  return {
    q: sp.get('q') ?? '',
    where: sp.get('where') ?? '',
    arrangement: sp.getAll('arrangement'),
    type: sp.getAll('type'),
    level: sp.getAll('level'),
    posted: sp.get('posted') ?? '',
    minPay: sp.get('minPay') ?? '',
    practice: sp.getAll('practice') as HiringOptionId[],
    need: sp.getAll('need'),
    sort: (sp.get('sort') as SearchParams['sort']) || 'recommended',
  };
}

export function writeSearch(p: SearchParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (p.q) sp.set('q', p.q);
  if (p.where) sp.set('where', p.where);
  p.arrangement.forEach((v) => sp.append('arrangement', v));
  p.type.forEach((v) => sp.append('type', v));
  p.level.forEach((v) => sp.append('level', v));
  if (p.posted) sp.set('posted', p.posted);
  if (p.minPay) sp.set('minPay', p.minPay);
  p.practice.forEach((v) => sp.append('practice', v));
  p.need.forEach((v) => sp.append('need', v));
  if (p.sort !== 'recommended') sp.set('sort', p.sort);
  return sp;
}

export function activeFilterCount(p: SearchParams): number {
  return (
    p.arrangement.length +
    p.type.length +
    p.level.length +
    (p.posted ? 1 : 0) +
    (p.minPay ? 1 : 0) +
    p.practice.length +
    p.need.length
  );
}

/** Hourly-equivalent pay for comparing hourly and salaried jobs. */
function hourly(job: Job): number {
  return job.salaryUnit === 'hour' ? job.salaryMax : job.salaryMax / 2080;
}

export function searchJobs(
  jobs: Job[],
  employers: Employer[],
  p: SearchParams,
  profile: CandidateProfile | null,
  today = new Date('2026-09-24'),
): Job[] {
  const employerById = Object.fromEntries(employers.map((e) => [e.id, e])) as Record<string, Employer>;
  const employerNames = Object.fromEntries(employers.map((e) => [e.id, e.name])) as Record<string, string>;
  const q = p.q.trim().toLowerCase();
  const where = p.where.trim().toLowerCase();

  let out = jobs.filter((job) => {
    if (job.status !== 'published') return false;
    if (q) {
      const hay = [job.title, job.department, job.summary, employerNames[job.employerId] ?? '', ...job.skills]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (where) {
      const loc = job.location.toLowerCase();
      const isRemote = job.environment.workLocation === 'remote';
      if (!loc.includes(where) && !(where === 'remote' && isRemote)) return false;
    }
    if (p.arrangement.length && !p.arrangement.includes(job.environment.workLocation ?? '')) return false;
    if (p.type.length && !p.type.includes(job.employmentType)) return false;
    if (p.level.length && !p.level.includes(job.experienceLevel)) return false;
    if (p.posted) {
      const days = (today.getTime() - new Date(job.postedOn).getTime()) / 86_400_000;
      if (days > Number(p.posted)) return false;
    }
    if (p.minPay && hourly(job) < Number(p.minPay)) return false;
    if (p.practice.length && !p.practice.every((id) => job.hiringOptions.includes(id))) return false;
    if (p.need.length) {
      const employer = employerById[job.employerId];
      if (!employer) return false;
      if (!p.need.every((id) => jobSatisfies(id, job, employer) === 'confirmed')) return false;
    }
    return true;
  });

  const hasPrefs = profile && (Object.keys(profile.workPreferences).length > 0 || Object.keys(profile.accessNeeds).length > 0);
  if (p.sort === 'pay') {
    out = [...out].sort((a, b) => hourly(b) - hourly(a));
  } else if (p.sort === 'newest' || !hasPrefs) {
    out = [...out].sort((a, b) => b.postedOn.localeCompare(a.postedOn));
  } else {
    const scores = new Map(out.map((j) => [j.id, rankScore(matchJob(profile!, j, employerById[j.employerId]))]));
    out = [...out].sort((a, b) => (scores.get(b.id)! - scores.get(a.id)!) || b.postedOn.localeCompare(a.postedOn));
  }
  return out;
}

/**
 * Spots vague hiring language and suggests the concrete question to ask
 * instead. Used in the employer job builder. Deliberately a short, plain list.
 */
export const VAGUE_PHRASES: { pattern: RegExp; ask: string; options: string[] }[] = [
  {
    pattern: /excellent communication|strong communication|great communicator|communication skills/i,
    ask: 'What does communication mean in this job?',
    options: ['Write clear status updates', 'Speak with customers by phone', 'Present to groups', 'Take part in team discussions', 'Coordinate in writing'],
  },
  {
    pattern: /team player|fits? (in|our) culture|culture fit/i,
    ask: 'What does working with the team actually involve?',
    options: ['Share work in progress for review', 'Cover for colleagues when needed', 'Attend a daily stand-up', 'Hand over work at shift change'],
  },
  {
    pattern: /fast[- ]paced|hit the ground running|thrives? under pressure|high[- ]pressure/i,
    ask: 'What is the actual pace? Say what changes and how often.',
    options: ['Priorities change during the day', 'Fixed daily deadlines', 'Peak periods at set times of year', 'Steady, predictable workload'],
  },
  {
    pattern: /self[- ]starter|go[- ]getter|proactive|takes? initiative/i,
    ask: 'What decisions will this person make without being asked?',
    options: ['Choose the order of assigned tasks', 'Decide what to work on each week', 'Escalate problems to a manager', 'Follow a defined queue'],
  },
  {
    pattern: /multi[- ]?task|juggle|wear many hats/i,
    ask: 'How often does the person switch tasks, and why?',
    options: ['A few switches a day', 'Frequent interruptions', 'Long stretches on one task'],
  },
  {
    pattern: /thick skin|handle criticism|rough and tumble/i,
    ask: 'How is feedback given here?',
    options: ['In scheduled one-to-ones', 'In writing', 'Directly, as it comes up'],
  },
];

export function findVaguePhrases(text: string) {
  return VAGUE_PHRASES.filter((v) => v.pattern.test(text));
}
