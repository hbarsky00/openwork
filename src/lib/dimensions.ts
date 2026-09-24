/**
 * The shared vocabulary for "how work actually works".
 *
 * One table drives three things: the candidate's "How I Work Best" form, the
 * employer's "How this job actually works" form, and the matching engine's
 * explanations. Adding a dimension is a one-object change here.
 *
 * `scale` is ordinal: options are listed low-to-high on a single axis so that
 * distance between a candidate answer and an employer answer is meaningful.
 * A dimension with `ordered: false` compares by identity only.
 */

export type DimensionId =
  | 'instructions'
  | 'schedulePredictability'
  | 'noise'
  | 'meetingFrequency'
  | 'taskStructure'
  | 'feedbackStyle'
  | 'socialInteraction'
  | 'customerInteraction'
  | 'taskSwitching'
  | 'collaboration'
  | 'workLocation';

export interface DimensionOption {
  value: string;
  /** What the candidate picks. */
  candidateLabel: string;
  /** What the employer picks. Describes reality, not preference. */
  employerLabel: string;
  /** Plain sentence used in explanations: "You prefer ___." */
  candidateSentence: string;
  /** Plain sentence used in explanations: "This employer says ___." */
  employerSentence: string;
}

export interface Dimension {
  id: DimensionId;
  /** Short noun used as a row label. */
  label: string;
  /** The question asked of the candidate. */
  candidateQuestion: string;
  /** The question asked of the employer. */
  employerQuestion: string;
  /** Shown under the employer question to explain why it is worth answering. */
  employerHelp: string;
  /** False when options are categories rather than points on an axis. */
  ordered: boolean;
  options: DimensionOption[];
}

