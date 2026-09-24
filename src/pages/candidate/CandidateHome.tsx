import { Badge, BlockStack, Button, Card, InlineGrid, InlineStack, Text } from '@shopify/polaris';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { JobCard } from '../../components/JobCard';
import { ACCESS_FEATURE_BY_ID } from '../../lib/access';
import { DIMENSIONS } from '../../lib/dimensions';
import { APPLICATION_STATUS_LABEL, longDate } from '../../lib/format';
import { matchJob, rankScore } from '../../lib/match';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/** Answers one question: what can I do next? */
export function CandidateHome() {
  useTitle('Home');
  const { state } = useStore();
  const p = state.candidate!;
  const hasPassport = Object.keys(p.workPreferences).length > 0 || Object.keys(p.accessNeeds).length > 0;

  const recommended = useMemo(() => {
    const applied = new Set(state.applications.filter((a) => a.candidateId === p.id).map((a) => a.jobId));
    const open = state.jobs.filter((j) => j.status === 'published' && !applied.has(j.id));
    if (!hasPassport) return open.sort((a, b) => b.postedOn.localeCompare(a.postedOn)).slice(0, 4);
    return open
      .map((j) => ({ j, s: rankScore(matchJob(p, j, state.employers.find((e) => e.id === j.employerId)!)) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 4)
      .map((x) => x.j);
  }, [state.jobs, state.applications, state.employers, p, hasPassport]);


  const myApps = state.applications.filter((a) => a.candidateId === p.id && a.status !== 'withdrawn');
  const active = myApps.filter((a) => !['hired', 'notSelected'].includes(a.status));
  const upcoming = active.filter((a) => ['assessment', 'interview'].includes(a.status));
  const myQuestions = state.questions.filter((q) => q.candidateId === p.id);
  const answered = myQuestions.filter((q) => q.answer);
  const saved = state.saved.map((s) => state.jobs.find((j) => j.id === s.jobId)).filter(Boolean).slice(0, 3);
  const answeredDims = DIMENSIONS.filter((d) => p.workPreferences[d.id]).length;

  const nextSteps: { label: string; to: string }[] = [];
  if (Object.keys(p.accessNeeds).length === 0) nextSteps.push({ label: 'Add what makes work accessible for you', to: '/passport/access-needs' });
  if (p.strengths.length === 0) nextSteps.push({ label: 'Add your strengths', to: '/passport' });
  if (answeredDims < DIMENSIONS.length) nextSteps.push({ label: `Answer ${DIMENSIONS.length - answeredDims} more “how I work” question${DIMENSIONS.length - answeredDims === 1 ? '' : 's'}`, to: '/passport/how-i-work' });
  if (!p.headline) nextSteps.push({ label: 'Add a one-line headline', to: '/passport' });

  return (
    <div className="ow-container">
      <BlockStack gap="800">
        <BlockStack gap="100">
          <Text as="h1" variant="heading2xl">
            Hello, {p.name.split(' ')[0]}
          </Text>
          <Text as="p" tone="subdued">
            {active.length === 0 ? 'No active applications. Here are jobs that work for you.' : `${active.length} active application${active.length === 1 ? '' : 's'}${upcoming.length ? ` · ${upcoming.length} with a next step` : ''}${answered.length ? ` · ${answered.length} employer answer${answered.length === 1 ? '' : 's'}` : ''}.`}
          </Text>
        </BlockStack>

        {(upcoming.length > 0 || answered.length > 0) && (
          <BlockStack gap="300">
            <Text as="h2" variant="headingLg">
              Next steps
            </Text>
            {upcoming.map((a) => {
              const job = state.jobs.find((j) => j.id === a.jobId)!;
              const employer = state.employers.find((e) => e.id === job.employerId)!;
              const last = a.history[a.history.length - 1];
              return (
                <Card key={a.id}>
                  <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                    <BlockStack gap="100">
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="h3" variant="headingMd">
                          {job.title}
                        </Text>
                        <Badge tone="attention">{APPLICATION_STATUS_LABEL[a.status]}</Badge>
                      </InlineStack>
                      <Text as="p" tone="subdued">
                        {employer.name} · {last.note}
                      </Text>
                    </BlockStack>
                    <Button url={`/applications/${a.id}`}>View application</Button>
                  </InlineStack>
                </Card>
              );
            })}
            {answered.map((q) => {
              const job = state.jobs.find((j) => j.id === q.jobId)!;
              return (
                <Card key={q.id}>
                  <BlockStack gap="100">
                    <Text as="h3" variant="headingMd">
                      Answer from {state.employers.find((e) => e.id === job.employerId)?.name} about {job.title}
                    </Text>
                    <Text as="p" tone="subdued">
                      You asked: {q.featureId ? `${ACCESS_FEATURE_BY_ID[q.featureId]?.label} — ` : ''}{q.text}
                    </Text>
                    <Text as="p">“{q.answer}”</Text>
                    <InlineStack>
                      <Button url={`/jobs/${job.id}#why`} size="slim">
                        See the job
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </Card>
              );
            })}
          </BlockStack>
        )}

        <InlineGrid columns={{ xs: 1, lg: ['twoThirds', 'oneThird'] }} gap="600">
          <BlockStack gap="600">
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="baseline">
                <Text as="h2" variant="headingLg">
                  Jobs that work for you
                </Text>
                <Button url="/jobs" size="slim">See all</Button>
              </InlineStack>
              {hasPassport ? (
                <Text as="p" variant="bodySm" tone="subdued">
                  Ordered by how much of your passport each employer has confirmed. Every card shows what is confirmed, what to review, and what the employer has not said.
                </Text>
              ) : (
                <Card>
                  <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                    <Text as="p">Add what you need and how you work, and every job will explain itself against your passport.</Text>
                    <Button url="/passport/access-needs" variant="primary">
                      Add what I need
                    </Button>
                  </InlineStack>
                </Card>
              )}
              <BlockStack gap="300">
                {recommended.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </BlockStack>
            </BlockStack>
          </BlockStack>

          <BlockStack gap="500">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="baseline">
                  <Text as="h2" variant="headingMd">
                    Applications
                  </Text>
                  <Button url="/applications" size="slim">All</Button>
                </InlineStack>
                {myApps.length === 0 ? (
                  <Text as="p" tone="subdued">
                    None yet. There is no rush.
                  </Text>
                ) : (
                  myApps.slice(0, 3).map((a) => {
                    const job = state.jobs.find((j) => j.id === a.jobId)!;
                    return (
                      <BlockStack key={a.id} gap="050">
                        <InlineStack>
                          <Button url={`/applications/${a.id}`} size="slim" textAlign="left">
                            {job.title}
                          </Button>
                        </InlineStack>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {APPLICATION_STATUS_LABEL[a.status]} · {longDate(a.history[a.history.length - 1].on)}
                        </Text>
                      </BlockStack>
                    );
                  })
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="baseline">
                  <Text as="h2" variant="headingMd">
                    Saved jobs
                  </Text>
                  <Button url="/saved" size="slim">All</Button>
                </InlineStack>
                {saved.length === 0 ? <Text as="p" tone="subdued">Save jobs you want to come back to.</Text> : saved.map((j) => <Link key={j!.id} to={`/jobs/${j!.id}`}>{j!.title}</Link>)}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Continue your passport
                </Text>
                {nextSteps.length === 0 ? (
                  <Text as="p" tone="subdued">
                    Nothing outstanding. Update it whenever something changes.
                  </Text>
                ) : (
                  <BlockStack gap="200">
                    {nextSteps.slice(0, 3).map((n) => (
                      <InlineStack key={n.label}>
                        <Button url={n.to} size="slim" textAlign="left">
                          {n.label}
                        </Button>
                      </InlineStack>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Support
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Help understanding a job, asking an employer, requesting an accommodation or bringing a job coach.
                </Text>
                <InlineStack><Button url="/support" size="slim">Get help</Button></InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </InlineGrid>
      </BlockStack>
    </div>
  );
}
