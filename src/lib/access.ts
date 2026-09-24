/**
 * The access-needs taxonomy. Nine categories of NEED — never diagnosis.
 *
 * Each feature says how the employer's side is resolved: from an evidence map
 * (workplace or job), from a "how the job works" dimension, from a hiring
 * option, from a physical requirement, from a communication requirement, or
 * from technology evidence. Candidate UI, employer UI, filters and matching all
 * read this one table.
 */
import type { DimensionId } from './dimensions';

// ---------------------------------------------------------------------------
// Evidence: who said a thing is accessible, and when.
// ---------------------------------------------------------------------------
export type EvidenceStatus = 'confirmed' | 'notAvailable' | 'contact';
export type EvidenceSource = 'employer' | 'candidateConfirmed' | 'platformVerified';

export interface Evidence {
  status: EvidenceStatus;
  source: EvidenceSource;
  confirmedOn: string;
  /** Employer's own words, shown to candidates. */
  note?: string;
}

export const EVIDENCE_SOURCE_LABEL: Record<EvidenceSource, string> = {
  employer: 'Employer reported',
  candidateConfirmed: 'Confirmed by a candidate',
  platformVerified: 'Verified by Openwork',
};

export const EVIDENCE_STATUS_LABEL: Record<EvidenceStatus, string> = {
  confirmed: 'Confirmed',
  notAvailable: 'Not available',
  contact: 'Contact employer',
};

// ---------------------------------------------------------------------------
// Physical requirements — employer states them; nothing is inferred.
// ---------------------------------------------------------------------------
export type PhysicalReqId = 'standing' | 'sitting' | 'walking' | 'lifting' | 'fineMotor' | 'driving' | 'travel';

export interface PhysicalRequirementDef {
  id: PhysicalReqId;
  label: string;
  employerQuestion: string;
  /** Ordered least to most demanding. */
  options: { value: string; label: string }[];
}

export const PHYSICAL_REQUIREMENTS: PhysicalRequirementDef[] = [
  {
    id: 'standing',
    label: 'Standing',
    employerQuestion: 'How much standing does this job involve?',
    options: [
      { value: 'none', label: 'Little or none — can be done seated' },
      { value: 'some', label: 'Some standing, with the option to sit' },
      { value: 'most', label: 'Standing for most of the shift' },
    ],
  },
  {
    id: 'sitting',
    label: 'Sitting',
    employerQuestion: 'How much sitting does this job involve?',
    options: [
      { value: 'none', label: 'Little or none' },
      { value: 'some', label: 'Some sitting' },
      { value: 'most', label: 'Seated for most of the day' },
    ],
  },
  {
    id: 'walking',
    label: 'Walking',
    employerQuestion: 'How much walking does this job involve?',
    options: [
      { value: 'none', label: 'Little or none' },
      { value: 'some', label: 'Some walking between areas' },
      { value: 'most', label: 'Walking for most of the shift' },
    ],
  },
  {
    id: 'lifting',
    label: 'Lifting',
    employerQuestion: 'What is the most this job requires someone to lift?',
    options: [
      { value: 'none', label: 'Nothing beyond everyday items' },
      { value: 'upTo10', label: 'Up to 10 lb' },
      { value: 'upTo25', label: 'Up to 25 lb' },
      { value: 'upTo50', label: 'Up to 50 lb' },
      { value: 'over50', label: 'Over 50 lb' },
    ],
  },
  {
    id: 'fineMotor',
    label: 'Fine hand movements',
    employerQuestion: 'How much precise hand work does this job involve?',
    options: [
      { value: 'none', label: 'Little or none' },
      { value: 'some', label: 'Some — typing, scanning, handling' },
      { value: 'most', label: 'Constant precise hand work' },
    ],
  },
  {
    id: 'driving',
    label: 'Driving',
    employerQuestion: 'Does this job require driving?',
    options: [
      { value: 'none', label: 'No' },
      { value: 'some', label: 'Occasionally' },
      { value: 'most', label: 'Yes — driving is a core part of the job' },
    ],
  },
  {
    id: 'travel',
    label: 'Travel',
    employerQuestion: 'Does this job require travel?',
    options: [
      { value: 'none', label: 'No' },
      { value: 'some', label: 'Occasionally' },
      { value: 'most', label: 'Frequently' },
    ],
  },
];

