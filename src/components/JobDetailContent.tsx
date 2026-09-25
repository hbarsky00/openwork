import { Badge, Banner, BlockStack, InlineStack, List, Text } from '@shopify/polaris';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ACCESS_FEATURES, HIRING_OPTION_BY_ID, PHYSICAL_REQUIREMENTS } from '../lib/access';
import { DIMENSIONS, optionOf } from '../lib/dimensions';
import { EMPLOYMENT_TYPE_LABEL, WORK_LOCATION_LABEL, postedAgo, salary } from '../lib/format';
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
const KEY_DIMENSIONS = ['workLocation', 'schedulePredictability', 'noise', 'meetingFrequency', 'instructions', 'socialInteraction'] as const;

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

        <InlineStack gap="300" blockAlign="start" wrap={false}>
          <EmployerLogo employer={employer} size={pane ? 48 : 56} />
          <BlockStack gap="100">
            <Text as="h1" variant={pane ? 'headingXl' : 'heading2xl'}>
              {job.title}
            </Text>
            <Text as="p" variant="bodyMd">
              <Link to={`/companies/${employer.id}`}>{employer.name}</Link> · {job.location}
            </Text>
            <InlineStack gap="150" blockAlign="center" wrap>
              <Badge>{salary(job)}</Badge>
              <Badge>{WORK_LOCATION_LABEL[job.environment.workLocation ?? ''] ?? 'On-site'}</Badge>
              <Badge>{EMPLOYMENT_TYPE_LABEL[job.employmentType]}</Badge>
              <VerificationBadge level={employer.verification} />
              <Text as="span" variant="bodySm" tone="subdued">
                {postedAgo(job.postedOn)} · {applicants} applicant{applicants === 1 ? '' : 's'} · replies {employer.typicalResponse}
              </Text>
            </InlineStack>
          </BlockStack>
        </InlineStack>

        {/* In the split view the apply bar pins to the top of the pane. The
            full page has its own sidebar card instead. */}
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

        {result && <WhyThisCouldWork result={result} job={job} />}

        <BlockStack gap="200">
          <Text as="h2" variant="headingLg">
            About the job
          </Text>
          <Text as="p" variant="bodyLg">
            {job.summary}
          </Text>
          {job.tasks.length > 0 && (
            <List type="number">
              {job.tasks.map((t) => (
                <List.Item key={t}>{t}</List.Item>
              ))}
            </List>
          )}
        </BlockStack>

        <BlockStack gap="200">
          <Text as="h2" variant="headingLg">
            What you need
          </Text>
          <List type="bullet">
            {job.essentialRequirements.map((r) => (
              <List.Item key={r}>{r}</List.Item>
            ))}
          </List>
          {job.preferredRequirements.length > 0 && (
            <Text as="p" tone="subdued">
              Nice to have: {job.preferredRequirements.join(', ')}.
            </Text>
          )}
        </BlockStack>

        <BlockStack gap="200">
          <Text as="h2" variant="headingLg">
            Job details
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
                <dt>Tools</dt>
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

        <BlockStack gap="200">
          <Text as="h2" variant="headingLg">
            What {employer.name} provides
          </Text>
          {provided.length === 0 ? (
            <Text as="p" tone="subdued">
              {employer.name} has not told us yet.
            </Text>
          ) : (
            <List type="bullet">
              {provided.map(({ f, ev }) => (
                <List.Item key={f.id}>
                  {f.label}
                  {ev!.note ? <Text as="span" tone="subdued">{` — ${ev!.note}`}</Text> : null}
                </List.Item>
              ))}
            </List>
          )}
          {onRequest.length > 0 && (
            <Text as="p" variant="bodySm" tone="subdued">
              Ask about: {onRequest.map((x) => x.f.label.toLowerCase()).join(', ')}.
            </Text>
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
        </BlockStack>

        <BlockStack gap="200">
          <Text as="h2" variant="headingLg">
            How hiring works
          </Text>
          <List type="number">
            {job.hiringStages.map((s) => (
              <List.Item key={s.id}>
                <strong>{s.name}</strong>
                {s.duration ? ` (${s.duration})` : ''}. {s.description}
              </List.Item>
            ))}
          </List>
          <Text as="p" variant="bodySm" tone="subdued">
            {job.decisionTimeframe}
            {job.hiringOptions.length > 0 ? ` You can ask for ${job.hiringOptions.slice(0, 3).map((h) => HIRING_OPTION_BY_ID[h].label.toLowerCase()).join(', ')}${job.hiringOptions.length > 3 ? ' and more' : ''}.` : ''}
          </Text>
        </BlockStack>

        <BlockStack gap="100">
          <Text as="h2" variant="headingLg">
            About {employer.name}
          </Text>
          <Text as="p">{employer.about}</Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {employer.industry} · {employer.size} · {employer.headquarters} · <Link to={`/companies/${employer.id}`}>Company page</Link>
          </Text>
        </BlockStack>
      </BlockStack>
    </div>
  );
}
