import { COMMUNICATION_REQUIREMENTS, JOB_EVIDENCE_FEATURES, PHYSICAL_REQUIREMENTS } from './access';
import { DIMENSIONS } from './dimensions';
import { findVaguePhrases } from './search';
import type { Employer, Job } from './types';

/** How much of what candidates compare against has been answered. */
export function jobCompleteness(j: Job): { done: number; total: number } {
  const total = DIMENSIONS.length + PHYSICAL_REQUIREMENTS.length + COMMUNICATION_REQUIREMENTS.length + JOB_EVIDENCE_FEATURES.length;
  const done = DIMENSIONS.filter((d) => j.environment[d.id]).length + PHYSICAL_REQUIREMENTS.filter((p) => j.physical[p.id]).length + COMMUNICATION_REQUIREMENTS.filter((c) => j.communication[c.id]).length + JOB_EVIDENCE_FEATURES.filter((f) => j.accessibility[f.id]).length;
  return { done, total };
}

/** Imported or thin jobs that still lack what an ATS feed never carries. */
export function jobNeedsInfo(j: Job): boolean {
  const { done, total } = jobCompleteness(j);
  return done / total < 0.5 || !j.hiringStages.some((s) => s.description.trim());
}

export interface ReviewItem {
  state: 'ok' | 'warn' | 'unknown';
  text: string;
  /** A vague phrase the employer can make concrete. */
  phrase?: string;
}

/** Accessibility and clarity review of one job. Deterministic; nothing invented. */
export function reviewJob(j: Job, employer: Employer): ReviewItem[] {
  const out: ReviewItem[] = [];
  out.push(j.salaryMin > 0 && j.salaryMax > 0 ? { state: 'ok', text: 'Pay range provided' } : { state: 'warn', text: 'Pay range missing' });
  out.push(j.environment.schedulePredictability ? { state: 'ok', text: 'Schedule described' } : { state: 'warn', text: 'Schedule not described' });
  out.push(PHYSICAL_REQUIREMENTS.some((p) => j.physical[p.id]) ? { state: 'ok', text: 'Physical requirements stated' } : { state: 'warn', text: 'Physical requirements unclear' });
  out.push(j.hiringStages.length > 0 && j.hiringStages.every((s) => s.description.trim()) ? { state: 'ok', text: 'Hiring process explained step by step' } : { state: 'warn', text: 'Hiring process missing or incomplete' });
  const text = [j.summary, ...j.essentialRequirements, ...j.preferredRequirements].join('\n');
  for (const v of findVaguePhrases(text)) {
    const m = text.match(v.pattern);
    if (m) out.push({ state: 'warn', text: `“${m[0]}” is ambiguous. ${v.ask}`, phrase: m[0] });
  }
  if (j.technology.length === 0) out.push({ state: 'unknown', text: 'Software and tools not listed, so digital accessibility is unknown' });
  else {
    const untested = j.technology.filter((t) => !t.accessibility?.screenReader);
    out.push(untested.length === 0 ? { state: 'ok', text: 'Screen-reader compatibility stated for every tool' } : { state: 'unknown', text: `Screen-reader compatibility unknown for ${untested.map((t) => t.name).join(', ')}` });
  }
  out.push(Object.keys(employer.accessibility).length > 0 ? { state: 'ok', text: 'Workplace accessibility profile provided' } : { state: 'unknown', text: 'Workplace accessibility not provided' });
  return out;
}

/** One line describing where a job came from, for the employer's own list. */
export function originLabel(j: Job): string | null {
  const o = j.origin;
  if (!o || o.kind === 'manual') return null;
  if (o.kind === 'ats') return o.syncStatus === 'error' ? 'ATS sync error' : 'synced from ATS';
  if (o.kind === 'careersPage') return 'imported from careers page';
  if (o.kind === 'feed') return 'from a job feed';
  return 'imported by Openwork';
}

/** Stable key for one posting at one employer, so re-importing updates instead of duplicating. */
export function originKey(employerId: string, externalId: string | undefined, title: string): string {
  return `${employerId}::${(externalId ?? title).trim().toLowerCase()}`;
}