export const PHYSICAL_BY_ID = Object.fromEntries(PHYSICAL_REQUIREMENTS.map((p) => [p.id, p])) as Record<PhysicalReqId, PhysicalRequirementDef>;

// ---------------------------------------------------------------------------
// Communication requirements — how the work is actually communicated.
// ---------------------------------------------------------------------------
export type CommReqId = 'phone' | 'email' | 'chat' | 'inPerson' | 'customerFacing' | 'meetings' | 'writtenReports' | 'presentations';
export type CommLevel = 'none' | 'occasional' | 'required';

export const COMMUNICATION_REQUIREMENTS: { id: CommReqId; label: string }[] = [
  { id: 'phone', label: 'Phone calls' },
  { id: 'email', label: 'Email' },
  { id: 'chat', label: 'Chat or messaging' },
  { id: 'inPerson', label: 'In-person conversation' },
  { id: 'customerFacing', label: 'Speaking with customers or the public' },
  { id: 'meetings', label: 'Team meetings' },
  { id: 'writtenReports', label: 'Written reports' },
  { id: 'presentations', label: 'Presenting to groups' },
];

export const COMM_LEVEL_LABEL: Record<CommLevel, string> = {
  none: 'Not part of the job',
  occasional: 'Occasional',
  required: 'A regular part of the job',
};

// ---------------------------------------------------------------------------
// Technology accessibility — per named tool.
// ---------------------------------------------------------------------------
export type TechA11yId = 'screenReader' | 'keyboard' | 'captions' | 'magnification';

export const TECH_A11Y: { id: TechA11yId; label: string; employerQuestion: string }[] = [
  { id: 'screenReader', label: 'Screen reader tested', employerQuestion: 'Has this tool been tested with a screen reader?' },
  { id: 'keyboard', label: 'Keyboard accessible', employerQuestion: 'Can this tool be fully used without a mouse?' },
  { id: 'captions', label: 'Captions supported', employerQuestion: 'Do calls or video in this tool support captions?' },
  { id: 'magnification', label: 'Magnification tested', employerQuestion: 'Does this tool work at 200% zoom or with a magnifier?' },
];

export interface Technology {
  name: string;
  accessibility: Partial<Record<TechA11yId, Evidence>>;
}

// ---------------------------------------------------------------------------
// Hiring options — ways to demonstrate skills, plus accessible-interview options.
// ---------------------------------------------------------------------------
export type HiringOptionId =
  | 'questionsInAdvance'
  | 'workSample'
  | 'structuredInterview'
  | 'writtenResponse'
  | 'supportPersonWelcome'
  | 'structuredOnboarding'
  | 'quietWorkspaceAvailable'
  | 'flexibleHours'
  | 'captionsAtInterview'
  | 'interpreterAtInterview'
  | 'accessibleInterviewLocation'
  | 'videoInterview'
  | 'phoneInterview'
  | 'textInterview'
  | 'extraTime';

export interface HiringOptionDef {
  id: HiringOptionId;
  label: string;
  description: string;
  filterLabel: string;
  /** Interview-format options are offered in the accommodation request. */
  group: 'demonstrate' | 'interview' | 'workplace';
}

