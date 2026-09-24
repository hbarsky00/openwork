import { Badge, Banner, BlockStack, Box, Button, Card, Divider, InlineGrid, InlineStack, List, Text } from '@shopify/polaris';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ACCESS_FEATURES, ACCESS_FEATURE_BY_ID, HIRING_OPTION_BY_ID, PHYSICAL_REQUIREMENTS, TECH_A11Y } from '../lib/access';
import { DIMENSIONS, optionOf } from '../lib/dimensions';
import { EMPLOYMENT_TYPE_LABEL, WORK_LOCATION_LABEL, longDate, postedAgo, salary } from '../lib/format';
import { matchJob } from '../lib/match';
import type { Job } from '../lib/types';
import { useMyApplication, useStore } from '../state/store';
import { AskEmployerButton } from './AskEmployerModal';
import { EmployerLogo } from './EmployerLogo';
import { evidenceState } from './EvidenceLine';
import { SaveButton } from './SaveButton';
import { StateSymbol } from './Signal';
import { VerificationBadge } from './VerificationBadge';
import { WhyThisCouldWork } from './WhyThisCouldWork';

interface Props {
  job: Job;
  pane?: boolean;
}

/**
 * Job page in the order a job seeker reads it: what and how much → Apply →
 * what you'd do → what it takes → how the workplace works, with evidence →
 * how hiring works → the employer. One column, no jump nav, no side quests.
 */
