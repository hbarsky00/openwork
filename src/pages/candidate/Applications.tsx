import { Badge, BlockStack, Button, EmptyState, InlineStack, List, Text } from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmployerLogo } from '../../components/EmployerLogo';
import { HIRING_OPTION_BY_ID } from '../../lib/access';
import { APPLICATION_STATUS_LABEL, longDate, postedAgo } from '../../lib/format';
import { describeSearch } from '../../lib/search';
import type { Application, ApplicationStatus } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const TONE: Record<ApplicationStatus, 'info' | 'attention' | 'success' | 'critical' | undefined> = {
  applied: 'info',
  viewed: 'info',
  assessment: 'attention',
  interview: 'attention',
  offer: 'success',
  hired: 'success',
  notSelected: undefined,
  withdrawn: undefined,
};
const CLOSED: ApplicationStatus[] = ['hired', 'notSelected', 'withdrawn'];
const NEXT: Partial<Record<ApplicationStatus, string>> = {
  applied: 'Nothing to do. The employer has your application.',
  viewed: 'The employer opened it. You will hear about the next step here.',
  assessment: 'Complete the work sample the employer sent.',
  interview: 'Prepare for the interview. Your requests went with the application.',
  offer: 'Read the offer and reply to the employer.',
};

type Tab = 'active' | 'interview' | 'closed';

/**
 * Applications, reference layout: tabs, a list of cards on the left, and a
 * sticky detail panel on the right with Status timeline / Documents / Job.
 */
