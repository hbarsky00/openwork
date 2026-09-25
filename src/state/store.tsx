/**
 * Single app store: context + reducer, persisted to localStorage.
 * This module is the seam where a real API would go. Screens never touch
 * storage directly.
 */
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { SAMPLE_APPLICATIONS, SAMPLE_CANDIDATES, emptyProfile } from '../data/candidates';
import { EMPLOYERS } from '../data/employers';
import { JOBS } from '../data/jobs';
import type {
  Application,
  ApplicationStatus,
  CandidateProfile,
  DisplayMode,
  Employer,
  Job,
  Question,
  Report,
  Role,
  SavedJob,
} from '../lib/types';

export interface AppState {
  /** Bumped whenever persisted shapes change. Mismatch = start fresh. */
  schema: number;
  role: Role;
  candidate: CandidateProfile | null;
  employerId: string | null;
  jobs: Job[];
  employers: Employer[];
  candidates: CandidateProfile[];
  saved: SavedJob[];
  applications: Application[];
  questions: Question[];
  recentlyViewed: string[];
  reports: Report[];
  lastSearch: string;
  displayMode: DisplayMode;
}

// v2: access-needs data model. Older v1 state is intentionally dropped.
const STORAGE_KEY = 'openwork.v5';

const SCHEMA = 5;

const initialState: AppState = {
  schema: SCHEMA,
  role: 'visitor',
  candidate: null,
  employerId: null,
  jobs: JOBS,
  employers: EMPLOYERS,
  candidates: SAMPLE_CANDIDATES,
  saved: [],
  applications: SAMPLE_APPLICATIONS,
  questions: [
    {
      id: 'q-devon-dq',
      jobId: 'j-dataquality',
      candidateId: 'c-devon',
      featureId: 'screenReaderCompatible',
      text: 'Has your internal admin tool been tested with NVDA or JAWS? The listing confirms the main tools but not that one.',
      askedOn: '2026-09-22',
      answer: null,
      answeredOn: null,
    },
  ],
  recentlyViewed: [],
  reports: [],
  lastSearch: '',
  displayMode: 'standard',
};

type Action =
  | { type: 'signInCandidate'; profile: CandidateProfile }
  | { type: 'signUpCandidate'; name: string; email: string }
  | { type: 'signInEmployer'; employerId: string }
  | { type: 'signInAdmin' }
  | { type: 'signOut' }
  | { type: 'updateCandidate'; patch: Partial<CandidateProfile> }
  | { type: 'toggleSave'; jobId: string }
  | { type: 'viewJob'; jobId: string }
  | { type: 'submitApplication'; application: Application }
  | { type: 'withdrawApplication'; applicationId: string }
  | { type: 'advanceApplication'; applicationId: string; status: ApplicationStatus; note: string }
  | { type: 'upsertJob'; job: Job }
  | { type: 'updateEmployer'; employerId: string; patch: Partial<Employer> }
  | { type: 'createEmployer'; employer: Employer }
  | { type: 'askQuestion'; question: Question }
  | { type: 'answerQuestion'; questionId: string; answer: string }
  | { type: 'reportJob'; report: Report }
  | { type: 'resolveReport'; reportId: string }
  | { type: 'setLastSearch'; value: string }
  | { type: 'setDisplayMode'; mode: DisplayMode }
  | { type: 'reset' };

