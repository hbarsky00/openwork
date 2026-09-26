import { Banner, BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AskEmployerButton } from '../../components/AskEmployerModal';
import { OptionGrid } from '../../components/OptionGrid';
import { QuickApplyButton } from '../../components/QuickApplyButton';
import { SaveButton } from '../../components/SaveButton';
import { PHYSICAL_REQUIREMENTS } from '../../lib/access';
import { DIMENSIONS, optionOf } from '../../lib/dimensions';
import { EXPERIENCE_LEVEL_LABEL, salary } from '../../lib/format';
import { MATCH_TIER_LABEL, matchJob, matchTier, type MatchReason, type MatchState } from '../../lib/match';
import { useTitle } from '../../lib/useTitle';
import { useJob, useStore } from '../../state/store';
import { NotFound } from '../public/NotFound';

type Tone = 'ok' | 'warn' | 'info';
const ICON = { ok: CheckCircleIcon, warn: AlertCircleIcon, info: InfoIcon };
const NEED_STATE: Record<MatchState, [string, Tone]> = {
  confirmed: ['Confirmed', 'ok'],
  review: ['Worth reviewing', 'warn'],
  different: ['Different from what you need', 'warn'],
  needsConfirmation: ['Not provided', 'info'],
  notImportant: ['', 'info'],
};
const REASONS = ['Role', 'Salary', 'Location', 'Company', 'Work arrangement', 'Accessibility', 'Experience requirement', 'Other'];
/** Dimensions worth a line even when the candidate has no preference about them. */
const WORTH = ['meetingFrequency', 'customerInteraction', 'noise', 'taskSwitching', 'schedulePredictability', 'collaboration'] as const;

function Fact({ tone, text, detail, action }: { tone: Tone; text: string; detail?: string; action?: React.ReactNode }) {
  const I = ICON[tone];
  return (
    <li className={`ow-fact ow-fact--${tone}`}>
      <I />
      <div>
        <Text as="p">{text}</Text>
        {detail && (
          <Text as="p" variant="bodySm" tone="subdued">
            {detail}
          </Text>
        )}
        {action}
      </div>
    </li>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ow-matchsec" aria-labelledby={`ms-${title}`}>
      <Text as="h2" variant="headingSm" id={`ms-${title}`}>
        {title}
      </Text>
      <ul className="ow-facts">{children}</ul>
    </section>
  );
}

/**
 * The flagship: every reason this job is or is not a fit, in five short
 * sections, then the same apply control as everywhere else. "Not for me"
 * hides the job and records why, without asking anything about the person.
 */
