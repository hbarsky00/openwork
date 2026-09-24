import { Badge, Banner, BlockStack, Box, Button, Card, Divider, InlineGrid, InlineStack, List, Modal, Tag, Text, TextField } from '@shopify/polaris';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ACCESS_FEATURE_BY_ID } from '../lib/access';
import { optionOf } from '../lib/dimensions';
import { EMPLOYMENT_TYPE_LABEL, EXPERIENCE_LEVEL_LABEL, WORK_LOCATION_LABEL, longDate, postedAgo, salary } from '../lib/format';
import { matchJob } from '../lib/match';
import type { Job } from '../lib/types';
import { useMyApplication, useStore } from '../state/store';
import { EmployerLogo } from './EmployerLogo';
import { HiringProcess } from './HiringProcess';
import { JobAccessibilitySummary } from './JobAccessibilitySummary';
import { JobCard } from './JobCard';
import { CommunicationRequirements, PhysicalRequirements, TechnologyAccessibility } from './JobRequirements';
import { SaveButton } from './SaveButton';
import { VerificationBadge } from './VerificationBadge';
import { WhyThisCouldWork } from './WhyThisCouldWork';
import { WorkEnvironmentProfile } from './WorkEnvironmentProfile';

interface Props {
  job: Job;
  pane?: boolean;
}

