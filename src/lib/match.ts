/**
 * Deterministic, explainable, need-based matching.
 *
 * For every access need and work preference the candidate has stated, the
 * employer's side is resolved (evidence map, dimension, hiring option,
 * physical requirement, communication requirement or technology evidence) and
 * compared. The result is a state, a plain sentence, and — where it exists —
 * the source and date of the employer's claim.
 *
 *   confirmed          ✓  the employer's side satisfies the need
 *   review             △  close, or the employer said "contact us"
 *   different          ✗  the employer's side does not satisfy the need
 *   needsConfirmation  ?  the employer has not said — candidate can ask
 *   notImportant       –  candidate marked it "doesn't matter"
 *
 * Nothing is inferred from a diagnosis (there is no diagnosis field). Unknown
 * never becomes a positive. No job is hidden. Ordering for lists is internal
 * and never displayed as a score.
 */
import {
  ACCESS_FEATURES,
  ACCESS_FEATURE_BY_ID,
  COMMUNICATION_REQUIREMENTS,
  HIRING_OPTION_BY_ID,
  PHYSICAL_BY_ID,
  TECH_A11Y,
  type AccessCategoryId,
  type AccessFeature,
  type Evidence,
  type EvidenceSource,
} from './access';
import { DIMENSIONS, DIMENSION_BY_ID, optionOf, type Dimension, type DimensionId } from './dimensions';
import type { CandidateProfile, Employer, Importance, Job } from './types';

export type MatchState = 'confirmed' | 'review' | 'different' | 'needsConfirmation' | 'notImportant';

export const MATCH_STATE_LABEL: Record<MatchState, string> = {
  confirmed: 'Confirmed',
  review: 'Worth reviewing',
  different: 'Different from your need',
  needsConfirmation: 'Needs confirmation',
  notImportant: 'Not important to you',
};

/** Text symbol paired with every state so meaning never depends on color. */
export const MATCH_STATE_SYMBOL: Record<MatchState, string> = {
  confirmed: '✓',
  review: '△',
  different: '✗',
  needsConfirmation: '?',
  notImportant: '–',
};

export interface MatchReason {
  id: string;
  kind: 'need' | 'preference';
  label: string;
  category?: AccessCategoryId;
  state: MatchState;
  explanation: string;
  source?: EvidenceSource;
  confirmedOn?: string;
  employerNote?: string;
  /** True when the right next step is to ask the employer. */
  askable: boolean;
}