export const HIRING_OPTIONS: HiringOptionDef[] = [
  { id: 'workSample', group: 'demonstrate', label: 'Work sample instead of an interview', description: 'Show what you can do with a task like the real job, instead of answering interview questions.', filterLabel: 'Work sample available' },
  { id: 'questionsInAdvance', group: 'demonstrate', label: 'Interview questions shared in advance', description: 'You receive the questions before the interview so you can prepare.', filterLabel: 'Questions in advance' },
  { id: 'structuredInterview', group: 'demonstrate', label: 'Structured interview', description: 'Every candidate is asked the same questions in the same order, scored the same way.', filterLabel: 'Structured interview' },
  { id: 'writtenResponse', group: 'demonstrate', label: 'Written responses accepted', description: 'Answer some or all questions in writing rather than out loud.', filterLabel: 'Written responses accepted' },
  { id: 'extraTime', group: 'interview', label: 'Extra time', description: 'More time for work samples, tests or answers, without penalty.', filterLabel: 'Extra time offered' },
  { id: 'captionsAtInterview', group: 'interview', label: 'Captions at interview', description: 'Live captions on video interviews.', filterLabel: 'Captions at interview' },
  { id: 'interpreterAtInterview', group: 'interview', label: 'Sign-language interpreter', description: 'An interpreter arranged and paid for by the employer.', filterLabel: 'Interpreter available' },
  { id: 'supportPersonWelcome', group: 'interview', label: 'Support person or job coach welcome', description: 'Bring a job coach or support person to any stage.', filterLabel: 'Support person welcome' },
  { id: 'accessibleInterviewLocation', group: 'interview', label: 'Accessible interview location', description: 'Step-free, with an accessible restroom nearby.', filterLabel: 'Accessible interview location' },
  { id: 'videoInterview', group: 'interview', label: 'Video interview available', description: 'Interview from home by video.', filterLabel: 'Video interview' },
  { id: 'phoneInterview', group: 'interview', label: 'Phone interview available', description: 'Interview by phone with no video.', filterLabel: 'Phone interview' },
  { id: 'textInterview', group: 'interview', label: 'Text or chat interview available', description: 'Interview entirely in writing, live or asynchronous.', filterLabel: 'Text interview' },
  { id: 'structuredOnboarding', group: 'workplace', label: 'Written onboarding plan', description: 'Your first weeks are planned in writing.', filterLabel: 'Written onboarding plan' },
  { id: 'quietWorkspaceAvailable', group: 'workplace', label: 'Quiet workspace available', description: 'A quieter place to work can be arranged if you ask.', filterLabel: 'Quiet workspace available' },
  { id: 'flexibleHours', group: 'workplace', label: 'Flexible start and finish times', description: 'Start and finish times can shift within agreed limits.', filterLabel: 'Flexible hours' },
];

export const HIRING_OPTION_BY_ID = Object.fromEntries(HIRING_OPTIONS.map((h) => [h.id, h])) as Record<HiringOptionId, HiringOptionDef>;

// ---------------------------------------------------------------------------
// Access features
// ---------------------------------------------------------------------------
export type AccessCategoryId =
  | 'vision'
  | 'hearing'
  | 'mobility'
  | 'dexterity'
  | 'communication'
  | 'cognitive'
  | 'colorVisual'
  | 'schedule'
  | 'support';

export const ACCESS_CATEGORIES: { id: AccessCategoryId; label: string; intro: string }[] = [
  { id: 'vision', label: 'Vision', intro: 'Technology and documents you can use without relying on sight.' },
  { id: 'hearing', label: 'Hearing', intro: 'Communication that does not depend on hearing.' },
  { id: 'mobility', label: 'Mobility', intro: 'Getting into and around the workplace, and where you work.' },
  { id: 'dexterity', label: 'Dexterity and motor', intro: 'How you operate equipment and software.' },
  { id: 'communication', label: 'Communication', intro: 'How you exchange information with colleagues and managers.' },
  { id: 'cognitive', label: 'Cognitive and focus', intro: 'Instructions, predictability, interruptions and expectations.' },
  { id: 'colorVisual', label: 'Colour and visual presentation', intro: 'How information is shown on screen and on paper.' },
  { id: 'schedule', label: 'Schedule and energy', intro: 'Hours, breaks and where you work from.' },
  { id: 'support', label: 'Support', intro: 'People and structures that help you do the job.' },
];

export type Resolver =
  | { kind: 'evidence'; scope: 'workplace' | 'job' }
  | { kind: 'dimension'; dimension: DimensionId; acceptable: string[] }
  | { kind: 'hiring'; option: HiringOptionId }
  | { kind: 'physical'; requirement: PhysicalReqId; acceptable: string[] }
  | { kind: 'communication'; requirement: CommReqId; acceptable: CommLevel[] }
  | { kind: 'technology'; attribute: TechA11yId };

