import { Banner, BlockStack, InlineGrid, InlineStack, List, Text } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ACCESS_FEATURES, EVIDENCE_SOURCE_LABEL, HIRING_OPTION_BY_ID, PHYSICAL_REQUIREMENTS } from '../lib/access';
import { DIMENSIONS, optionOf } from '../lib/dimensions';
import { EMPLOYMENT_TYPE_LABEL, WORK_LOCATION_LABEL, longDate, postedAgo, salary } from '../lib/format';
import { matchJob } from '../lib/match';
import type { Job } from '../lib/types';
import { useApplicantCount, useMyApplication, useStore } from '../state/store';
import { AskEmployerButton } from './AskEmployerModal';
import { EmployerLogo } from './EmployerLogo';
import { QuickApplyButton, applyHint } from './QuickApplyButton';
import { SaveButton } from './SaveButton';
import { VerificationBadge } from './VerificationBadge';
import { WhyThisCouldWork } from './WhyThisCouldWork';

interface Props {
  job: Job;
  pane?: boolean;
}

/** The six facts a job seeker actually asks about. The rest is noise. */
const KEY_DIMENSIONS = ['schedulePredictability', 'meetingFrequency', 'collaboration', 'customerInteraction', 'taskSwitching', 'feedbackStyle', 'instructions', 'noise'] as const;

/**
 * Job page in the order a job seeker reads it. Apply stays on screen.
 * Plain sentences and short lists — no evidence tables, no symbols, no dates
 * on every line.
 */
