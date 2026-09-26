import type { DimensionId } from './dimensions';
import type { CommLevel, CommReqId, Evidence, HiringOptionId, PhysicalReqId, Technology } from './access';
export type { DimensionId };
export type { HiringOptionId };
/** @deprecated alias kept for older imports */
export type HiringPracticeId = HiringOptionId;

export type Role = 'visitor' | 'candidate' | 'employer' | 'admin';

/** How much a need or preference matters to the candidate. */
export type Importance = 'required' | 'preferred' | 'dontMatter';

/**
 * Where a piece of profile information may go.
 * `matching` is the default: the system uses it, the employer does not see it.
 */
export type Visibility = 'private' | 'matching' | 'shared';

export interface CandidatePreference {
  value: string;
  importance: Importance;
  visibility: Visibility;
}

export interface AccessNeed {
  importance: Importance;
  visibility: Visibility;
}

export type WorkPreferences = Partial<Record<DimensionId, CandidatePreference>>;
/** Keyed by AccessFeature id. */
export type AccessNeeds = Record<string, AccessNeed>;

export interface Experience {
  id: string;
  title: string;
  organization: string;
  startYear: number;
  endYear: number | null;
  summary: string;
  /** Paid work, volunteering, school placement, personal project — all count. */
  kind: 'paid' | 'volunteer' | 'school' | 'project';
}

export interface Education {
  id: string;
  credential: string;
  institution: string;
  year: number | null;
}

export interface WorkExample {
  id: string;
  title: string;
  description: string;
  url?: string;
}

export type EmploymentType = 'fullTime' | 'partTime' | 'contract' | 'apprenticeship';
export type ExperienceLevel = 'entry' | 'mid' | 'senior';

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  headline: string;
  location: string;
  about: string;
  /** Plain strengths from the shared vocabulary, plus custom ones. */
  strengths: string[];
  skills: string[];
  experience: Experience[];
  education: Education[];
  workExamples: WorkExample[];
  desiredRoles: string[];
  interestedFamilies: string[];
  desiredSalaryMin: number | null;
  employmentTypes: EmploymentType[];
  availability: string;
  /** No traditional work history yet — changes copy, never capability. */
  firstJob: boolean;
  workPreferences: WorkPreferences;
  accessNeeds: AccessNeeds;
  /** Hiring options the candidate wants. */
  hiringPreferences: HiringOptionId[];
  /** Free-text support the candidate may request. Never auto-shared. */
  supportNotes: string;
  resumeFileName: string | null;
  phone: string;
  privacy: {
    supportNotes: Visibility;
    hiringPreferences: Visibility;
    workExamples: Visibility;
  };
  onboardingComplete: boolean;
  goal: string | null;
  /** How much Openwork does for you: you review, we prepare, or we send within your rules. */
  assistMode: 'review' | 'assist' | 'auto';
  /** Subscription. Free = Review, Plus = Assist, Pro = Auto. Prototype: no billing. */
  plan: 'free' | 'plus' | 'pro';
  /** Rules Openwork must respect before preparing or sending anything for you. */
  autoRules: AutoRules;
}

export interface AutoRules {
  /** Only Strong and Good matches; never Worth reviewing. */
  onlyStrongMatches: boolean;
  /** Every access need you marked required must be confirmed by the employer. */
  requireNeedsConfirmed: boolean;
  /** Per hour. Null = no floor. */
  minPay: number | null;
  /** workLocation values allowed; empty = any. */
  arrangements: string[];
  /** Employment types allowed; empty = any. */
  types: EmploymentType[];
  /** Applications Openwork may send or prepare per day. */
  dailyCap: number;
}

export type VerificationLevel = 'listed' | 'practicesCompleted' | 'verifiedPractices';

export interface Employer {
  id: string;
  name: string;
  industry: string;
  size: string;
  headquarters: string;
  about: string;
  mission: string;
  benefits: string[];
  verification: VerificationLevel;
  verifiedOn: string | null;
  workplace: {
    communicationNorms: string;
    onboarding: string;
    accommodationRoute: string;
    managerCadence: string;
  };
  /** Workplace-scope accessibility evidence, keyed by AccessFeature id. Absent = not provided. */
  accessibility: Record<string, Evidence>;
  /** Named person or address for accommodation requests. */
  accessibilityContact: string;
  /** How fast this employer usually gets back to applicants. */
  typicalResponse: string;
  /** Work email that claimed this page. Absent = listed from public data, unclaimed. */
  claimedBy?: string | null;
  plan?: 'free' | 'growth' | 'enterprise';
  logoColor: string;
}