export interface AccessFeature {
  id: string;
  category: AccessCategoryId;
  /** Candidate-facing label. Always a need, never a condition. */
  label: string;
  /** "you need …" — completes a sentence. */
  need: string;
  /** "… " — what the employer's side means when it is confirmed. */
  provided: string;
  /** Employer-facing question, for evidence-kind features. */
  employerQuestion?: string;
  resolve: Resolver;
  /** Offered as a search filter. */
  filter?: boolean;
}

const ev = (scope: 'workplace' | 'job'): Resolver => ({ kind: 'evidence', scope });

export const ACCESS_FEATURES: AccessFeature[] = [
  // VISION -------------------------------------------------------------
  { id: 'screenReaderCompatible', category: 'vision', label: 'Screen-reader compatible software', need: 'you need software that works with a screen reader', provided: 'the software used in this job has been tested with a screen reader', resolve: { kind: 'technology', attribute: 'screenReader' }, filter: true },
  { id: 'keyboardNavigation', category: 'vision', label: 'Keyboard-accessible software', need: 'you need software you can use without a mouse', provided: 'the software used in this job can be fully operated by keyboard', resolve: { kind: 'technology', attribute: 'keyboard' }, filter: true },
  { id: 'magnification', category: 'vision', label: 'Magnification or large text', need: 'you need software and documents that work at high zoom', provided: 'the software used in this job has been tested with magnification', resolve: { kind: 'technology', attribute: 'magnification' } },
  { id: 'accessibleDocuments', category: 'vision', label: 'Accessible digital documents', need: 'you need documents in an accessible digital format', provided: 'work documents are provided in accessible digital formats', employerQuestion: 'Are work documents (procedures, forms, handbooks) available in accessible digital formats?', resolve: ev('job'), filter: true },
  { id: 'braille', category: 'vision', label: 'Braille materials', need: 'you need key materials in braille', provided: 'key materials can be provided in braille', employerQuestion: 'Can key materials be provided in braille on request?', resolve: ev('workplace') },
  { id: 'audioInstructions', category: 'vision', label: 'Audio or spoken instructions', need: 'you need instructions available in audio', provided: 'instructions can be provided in audio', employerQuestion: 'Can instructions be provided as audio?', resolve: ev('job') },
  { id: 'nonvisualNavigation', category: 'vision', label: 'Clear non-visual wayfinding', need: 'you need to be able to find your way without relying on sight', provided: 'the workplace has tactile or audible wayfinding and consistent layouts', employerQuestion: 'Does the workplace have tactile signage, audible cues or consistent layouts for non-visual wayfinding?', resolve: ev('workplace') },

  // HEARING ------------------------------------------------------------
  { id: 'captions', category: 'hearing', label: 'Captions on meetings and video', need: 'you need captions on meetings and video', provided: 'meeting and video tools used in this job support captions', resolve: { kind: 'technology', attribute: 'captions' }, filter: true },
  { id: 'liveTranscription', category: 'hearing', label: 'Live transcription', need: 'you need live transcription in meetings', provided: 'live transcription is available in meetings', employerQuestion: 'Is live transcription available in meetings?', resolve: ev('workplace') },
  { id: 'interpreter', category: 'hearing', label: 'Sign-language interpreter at work', need: 'you need a sign-language interpreter for key meetings', provided: 'the employer arranges interpreters for key meetings', employerQuestion: 'Does the employer arrange sign-language interpreters for meetings and training?', resolve: ev('workplace'), filter: true },
  { id: 'textBasedCommunication', category: 'hearing', label: 'Text-based communication', need: 'you need work communication in text rather than by phone', provided: 'phone calls are not a regular part of this job', resolve: { kind: 'communication', requirement: 'phone', acceptable: ['none', 'occasional'] }, filter: true },
  { id: 'visualAlerts', category: 'hearing', label: 'Visual alerts and alarms', need: 'you need alerts and alarms to be visual, not only audible', provided: 'alarms and alerts in the workplace are visual as well as audible', employerQuestion: 'Are fire alarms and workplace alerts visual as well as audible?', resolve: ev('workplace') },
  { id: 'writtenInstructionsHearing', category: 'hearing', label: 'Written instructions', need: 'you need instructions in writing', provided: 'most instructions for this job are given in writing', resolve: { kind: 'dimension', dimension: 'instructions', acceptable: ['written'] } },
  { id: 'assistiveListening', category: 'hearing', label: 'Assistive listening systems', need: 'you need assistive listening support in meeting rooms', provided: 'meeting rooms have hearing loops or assistive listening systems', employerQuestion: 'Do meeting rooms have hearing loops or assistive listening systems?', resolve: ev('workplace') },

  // MOBILITY -----------------------------------------------------------
  { id: 'stepFreeEntrance', category: 'mobility', label: 'Step-free entrance', need: 'you need step-free access to the building', provided: 'the workplace has a step-free entrance', employerQuestion: 'Is there a step-free entrance to the workplace?', resolve: ev('workplace'), filter: true },
  { id: 'elevator', category: 'mobility', label: 'Elevator to all work areas', need: 'you need an elevator to reach every area you work in', provided: 'an elevator serves every floor used for work', employerQuestion: 'Does an elevator serve every floor where this job is performed?', resolve: ev('workplace') },
  { id: 'accessibleRestroom', category: 'mobility', label: 'Accessible restroom', need: 'you need an accessible restroom', provided: 'the workplace has an accessible restroom on the work floor', employerQuestion: 'Is there an accessible restroom on the floor where this job is performed?', resolve: ev('workplace'), filter: true },
  { id: 'accessibleWorkstation', category: 'mobility', label: 'Accessible workstation', need: 'you need a workstation that suits a wheelchair or adjustable height', provided: 'height-adjustable, wheelchair-accessible workstations are available', employerQuestion: 'Are height-adjustable or wheelchair-accessible workstations available?', resolve: ev('job'), filter: true },
  { id: 'accessibleParking', category: 'mobility', label: 'Accessible parking', need: 'you need accessible parking near the entrance', provided: 'accessible parking is available near the entrance', employerQuestion: 'Is there accessible parking near the entrance?', resolve: ev('workplace'), filter: true },
  { id: 'publicTransport', category: 'mobility', label: 'Reachable by public transport', need: 'you need the workplace to be reachable by public transport', provided: 'the workplace is within a short distance of an accessible transit stop', employerQuestion: 'Is the workplace within a short, accessible walk of public transport?', resolve: ev('workplace') },
  { id: 'reducedWalking', category: 'mobility', label: 'Limited walking', need: 'you need a job without a lot of walking', provided: 'this job involves little walking', resolve: { kind: 'physical', requirement: 'walking', acceptable: ['none', 'some'] } },
  { id: 'abilityToSit', category: 'mobility', label: 'Ability to sit while working', need: 'you need to be able to sit while you work', provided: 'this job can be done seated or with the option to sit', resolve: { kind: 'physical', requirement: 'standing', acceptable: ['none', 'some'] }, filter: true },
  { id: 'limitedLifting', category: 'mobility', label: 'Limited lifting', need: 'you need a job without heavy lifting', provided: 'this job does not involve lifting more than 10 lb', resolve: { kind: 'physical', requirement: 'lifting', acceptable: ['none', 'upTo10'] } },
  { id: 'remoteWorkMobility', category: 'mobility', label: 'Remote work', need: 'you need to work remotely', provided: 'this job is fully remote', resolve: { kind: 'dimension', dimension: 'workLocation', acceptable: ['remote', 'flexible'] } },

  // DEXTERITY ----------------------------------------------------------
  { id: 'keyboardAlternatives', category: 'dexterity', label: 'Alternatives to keyboard and mouse', need: 'you need to be able to use voice input or alternative hardware', provided: 'the employer supports voice input and adaptive hardware', employerQuestion: 'Can the person use voice input or adaptive hardware with the job’s tools?', resolve: ev('job'), filter: true },
  { id: 'reducedFineMotor', category: 'dexterity', label: 'Limited precise hand work', need: 'you need a job without constant precise hand movements', provided: 'this job involves little precise hand work', resolve: { kind: 'physical', requirement: 'fineMotor', acceptable: ['none', 'some'] } },
  { id: 'ergonomicEquipment', category: 'dexterity', label: 'Ergonomic equipment', need: 'you need ergonomic equipment', provided: 'ergonomic equipment is provided on request', employerQuestion: 'Is ergonomic equipment (chairs, keyboards, mice) provided on request?', resolve: ev('workplace') },
  { id: 'extraTaskTime', category: 'dexterity', label: 'Extra time where tasks are timed', need: 'you need extra time where tasks are timed', provided: 'extra time is offered on timed tasks', resolve: { kind: 'hiring', option: 'extraTime' } },
  { id: 'noDriving', category: 'dexterity', label: 'No driving', need: 'you need a job that does not require driving', provided: 'this job does not require driving', resolve: { kind: 'physical', requirement: 'driving', acceptable: ['none'] }, filter: true },

  // COMMUNICATION ------------------------------------------------------
  { id: 'writtenCommunication', category: 'communication', label: 'Written communication', need: 'you need most work communication in writing', provided: 'most instructions for this job are given in writing', resolve: { kind: 'dimension', dimension: 'instructions', acceptable: ['written'] }, filter: true },
  { id: 'processingTime', category: 'communication', label: 'Extra processing time', need: 'you need time to process information before responding', provided: 'extra time is offered on questions and tasks', resolve: { kind: 'hiring', option: 'extraTime' } },
  { id: 'aacFriendly', category: 'communication', label: 'AAC or alternative communication welcome', need: 'you use an alternative communication method', provided: 'the employer supports alternative and augmentative communication', employerQuestion: 'Can the person use AAC or another alternative communication method for all work communication?', resolve: ev('job') },
  { id: 'questionsInAdvanceComm', category: 'communication', label: 'Questions in advance', need: 'you need interview questions in advance', provided: 'interview questions are shared in advance', resolve: { kind: 'hiring', option: 'questionsInAdvance' }, filter: true },
  { id: 'clearLanguage', category: 'communication', label: 'Clear, direct language', need: 'you need instructions in clear, direct language', provided: 'tasks in this job are defined and assigned', resolve: { kind: 'dimension', dimension: 'taskStructure', acceptable: ['defined'] } },
  { id: 'supportPerson', category: 'communication', label: 'Support person at interviews', need: 'you need to bring a support person to interviews', provided: 'a support person or job coach is welcome at interviews', resolve: { kind: 'hiring', option: 'supportPersonWelcome' }, filter: true },
  { id: 'noCustomerFacing', category: 'communication', label: 'Little or no customer contact', need: 'you need a job without regular customer contact', provided: 'customer contact is not a regular part of this job', resolve: { kind: 'communication', requirement: 'customerFacing', acceptable: ['none', 'occasional'] } },
  { id: 'noPresentations', category: 'communication', label: 'No presenting to groups', need: 'you need a job that does not involve presenting to groups', provided: 'presenting to groups is not part of this job', resolve: { kind: 'communication', requirement: 'presentations', acceptable: ['none'] } },

  // COGNITIVE ----------------------------------------------------------
  { id: 'predictableSchedule', category: 'cognitive', label: 'Predictable schedule', need: 'you need the same hours every week', provided: 'this job follows the same hours every week', resolve: { kind: 'dimension', dimension: 'schedulePredictability', acceptable: ['fixed'] }, filter: true },
  { id: 'writtenInstructionsCog', category: 'cognitive', label: 'Written instructions', need: 'you need instructions in writing', provided: 'most instructions for this job are given in writing', resolve: { kind: 'dimension', dimension: 'instructions', acceptable: ['written'] } },
  { id: 'stepByStep', category: 'cognitive', label: 'Step-by-step tasks', need: 'you need tasks broken into clear steps', provided: 'tasks in this job are defined and assigned', resolve: { kind: 'dimension', dimension: 'taskStructure', acceptable: ['defined'] }, filter: true },
  { id: 'reducedInterruptions', category: 'cognitive', label: 'Few interruptions', need: 'you need to work with few interruptions', provided: 'this job allows long stretches on one task', resolve: { kind: 'dimension', dimension: 'taskSwitching', acceptable: ['sustained'] } },
  { id: 'quietWorkspace', category: 'cognitive', label: 'Quiet workspace', need: 'you need a quiet place to work', provided: 'the workspace is consistently quiet', resolve: { kind: 'dimension', dimension: 'noise', acceptable: ['quiet'] }, filter: true },
  { id: 'structuredOnboardingCog', category: 'cognitive', label: 'Structured onboarding', need: 'you need a written onboarding plan', provided: 'onboarding follows a written plan', resolve: { kind: 'hiring', option: 'structuredOnboarding' }, filter: true },
  { id: 'advanceNotice', category: 'cognitive', label: 'Advance notice of changes', need: 'you need advance notice when plans change', provided: 'changes to schedules and tasks are announced in advance', employerQuestion: 'Are changes to schedules or tasks announced in advance, in writing?', resolve: ev('job') },
  { id: 'regularCheckins', category: 'cognitive', label: 'Regular check-ins', need: 'you need regular scheduled check-ins', provided: 'feedback is given in scheduled one-to-ones', resolve: { kind: 'dimension', dimension: 'feedbackStyle', acceptable: ['scheduled'] } },
  { id: 'alternativeInterview', category: 'cognitive', label: 'Alternative to a standard interview', need: 'you need an alternative to a standard interview', provided: 'a work sample can replace the interview', resolve: { kind: 'hiring', option: 'workSample' }, filter: true },

  // COLOUR / VISUAL ----------------------------------------------------
  { id: 'notColorAlone', category: 'colorVisual', label: 'Information not shown by colour alone', need: 'you need information not to rely on colour alone', provided: 'work systems and signage do not rely on colour alone', employerQuestion: 'Do the job’s systems and any colour-coded processes also use labels, patterns or text?', resolve: ev('job') },
  { id: 'highContrast', category: 'colorVisual', label: 'High-contrast display', need: 'you need to be able to set high contrast on your screen', provided: 'display settings can be customised on work devices', employerQuestion: 'Can the person change display settings (contrast, zoom, colours) on work devices?', resolve: ev('job') },

  // SCHEDULE -----------------------------------------------------------
  { id: 'flexibleHours', category: 'schedule', label: 'Flexible start and finish', need: 'you need flexible start and finish times', provided: 'start and finish times can shift within agreed limits', resolve: { kind: 'hiring', option: 'flexibleHours' }, filter: true },
  { id: 'partTime', category: 'schedule', label: 'Part-time hours', need: 'you need part-time hours', provided: 'this is a part-time job', employerQuestion: 'Can this job be done part-time?', resolve: ev('job') },
  { id: 'remoteWork', category: 'schedule', label: 'Remote work', need: 'you need to work from home', provided: 'this job is fully remote', resolve: { kind: 'dimension', dimension: 'workLocation', acceptable: ['remote', 'flexible'] }, filter: true },
  { id: 'breakFlexibility', category: 'schedule', label: 'Flexible breaks', need: 'you need to take breaks when you need them', provided: 'breaks can be taken when needed', employerQuestion: 'Can breaks be taken when needed rather than at fixed times?', resolve: ev('job') },
  { id: 'predictableShifts', category: 'schedule', label: 'Predictable shifts', need: 'you need to know your shifts well in advance', provided: 'this job follows the same hours every week', resolve: { kind: 'dimension', dimension: 'schedulePredictability', acceptable: ['fixed', 'mostlyConsistent'] } },

  // SUPPORT ------------------------------------------------------------
  { id: 'jobCoach', category: 'support', label: 'Job coach welcome at work', need: 'you work with a job coach', provided: 'a job coach is welcome on site and involved in onboarding', employerQuestion: 'Is a job coach welcome on site, including during onboarding?', resolve: ev('workplace'), filter: true },
  { id: 'workplaceMentor', category: 'support', label: 'Workplace mentor or buddy', need: 'you need a named person to go to', provided: 'a named mentor or buddy is assigned', employerQuestion: 'Is a named mentor or buddy assigned to new starters?', resolve: ev('job') },
  { id: 'structuredOnboardingSupport', category: 'support', label: 'Structured onboarding', need: 'you need a written onboarding plan', provided: 'onboarding follows a written plan', resolve: { kind: 'hiring', option: 'structuredOnboarding' } },
  { id: 'vocRehab', category: 'support', label: 'Works with vocational rehabilitation', need: 'you are supported by a vocational rehabilitation agency', provided: 'the employer has worked with vocational rehabilitation agencies before', employerQuestion: 'Has the employer worked with vocational rehabilitation or supported-employment agencies?', resolve: ev('workplace') },
  { id: 'transportSupport', category: 'support', label: 'Transportation support', need: 'you need help getting to work', provided: 'the employer offers transportation support', employerQuestion: 'Does the employer offer shuttle, transit passes or other transport support?', resolve: ev('workplace') },
];

