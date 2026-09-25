import { Badge, Banner, BlockStack, Button, Card, InlineGrid, InlineStack, List, Modal, Page, Select, Tag, Text, TextField } from '@shopify/polaris';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApplicationStatusTimeline } from '../../components/ApplicationStatusTimeline';
import { StateSymbol } from '../../components/Signal';
import { ACCESS_FEATURE_BY_ID, HIRING_OPTION_BY_ID } from '../../lib/access';
import { DIMENSION_BY_ID, optionOf } from '../../lib/dimensions';
import { APPLICATION_STATUS_LABEL, longDate } from '../../lib/format';
import { jobSatisfies, MATCH_STATE_LABEL } from '../../lib/match';
import type { ApplicationStatus } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { employerVisible, useStore } from '../../state/store';
import { NotFound } from '../public/NotFound';

const NEXT: Record<ApplicationStatus, ApplicationStatus[]> = {
  prepared: [],
  applied: ['assessment', 'interview', 'notSelected'],
  viewed: ['assessment', 'interview', 'notSelected'],
  assessment: ['interview', 'offer', 'notSelected'],
  interview: ['offer', 'notSelected'],
  offer: ['hired', 'notSelected'],
  hired: [],
  notSelected: [],
  withdrawn: [],
};

const NOTE_HINT: Partial<Record<ApplicationStatus, string>> = {
  assessment: 'Say what the work sample is, how long it takes, the format and the due date. Confirm any accommodation the candidate requested. Candidates see this word for word.',
  interview: 'Format, length, who will be there, and — if requested — confirm the interpreter, captions, questions in advance or support person.',
  offer: 'Summarize the offer and when you need an answer.',
  notSelected: 'A sentence of real feedback. Candidates on Openwork are told you will say why.',
  hired: 'Confirm the start date, who they will meet on day one, and how the accommodations they asked for will be in place.',
};

const KIND_LABEL = { paid: 'Paid work', volunteer: 'Volunteering', school: 'School or program', project: 'Project' } as const;

/**
 * The employer sees exactly what the candidate confirmed on the sharing
 * review — nothing else. Private needs are not here and cannot be.
 */