export function Applications() {
  useTitle('Applications');
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const p = state.candidate!;
  const mine = useMemo(() => state.applications.filter((a) => a.candidateId === p.id).sort((a, b) => b.submittedOn.localeCompare(a.submittedOn)), [state.applications, p.id]);
  const active = mine.filter((a) => !CLOSED.includes(a.status));
  const interviews = mine.filter((a) => a.status === 'interview' || a.status === 'assessment');
  const closed = mine.filter((a) => CLOSED.includes(a.status));
  const [tab, setTab] = useState<Tab>('active');
  const list = tab === 'active' ? active : tab === 'interview' ? interviews : closed;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = list.find((a) => a.id === selectedId) ?? list[0] ?? null;
  const [panel, setPanel] = useState<'timeline' | 'documents' | 'job'>('timeline');

  const jobOf = (a: Application) => state.jobs.find((j) => j.id === a.jobId)!;
  const empOf = (a: Application) => state.employers.find((e) => e.id === jobOf(a).employerId)!;

  return (
    <div className="ow-container">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <BlockStack gap="100">
            <Text as="h1" variant="heading2xl">
              Applications
            </Text>
            <Text as="p" tone="subdued">
              Track each application and prepare for what comes next.
            </Text>
          </BlockStack>
        </div>

        <div className="ow-tabs" role="tablist" aria-label="Application status">
          {(
            [
              ['active', `Active (${active.length})`],
              ['interview', `Interviews (${interviews.length})`],
              ['closed', `Closed (${closed.length})`],
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setSelectedId(null); }}>
              {label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="ow-sheet">
            <EmptyState heading={tab === 'active' ? 'No active applications' : tab === 'interview' ? 'No interviews yet' : 'Nothing closed yet'} image="" action={{ content: 'See your matches', url: '/matches' }}>
              <p>When you apply, every step the employer takes shows up here.</p>
            </EmptyState>
          </div>
        ) : (
          <div className="ow-cols">
            <BlockStack gap="300">
              {list.map((a) => {
                const job = jobOf(a);
                const emp = empOf(a);
                const isSel = selected?.id === a.id;
                return (
                  <article key={a.id} className={`ow-jobcard ow-jobcard--clickable${isSel ? ' ow-jobcard--selected' : ''}`} onClick={() => (window.matchMedia('(min-width: 1024px)').matches ? setSelectedId(a.id) : navigate(`/applications/${a.id}`))} aria-current={isSel ? 'true' : undefined}>
                    <InlineStack gap="300" blockAlign="start" wrap={false}>
                      <EmployerLogo employer={emp} size={48} />
                      <BlockStack gap="100">
                        <Text as="h3" variant="headingMd">
                          <a href={`/applications/${a.id}`} className="ow-plainlink" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/applications/${a.id}`); }}>
                            {job.title}
                          </a>
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {emp.name} • {job.location}
                        </Text>
                        <InlineStack gap="200" blockAlign="center" wrap>
                          <Text as="span" variant="bodySm" tone="subdued">
                            Applied {postedAgo(a.submittedOn)}
                          </Text>
                          <Badge tone={TONE[a.status]} toneAndProgressLabelOverride={APPLICATION_STATUS_LABEL[a.status]}>
                            {APPLICATION_STATUS_LABEL[a.status]}
                          </Badge>
                        </InlineStack>
                      </BlockStack>
                    </InlineStack>
                  </article>
                );
              })}
            </BlockStack>

            {selected && (
              <aside className="ow-aside ow-split__detail" style={{ display: undefined }}>
                <div className="ow-sheet ow-aside__card">
                  <BlockStack gap="400">
                    <InlineStack gap="300" blockAlign="center" wrap={false}>
                      <EmployerLogo employer={empOf(selected)} size={40} />
                      <BlockStack gap="050">
                        <Text as="h2" variant="headingMd">
                          {jobOf(selected).title}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {empOf(selected).name}
                        </Text>
                      </BlockStack>
                    </InlineStack>
                    <div className="ow-tabs" role="tablist" aria-label="Application detail">
                      {(
                        [
                          ['timeline', 'Status timeline'],
                          ['documents', 'What they received'],
                          ['job', 'Job details'],
                        ] as const
                      ).map(([k, label]) => (
                        <button key={k} role="tab" aria-selected={panel === k} onClick={() => setPanel(k)}>
                          {label}
                        </button>
                      ))}
                    </div>

                    {panel === 'timeline' && (
                      <BlockStack gap="300">
                        <ol className="ow-tl">
                          {[...selected.history].reverse().map((ev, i) => (
                            <li key={`${ev.status}-${ev.on}-${i}`} data-current={i === 0}>
                              <Text as="p" fontWeight="semibold">
                                {APPLICATION_STATUS_LABEL[ev.status]}
                              </Text>
                              <Text as="p" variant="bodySm" tone="subdued">
                                {ev.note}
                              </Text>
                              <Text as="p" variant="bodyXs" tone="subdued">
                                {longDate(ev.on)}
                              </Text>
                            </li>
                          ))}
                        </ol>
                        {NEXT[selected.status] && (
                          <div className="ow-why">
                            <Text as="p" variant="bodySm">
                              <strong>Next:</strong> {NEXT[selected.status]}
                            </Text>
                          </div>
                        )}
                      </BlockStack>
                    )}
                    {panel === 'documents' && (
                      <List type="bullet">
                        <List.Item>Profile: strengths, skills, experience</List.Item>
                        {selected.shared.resume && p.resumeFileName && <List.Item>Résumé: {p.resumeFileName}</List.Item>}
                        {Object.entries(selected.answers).map(([q, a]) => (
                          <List.Item key={q}>
                            {q}: “{a}”
                          </List.Item>
                        ))}
                        {selected.shared.accommodationRequest?.custom && <List.Item>Interview request: “{selected.shared.accommodationRequest.custom}”</List.Item>}
                        {selected.shared.hiringPreferences.map((h) => (
                          <List.Item key={h}>Would like: {HIRING_OPTION_BY_ID[h]?.label}</List.Item>
                        ))}
                      </List>
                    )}
                    {panel === 'job' && (
                      <BlockStack gap="200">
                        <Text as="p">{jobOf(selected).summary}</Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {jobOf(selected).decisionTimeframe}
                        </Text>
                        <Button url={`/jobs/${selected.jobId}`} variant="plain">
                          Open the job
                        </Button>
                      </BlockStack>
                    )}
                    <InlineStack gap="200">
                      <Button url={`/applications/${selected.id}`}>Full details</Button>
                      {!CLOSED.includes(selected.status) && (
                        <Button variant="plain" tone="critical" onClick={() => dispatch({ type: 'withdrawApplication', applicationId: selected.id })}>
                          Withdraw
                        </Button>
                      )}
                    </InlineStack>
                  </BlockStack>
                </div>
              </aside>
            )}
          </div>
        )}

        <BlockStack gap="300">
          <Text as="h2" variant="headingLg">
            Job alerts
          </Text>
          {state.alerts.length === 0 ? (
            <Text as="p" tone="subdued">
              None yet. On Search jobs, set your search and press “Alert me about jobs like this”.
            </Text>
          ) : (
            state.alerts.map((q) => (
              <div key={q} className="ow-sheet ow-aside__card">
                <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                  <BlockStack gap="050">
                    <Text as="p" fontWeight="semibold">
                      {describeSearch(new URLSearchParams(q))}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      We email you when a new job matches. <Link to={`/jobs?${q}`}>See matches</Link>
                    </Text>
                  </BlockStack>
                  <Button variant="plain" onClick={() => dispatch({ type: 'toggleAlert', query: q })}>
                    Turn off
                  </Button>
                </InlineStack>
              </div>
            ))
          )}
        </BlockStack>
      </BlockStack>
    </div>
  );
}