export interface HiringStage {
  id: string;
  name: string;
  description: string;
  duration: string;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  department: string;
  family: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  salaryUnit: 'hour' | 'year';
  postedOn: string;
  status: 'draft' | 'published' | 'closed';
  summary: string;
  /** A typical day, as concrete steps. Replaces corporate prose. */
  tasks: string[];
  essentialRequirements: string[];
  preferredRequirements: string[];
  skills: string[];
  /** Strengths from the shared vocabulary that this job uses. */
  strengthsUsed: string[];
  physical: Partial<Record<PhysicalReqId, string | null>>;
  communication: Partial<Record<CommReqId, CommLevel | null>>;
  technology: Technology[];
  environment: Partial<Record<DimensionId, string | null>>;
  environmentNotes: Partial<Record<DimensionId, string>>;
  /** Job-scope accessibility evidence, keyed by AccessFeature id. Overrides employer. */
  accessibility: Record<string, Evidence>;
  hiringOptions: HiringOptionId[];
  /** 1–3 short questions the employer asks at apply time. */
  screeningQuestions: string[];
  /** Applicants before any on this platform; live count adds to it. */
  baseApplicants: number;
  /** Employer opt-out for applications Openwork sends on a candidate's behalf. */
  acceptsAutoApply: boolean;
  hiringStages: HiringStage[];
  decisionTimeframe: string;
  accommodationRoute: string;
  supportAvailable: string[];
}

export interface SavedJob {
  jobId: string;
  savedOn: string;
}

export type ApplicationStatus =
  /** Prepared by Openwork, waiting for the candidate to approve. Employers never see it. */
  | 'prepared'
  | 'applied'
  | 'viewed'
  | 'assessment'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'notSelected'
  | 'withdrawn';

export interface ApplicationEvent {
  status: ApplicationStatus;
  on: string;
  note: string;
}

/** Exactly what the candidate agreed to send. Nothing else reaches an employer. */
export interface ApplicationSharedData {
  profile: boolean;
  resume: boolean;
  workExamples: boolean;
  sharedPreferences: DimensionId[];
  /** AccessFeature ids the candidate chose to share. */
  sharedAccessNeeds: string[];
  hiringPreferences: HiringOptionId[];
  /** Practical accommodation request for the hiring process. */
  accommodationRequest: { options: HiringOptionId[]; custom: string } | null;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  submittedOn: string;
  status: ApplicationStatus;
  history: ApplicationEvent[];
  answers: Record<string, string>;
  shared: ApplicationSharedData;
  /** Who pressed send. Shown to the employer. */
  sentBy: 'candidate' | 'openwork';
  /** Set when the employer schedules a work sample or interview. */
  interview?: Interview;
}

export interface Interview {
  kind: 'assessment' | 'interview';
  /** Plain words, e.g. "Tuesday 30 September, 10:00 AM". */
  when: string;
  format: string;
  length: string;
  interviewers?: string;
  /** Arrangements the employer has confirmed, in the candidate's words. */
  arrangements: string[];
  /** Questions the employer shared in advance, if any. */
  questions?: string[];
  whatToExpect: string;
}

/** A candidate asking an employer to confirm something the job does not say. */
export interface Question {
  id: string;
  jobId: string;
  candidateId: string;
  /** AccessFeature id, when the question is about a specific need. */
  featureId: string | null;
  text: string;
  askedOn: string;
  answer: string | null;
  answeredOn: string | null;
}

export interface Report {
  id: string;
  jobId: string;
  reason: string;
  detail: string;
  on: string;
  resolved: boolean;
}

export type DisplayMode = 'standard' | 'simplified' | 'largeText';

/** "Not for me" on a match: hides the job and feeds ranking. Reasons are labels, never free text about the person. */
export interface CandidateFeedback {
  id: string;
  candidateId: string;
  jobId: string;
  reasons: string[];
  on: string;
}

/** Modeled for phase 2. Deliberately not built in MVP. */
export interface JobCoachRelationship {
  id: string;
  candidateId: string;
  coachEmail: string;
  permissions: string[];
  status: 'invited' | 'active' | 'revoked';
}