function today() {
  return new Date().toISOString().slice(0, 10);
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'signInCandidate':
      return { ...state, role: 'candidate', candidate: action.profile, employerId: null };
    case 'signUpCandidate': {
      const id = `c-${Date.now().toString(36)}`;
      const candidate = emptyProfile(id, action.name, action.email);
      return { ...state, role: 'candidate', candidate, candidates: [...state.candidates, candidate], employerId: null };
    }
    case 'signInEmployer':
      return { ...state, role: 'employer', employerId: action.employerId, candidate: null };
    case 'signInAdmin':
      return { ...state, role: 'admin', candidate: null, employerId: null };
    case 'signOut':
      return { ...state, role: 'visitor', candidate: null, employerId: null };
    case 'updateCandidate': {
      if (!state.candidate) return state;
      const candidate = { ...state.candidate, ...action.patch };
      return {
        ...state,
        candidate,
        candidates: state.candidates.some((c) => c.id === candidate.id)
          ? state.candidates.map((c) => (c.id === candidate.id ? candidate : c))
          : [...state.candidates, candidate],
      };
    }
    case 'toggleSave': {
      const exists = state.saved.some((s) => s.jobId === action.jobId);
      return { ...state, saved: exists ? state.saved.filter((s) => s.jobId !== action.jobId) : [{ jobId: action.jobId, savedOn: today() }, ...state.saved] };
    }
    case 'viewJob':
      return { ...state, recentlyViewed: [action.jobId, ...state.recentlyViewed.filter((j) => j !== action.jobId)].slice(0, 8) };
    case 'submitApplication': {
      const candidateId = action.application.candidateId === 'pending' ? (state.candidate?.id ?? 'pending') : action.application.candidateId;
      return { ...state, applications: [{ ...action.application, candidateId }, ...state.applications] };
    }
    case 'withdrawApplication':
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.applicationId ? { ...a, status: 'withdrawn', history: [...a.history, { status: 'withdrawn', on: today(), note: 'You withdrew this application.' }] } : a,
        ),
      };
    case 'advanceApplication': {
      // Idempotent: the same transition recorded twice must not produce two events.
      const target = state.applications.find((a) => a.id === action.applicationId);
      if (!target || target.status === action.status) return state;
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.applicationId ? { ...a, status: action.status, history: [...a.history, { status: action.status, on: today(), note: action.note }] } : a,
        ),
      };
    }
    case 'upsertJob':
      return { ...state, jobs: state.jobs.some((j) => j.id === action.job.id) ? state.jobs.map((j) => (j.id === action.job.id ? action.job : j)) : [action.job, ...state.jobs] };
    case 'updateEmployer':
      return { ...state, employers: state.employers.map((e) => (e.id === action.employerId ? { ...e, ...action.patch } : e)) };
    case 'createEmployer':
      return { ...state, role: 'employer', employerId: action.employer.id, candidate: null, employers: [...state.employers, action.employer] };
    case 'askQuestion':
      return { ...state, questions: [action.question, ...state.questions] };
    case 'answerQuestion':
      return { ...state, questions: state.questions.map((q) => (q.id === action.questionId ? { ...q, answer: action.answer, answeredOn: today() } : q)) };
    case 'reportJob':
      return { ...state, reports: [action.report, ...state.reports] };
    case 'resolveReport':
      return { ...state, reports: state.reports.map((r) => (r.id === action.reportId ? { ...r, resolved: true } : r)) };
    case 'setLastSearch':
      return { ...state, lastSearch: action.value };
    case 'setDisplayMode':
      return { ...state, displayMode: action.mode };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.schema !== SCHEMA) return initialState;
    // Seed data is code, not storage: take jobs/employers from the seed and
    // merge in anything the user created or edited. A persisted copy that
    // predates the current shape is never trusted over the seed.
    const wellFormed = (j: Job) => !!j.accessibility && !!j.physical && !!j.communication && Array.isArray(j.technology) && Array.isArray(j.hiringOptions) && Array.isArray(j.screeningQuestions);
    const seedJobIds = new Set(JOBS.map((j) => j.id));
    const userJobs = (parsed.jobs ?? []).filter((j) => !seedJobIds.has(j.id) && wellFormed(j));
    const editedSeed = (parsed.jobs ?? []).filter((j) => seedJobIds.has(j.id) && wellFormed(j));
    const jobs = [...userJobs, ...JOBS.map((seed) => editedSeed.find((j) => j.id === seed.id) ?? seed)];
    const seedEmpIds = new Set(EMPLOYERS.map((e) => e.id));
    const goodEmp = (e: Employer) => !!e.accessibility;
    const userEmployers = (parsed.employers ?? []).filter((e) => !seedEmpIds.has(e.id) && goodEmp(e));
    const editedEmp = (parsed.employers ?? []).filter((e) => seedEmpIds.has(e.id) && goodEmp(e));
    const employers = [...EMPLOYERS.map((seed) => editedEmp.find((e) => e.id === seed.id) ?? seed), ...userEmployers];
    return { ...initialState, ...parsed, schema: SCHEMA, jobs, employers };
  } catch {
    return initialState;
  }
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — app still works for this session */
    }
  }, [state]);
  useEffect(() => {
    document.documentElement.dataset.display = state.displayMode;
  }, [state.displayMode]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

// Convenience selectors ------------------------------------------------------

export function useJob(id: string | undefined) {
  const { state } = useStore();
  return state.jobs.find((j) => j.id === id) ?? null;
}

export function useEmployer(id: string | undefined) {
  const { state } = useStore();
  return state.employers.find((e) => e.id === id) ?? null;
}

export function useIsSaved(jobId: string) {
  const { state } = useStore();
  return state.saved.some((s) => s.jobId === jobId);
}

export function useMyApplication(jobId: string) {
  const { state } = useStore();
  if (!state.candidate) return null;
  return state.applications.find((a) => a.jobId === jobId && a.candidateId === state.candidate!.id) ?? null;
}

/** Employer for a job, with an empty accessibility map if somehow missing. */
export function useJobEmployer(job: Job | null) {
  const { state } = useStore();
  if (!job) return null;
  return state.employers.find((e) => e.id === job.employerId) ?? null;
}