export function JobDetailContent({ job, pane = false }: Props) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const employer = state.employers.find((e) => e.id === job.employerId);
  const profile = state.role === 'candidate' ? state.candidate : null;
  const result = profile && employer ? matchJob(profile, job, employer) : null;
  const myApplication = useMyApplication(job.id);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reported, setReported] = useState(false);

  useEffect(() => {
    if (state.role === 'candidate') dispatch({ type: 'viewJob', jobId: job.id });
  }, [job.id, state.role, dispatch]);

  if (!employer) return null;
  const closed = job.status !== 'published';
  const schedule = optionOf('schedulePredictability', job.environment.schedulePredictability ?? null);
  const answered = state.questions.filter((q) => q.jobId === job.id && q.answer);

  const applyAction = () => {
    if (state.role !== 'candidate') return navigate(`/signin?next=${encodeURIComponent(`/jobs/${job.id}/apply`)}&reason=apply`);
    navigate(`/jobs/${job.id}/apply`);
  };

  const similar = state.jobs.filter((j) => j.id !== job.id && j.status === 'published' && (j.family === job.family || j.employerId === job.employerId)).slice(0, 3);

  const actions = (
    <InlineStack gap="200">
      {myApplication ? (
        <Button url={`/applications/${myApplication.id}`} variant="primary">
          View your application
        </Button>
      ) : closed ? null : (
        <Button variant="primary" onClick={applyAction}>
          Apply
        </Button>
      )}
      <SaveButton jobId={job.id} />
    </InlineStack>
  );

  return (
    <BlockStack gap={pane ? '400' : '600'}>
      <Box padding={pane ? '500' : '0'}>
        <BlockStack gap="400">
          {closed && (
            <Banner tone="warning" title="This job is no longer accepting applications">
              <p>Similar jobs are listed below.</p>
            </Banner>
          )}
          {state.role === 'visitor' && (
            <Banner tone="info">
              <p>
                <Link to={`/signin?next=${encodeURIComponent(`/jobs/${job.id}`)}`}>Sign in</Link> or <Link to="/signup">create an account</Link> to compare this job with what you need — privately.
              </p>
            </Banner>
          )}
          <InlineStack gap="400" blockAlign="start" wrap={false}>
            <EmployerLogo employer={employer} size={pane ? 48 : 64} />
            <BlockStack gap="200">
              <Text as="h1" variant={pane ? 'headingXl' : 'heading2xl'}>
                {job.title}
              </Text>
              <InlineStack gap="200" blockAlign="center" wrap>
                <Link to={`/companies/${employer.id}`}>{employer.name}</Link>
                <Text as="span" tone="subdued">·</Text>
                <Text as="span">{job.location}</Text>
                <VerificationBadge level={employer.verification} />
              </InlineStack>
            </BlockStack>
          </InlineStack>

          <InlineStack gap="300" wrap blockAlign="center">
            <Text as="span" variant="headingMd">
              {salary(job)}
            </Text>
            <Badge>{WORK_LOCATION_LABEL[job.environment.workLocation ?? ''] ?? 'Location not stated'}</Badge>
            <Badge>{EMPLOYMENT_TYPE_LABEL[job.employmentType]}</Badge>
            <Badge>{EXPERIENCE_LEVEL_LABEL[job.experienceLevel]}</Badge>
            {schedule && <Badge>{schedule.employerLabel}</Badge>}
            <Text as="span" variant="bodySm" tone="subdued">
              {postedAgo(job.postedOn)}
            </Text>
          </InlineStack>
          {job.environmentNotes.schedulePredictability && (
            <Text as="p" tone="subdued">
              Schedule: {job.environmentNotes.schedulePredictability}
            </Text>
          )}
          {actions}
          {!pane && (
            <nav aria-label="On this page">
              <ul className="ow-jump">
                {[
                  profile ? ['why', 'Why this could work'] : null,
                  ['tasks', 'What you’ll do'],
                  ['physical', 'Physical'],
                  ['communication', 'Communication'],
                  ['technology', 'Software'],
                  ['how-it-works', 'Environment'],
                  ['accessibility', 'Accessibility'],
                  ['hiring', 'Hiring process'],
                ]
                  .filter((x): x is [string, string] => !!x)
                  .map(([href, label]) => (
                    <li key={href}>
                      <a href={`#${href}`}>{label}</a>
                    </li>
                  ))}
              </ul>
            </nav>
          )}
        </BlockStack>
      </Box>

      {pane && <Divider />}

      <Box paddingInline={pane ? '500' : '0'} paddingBlockEnd={pane ? '500' : '0'}>
        <BlockStack gap={pane ? '400' : '600'}>
          {profile && result && <WhyThisCouldWork result={result} job={job} />}

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg" id="tasks">
                What you’ll actually do
              </Text>
              <Text as="p" variant="bodyLg">
                {job.summary}
              </Text>
              {job.tasks.length > 0 && (
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    A typical day
                  </Text>
                  <List type="number">
                    {job.tasks.map((t) => (
                      <List.Item key={t}>{t}</List.Item>
                    ))}
                  </List>
                </BlockStack>
              )}
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Essential — needed to do the job
                </Text>
                <List type="bullet">
                  {job.essentialRequirements.map((r) => (
                    <List.Item key={r}>{r}</List.Item>
                  ))}
                </List>
              </BlockStack>
              {job.preferredRequirements.length > 0 && (
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Helpful but not required
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Apply even if you don’t have these.
                  </Text>
                  <List type="bullet">
                    {job.preferredRequirements.map((r) => (
                      <List.Item key={r}>{r}</List.Item>
                    ))}
                  </List>
                </BlockStack>
              )}
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Strengths and skills this job uses
                </Text>
                <InlineStack gap="200" wrap>
                  {job.strengthsUsed.map((s) => (
                    <Tag key={`st-${s}`}>{result?.strengthsMatched.includes(s) ? `${s} ✓` : s}</Tag>
                  ))}
                  {job.skills.map((s) => (
                    <Tag key={`sk-${s}`}>{result?.skillsMatched.includes(s) ? `${s} ✓` : s}</Tag>
                  ))}
                </InlineStack>
                {result && (result.skillsMatched.length > 0 || result.strengthsMatched.length > 0) && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    ✓ marks ones already on your passport.
                  </Text>
                )}
              </BlockStack>
            </BlockStack>
          </Card>

          <InlineGrid columns={{ xs: 1, lg: pane ? 1 : 2 }} gap={pane ? '400' : '600'} alignItems="start">
            <PhysicalRequirements job={job} />
            <CommunicationRequirements job={job} />
          </InlineGrid>
          <InlineGrid columns={{ xs: 1, lg: pane ? 1 : 2 }} gap={pane ? '400' : '600'} alignItems="start">
            <TechnologyAccessibility job={job} />
            <WorkEnvironmentProfile job={job} heading="Work environment" />
          </InlineGrid>
          <JobAccessibilitySummary job={job} employer={employer} compact={pane} />
          <HiringProcess job={job} onRequestAccommodation={closed ? undefined : applyAction} />

          {job.supportAvailable.length > 0 && (
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">
                  Support available
                </Text>
                <List type="bullet">
                  {job.supportAvailable.map((s) => (
                    <List.Item key={s}>{s}</List.Item>
                  ))}
                </List>
                <Text as="p" variant="bodySm" tone="subdued">
                  Accessibility contact: {employer.accessibilityContact}
                </Text>
              </BlockStack>
            </Card>
          )}

          {answered.length > 0 && (
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">
                  Questions candidates have asked
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Answered by the employer. Names are never shown.
                </Text>
                {answered.map((q) => (
                  <BlockStack key={q.id} gap="050">
                    <Text as="p" fontWeight="semibold">
                      {q.featureId ? `${ACCESS_FEATURE_BY_ID[q.featureId]?.label ?? ''}: ` : ''}
                      {q.text}
                    </Text>
                    <Text as="p">“{q.answer}” — {employer.name}, {longDate(q.answeredOn!)}</Text>
                  </BlockStack>
                ))}
              </BlockStack>
            </Card>
          )}

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                About {employer.name}
              </Text>
              <Text as="p">{employer.about}</Text>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Benefits
                </Text>
                <List type="bullet">
                  {employer.benefits.map((b) => (
                    <List.Item key={b}>{b}</List.Item>
                  ))}
                </List>
              </BlockStack>
              <VerificationBadge level={employer.verification} detailed />
              <InlineStack gap="300" wrap>
                <Button url={`/companies/${employer.id}`} variant="plain">
                  Company profile and workplace accessibility
                </Button>
                <Button variant="plain" onClick={() => setReportOpen(true)}>
                  Report incorrect information
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>

          {!pane && similar.length > 0 && (
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                Similar jobs
              </Text>
              <BlockStack gap="300">
                {similar.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </BlockStack>
            </BlockStack>
          )}

          {!closed && !myApplication && (
            <Card>
              <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                <BlockStack gap="050">
                  <Text as="h2" variant="headingMd">
                    Ready to apply?
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    You choose what to share and can request an accommodation. You see the exact list before anything is sent.
                  </Text>
                </BlockStack>
                {actions}
              </InlineStack>
            </Card>
          )}
        </BlockStack>
      </Box>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report incorrect information"
        primaryAction={
          reported
            ? { content: 'Done', onAction: () => setReportOpen(false) }
            : {
                content: 'Send report',
                disabled: !reportText.trim(),
                onAction: () => {
                  dispatch({ type: 'reportJob', report: { id: `r-${Date.now().toString(36)}`, jobId: job.id, reason: 'Accessibility information incorrect', detail: reportText.trim(), on: new Date().toISOString().slice(0, 10), resolved: false } });
                  setReported(true);
                },
              }
        }
      >
        <Modal.Section>
          {reported ? (
            <Banner tone="success" title="Thank you">
              <p>The Openwork trust team reviews every report. The employer is not told who reported.</p>
            </Banner>
          ) : (
            <BlockStack gap="300">
              <Text as="p">Tell us what on this page does not match reality — an entrance that has steps, software that did not work with your screen reader, an interpreter that was not provided. Anonymous to the employer.</Text>
              <TextField label="What is incorrect?" value={reportText} onChange={setReportText} multiline={3} autoComplete="off" />
            </BlockStack>
          )}
        </Modal.Section>
      </Modal>
    </BlockStack>
  );
}