export const ACCESS_FEATURE_BY_ID = Object.fromEntries(ACCESS_FEATURES.map((f) => [f.id, f])) as Record<string, AccessFeature>;

export function featuresIn(category: AccessCategoryId) {
  return ACCESS_FEATURES.filter((f) => f.category === category);
}

/** Evidence-kind features an employer answers about the workplace. */
export const WORKPLACE_EVIDENCE_FEATURES = ACCESS_FEATURES.filter((f) => f.resolve.kind === 'evidence' && f.resolve.scope === 'workplace');
/** Evidence-kind features an employer answers per job. */
export const JOB_EVIDENCE_FEATURES = ACCESS_FEATURES.filter((f) => f.resolve.kind === 'evidence' && f.resolve.scope === 'job');

// ---------------------------------------------------------------------------
// Strengths — plain, practical, not tied to any diagnosis.
// ---------------------------------------------------------------------------
export const STRENGTHS: string[] = [
  'Organizing',
  'Working with numbers',
  'Following a process',
  'Helping customers',
  'Working with computers',
  'Building or fixing things',
  'Cleaning',
  'Cooking',
  'Data entry',
  'Creative work',
  'Working outdoors',
  'Working with animals',
  'Driving',
  'Stocking and sorting',
  'Writing',
  'Research',
  'Attention to detail',
  'Repeating a task accurately',
  'Solving problems',
  'Working independently',
  'Working in a team',
  'Checking and inspecting',
  'Explaining things clearly',
  'Staying calm under pressure',
];