export function CandidateDetail() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const app = state.applications.find((a) => a.id === id && employerVisible(a));
  const job = app ? state.jobs.find((j) => j.id === app.jobId && j.employerId === state.employerId) : null;
  const cand = app ? state.candidates.find((c) => c.id === app.candidateId) : null;
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  useTitle(cand ? cand.name : 'Candidate');

  const [advanceTo, setAdvanceTo] = useState<ApplicationStatus | ''>('');
  const [note, setNote] = useState('');
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (app && app.status === 'applied') dispatch({ type: 'advanceApplication', applicationId: app.id, status: 'viewed', note: `${employer.name} opened your application.` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id]);

  if (!app || !job || !cand) return <NotFound message="That application is not in your account." />;

  const options = NEXT[app.status];
  const questions = state.questions.filter((q) => q.jobId === job.id && q.candidateId === cand.id);
  const submitAdvance = () => {
    if (!advanceTo) return;
    dispatch({ type: 'advanceApplication', applicationId: app.id, status: advanceTo, note: note.trim() || `Moved to ${APPLICATION_STATUS_LABEL[advanceTo].toLowerCase()}.` });
    setConfirm(false);
    setAdvanceTo('');
    setNote('');
  };

  return (
    <Page fullWidth title={cand.name} subtitle={`${job.title} · ${APPLICATION_STATUS_LABEL[app.status]}`} backAction={{ content: 'Candidates', url: '/employer/candidates' }}>
      <BlockStack gap="500">
        {app.sentBy === 'openwork' && (
          <Banner tone="info" title="Sent by Openwork on the candidate’s behalf">
            <p>{cand.name.split(' ')[0]} set rules — pay, arrangement, required access needs — and this job met them. The profile and résumé are exactly what a manual application would carry.</p>
          </Banner>
        )}
        <Banner tone="info" title="You are seeing only what this candidate chose to share">
          <p>Openwork does not pass on private needs, preferences, or anything not confirmed on the candidate’s sharing review. There is no diagnosis anywhere on Openwork. Judge the application on the work.</p>
        </Banner>

        {app.shared.accommodationRequest && (
          <Banner tone="warning" title="Accommodation request for the hiring process">
            <BlockStack gap="200">
              {app.shared.accommodationRequest.options.length > 0 && (
                <List type="bullet">
                  {app.shared.accommodationRequest.options.map((o) => (
                    <List.Item key={o}>{HIRING_OPTION_BY_ID[o]?.label}</List.Item>
                  ))}
                </List>
              )}
              {app.shared.accommodationRequest.custom && <p>“{app.shared.accommodationRequest.custom}”</p>}
              <p>Route this to {employer.accessibilityContact}. Do not ask the candidate why. Confirm it in your next status message.</p>
            </BlockStack>
          </Banner>
        )}

        <InlineGrid columns={{ xs: 1, lg: ['twoThirds', 'oneThird'] }} gap="500">
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingLg">
                    {cand.headline || cand.name}
                  </Text>
                  <Text as="p" tone="subdued">
                    {cand.location}
                    {cand.availability ? ` · Available: ${cand.availability}` : ''}
                    {cand.firstJob ? ' · First regular job' : ''}
                  </Text>
                </BlockStack>
                {cand.about && <Text as="p">{cand.about}</Text>}
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Strengths
                  </Text>
                  <InlineStack gap="200" wrap>
                    {cand.strengths.map((s) => (
                      <Tag key={s}>{job.strengthsUsed.includes(s) ? `${s} ✓` : s}</Tag>
                    ))}
                  </InlineStack>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Skills and tools
                  </Text>
                  <InlineStack gap="200" wrap>
                    {cand.skills.map((s) => (
                      <Tag key={s}>{job.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase()) ? `${s} ✓` : s}</Tag>
                    ))}
                  </InlineStack>
                  <Text as="p" variant="bodySm" tone="subdued">
                    ✓ marks strengths and skills this job lists.
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Experience and learning
                  </Text>
                  {cand.experience.length === 0 && <Text as="p" tone="subdued">None listed. Judge on strengths, skills and the work sample.</Text>}
                  {cand.experience.map((e) => (
                    <BlockStack key={e.id} gap="050">
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="p" fontWeight="semibold">
                          {e.title} · {e.organization} · {e.startYear}–{e.endYear ?? 'present'}
                        </Text>
                        <Badge>{KIND_LABEL[e.kind]}</Badge>
                      </InlineStack>
                      <Text as="p">{e.summary}</Text>
                    </BlockStack>
                  ))}
                </BlockStack>
                {cand.education.length > 0 && (
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      Education and training
                    </Text>
                    {cand.education.map((e) => (
                      <Text key={e.id} as="p">
                        {e.credential}, {e.institution}
                        {e.year ? ` (${e.year})` : ''}
                      </Text>
                    ))}
                  </BlockStack>
                )}
                {app.shared.workExamples && cand.workExamples.length > 0 && (
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      Work examples
                    </Text>
                    {cand.workExamples.map((w) => (
                      <BlockStack key={w.id} gap="050">
                        <Text as="p" fontWeight="semibold">
                          {w.title}
                        </Text>
                        <Text as="p">{w.description}</Text>
                      </BlockStack>
                    ))}
                  </BlockStack>
                )}
                {app.shared.resume && cand.resumeFileName && <Badge>{`Résumé: ${cand.resumeFileName}`}</Badge>}
                {Object.keys(app.answers).length > 0 && (
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      Their answers to your questions
                    </Text>
                    {Object.entries(app.answers).map(([q, a]) => (
                      <BlockStack key={q} gap="050">
                        <Text as="p" variant="bodySm" tone="subdued">
                          {q === 'note' ? 'Message' : q}
                        </Text>
                        <Text as="p">“{a}”</Text>
                      </BlockStack>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  What this candidate shared about what they need
                </Text>
                {app.shared.sharedAccessNeeds.length === 0 && app.shared.sharedPreferences.length === 0 && app.shared.hiringPreferences.length === 0 ? (
                  <Text as="p" tone="subdued">
                    Nothing beyond their passport basics. That is their choice and says nothing about their suitability.
                  </Text>
                ) : (
                  <>
                    {app.shared.sharedAccessNeeds.length > 0 && (
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingSm">
                          Access needs — and what your job says
                        </Text>
                        <ul className="ow-evidence">
                          {app.shared.sharedAccessNeeds.map((n) => {
                            const st = jobSatisfies(n, job, employer);
                            return (
                              <li key={n} className={`ow-evidence__row ow-evidence__row--${st}`}>
                                <StateSymbol state={st} />
                                <BlockStack gap="050">
                                  <Text as="span" fontWeight="semibold">
                                    {ACCESS_FEATURE_BY_ID[n]?.label ?? n}
                                  </Text>
                                  <Text as="span" variant="bodySm" tone="subdued">
                                    Your job: {MATCH_STATE_LABEL[st].toLowerCase()}
                                    {st === 'needsConfirmation' ? ' — you have not stated this. Answer it on the job or in your reply.' : ''}
                                  </Text>
                                </BlockStack>
                              </li>
                            );
                          })}
                        </ul>
                      </BlockStack>
                    )}
                    {app.shared.sharedPreferences.length > 0 && (
                      <List type="bullet">
                        {app.shared.sharedPreferences.map((d) => {
                          const pref = cand.workPreferences[d];
                          const c = pref ? optionOf(d, pref.value) : null;
                          const j = optionOf(d, job.environment[d] ?? null);
                          return (
                            <List.Item key={d}>
                              <strong>{DIMENSION_BY_ID[d].label}:</strong> {c?.candidateLabel ?? '—'}
                              {j ? ` — your job: ${j.employerLabel}` : ' — your job: not provided'}
                            </List.Item>
                          );
                        })}
                      </List>
                    )}
                    {app.shared.hiringPreferences.length > 0 && (
                      <BlockStack gap="100">
                        <Text as="h3" variant="headingSm">
                          Would like to use
                        </Text>
                        <List type="bullet">
                          {app.shared.hiringPreferences.map((h) => (
                            <List.Item key={h}>{HIRING_OPTION_BY_ID[h]?.label}</List.Item>
                          ))}
                        </List>
                      </BlockStack>
                    )}
                  </>
                )}
              </BlockStack>
            </Card>

            {questions.length > 0 && (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingLg">
                    Questions this candidate asked about the job
                  </Text>
                  {questions.map((q) => (
                    <BlockStack key={q.id} gap="050">
                      <Text as="p">“{q.text}”</Text>
                      <Text as="p" variant="bodySm" tone={q.answer ? 'success' : 'subdued'}>
                        {q.answer ? `Answered ${longDate(q.answeredOn!)}` : 'Not answered yet — answer it on your overview.'}
                      </Text>
                    </BlockStack>
                  ))}
                </BlockStack>
              </Card>
            )}
          </BlockStack>

          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Next step
                </Text>
                {options.length === 0 ? (
                  <Text as="p" tone="subdued">
                    This application is closed.
                  </Text>
                ) : (
                  <>
                    <Select label="Move to" placeholder="Choose" options={options.map((s) => ({ label: APPLICATION_STATUS_LABEL[s], value: s }))} value={advanceTo} onChange={(v) => setAdvanceTo(v as ApplicationStatus)} />
                    {advanceTo && <TextField label="Message to the candidate" value={note} onChange={setNote} multiline={3} autoComplete="off" helpText={NOTE_HINT[advanceTo]} />}
                    <Button variant="primary" disabled={!advanceTo} onClick={() => setConfirm(true)}>
                      Update status
                    </Button>
                  </>
                )}
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  History
                </Text>
                <ApplicationStatusTimeline application={app} />
              </BlockStack>
            </Card>
          </BlockStack>
        </InlineGrid>
      </BlockStack>

      <Modal open={confirm} onClose={() => setConfirm(false)} title={`Move ${cand.name.split(' ')[0]} to “${advanceTo ? APPLICATION_STATUS_LABEL[advanceTo] : ''}”?`} primaryAction={{ content: 'Yes, update', onAction: submitAdvance }} secondaryActions={[{ content: 'Cancel', onAction: () => setConfirm(false) }]}>
        <Modal.Section>
          <BlockStack gap="200">
            <Text as="p">The candidate sees this immediately in their application tracker and by email:</Text>
            <Text as="p" fontWeight="semibold">
              “{note.trim() || `Moved to ${advanceTo ? APPLICATION_STATUS_LABEL[advanceTo].toLowerCase() : ''}.`}”
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
