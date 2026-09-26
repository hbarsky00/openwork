import type { CandidateProfile, Employer } from './types';

/** SHA-256 hex. Good enough to keep a prototype password out of plain text; not a server. */
export async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`openwork:${password}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const validEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

export function employerEmail(e: Employer): string | null {
  return e.claimedBy ?? e.accessibilityContact.match(/[^\s(]+@[^\s)]+/)?.[0] ?? null;
}

export type Account = { kind: 'candidate'; candidate: CandidateProfile } | { kind: 'employer'; employer: Employer } | { kind: 'admin' };

/** Every account the app knows, by email. Trust team is trust@openwork.example. */
export function findAccount(email: string, candidates: CandidateProfile[], employers: Employer[]): Account | null {
  const e = email.trim().toLowerCase();
  if (e === 'trust@openwork.example') return { kind: 'admin' };
  const c = candidates.find((x) => x.email.toLowerCase() === e);
  if (c) return { kind: 'candidate', candidate: c };
  const emp = employers.find((x) => employerEmail(x)?.toLowerCase() === e);
  if (emp) return { kind: 'employer', employer: emp };
  return null;
}

/** Demo accounts have no hash and accept any password; real ones must match. */
export async function passwordOk(hash: string | undefined, password: string): Promise<boolean> {
  if (!hash) return password.length > 0;
  return (await hashPassword(password)) === hash;
}