// ---------------------------------------------------------------------------
// Job families — for "Help me find work". Derived from jobs, not diagnosis.
// ---------------------------------------------------------------------------
export interface JobFamily {
  id: string;
  label: string;
  description: string;
}

export const JOB_FAMILIES: JobFamily[] = [
  { id: 'records', label: 'Records and data', description: 'Filing, entering and checking information. Usually seated, usually quiet.' },
  { id: 'warehouse', label: 'Warehouse and stock', description: 'Receiving, counting, moving and organising goods. On your feet, often busy.' },
  { id: 'finance', label: 'Accounting and finance', description: 'Working with numbers, invoices and reports. Detail-heavy, mostly independent.' },
  { id: 'library', label: 'Libraries and archives', description: 'Organising and describing books, documents and images. Quiet, methodical.' },
  { id: 'software', label: 'Software and data quality', description: 'Testing, analysing and documenting technical systems. Usually remote.' },
  { id: 'outdoors', label: 'Outdoors and grounds', description: 'Planting, maintaining and building outside. Physical, in all weather.' },
  { id: 'publishing', label: 'Editing and publishing', description: 'Reading, correcting and producing written work. Deadline-driven.' },
  { id: 'manufacturing', label: 'Manufacturing and inspection', description: 'Making and measuring parts to a specification. Precise, structured.' },
  { id: 'customerService', label: 'Customer service and scheduling', description: 'Talking with people by phone or in person. Fast-moving, social.' },
];

export const JOB_FAMILY_BY_ID = Object.fromEntries(JOB_FAMILIES.map((f) => [f.id, f])) as Record<string, JobFamily>;
