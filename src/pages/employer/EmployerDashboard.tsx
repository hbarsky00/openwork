import { Badge, BlockStack, Button, Card, InlineGrid, InlineStack, Layout, Page, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { CompletenessMeter } from '../../components/CompletenessMeter';
import { VerificationBadge } from '../../components/VerificationBadge';
import { ACCESS_FEATURE_BY_ID, COMMUNICATION_REQUIREMENTS, JOB_EVIDENCE_FEATURES, PHYSICAL_REQUIREMENTS, WORKPLACE_EVIDENCE_FEATURES } from '../../lib/access';
import { DIMENSIONS } from '../../lib/dimensions';
import { APPLICATION_STATUS_LABEL, longDate } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

export function EmployerDashboard() {
  useTitle('Employer overview');
  const { state, dispatch } = useStore();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  const jobs = state.jobs.filter((j) => j.employerId === employer.id);
  const active = jobs.filter((j) => j.status === 'published');
  const drafts = jobs.filter((j) => j.status === 'draft');
  const jobIds = new Set(jobs.map((j) => j.id));
  const apps = state.applications.filter((a) => jobIds.has(a.jobId) && a.status !== 'withdrawn');
  const newApps = apps.filter((a) => a.status === 'applied');
  const withRequest = apps.filter((a) => a.shared.accommodationRequest && ['applied', 'viewed'].includes(a.status));
  const questions = state.questions.filter((q) => jobIds.has(q.jobId));
  const openQuestions = questions.filter((q) => !q.answer);
  const recent = [...apps].sort((a, b) => b.history[b.history.length - 1].on.localeCompare(a.history[a.history.length - 1].on)).slice(0, 5);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const workplaceDone = WORKPLACE_EVIDENCE_FEATURES.filter((f) => employer.accessibility[f.id]).length;
  const jobCompleteness = (j: (typeof jobs)[number]) => {
    const total = DIMENSIONS.length + PHYSICAL_REQUIREMENTS.length + COMMUNICATION_REQUIREMENTS.length + JOB_EVIDENCE_FEATURES.length;
    const done = DIMENSIONS.filter((d) => j.environment[d.id]).length + PHYSICAL_REQUIREMENTS.filter((p) => j.physical[p.id]).length + COMMUNICATION_REQUIREMENTS.filter((c) => j.communication[c.id]).length + JOB_EVIDENCE_FEATURES.filter((f) => j.accessibility[f.id]).length;
    return { done, total };
  };

  const setup = [
    { done: workplaceDone >= 5, label: 'Answer your workplace accessibility questions', to: '/employer/accessibility', why: 'Shown on every job. Four taps per question.' },
    { done: active.length + drafts.length > 0, label: 'Create your first job', to: '/employer/jobs/new', why: 'Seven short steps. Save a draft any time.' },
    { done: !!employer.about.trim(), label: 'Describe your company', to: '/employer/company', why: 'What you do and how the workplace runs.' },
  ];
  const setupLeft = setup.filter((s) => !s.done);

  return (
    <Page title={employer.name} subtitle="Overview" titleMetadata={<VerificationBadge level={employer.verification} />} primaryAction={{ content: 'Create job', url: '/employer/jobs/new' }}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {setupLeft.length > 0 && (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingLg">
                    {setupLeft.length === setup.length ? 'Three things to do' : `${setupLeft.length} thing${setupLeft.length === 1 ? '' : 's'} left to set up`}
                  </Text>
                  {setup.map((s) => (
                    <InlineStack key={s.label} align="space-between" blockAlign="center" wrap gap="300">
                      <BlockStack gap="050">
                        <Text as="p" fontWeight="semibold" textDecorationLine={s.done ? 'line-through' : undefined}>
                          {s.done ? '✓ ' : ''}{s.label}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {s.why}
                        </Text>
                      </BlockStack>
                      {!s.done && <Button url={s.to} variant={s === setupLeft[0] ? 'primary' : 'secondary'}>Start</Button>}
                    </InlineStack>
                  ))}
                </BlockStack>
              </Card>
            )}
            <InlineGrid columns={{ xs: 2, md: 4 }} gap="300">
              {[
                { label: 'Active jobs', value: active.length, to: '/employer/jobs' },
                { label: 'New applicants', value: newApps.length, to: '/employer/candidates?status=applied' },
                { label: 'Accommodation requests', value: withRequest.length, to: '/employer/candidates' },
                { label: 'Candidate questions', value: openQuestions.length, to: '#questions' },
              ].map((m) => (
                <Card key={m.label}>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">
                      {m.label}
                    </Text>
                    <Text as="p" variant="headingXl">
                      {m.value}
                    </Text>
                    <InlineStack>
                      <Button url={m.to} size="slim">
                        View
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingLg" id="questions">
                    Candidate questions
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Asked where a job does not say. Your answer appears on the job page for everyone — names are never shown. Answering is the fastest way to close a “?”.
                  </Text>
                </BlockStack>
                {questions.length === 0 ? (
                  <Text as="p" tone="subdued">
                    No questions yet.
                  </Text>
                ) : (
                  questions.map((q) => {
                    const job = state.jobs.find((j) => j.id === q.jobId)!;
                    return (
                      <Card key={q.id} background="bg-surface-secondary">
                        <BlockStack gap="200">
                          <InlineStack gap="200" blockAlign="center" wrap>
                            <Text as="h3" variant="headingSm">
                              {job.title}
                            </Text>
                            {q.featureId && <Badge>{ACCESS_FEATURE_BY_ID[q.featureId]?.label ?? q.featureId}</Badge>}
                            <Text as="span" variant="bodySm" tone="subdued">
                              Asked {longDate(q.askedOn)}
                            </Text>
                          </InlineStack>
                          <Text as="p">“{q.text}”</Text>
                          {q.answer ? (
                            <Text as="p" tone="success">
                              Answered {longDate(q.answeredOn!)}: “{q.answer}”
                            </Text>
                          ) : (
                            <InlineStack gap="200" blockAlign="end">
                              <div style={{ flex: 1 }}>
                                <TextField label="Your answer" value={answers[q.id] ?? ''} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} autoComplete="off" multiline={2} helpText="Be specific. If the honest answer is “not yet”, say so." />
                              </div>
                              <Button variant="primary" disabled={!(answers[q.id] ?? '').trim()} onClick={() => dispatch({ type: 'answerQuestion', questionId: q.id, answer: answers[q.id].trim() })}>
                                Answer
                              </Button>
                            </InlineStack>
                          )}
                        </BlockStack>
                      </Card>
                    );
                  })
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="baseline">
                  <Text as="h2" variant="headingLg">
                    Recent activity
                  </Text>
                  <Button url="/employer/candidates" size="slim">All candidates</Button>
                </InlineStack>
                {recent.length === 0 ? (
                  <Text as="p" tone="subdued">
                    No applications yet.
                  </Text>
                ) : (
                  recent.map((a) => {
                    const job = state.jobs.find((j) => j.id === a.jobId)!;
                    const cand = state.candidates.find((c) => c.id === a.candidateId);
                    return (
                      <InlineStack key={a.id} align="space-between" blockAlign="center" wrap gap="300">
                        <BlockStack gap="050">
                          <InlineStack gap="200" blockAlign="center" wrap>
                            <Button url={`/employer/candidates/${a.id}`} size="slim">
                              {cand?.name ?? 'Candidate'}
                            </Button>
                            <Text as="span" variant="bodySm" tone="subdued">
                              {job.title}
                            </Text>
                          </InlineStack>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {longDate(a.history[a.history.length - 1].on)}
                            {a.shared.accommodationRequest ? ' · Accommodation request included' : ''}
                          </Text>
                        </BlockStack>
                        <Badge tone={a.status === 'applied' ? 'attention' : 'info'}>{APPLICATION_STATUS_LABEL[a.status]}</Badge>
                      </InlineStack>
                    );
                  })
                )}
              </BlockStack>
            </Card>

            {drafts.length > 0 && (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingLg">
                    Drafts ({drafts.length})
                  </Text>
                  {drafts.map((j) => (
                    <InlineStack key={j.id} align="space-between" blockAlign="center">
                      <Text as="p">{j.title}</Text>
                      <Button url={`/employer/jobs/${j.id}/edit`}>Continue editing</Button>
                    </InlineStack>
                  ))}
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Information completeness
                </Text>
                <CompletenessMeter id="cm-wp" done={workplaceDone} total={WORKPLACE_EVIDENCE_FEATURES.length} label="Workplace accessibility" why="Shown on every job. Each unanswered question is a “?” a candidate has to ask about." />
                <InlineStack><Button url="/employer/accessibility" size="slim">Edit workplace accessibility</Button></InlineStack>
                {active.map((j) => {
                  const { done, total } = jobCompleteness(j);
                  return <CompletenessMeter key={j.id} id={`cm-${j.id}`} done={done} total={total} label={j.title} why="Environment, physical, communication and job accessibility answers." />;
                })}
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Verification
                </Text>
                <VerificationBadge level={employer.verification} detailed />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
