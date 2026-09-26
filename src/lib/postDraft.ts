import type { Job } from './types';

const KEY = 'openwork.postDraft';
export interface PostDraft {
  job: Job;
  intent: 'draft' | 'publish';
}

/** A job written before the account exists. One per browser. */
export function readPostDraft(): PostDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as PostDraft;
    return d && d.job && typeof d.job.title === 'string' ? d : null;
  } catch {
    return null;
  }
}
export function writePostDraft(d: PostDraft) {
  localStorage.setItem(KEY, JSON.stringify(d));
}
export function clearPostDraft() {
  localStorage.removeItem(KEY);
}

/** Does this email belong to the employer? Prototype rule: same domain as their contact address, or the domain names the company. */
export function emailMatchesEmployer(email: string, employer: { name: string; accessibilityContact: string }): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  const contactDomain = employer.accessibilityContact.match(/@([a-z0-9.-]+)/i)?.[1]?.toLowerCase();
  if (contactDomain && contactDomain === domain) return true;
  const host = domain.split('.')[0];
  return employer.name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !['health', 'partners', 'group', 'company', 'inc', 'llc'].includes(w))
    .some((w) => host.includes(w));
}