export function JobDetailContent({ job, pane = false }: Props) {
  const { state, dispatch } = useStore();
  const employer = state.employers.find((e) => e.id === job.employerId);
  const profile = state.role === 'candidate' ? state.candidate : null;
  const hasPassport = !!profile && (Object.keys(profile.accessNeeds).length > 0 || Object.keys(profile.workPreferences).length > 0);
  const result = profile && employer && hasPassport ? matchJob(profile, job, employer) : null;
  const myApplication = useMyApplication(job.id);
  const applicants = useApplicantCount(job.id);

  useEffect(() => {
    if (state.role === 'candidate') dispatch({ type: 'viewJob', jobId: job.id });
  }, [job.id, state.role, dispatch]);

  if (!employer) return null;
  const closed = job.status !== 'published';

  const details: { label: string; value: string }[] = [];
  for (const id of KEY_DIMENSIONS) {
    const d = DIMENSIONS.find((x) => x.id === id);
    const o = d && optionOf(d.id, job.environment[d.id] ?? null);
    if (d && o) details.push({ label: d.label, value: o.employerLabel });
  }
  for (const p of PHYSICAL_REQUIREMENTS) {
    const o = p.options.find((x) => x.value === job.physical[p.id]);
    if (o && o.value !== 'none') details.push({ label: p.label, value: o.label });
  }

  // Accessibility: what the employer says it provides, in plain words.
  const evidence = ACCESS_FEATURES.filter((f) => f.resolve.kind === 'evidence').map((f) => ({ f, ev: job.accessibility[f.id] ?? employer.accessibility[f.id] }));
  const provided = evidence.filter((x) => x.ev?.status === 'confirmed');
  const onRequest = evidence.filter((x) => x.ev?.status === 'contact');
  const answered = state.questions.filter((q) => q.jobId === job.id && q.answer);

  const verified = provided.slice(0, 6);
  return (
    <div className={pane ? 'ow-jobdetail ow-jobdetail--pane' : 'ow-jobdetail'}>
      <BlockStack gap="500">
        {closed && (
          <Banner tone="warning" title="This job is no longer accepting applications">
            <p>
              <Link to={`/companies/${employer.id}`}>See other jobs at {employer.name}</Link>.
            </p>
          </Banner>
        )}

        <div className={pane ? '' : 'ow-sheet'}>
          <BlockStack gap="400">
            <InlineStack gap="400" blockAlign="start" wrap={false}>
              <EmployerLogo employer={employer} size={pane ? 48 : 64} />
              <BlockStack gap="200">
                <Text as={pane ? 'h2' : 'h1'} variant={pane ? 'headingXl' : 'heading2xl'}>
                  {job.title}
                </Text>
                <Text as="p" tone="subdued">
                  <Link to={`/companies/${employer.id}`}>{employer.name}</Link> • {job.location}
                </Text>
                <InlineStack gap="200" blockAlign="center" wrap>
                  <Text as="p" fontWeight="medium">
                    {salary(job)} · {WORK_LOCATION_LABEL[job.environment.workLocation ?? ''] ?? 'On-site'} · {EMPLOYMENT_TYPE_LABEL[job.employmentType]}
                  </Text>
                  <VerificationBadge level={employer.verification} />
                  <Text as="span" variant="bodySm" tone="subdued">
                    {postedAgo(job.postedOn)} · {applicants} applicant{applicants === 1 ? '' : 's'}
                  </Text>
                </InlineStack>
              </BlockStack>
            </InlineStack>
            {pane && (
              <div className="ow-applybar">
                <QuickApplyButton job={job} />
                <SaveButton jobId={job.id} size="large" />
                {!myApplication && !closed && (
                  <Text as="span" variant="bodySm" tone="subdued">
                    {applyHint(job, !!profile)}
                  </Text>
                )}
              </div>
            )}
          </BlockStack>
        </div>

        {verified.length > 0 && (
          <section className="ow-verif" aria-labelledby="verif">
            <BlockStack gap="400">
              <BlockStack gap="050">
                <Text as="h2" variant="headingLg" id="verif">
                  Accessibility verification
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {result ? 'Verified practices matching your profile' : `What ${employer.name} has confirmed, with the source`}
                </Text>
              </BlockStack>
              <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
                {verified.map(({ f, ev }) => (
                  <div key={f.id} className="ow-evcard">
                    <CheckCircleIcon />
                    <div>
                      <Text as="h3" variant="headingSm">
                        {f.label}
                      </Text>
                      {ev!.note && (
                        <Text as="p" variant="bodySm" tone="subdued">
                          {ev!.note}
                        </Text>
                      )}
                      <span className="ow-evcard__source">
                        Source: {EVIDENCE_SOURCE_LABEL[ev!.source]} ({longDate(ev!.confirmedOn)})
                      </span>
                    </div>
                  </div>
                ))}
              </InlineGrid>
              {(provided.length > verified.length || onRequest.length > 0) && (
                <Text as="p" variant="bodySm" tone="subdued">
                  {provided.length > verified.length ? `Also confirmed: ${provided.slice(6).map((x) => x.f.label.toLowerCase()).join(', ')}. ` : ''}
                  {onRequest.length > 0 ? `Ask about: ${onRequest.map((x) => x.f.label.toLowerCase()).join(', ')}.` : ''}
                </Text>
              )}
            </BlockStack>
          </section>
        )}

        {result && <div id="why"><WhyThisCouldWork result={result} job={job} /></div>}

        <div className={pane ? '' : 'ow-sheet'}>
          <BlockStack gap="600">
            <BlockStack gap="200">
              <Text as="h2" variant="headingLg">
                What you’ll actually do
              </Text>
              <Text as="p" variant="bodyLg">
                {job.summary}
              </Text>
              {job.tasks.length > 0 && (
                <List type="bullet">
                  {job.tasks.map((t) => (
                    <List.Item key={t}>{t}</List.Item>
                  ))}
                </List>
              )}
            </BlockStack>

            <BlockStack gap="200">
              <Text as="h2" variant="headingLg">
                Skills and experience
              </Text>
              <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                <BlockStack gap="100">
                  <Text as="h3" variant="headingSm">
                    Required
                  </Text>
                  <List type="bullet">
                    {job.essentialRequirements.map((r) => (
                      <List.Item key={r}>{r}</List.Item>
                    ))}
                  </List>
                </BlockStack>
                {job.preferredRequirements.length > 0 && (
                  <BlockStack gap="100">
                    <Text as="h3" variant="headingSm">
                      Preferred
                    </Text>
                    <List type="bullet">
                      {job.preferredRequirements.map((r) => (
                        <List.Item key={r}>{r}</List.Item>
                      ))}
                    </List>
                  </BlockStack>
                )}
              </InlineGrid>
            </BlockStack>

            <BlockStack gap="200">
              <Text as="h2" variant="headingLg">
                How this job works
              </Text>
              <dl className="ow-details">
                {details.map((f) => (
                  <div key={f.label} className="ow-details__row">
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
                {job.technology.length > 0 && (
                  <div className="ow-details__row">
                    <dt>Technology</dt>
                    <dd>{job.technology.map((t) => t.name).join(', ')}</dd>
                  </div>
                )}
                {job.environmentNotes.schedulePredictability && (
                  <div className="ow-details__row">
                    <dt>Hours</dt>
                    <dd>{job.environmentNotes.schedulePredictability}</dd>
                  </div>
                )}
              </dl>
            </BlockStack>

            {provided.length === 0 && (
              <BlockStack gap="200">
                <Text as="h2" variant="headingLg">
                  Workplace accessibility
                </Text>
                <Text as="p" tone="subdued">
                  {employer.name} has not provided accessibility information yet. Not provided is not the same as not accessible.
                </Text>
              </BlockStack>
            )}
            {answered.map((q) => (
              <Text key={q.id} as="p" variant="bodySm">
                <strong>Q:</strong> {q.text} <strong>A:</strong> {q.answer}
              </Text>
            ))}
            <InlineStack gap="300" blockAlign="center" wrap>
              <Text as="span" variant="bodySm" tone="subdued">
                Need something not listed?
              </Text>
              <AskEmployerButton job={job} featureId={null} />
            </InlineStack>

            <BlockStack gap="200">
              <Text as="h2" variant="headingLg">
                Hiring process
              </Text>
              <ol className="ow-stages">
                {job.hiringStages.map((s, i) => (
                  <li key={s.id}>
                    <span className="ow-stages__n" aria-hidden="true">{i + 1}</span>
                    <div>
                      <Text as="p" fontWeight="semibold">
                        {s.name}
                        {s.duration ? <Text as="span" tone="subdued" variant="bodySm">{` · ${s.duration}`}</Text> : null}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {s.description}
                      </Text>
                    </div>
                  </li>
                ))}
              </ol>
              <Text as="p" variant="bodySm" tone="subdued">
                {job.decisionTimeframe}
                {job.hiringOptions.length > 0 ? ` Available on request: ${job.hiringOptions.slice(0, 4).map((h) => HIRING_OPTION_BY_ID[h].label.toLowerCase()).join(', ')}${job.hiringOptions.length > 4 ? ' and more' : ''}.` : ''}
              </Text>
            </BlockStack>
          </BlockStack>
        </div>
      </BlockStack>
    </div>
  );
}