export function WhyThisMatches() {
  const { id } = useParams();
  const job = useJob(id);
  const { state, dispatch } = useStore();
  const p = state.candidate!;
  const [picking, setPicking] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  useTitle(job ? `Why this matches · ${job.title}` : 'Job not found');
  if (!job) return <NotFound message="This job may have been removed or the link is wrong." />;
  const employer = state.employers.find((e) => e.id === job.employerId);
  if (!employer) return null;

  const result = matchJob(p, job, employer);
  const tier = matchTier(result);
  const skills = result.skillsMatched.length + result.strengthsMatched.length;
  const skillsTotal = job.skills.length + job.strengthsUsed.length;
  const hourly = job.salaryUnit === 'hour' ? job.salaryMin : job.salaryMin / 2080;
  const prefs = result.reasons.filter((r) => r.kind === 'preference' && r.state !== 'notImportant');
  const needs = result.reasons.filter((r) => r.kind === 'need' && r.state !== 'notImportant');
  const byState = (rs: MatchReason[]) => [...rs].sort((a, b) => ['confirmed', 'review', 'different', 'needsConfirmation', 'notImportant'].indexOf(a.state) - ['confirmed', 'review', 'different', 'needsConfirmation', 'notImportant'].indexOf(b.state));
  const worth: string[] = [];
  for (const did of WORTH) {
    const v = job.environment[did];
    if (!v || p.workPreferences[did]) continue;
    const d = DIMENSIONS.find((x) => x.id === did);
    const o = optionOf(did, v);
    if (d && o) worth.push(`${d.label}: ${o.employerLabel.toLowerCase()}`);
  }
  for (const pr of PHYSICAL_REQUIREMENTS) {
    const v = job.physical[pr.id];
    const o = pr.options.find((x) => x.value === v);
    if (o && o.value !== 'none') worth.push(`${pr.label}: ${o.label.toLowerCase()}`);
  }
  const dismissed = state.feedback.find((f) => f.candidateId === p.id && f.jobId === job.id);

  return (
    <div className="ow-container ow-container--narrow">
      <div className="ow-pagehead">
        <Link to={`/jobs/${job.id}`} className="ow-backlink">
          ← Back to the job
        </Link>
      </div>
      <BlockStack gap="500">
        <div className="ow-sheet">
          <BlockStack gap="500">
            <BlockStack gap="200">
              <span className={`ow-matchlabel ow-matchlabel--${tier}`}>{MATCH_TIER_LABEL[tier]}</span>
              <Text as="h1" variant="heading2xl">
                Why this matches
              </Text>
              <Text as="p" tone="subdued">
                <Link to={`/jobs/${job.id}`}>{job.title}</Link> at <Link to={`/companies/${employer.id}`}>{employer.name}</Link> · {salary(job)} · {job.location}
              </Text>
            </BlockStack>

            {dismissed && (
              <Banner tone="info" title="Hidden from your matches">
                <p>
                  You said this one is not for you{dismissed.reasons.length ? ` (${dismissed.reasons.join(', ').toLowerCase()})` : ''}.{' '}
                  <Button variant="plain" onClick={() => dispatch({ type: 'undoDismiss', jobId: job.id })}>
                    Undo
                  </Button>
                </p>
              </Banner>
            )}

            <Section title="Career">
              {skillsTotal > 0 && <Fact tone={skills > 0 ? 'ok' : 'info'} text={skills > 0 ? `${skills} of ${skillsTotal} skills and strengths align` : `None of the ${skillsTotal} listed skills and strengths are on your profile yet`} detail={skills > 0 ? [...result.skillsMatched, ...result.strengthsMatched].join(', ') : undefined} />}
              <Fact tone="info" text={`${EXPERIENCE_LEVEL_LABEL[job.experienceLevel]} role`} />
              {p.desiredSalaryMin != null && <Fact tone={hourly >= p.desiredSalaryMin ? 'ok' : 'warn'} text={hourly >= p.desiredSalaryMin ? `Pay meets your $${p.desiredSalaryMin}/hr minimum` : `Pay starts below your $${p.desiredSalaryMin}/hr minimum`} detail={salary(job)} />}
            </Section>

            {prefs.length > 0 && (
              <Section title="Work">
                {byState(prefs).map((r) => (
                  <Fact key={r.id} tone={r.state === 'confirmed' ? 'ok' : r.state === 'review' ? 'ok' : r.state === 'needsConfirmation' ? 'info' : 'warn'} text={r.state === 'confirmed' ? r.label : `${r.label}: ${r.state === 'needsConfirmation' ? 'not stated' : r.state === 'review' ? 'close to what you prefer' : 'differs'}`} detail={r.state === 'confirmed' ? undefined : r.explanation} />
                ))}
              </Section>
            )}

            {needs.length > 0 && (
              <Section title="Accessibility">
                {byState(needs).map((r) => (
                  <Fact key={r.id} tone={NEED_STATE[r.state][1]} text={`${r.label}: ${NEED_STATE[r.state][0].toLowerCase()}`} detail={r.state === 'confirmed' ? undefined : r.explanation} action={r.askable ? <AskEmployerButton job={job} featureId={r.id} /> : undefined} />
                ))}
              </Section>
            )}

            {worth.length > 0 && (
              <Section title="Worth knowing">
                {worth.map((w) => (
                  <Fact key={w} tone="info" text={w} />
                ))}
              </Section>
            )}

            <Section title="Application">
              <Fact tone="ok" text={p.resumeFileName ? 'Your résumé is on file and can be tailored to this job' : 'No résumé needed; your profile goes instead'} />
              <Fact tone={job.screeningQuestions.length ? 'info' : 'ok'} text={job.screeningQuestions.length ? `${job.screeningQuestions.length} employer question${job.screeningQuestions.length === 1 ? '' : 's'} to answer` : 'No employer questions'} />
              <Fact tone="info" text={`Hiring in ${job.hiringStages.length} step${job.hiringStages.length === 1 ? '' : 's'}: ${job.hiringStages.map((s) => s.name.toLowerCase()).join(' → ')}`} detail={job.decisionTimeframe || undefined} />
            </Section>

            <div className="ow-actionbar">
              <div className="ow-actionbar__row">
                <InlineStack gap="200" blockAlign="center" wrap>
                  <SaveButton jobId={job.id} size="large" />
                  {!dismissed && (
                    <Button size="large" onClick={() => setPicking((v) => !v)} pressed={picking}>
                      Not for me
                    </Button>
                  )}
                </InlineStack>
                <div className="ow-actionbar__primary">
                  <QuickApplyButton job={job} fullWidth />
                </div>
              </div>
            </div>

            {picking && !dismissed && (
              <div className="ow-why">
                <BlockStack gap="300">
                  <Text as="p" fontWeight="semibold">
                    Why not? Optional, and it only tunes your matches.
                  </Text>
                  <OptionGrid label="Reasons" multiple options={REASONS.map((r) => ({ value: r, label: r }))} value={reasons} onChange={(v) => setReasons(v as string[])} />
                  <InlineStack gap="200">
                    <Button variant="primary" onClick={() => { dispatch({ type: 'dismissJob', jobId: job.id, reasons }); setPicking(false); }}>
                      Hide this job
                    </Button>
                    <Button variant="plain" onClick={() => setPicking(false)}>
                      Cancel
                    </Button>
                  </InlineStack>
                </BlockStack>
              </div>
            )}
          </BlockStack>
        </div>
      </BlockStack>
    </div>
  );
}