export interface MatchResult {
  reasons: MatchReason[];
  confirmed: MatchReason[];
  review: MatchReason[];
  different: MatchReason[];
  needsConfirmation: MatchReason[];
  notImportant: MatchReason[];
  skillsMatched: string[];
  strengthsMatched: string[];
  comparable: number;
  summary: 'strong' | 'good' | 'mixed' | 'limited' | 'unconfirmed' | 'none';
  summaryLabel: string;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function escalate(near: boolean, importance: Importance): MatchState {
  if (!near) return 'different';
  return importance === 'required' ? 'different' : 'review';
}

// ---------------------------------------------------------------------------
// Resolve one access need
// ---------------------------------------------------------------------------
function resolveNeed(f: AccessFeature, importance: Importance, job: Job, employer: Employer): MatchReason {
  const base = { id: f.id, kind: 'need' as const, label: f.label, category: f.category, askable: false };
  const need = cap(f.need);
  const r = f.resolve;

  switch (r.kind) {
    case 'evidence': {
      const ev: Evidence | undefined = job.accessibility[f.id] ?? employer.accessibility[f.id];
      if (!ev) {
        return { ...base, state: 'needsConfirmation', askable: true, explanation: `${need}. This employer has not said whether that is available.` };
      }
      if (ev.status === 'confirmed') {
        return { ...base, state: 'confirmed', source: ev.source, confirmedOn: ev.confirmedOn, employerNote: ev.note, explanation: `${need}, and ${f.provided}.` };
      }
      if (ev.status === 'contact') {
        return { ...base, state: 'review', source: ev.source, confirmedOn: ev.confirmedOn, employerNote: ev.note, askable: true, explanation: `${need}. This employer says to contact them about it.` };
      }
      return { ...base, state: 'different', source: ev.source, confirmedOn: ev.confirmedOn, employerNote: ev.note, explanation: `${need}. This employer reports it is not available here.` };
    }

    case 'dimension': {
      const dim: Dimension = DIMENSION_BY_ID[r.dimension];
      const value = job.environment[r.dimension] ?? null;
      const jobOpt = optionOf(r.dimension, value);
      if (!jobOpt) {
        return { ...base, state: 'needsConfirmation', askable: true, explanation: `${need}. This employer has not described this part of the job.` };
      }
      if (r.acceptable.includes(jobOpt.value)) {
        return { ...base, state: 'confirmed', source: 'employer', employerNote: job.environmentNotes[r.dimension], explanation: `${need}, and ${jobOpt.employerSentence}.` };
      }
      const idx = dim.options.findIndex((o) => o.value === jobOpt.value);
      const near = dim.ordered && r.acceptable.some((a) => Math.abs(dim.options.findIndex((o) => o.value === a) - idx) === 1);
      return { ...base, state: escalate(near, importance), source: 'employer', employerNote: job.environmentNotes[r.dimension], explanation: `${need}. This employer says ${jobOpt.employerSentence}.` };
    }

    case 'hiring': {
      const opt = HIRING_OPTION_BY_ID[r.option];
      if (job.hiringOptions.includes(r.option)) {
        return { ...base, state: 'confirmed', source: 'employer', explanation: `${need}, and this employer offers: ${opt.label.toLowerCase()}.` };
      }
      return { ...base, state: 'needsConfirmation', askable: true, explanation: `${need}. This employer has not listed “${opt.label.toLowerCase()}” as an option. You can ask.` };
    }

    case 'physical': {
      const def = PHYSICAL_BY_ID[r.requirement];
      const value = job.physical[r.requirement] ?? null;
      const opt = def.options.find((o) => o.value === value);
      if (!opt) {
        return { ...base, state: 'needsConfirmation', askable: true, explanation: `${need}. This employer has not stated the ${def.label.toLowerCase()} requirement for this job.` };
      }
      if (r.acceptable.includes(opt.value)) {
        return { ...base, state: 'confirmed', source: 'employer', explanation: `${need}, and this employer states: ${def.label.toLowerCase()} — ${opt.label.toLowerCase()}.` };
      }
      const idx = def.options.findIndex((o) => o.value === opt.value);
      const near = r.acceptable.some((a) => Math.abs(def.options.findIndex((o) => o.value === a) - idx) === 1);
      return { ...base, state: escalate(near, importance), source: 'employer', explanation: `${need}. This employer states: ${def.label.toLowerCase()} — ${opt.label.toLowerCase()}.` };
    }

    case 'communication': {
      const def = COMMUNICATION_REQUIREMENTS.find((c) => c.id === r.requirement)!;
      const value = job.communication[r.requirement] ?? null;
      if (!value) {
        return { ...base, state: 'needsConfirmation', askable: true, explanation: `${need}. This employer has not said how much ${def.label.toLowerCase()} this job involves.` };
      }
      if (r.acceptable.includes(value)) {
        return { ...base, state: 'confirmed', source: 'employer', explanation: `${need}, and ${def.label.toLowerCase()} ${value === 'none' ? 'are not part of this job' : 'are only occasional in this job'}.` };
      }
      return { ...base, state: importance === 'required' ? 'different' : 'review', source: 'employer', explanation: `${need}. This employer says ${def.label.toLowerCase()} are a regular part of this job.` };
    }

    case 'technology': {
      const attr = TECH_A11Y.find((t) => t.id === r.attribute)!;
      if (job.technology.length === 0) {
        return { ...base, state: 'needsConfirmation', askable: true, explanation: `${need}. This employer has not listed the software used in this job.` };
      }
      // Captions apply only to tools with audio or video. A gauge or a
      // scanner has no meetings, so for that one attribute we judge only the
      // tools the employer has said anything about. Every other attribute
      // (screen reader, keyboard, magnification) applies to every tool.
      const allRows = job.technology.map((t) => ({ name: t.name, ev: t.accessibility[r.attribute] }));
      const rows = r.attribute === 'captions' ? allRows.filter((x) => x.ev) : allRows;
      if (rows.length === 0) {
        return { ...base, state: 'needsConfirmation', askable: true, explanation: `${need}. This employer has not said whether its meeting or video tools support captions.` };
      }
      const notAvailable = rows.filter((x) => x.ev?.status === 'notAvailable');
      const unknown = rows.filter((x) => !x.ev);
      const contact = rows.filter((x) => x.ev?.status === 'contact');
      const confirmed = rows.filter((x) => x.ev?.status === 'confirmed');
      const src = (confirmed[0] ?? contact[0] ?? notAvailable[0])?.ev;
      if (notAvailable.length) {
        return { ...base, state: 'different', source: src?.source, confirmedOn: src?.confirmedOn, explanation: `${need}. This employer reports ${notAvailable.map((x) => x.name).join(', ')} ${notAvailable.length === 1 ? 'is' : 'are'} not ${attr.label.toLowerCase()}.` };
      }
      if (unknown.length) {
        return { ...base, state: 'needsConfirmation', askable: true, source: src?.source, explanation: `${need}. ${attr.label} is not verified for ${unknown.map((x) => x.name).join(', ')}${confirmed.length ? ` (confirmed for ${confirmed.map((x) => x.name).join(', ')})` : ''}.` };
      }
      if (contact.length) {
        return { ...base, state: 'review', source: src?.source, confirmedOn: src?.confirmedOn, askable: true, explanation: `${need}. This employer says to contact them about ${contact.map((x) => x.name).join(', ')}.` };
      }
      return { ...base, state: 'confirmed', source: src?.source, confirmedOn: src?.confirmedOn, explanation: `${need}, and ${f.provided}: ${confirmed.map((x) => x.name).join(', ')}.` };
    }
  }
}

// ---------------------------------------------------------------------------
// Resolve one work preference (dimension)
// ---------------------------------------------------------------------------
function resolvePreference(dim: Dimension, value: string, importance: Importance, job: Job): MatchReason {
  const base = { id: `pref:${dim.id}`, kind: 'preference' as const, label: dim.label, askable: false };
  const c = optionOf(dim.id, value);
  const jobValue = job.environment[dim.id] ?? null;
  const j = optionOf(dim.id, jobValue);
  if (!c) return { ...base, state: 'needsConfirmation', askable: true, explanation: 'Your answer could not be read.' };
  if (!j) {
    return { ...base, state: 'needsConfirmation', askable: true, explanation: `${cap(c.candidateSentence)}. This employer has not said what to expect here.` };
  }
  if (importance === 'dontMatter') {
    return { ...base, state: 'notImportant', source: 'employer', employerNote: job.environmentNotes[dim.id], explanation: `You said this does not matter to you. For reference, ${j.employerSentence}.` };
  }
  if (c.value === j.value) {
    return { ...base, state: 'confirmed', source: 'employer', employerNote: job.environmentNotes[dim.id], explanation: `${cap(c.candidateSentence)}, and ${j.employerSentence}.` };
  }
  let near = false;
  if (dim.ordered) {
    const ia = dim.options.findIndex((o) => o.value === c.value);
    const ib = dim.options.findIndex((o) => o.value === j.value);
    near = Math.abs(ia - ib) === 1;
  }
  return { ...base, state: escalate(near, importance), source: 'employer', employerNote: job.environmentNotes[dim.id], explanation: `${cap(c.candidateSentence)}, and ${j.employerSentence}.` };
}

/**
 * Does this job satisfy one access feature outright? Used by search filters.
 * Only 'confirmed' counts — unknown is never treated as a match.
 */
export function jobSatisfies(featureId: string, job: Job, employer: Employer): MatchState {
  const f = ACCESS_FEATURE_BY_ID[featureId];
  if (!f) return 'needsConfirmation';
  return resolveNeed(f, 'required', job, employer).state;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function matchJob(profile: CandidateProfile, job: Job, employer: Employer): MatchResult {
  const reasons: MatchReason[] = [];

  // Access needs first — they are the reason the product exists.
  for (const [featureId, need] of Object.entries(profile.accessNeeds)) {
    const f = ACCESS_FEATURE_BY_ID[featureId];
    if (!f) continue;
    if (need.importance === 'dontMatter') {
      reasons.push({ id: f.id, kind: 'need', label: f.label, category: f.category, state: 'notImportant', askable: false, explanation: 'You said this does not matter to you.' });
      continue;
    }
    reasons.push(resolveNeed(f, need.importance, job, employer));
  }

  // Then work preferences that are not already covered by a need.
  const coveredDims = new Set<DimensionId>(
    Object.keys(profile.accessNeeds)
      .map((id) => ACCESS_FEATURE_BY_ID[id]?.resolve)
      .filter((r): r is Extract<AccessFeature['resolve'], { kind: 'dimension' }> => !!r && r.kind === 'dimension')
      .map((r) => r.dimension),
  );
  for (const dim of DIMENSIONS) {
    const pref = profile.workPreferences[dim.id];
    if (!pref || coveredDims.has(dim.id)) continue;
    reasons.push(resolvePreference(dim, pref.value, pref.importance, job));
  }

  const by = (s: MatchState) => reasons.filter((r) => r.state === s);
  const confirmed = by('confirmed');
  const review = by('review');
  const different = by('different');
  const needsConfirmation = by('needsConfirmation');
  const notImportant = by('notImportant');
  const comparable = confirmed.length + review.length + different.length;

  const mine = new Set(profile.skills.map((s) => s.toLowerCase()));
  const skillsMatched = job.skills.filter((s) => mine.has(s.toLowerCase()));
  const myStrengths = new Set(profile.strengths.map((s) => s.toLowerCase()));
  const strengthsMatched = job.strengthsUsed.filter((s) => myStrengths.has(s.toLowerCase()));

  let summary: MatchResult['summary'];
  if (reasons.length === 0) summary = 'none';
  else if (comparable === 0) summary = 'unconfirmed';
  else if (different.length > 2) summary = 'limited';
  else if (different.length > 0) summary = 'mixed';
  else if (confirmed.length >= 4 && needsConfirmation.length === 0) summary = 'strong';
  else summary = 'good';

  const summaryLabel: Record<MatchResult['summary'], string> = {
    strong: 'Strong workplace alignment',
    good: 'Good workplace alignment',
    mixed: 'Some things to review',
    limited: 'Several things to review',
    unconfirmed: 'Mostly unconfirmed — ask the employer',
    none: 'Not enough information yet',
  };

  return {
    reasons,
    confirmed,
    review,
    different,
    needsConfirmation,
    notImportant,
    skillsMatched,
    strengthsMatched,
    comparable,
    summary,
    summaryLabel: summaryLabel[summary],
  };
}

/**
 * Signals for a job card: a few confirmed, every difference, and at least one
 * unknown when there is one — so a card never looks better than the facts.
 */
export function cardSignals(result: MatchResult, limit = 5): MatchReason[] {
  const out: MatchReason[] = [];
  out.push(...result.confirmed.slice(0, 3));
  out.push(...result.review, ...result.different);
  if (result.needsConfirmation.length) out.push(result.needsConfirmation[0]);
  return out.slice(0, limit);
}

/** Internal ordering only. Never shown. */
export function rankScore(result: MatchResult): number {
  return (
    result.confirmed.length * 3 +
    result.skillsMatched.length * 2 +
    result.strengthsMatched.length -
    result.review.length -
    result.different.length * 4
  );
}

/** Group reasons by access category for the passport-style explanation view. */
export function groupByCategory(reasons: MatchReason[]) {
  const map = new Map<string, MatchReason[]>();
  for (const r of reasons) {
    const key = r.kind === 'need' ? r.category! : 'preference';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

// Keep old names alive for the migration window.
export const skillOverlap = (profile: CandidateProfile, job: Job) => matchJob(profile, job, { accessibility: {} } as Employer).skillsMatched;
export { ACCESS_FEATURES };

// ---------------------------------------------------------------------------
// Self-check — the seven scenarios in miniature. Run: npx tsx src/lib/match.ts
// ---------------------------------------------------------------------------
declare const process: { argv: string[] } | undefined;

export function selfCheck() {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(`FAIL: ${msg}`);
  };
  const cand = (accessNeeds: CandidateProfile['accessNeeds'], workPreferences: CandidateProfile['workPreferences'] = {}) =>
    ({ skills: [], strengths: [], accessNeeds, workPreferences, hiringPreferences: [] }) as unknown as CandidateProfile;
  const emp = (accessibility: Employer['accessibility'] = {}) => ({ accessibility }) as unknown as Employer;
  const job = (p: Partial<Job>) =>
    ({ environment: {}, environmentNotes: {}, hiringOptions: [], skills: [], strengthsUsed: [], physical: {}, communication: {}, technology: [], accessibility: {}, ...p }) as unknown as Job;
  const E = (status: Evidence['status']): Evidence => ({ status, source: 'employer', confirmedOn: '2026-09-01' });
  const req = { importance: 'required' as const, visibility: 'matching' as const };
  const pref = { importance: 'preferred' as const, visibility: 'matching' as const };

  // Scenario 1 — blind candidate: screen reader tested on one tool, unknown on another → needs confirmation, names the tool
  let r = matchJob(cand({ screenReaderCompatible: req }), job({ technology: [{ name: 'Epic', accessibility: { screenReader: E('confirmed') } }, { name: 'Excel', accessibility: {} }] }), emp());
  assert(r.needsConfirmation.length === 1 && r.needsConfirmation[0].explanation.includes('Excel'), 'S1: partial tech evidence must be needsConfirmation naming the unknown tool');
  r = matchJob(cand({ screenReaderCompatible: req }), job({ technology: [{ name: 'Epic', accessibility: { screenReader: E('confirmed') } }] }), emp());
  assert(r.confirmed.length === 1 && r.confirmed[0].source === 'employer', 'S1: all tools confirmed → confirmed with source');

  // Scenario 3 — wheelchair user: step-free unknown → needsConfirmation + askable; restroom confirmed by employer
  r = matchJob(cand({ stepFreeEntrance: req, accessibleRestroom: req }), job({}), emp({ accessibleRestroom: E('confirmed') }));
  assert(r.needsConfirmation.length === 1 && r.needsConfirmation[0].askable, 'S3: unknown entrance must be askable needsConfirmation');
  assert(r.confirmed.length === 1 && r.confirmed[0].id === 'accessibleRestroom', 'S3: restroom confirmed');
  // notAvailable is different, never softened
  r = matchJob(cand({ stepFreeEntrance: req }), job({}), emp({ stepFreeEntrance: E('notAvailable') }));
  assert(r.different.length === 1, 'S3: notAvailable must be different');
  // job-scope evidence overrides employer
  r = matchJob(cand({ accessibleWorkstation: req }), job({ accessibility: { accessibleWorkstation: E('confirmed') } }), emp({ accessibleWorkstation: E('notAvailable') }));
  assert(r.confirmed.length === 1, 'job evidence overrides employer evidence');

  // Scenario 4 — Deaf candidate: captions via technology, text comms via communication requirement, interpreter via evidence
  r = matchJob(cand({ captions: req, textBasedCommunication: req, interpreter: pref }), job({ technology: [{ name: 'Zoom', accessibility: { captions: E('confirmed') } }], communication: { phone: 'none' } }), emp({ interpreter: E('contact') }));
  assert(r.confirmed.length === 2 && r.review.length === 1 && r.review[0].askable, 'S4: captions+text confirmed, interpreter contact → review');
  r = matchJob(cand({ textBasedCommunication: req }), job({ communication: { phone: 'required' } }), emp());
  assert(r.different.length === 1, 'S4: required phone vs required text → different');

  // Scenario 2 — autistic candidate via preferences only, no disclosure
  r = matchJob(cand({}, { instructions: { value: 'written', ...pref }, schedulePredictability: { value: 'fixed', ...req } }), job({ environment: { instructions: 'written', schedulePredictability: 'mostlyConsistent' } }), emp());
  assert(r.confirmed.length === 1 && r.different.length === 1, 'S2: written confirmed; required schedule one step off → different');
  // a need that covers a dimension suppresses the duplicate preference row
  r = matchJob(cand({ predictableSchedule: req }, { schedulePredictability: { value: 'fixed', ...req } }), job({ environment: { schedulePredictability: 'fixed' } }), emp());
  assert(r.reasons.length === 1, 'need covering a dimension must not duplicate the preference');

  // Physical: ability to sit vs standing most of shift → different (required), review (preferred, one step)
  r = matchJob(cand({ abilityToSit: req }), job({ physical: { standing: 'most' } }), emp());
  assert(r.different.length === 1, 'physical: required sit vs standing most → different');
  r = matchJob(cand({ abilityToSit: pref }), job({ physical: { standing: 'most' } }), emp());
  assert(r.review.length === 1, 'physical: preferred sit vs standing most (one step) → review');

  // Hiring option absent is unknown, not negative
  r = matchJob(cand({ alternativeInterview: pref }), job({ hiringOptions: [] }), emp());
  assert(r.needsConfirmation.length === 1 && r.needsConfirmation[0].askable, 'absent hiring option → needsConfirmation, askable');

  // Cards never hide the unknown
  r = matchJob(cand({ stepFreeEntrance: req, accessibleRestroom: req, accessibleParking: req, accessibleWorkstation: req, elevator: req }), job({}), emp({ accessibleRestroom: E('confirmed'), accessibleParking: E('confirmed'), accessibleWorkstation: E('confirmed'), elevator: E('confirmed') }));
  assert(cardSignals(r, 4).some((s) => s.state === 'needsConfirmation'), 'card signals must include an unknown when one exists');

  // Summary never says strong while something is unconfirmed
  assert(r.summary !== 'strong', 'summary must not be strong with an unknown');

  return 'all match.ts checks passed';
}

if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('match.ts')) {
  // eslint-disable-next-line no-console
  console.log(selfCheck());
}

// ---------------------------------------------------------------------------
// Presentation helpers for match cards (reference: Strong / Good / Worth Reviewing)
// ---------------------------------------------------------------------------
export type MatchTier = 'strong' | 'good' | 'review' | 'new';

export function matchTier(result: MatchResult | null): MatchTier {
  if (!result || result.comparable === 0) return 'new';
  if (result.summary === 'strong') return 'strong';
  if (result.summary === 'good') return 'good';
  return 'review';
}

export const MATCH_TIER_LABEL: Record<MatchTier, string> = {
  strong: 'Strong match',
  good: 'Good match',
  review: 'Worth reviewing',
  new: 'New',
};

export interface EvidenceLine {
  heading: 'Career' | 'Work' | 'Accessibility';
  text: string;
  tone: 'ok' | 'info' | 'warn';
}

/** Three compact lines: Career · Work · Accessibility. Never a badge wall. */
export function evidenceLines(result: MatchResult, job: Job): EvidenceLine[] {
  const out: EvidenceLine[] = [];
  const skills = result.skillsMatched.length + result.strengthsMatched.length;
  const skillsTotal = job.skills.length + job.strengthsUsed.length;
  if (skillsTotal > 0) out.push({ heading: 'Career', text: skills > 0 ? `${skills} of ${skillsTotal} skills and strengths align` : `None of the ${skillsTotal} listed skills and strengths are on your profile yet`, tone: skills > 0 ? 'ok' : 'info' });
  const prefsOk = result.confirmed.filter((r) => r.kind === 'preference');
  const prefsOff = [...result.different, ...result.review].filter((r) => r.kind === 'preference');
  if (prefsOk.length || prefsOff.length) {
    const bits = prefsOk.slice(0, 2).map((r) => r.label);
    if (prefsOff.length) bits.push(`${prefsOff[0].label} differs`);
    out.push({ heading: 'Work', text: bits.join(' · '), tone: prefsOff.length && !prefsOk.length ? 'warn' : 'ok' });
  }
  const needsOk = result.confirmed.filter((r) => r.kind === 'need').length;
  const needsUnknown = result.needsConfirmation.filter((r) => r.kind === 'need').length;
  const needsOff = [...result.different, ...result.review].filter((r) => r.kind === 'need').length;
  if (needsOk || needsUnknown || needsOff) {
    const bits = [];
    if (needsOk) bits.push(`${needsOk} requirement${needsOk === 1 ? '' : 's'} confirmed`);
    if (needsOff) bits.push(`${needsOff} differ${needsOff === 1 ? 's' : ''}`);
    if (needsUnknown) bits.push(`${needsUnknown} unknown`);
    out.push({ heading: 'Accessibility', text: bits.join(' · '), tone: needsOff ? 'warn' : needsUnknown && !needsOk ? 'info' : 'ok' });
  }
  return out;
}