export function JobDetailContent({ job, pane = false }: Props) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const employer = state.employers.find((e) => e.id === job.employerId);
  const profile = state.role === 'candidate' ? state.candidate : null;
  const hasPassport = !!profile && (Object.keys(profile.accessNeeds).length > 0 || Object.keys(profile.workPreferences).length > 0);
  const result = profile && employer && hasPassport ? matchJob(profile, job, employer) : null;
  const myApplication = useMyApplication(job.id);

  useEffect(() => {
    if (state.role === 'candidate') dispatch({ type: 'viewJob', jobId: job.id });
  }, [job.id, state.role, dispatch]);

  if (!employer) return null;
  const closed = job.status !== 'published';
  const apply = () => navigate(`/jobs/${job.id}/apply`);

  // Facts the employer actually answered. Gaps are shown once, as a count, with one Ask button.
  const workFacts: { label: string; value: string }[] = [];
  for (const d of DIMENSIONS) {
    const o = optionOf(d.id, job.environment[d.id] ?? null);
    if (o) workFacts.push({ label: d.label, value: o.employerLabel });
  }
  for (const p of PHYSICAL_REQUIREMENTS) {
    const o = p.options.find((x) => x.value === job.physical[p.id]);
    if (o && o.value !== 'none') workFacts.push({ label: p.label, value: o.label });
  }

  const accessRows = ACCESS_FEATURES.filter((f) => f.resolve.kind === 'evidence')
    .map((f) => ({ f, ev: job.accessibility[f.id] ?? employer.accessibility[f.id] }))
    .filter((x) => x.ev);
  const unknownCount = ACCESS_FEATURES.filter((f) => f.resolve.kind === 'evidence' && f.filter && !(job.accessibility[f.id] ?? employer.accessibility[f.id])).length;
  const answered = state.questions.filter((q) => q.jobId === job.id && q.answer);

  const actions = (
    <InlineStack gap="200">
      {myApplication ? (
        <Button url={`/applications/${myApplication.id}`} variant="primary" size="large">
          View your application
        </Button>
      ) : closed ? null : (
        <Button variant="primary" size="large" onClick={apply}>
          Apply now
        </Button>
      )}
      <SaveButton jobId={job.id} size="large" />
    </InlineStack>
  );

  return (
    <div className={pane ? 'ow-jobdetail ow-jobdetail--pane' : 'ow-jobdetail'}>
      <BlockStack gap="500">
        <BlockStack gap="300">
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
              <InlineStack gap="200" blockAlign="center" wrap>
                <Text as="span" variant="headingMd">
                  {salary(job)}
                </Text>
                <Badge>{WORK_LOCATION_LABEL[job.environment.workLocation ?? ''] ?? 'On-site'}</Badge>
                <Badge>{EMPLOYMENT_TYPE_LABEL[job.employmentType]}</Badge>
                <VerificationBadge level={employer.verification} />
                <Text as="span" variant="bodySm" tone="subdued">
                  {postedAgo(job.postedOn)}
                </Text>
              </InlineStack>
            </BlockStack>
          </InlineStack>
          {actions}
          {job.screeningQuestions.length > 0 && !myApplication && !closed && (
            <Text as="p" variant="bodySm" tone="subdued">
              Applying takes a few minutes: your résumé and {job.screeningQuestions.length} short question{job.screeningQuestions.length === 1 ? '' : 's'} from {employer.name}.
            </Text>
          )}
        </BlockStack>

        <Divider />

        {result && <WhyThisCouldWork result={result} job={job} />}

        <BlockStack gap="300">
          <Text as="h2" variant="headingLg">
            About the job
          </Text>
          <Text as="p" variant="bodyLg">
            {job.summary}
          </Text>
          {job.environmentNotes.schedulePredictability && <Text as="p">{job.environmentNotes.schedulePredictability}</Text>}
          {job.tasks.length > 0 && (
            <BlockStack gap="100">
              <Text as="h3" variant="headingSm">
                A typical day
              </Text>
              <List type="number">
                {job.tasks.map((t) => (
                  <List.Item key={t}>{t}</List.Item>
                ))}
              </List>
            </BlockStack>
          )}
        </BlockStack>

        <BlockStack gap="300">
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
              Helpful but not required: {job.preferredRequirements.join(' · ')}
            </Text>
          )}
        </BlockStack>

        <BlockStack gap="300">
          <Text as="h2" variant="headingLg">
            How this job works
          </Text>
          <InlineGrid columns={{ xs: 1, sm: 2 }} gap="200">
            {workFacts.map((f) => (
              <Box key={f.label} padding="300" background="bg-surface-secondary" borderRadius="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  {f.label}
                </Text>
                <Text as="p" fontWeight="semibold">
                  {f.value}
                </Text>
              </Box>
            ))}
          </InlineGrid>
          {job.technology.length > 0 && (
            <BlockStack gap="100">
              <Text as="h3" variant="headingSm">
                Software you would use
              </Text>
              {job.technology.map((t) => {
                const bits = TECH_A11Y.map((a) => ({ a, st: evidenceState(t.accessibility[a.id]) })).filter((x) => x.st !== 'needsConfirmation');
                return (
                  <InlineStack key={t.name} gap="200" blockAlign="center" wrap>
                    <Text as="span" fontWeight="semibold">
                      {t.name}
                    </Text>
                    {bits.length === 0 ? (
                      <Text as="span" variant="bodySm" tone="subdued">
                        accessibility not stated
                      </Text>
                    ) : (
                      bits.map(({ a, st }) => (
                        <InlineStack key={a.id} gap="100" blockAlign="center">
                          <StateSymbol state={st} />
                          <Text as="span" variant="bodySm">
                            {a.label}
                          </Text>
                        </InlineStack>
                      ))
                    )}
                  </InlineStack>
                );
              })}
            </BlockStack>
          )}
        </BlockStack>

        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="baseline" wrap gap="200">
            <Text as="h2" variant="headingLg">
              Accessibility at {employer.name}
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              Employer-confirmed, with dates
            </Text>
          </InlineStack>
          {accessRows.length === 0 ? (
            <Text as="p" tone="subdued">
              This employer has not answered any accessibility questions yet.
            </Text>
          ) : (
            <InlineGrid columns={{ xs: 1, sm: 2 }} gap="200">
              {accessRows.map(({ f, ev }) => (
                <InlineStack key={f.id} gap="200" blockAlign="start" wrap={false}>
                  <StateSymbol state={evidenceState(ev)} />
                  <BlockStack gap="0">
                    <Text as="span" fontWeight="medium">
                      {f.label}
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {ev!.status === 'confirmed' ? 'Confirmed' : ev!.status === 'contact' ? 'Contact employer' : 'Not available'} · {longDate(ev!.confirmedOn)}
                      {ev!.note ? ` — ${ev!.note}` : ''}
                    </Text>
                  </BlockStack>
                </InlineStack>
              ))}
            </InlineGrid>
          )}
          {unknownCount > 0 && (
            <InlineStack gap="300" blockAlign="center" wrap>
              <Text as="p" variant="bodySm" tone="subdued">
                {unknownCount} other question{unknownCount === 1 ? '' : 's'} not answered yet.
              </Text>
              <AskEmployerButton job={job} featureId={null} />
            </InlineStack>
          )}
          {answered.length > 0 && (
            <BlockStack gap="100">
              {answered.map((q) => (
                <Text key={q.id} as="p" variant="bodySm">
                  <strong>Q:</strong> {q.text} <strong>A:</strong> {q.answer}
                </Text>
              ))}
            </BlockStack>
          )}
        </BlockStack>

        <BlockStack gap="300">
          <Text as="h2" variant="headingLg">
            How hiring works
          </Text>
          <List type="number">
            {job.hiringStages.map((s) => (
              <List.Item key={s.id}>
                <strong>{s.name}</strong>
                {s.duration ? ` (${s.duration})` : ''} — {s.description}
              </List.Item>
            ))}
          </List>
          {job.hiringOptions.length > 0 && (
            <Text as="p" variant="bodySm">
              Available if you ask: {job.hiringOptions.map((h) => HIRING_OPTION_BY_ID[h].label.toLowerCase()).join(' · ')}.
            </Text>
          )}
          <Text as="p" variant="bodySm" tone="subdued">
            Need something for the interview? {job.accommodationRoute}
          </Text>
        </BlockStack>

        <BlockStack gap="200">
          <Text as="h2" variant="headingLg">
            About {employer.name}
          </Text>
          <Text as="p">{employer.about}</Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {employer.industry} · {employer.size} · {employer.headquarters} · <Link to={`/companies/${employer.id}`}>Company page</Link>
          </Text>
        </BlockStack>

        {!closed && !myApplication && (
          <Card>
            <InlineStack align="space-between" blockAlign="center" wrap gap="300">
              <Text as="p" fontWeight="semibold">
                {job.title} · {salary(job)}
              </Text>
              {actions}
            </InlineStack>
          </Card>
        )}
      </BlockStack>
    </div>
  );
}

export { ACCESS_FEATURE_BY_ID };
