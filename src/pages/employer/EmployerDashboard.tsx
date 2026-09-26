import { Badge, BlockStack, Button, InlineGrid, InlineStack, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { VerificationBadge } from '../../components/VerificationBadge';
import { ACCESS_FEATURE_BY_ID, WORKPLACE_EVIDENCE_FEATURES } from '../../lib/access';
import { jobNeedsInfo } from '../../lib/jobs';
import { matchJob, matchTier } from '../../lib/match';
import { APPLICATION_STATUS_LABEL, longDate } from '../../lib/format';
import { Link } from 'react-router-dom';
import { useTitle } from '../../lib/useTitle';
import { employerVisible, useStore } from '../../state/store';

export function EmployerDashboard() {
  useTitle('Employer overview');
  const { state, dispatch } = useStore();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  const jobs = state.jobs.filter((j) => j.employerId === employer.id);
  const active = jobs.filter((j) => j.status === 'published');
  const drafts = jobs.filter((j) => j.status === 'draft');
  const jobIds = new Set(jobs.map((j) => j.id));
  const apps = state.applications.filter((a) => employerVisible(a) && jobIds.has(a.jobId) && a.status !== 'withdrawn');
  const newApps = apps.filter((a) => a.status === 'applied');
  const withRequest = apps.filter((a) => a.shared.accommodationRequest && ['applied', 'viewed'].includes(a.status));
  const questions = state.questions.filter((q) => jobIds.has(q.jobId));
  const openQuestions = questions.filter((q) => !q.answer);
  const recent = [...apps].sort((a, b) => b.history[b.history.length - 1].on.localeCompare(a.history[a.history.length - 1].on)).slice(0, 5);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const workplaceDone = WORKPLACE_EVIDENCE_FEATURES.filter((f) => employer.accessibility[f.id]).length;
  const interviews = apps.filter((a) => a.status === 'interview' || a.status === 'assessment');
  const needsInfo = jobs.filter((j) => j.status !== 'closed' && jobNeedsInfo(j));
  const appliedIds = new Set(apps.map((a) => `${a.candidateId}|${a.jobId}`));
  // Count only; never a list of people who have not applied.
  const potential = state.candidates.filter((c) => active.some((j) => !appliedIds.has(`${c.id}|${j.id}`) && ['strong', 'good'].includes(matchTier(matchJob(c, j, employer))))).length;
  const setup = [
    { done: workplaceDone >= 5, label: 'Answer your workplace accessibility questions', to: '/employer/accessibility', why: 'Shown on every job. Four taps per question.' },
    { done: active.length + drafts.length > 0, label: 'Create your first job', to: '/employer/jobs/new', why: 'Seven short steps. Save a draft any time.' },
    { done: !!employer.about.trim(), label: 'Describe your company', to: '/employer/company', why: 'What you do and how the workplace runs.' },
  ];
  const setupLeft = setup.filter((s) => !s.done);

  return (
    <div className="ow-container">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="center" wrap>
              <Text as="h1" variant="heading2xl">
                {employer.name}
              </Text>
              <VerificationBadge level={employer.verification} />
              {employer.plan === 'founding' && <Badge tone="info">Founding Employer</Badge>}
            </InlineStack>
            <Text as="p" tone="subdued">
              {employer.companyVerified ? 'Verified company' : 'Company not yet verified'} · {employer.ats ? `ATS: ${employer.ats.provider} ${employer.ats.status}` : 'ATS not connected'}
            </Text>
          </BlockStack>
          <InlineStack gap="200">
            <Button url="/employer/jobs/import">Import jobs</Button>
            <Button url="/employer/jobs/new" variant="primary">
              Create job
            </Button>
          </InlineStack>
        </div>

        {setupLeft.length > 0 && (
          <div className="ow-sheet">
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
          </div>
        )}

        <InlineGrid columns={{ xs: 2, md: 4 }} gap="300">
          {[
            { label: 'Applicants to review', value: newApps.length, to: '/employer/candidates?status=applied' },
            { label: 'Potential candidate matches', value: potential, to: '/employer/jobs' },
            { label: 'Interviews and work samples', value: interviews.length, to: '/employer/interviews' },
            { label: 'Active jobs', value: active.length, to: '/employer/jobs' },
            { label: 'Jobs needing information', value: needsInfo.length, to: '/employer/jobs?tab=needs' },
            { label: 'Accessibility questions unanswered', value: WORKPLACE_EVIDENCE_FEATURES.length - workplaceDone, to: '/employer/accessibility' },
            { label: 'Candidate questions', value: openQuestions.length, to: '#questions' },
            { label: 'Accommodation requests', value: withRequest.length, to: '/employer/candidates' },
          ].map((m) => (
            <Link key={m.label} to={m.to} className="ow-stat" aria-label={`${m.label}: ${m.value}. Open.`}>
              <Text as="span" variant="bodySm" tone="subdued">
                {m.label}
              </Text>
              <Text as="span" variant="headingXl">
                {m.value}
              </Text>
            </Link>
          ))}
        </InlineGrid>

        <div className="ow-cols">
          <BlockStack gap="500">
            <div className="ow-sheet">
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
                      <div key={q.id} className="ow-why">
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
                      </div>
                    );
                  })
                )}
              </BlockStack>
            </div>

            <div className="ow-sheet">
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
            </div>
          </BlockStack>

          <aside className="ow-aside">
            {drafts.length > 0 && (
              <div className="ow-sheet ow-aside__card">
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Drafts ({drafts.length})
                  </Text>
                  {drafts.map((j) => (
                    <InlineStack key={j.id} align="space-between" blockAlign="center" gap="200" wrap>
                      <Text as="p">{j.title}</Text>
                      <Button url={`/employer/jobs/${j.id}/${jobNeedsInfo(j) ? 'enrich' : 'edit'}`} size="slim">
                        {jobNeedsInfo(j) ? 'Add information' : 'Continue'}
                      </Button>
                    </InlineStack>
                  ))}
                </BlockStack>
              </div>
            )}
            <div className="ow-sheet ow-aside__card">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Verification
                </Text>
                <VerificationBadge level={employer.verification} detailed />
                <Text as="p" variant="bodySm" tone="subdued">
                  {employer.companyVerified ? 'Company identity verified by work-email domain.' : 'Company identity not yet verified. Claiming with a work email at your domain verifies it.'} Accessibility claims are checked separately.
                </Text>
              </BlockStack>
            </div>
            <div className="ow-sheet ow-aside__card">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  ATS
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {employer.ats ? `${employer.ats.provider}: ${employer.ats.status === 'connected' ? 'connected, jobs sync automatically' : 'connection requested'}.` : 'Not connected. Jobs are imported or written here.'}
                </Text>
                <Button url="/employer/connect" size="slim">
                  {employer.ats ? 'Connection details' : 'Connect ATS'}
                </Button>
              </BlockStack>
            </div>
          </aside>
        </div>
      </BlockStack>
    </div>
  );
}