export const DIMENSIONS: Dimension[] = [
  {
    id: 'instructions',
    label: 'Instructions',
    candidateQuestion: 'How do you prefer to receive instructions?',
    employerQuestion: 'How are instructions usually given in this job?',
    employerHelp:
      'Candidates use this to judge whether they can get started without asking for things to be repeated.',
    ordered: false,
    options: [
      {
        value: 'written',
        candidateLabel: 'In writing',
        employerLabel: 'Mostly in writing',
        candidateSentence: 'you prefer written instructions',
        employerSentence: 'most instructions for this job are given in writing',
      },
      {
        value: 'verbal',
        candidateLabel: 'Spoken',
        employerLabel: 'Mostly spoken',
        candidateSentence: 'you prefer spoken instructions',
        employerSentence: 'most instructions for this job are given in conversation',
      },
      {
        value: 'demonstrated',
        candidateLabel: 'Shown to me',
        employerLabel: 'Mostly demonstrated in person',
        candidateSentence: 'you prefer to be shown how a task is done',
        employerSentence: 'tasks in this job are usually demonstrated in person first',
      },
      {
        value: 'either',
        candidateLabel: "Either is fine",
        employerLabel: 'A mix of written and spoken',
        candidateSentence: 'you are comfortable with any format',
        employerSentence: 'instructions come as a mix of written and spoken',
      },
    ],
  },
  {
    id: 'schedulePredictability',
    label: 'Schedule',
    candidateQuestion: 'How predictable do you need your schedule to be?',
    employerQuestion: 'How predictable is the schedule for this job?',
    employerHelp:
      'Be accurate rather than generous. A schedule described as fixed that then changes is a common reason people leave a job.',
    ordered: true,
    options: [
      {
        value: 'fixed',
        candidateLabel: 'The same hours every week',
        employerLabel: 'The same hours every week',
        candidateSentence: 'you need the same hours every week',
        employerSentence: 'this job follows the same hours every week',
      },
      {
        value: 'mostlyConsistent',
        candidateLabel: 'Mostly consistent, occasional changes',
        employerLabel: 'Mostly consistent, occasional changes',
        candidateSentence: 'you prefer a mostly consistent schedule',
        employerSentence: 'hours are mostly consistent with occasional changes',
      },
      {
        value: 'varies',
        candidateLabel: 'Changing hours are fine',
        employerLabel: 'Hours change week to week',
        candidateSentence: 'changing hours are fine for you',
        employerSentence: 'hours for this job change from week to week',
      },
    ],
  },
  {
    id: 'noise',
    label: 'Noise and surroundings',
    candidateQuestion: 'What kind of surroundings help you work best?',
    employerQuestion: 'What is the workspace actually like?',
    employerHelp:
      'Describe the real space, including busy periods. "Quiet" should mean quiet.',
    ordered: true,
    options: [
      {
        value: 'quiet',
        candidateLabel: 'Quiet',
        employerLabel: 'Consistently quiet',
        candidateSentence: 'you work best somewhere quiet',
        employerSentence: 'the workspace is consistently quiet',
      },
      {
        value: 'someActivity',
        candidateLabel: 'Some activity is fine',
        employerLabel: 'Some background activity',
        candidateSentence: 'some background activity is fine for you',
        employerSentence: 'there is some background activity in the workspace',
      },
      {
        value: 'busy',
        candidateLabel: 'A busy space is fine',
        employerLabel: 'Busy and often loud',
        candidateSentence: 'a busy space is fine for you',
        employerSentence: 'the workspace is busy and often loud',
      },
    ],
  },
  {
    id: 'meetingFrequency',
    label: 'Meetings',
    candidateQuestion: 'How many meetings suit you?',
    employerQuestion: 'How many meetings does this job involve in a normal week?',
    employerHelp: 'Count recurring meetings a person in this job is expected to attend.',
    ordered: true,
    options: [
      {
        value: 'few',
        candidateLabel: 'As few as possible',
        employerLabel: '0–1 per week',
        candidateSentence: 'you prefer as few meetings as possible',
        employerSentence: 'this job has about one meeting a week or fewer',
      },
      {
        value: 'some',
        candidateLabel: 'A few is fine',
        employerLabel: '2–3 per week',
        candidateSentence: 'a few meetings a week are fine for you',
        employerSentence: 'this job has two to three meetings a week',
      },
      {
        value: 'many',
        candidateLabel: 'I like regular collaboration',
        employerLabel: '4 or more per week',
        candidateSentence: 'you like regular collaboration',
        employerSentence: 'this job has four or more meetings a week',
      },
    ],
  },
  {
    id: 'taskStructure',
    label: 'Task structure',
    candidateQuestion: 'What kind of tasks suit you?',
    employerQuestion: 'How defined is the work in this job?',
    employerHelp:
      'Say whether someone is given tasks or expected to decide what to work on.',
    ordered: true,
    options: [
      {
        value: 'defined',
        candidateLabel: 'Clear, defined tasks',
        employerLabel: 'Tasks are defined and assigned',
        candidateSentence: 'you prefer clear, defined tasks',
        employerSentence: 'tasks in this job are defined and assigned',
      },
      {
        value: 'mix',
        candidateLabel: 'A mix',
        employerLabel: 'A mix of assigned and self-directed work',
        candidateSentence: 'you prefer a mix of defined and open work',
        employerSentence: 'this job mixes assigned and self-directed work',
      },
      {
        value: 'openEnded',
        candidateLabel: 'Open-ended work I shape myself',
        employerLabel: 'Largely self-directed',
        candidateSentence: 'you prefer open-ended work you shape yourself',
        employerSentence: 'this job is largely self-directed',
      },
    ],
  },
  {
    id: 'feedbackStyle',
    label: 'Feedback',
    candidateQuestion: 'How do you prefer to get feedback?',
    employerQuestion: 'How is feedback given in this job?',
    employerHelp: 'Describe what a manager in this team actually does.',
    ordered: false,
    options: [
      {
        value: 'scheduled',
        candidateLabel: 'In scheduled check-ins',
        employerLabel: 'In scheduled one-to-ones',
        candidateSentence: 'you prefer feedback in scheduled check-ins',
        employerSentence: 'feedback is given in scheduled one-to-ones',
      },
      {
        value: 'written',
        candidateLabel: 'In writing',
        employerLabel: 'In writing',
        candidateSentence: 'you prefer written feedback',
        employerSentence: 'feedback in this job is given in writing',
      },
      {
        value: 'direct',
        candidateLabel: 'Directly, as it comes up',
        employerLabel: 'Directly, as it comes up',
        candidateSentence: 'you prefer direct feedback as it comes up',
        employerSentence: 'feedback is given directly, as it comes up',
      },
      {
        value: 'noPreference',
        candidateLabel: 'No preference',
        employerLabel: 'Varies by manager',
        candidateSentence: 'you have no preference about feedback',
        employerSentence: 'how feedback is given varies by manager',
      },
    ],
  },
  {
    id: 'socialInteraction',
    label: 'Working with people',
    candidateQuestion: 'How much interaction with colleagues suits you?',
    employerQuestion: 'How much interaction with colleagues does this job involve?',
    employerHelp: 'This is about colleagues, not customers.',
    ordered: true,
    options: [
      {
        value: 'low',
        candidateLabel: 'Not much',
        employerLabel: 'Mostly working alone',
        candidateSentence: 'you prefer limited interaction with colleagues',
        employerSentence: 'this job is mostly worked alone',
      },
      {
        value: 'moderate',
        candidateLabel: 'A moderate amount',
        employerLabel: 'Regular contact with a small team',
        candidateSentence: 'you prefer a moderate amount of interaction',
        employerSentence: 'this job involves regular contact with a small team',
      },
      {
        value: 'high',
        candidateLabel: 'A lot',
        employerLabel: 'Constant contact across teams',
        candidateSentence: 'you prefer a lot of interaction',
        employerSentence: 'this job involves constant contact across teams',
      },
    ],
  },
  {
    id: 'customerInteraction',
    label: 'Customer contact',
    candidateQuestion: 'How much customer or public contact suits you?',
    employerQuestion: 'How much customer or public contact does this job involve?',
    employerHelp: 'Include phone calls, walk-ins and any public-facing duty.',
    ordered: true,
    options: [
      {
        value: 'none',
        candidateLabel: 'None',
        employerLabel: 'None',
        candidateSentence: 'you prefer no customer contact',
        employerSentence: 'this job has no customer contact',
      },
      {
        value: 'occasional',
        candidateLabel: 'Occasional',
        employerLabel: 'Occasional',
        candidateSentence: 'you are comfortable with occasional customer contact',
        employerSentence: 'this job involves occasional customer contact',
      },
      {
        value: 'constant',
        candidateLabel: 'Constant is fine',
        employerLabel: 'Constant — it is the core of the job',
        candidateSentence: 'constant customer contact is fine for you',
        employerSentence: 'customer contact is the core of this job',
      },
    ],
  },
  {
    id: 'taskSwitching',
    label: 'Switching between tasks',
    candidateQuestion: 'How do you prefer to move between tasks?',
    employerQuestion: 'How often is someone interrupted or asked to switch tasks?',
    employerHelp: 'Be honest about interruptions — this is rarely written down anywhere.',
    ordered: true,
    options: [
      {
        value: 'sustained',
        candidateLabel: 'One thing at a time',
        employerLabel: 'Long stretches on one task',
        candidateSentence: 'you prefer to work on one thing at a time',
        employerSentence: 'this job allows long stretches on one task',
      },
      {
        value: 'some',
        candidateLabel: 'Some switching is fine',
        employerLabel: 'A few switches a day',
        candidateSentence: 'some switching between tasks is fine for you',
        employerSentence: 'this job involves a few task switches a day',
      },
      {
        value: 'frequent',
        candidateLabel: 'Frequent switching is fine',
        employerLabel: 'Frequent interruptions',
        candidateSentence: 'frequent switching is fine for you',
        employerSentence: 'this job involves frequent interruptions',
      },
    ],
  },
  {
    id: 'collaboration',
    label: 'Independent or collaborative',
    candidateQuestion: 'Do you prefer working independently or with others?',
    employerQuestion: 'Is this job done independently or with others?',
    employerHelp: 'Describe how the work is actually organised day to day.',
    ordered: true,
    options: [
      {
        value: 'independent',
        candidateLabel: 'Mostly independently',
        employerLabel: 'Mostly independent work',
        candidateSentence: 'you prefer to work mostly independently',
        employerSentence: 'this job is mostly independent work',
      },
      {
        value: 'balanced',
        candidateLabel: 'A balance',
        employerLabel: 'A balance of both',
        candidateSentence: 'you prefer a balance of independent and shared work',
        employerSentence: 'this job balances independent and shared work',
      },
      {
        value: 'collaborative',
        candidateLabel: 'Mostly with others',
        employerLabel: 'Mostly collaborative',
        candidateSentence: 'you prefer to work mostly with others',
        employerSentence: 'this job is mostly collaborative',
      },
    ],
  },
  {
    id: 'workLocation',
    label: 'Where the work happens',
    candidateQuestion: 'Where do you want to work?',
    employerQuestion: 'Where is this job done?',
    employerHelp: 'If on-site days are required, say how many.',
    ordered: false,
    options: [
      {
        value: 'remote',
        candidateLabel: 'Remote',
        employerLabel: 'Fully remote',
        candidateSentence: 'you want to work remotely',
        employerSentence: 'this job is fully remote',
      },
      {
        value: 'hybrid',
        candidateLabel: 'Hybrid',
        employerLabel: 'Hybrid — some days on-site',
        candidateSentence: 'you want hybrid work',
        employerSentence: 'this job is hybrid, with some days on-site',
      },
      {
        value: 'onsite',
        candidateLabel: 'On-site',
        employerLabel: 'Fully on-site',
        candidateSentence: 'you want to work on-site',
        employerSentence: 'this job is fully on-site',
      },
      {
        value: 'flexible',
        candidateLabel: 'Flexible — any of these',
        employerLabel: 'The person in this job can choose',
        candidateSentence: 'you are flexible about where you work',
        employerSentence: 'the person in this job can choose where they work',
      },
    ],
  },
];

export const DIMENSION_BY_ID: Record<DimensionId, Dimension> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d]),
) as Record<DimensionId, Dimension>;

export function optionOf(id: DimensionId, value: string | null): DimensionOption | null {
  if (!value) return null;
  return DIMENSION_BY_ID[id].options.find((o) => o.value === value) ?? null;
}

// Hiring options moved to access.ts (they are one of several access resolvers).
// Re-exported here so existing imports keep working during the migration.
export {
  HIRING_OPTIONS as HIRING_PRACTICES,
  HIRING_OPTION_BY_ID as HIRING_PRACTICE_BY_ID,
} from './access';
export type { HiringOptionId as HiringPracticeId } from './access';
