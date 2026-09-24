import { Banner, BlockStack, Box, Button, Card, Checkbox, Collapsible, Form, FormLayout, InlineGrid, InlineStack, List, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AccommodationRequest, type AccommodationRequestValue } from '../../components/AccommodationRequest';
import { ChoiceChips } from '../../components/ChoiceChips';
import { HiringProcess } from '../../components/HiringProcess';
import { ACCESS_FEATURE_BY_ID, HIRING_OPTION_BY_ID } from '../../lib/access';
import { DIMENSIONS, DIMENSION_BY_ID, optionOf, type DimensionId } from '../../lib/dimensions';
import type { Application } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useJob, useMyApplication, useStore } from '../../state/store';
import { NotFound } from '../public/NotFound';

/**
 * Apply in one screen. The list of what the employer will receive is the
 * page; defaults come from the passport; anything can be changed in place.
 * Visitors create an account right here — two fields — and continue.
 */
export function Apply() {
  const { id } = useParams();
  const job = useJob(id);
  const { state } = useStore();
  const employer = job ? state.employers.find((e) => e.id === job.employerId) : null;
  useTitle(job ? `Apply · ${job.title}` : 'Apply');
  if (!job || !employer) return <NotFound message="This job is not available." />;
  if (state.role !== 'candidate') return <InlineSignUp jobTitle={job.title} employerName={employer.name} />;
  return <ApplyForm job={job} employer={employer} />;
}

function InlineSignUp({ jobTitle, employerName }: { jobTitle: string; employerName: string }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const submit = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Enter the name you want the employer to see.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter an email address like name@example.com.';
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch({ type: 'signUpCandidate', name: name.trim(), email: email.trim() });
    dispatch({ type: 'updateCandidate', patch: { onboardingComplete: true } });
  };
  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Apply to {jobTitle}
          </Text>
          <Text as="p" tone="subdued">
            Two fields to create your account, then you apply on the next screen. You can add strengths, how you work and what you need afterwards — or never.
          </Text>
        </BlockStack>
        <Card>
          <Form onSubmit={submit}>
            <FormLayout>
              <TextField label="Your name" value={name} onChange={setName} autoComplete="name" error={errors.name} requiredIndicator />
              <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} requiredIndicator helpText={`${employerName} uses this to reply to you.`} />
              <InlineStack gap="300" blockAlign="center" wrap>
                <Button submit variant="primary" size="large">
                  Create account and continue
                </Button>
                <Text as="span" variant="bodySm" tone="subdued">
                  Already have one? <Link to={`/signin?next=${encodeURIComponent(location.pathname)}`}>Sign in</Link>
                </Text>
              </InlineStack>
            </FormLayout>
          </Form>
        </Card>
        {state.role === 'employer' && (
          <Banner tone="warning">
            <p>You are signed in as an employer. <Button variant="plain" onClick={() => { dispatch({ type: 'signOut' }); navigate(location.pathname); }}>Sign out</Button> to apply as a candidate.</p>
          </Banner>
        )}
      </BlockStack>
    </div>
  );
}

function ApplyForm({ job, employer }: { job: NonNullable<ReturnType<typeof useJob>>; employer: NonNullable<ReturnType<typeof useStore>['state']['employers'][number]> }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const existing = useMyApplication(job.id);
  const p = state.candidate!;

  const [includeResume, setIncludeResume] = useState(!!p.resumeFileName);
  const [includeExamples, setIncludeExamples] = useState(p.privacy.workExamples === 'shared' && p.workExamples.length > 0);
  const [note, setNote] = useState('');
  const [sharedPrefs, setSharedPrefs] = useState<DimensionId[]>(DIMENSIONS.filter((d) => p.workPreferences[d.id]?.visibility === 'shared').map((d) => d.id));
  const [sharedNeeds, setSharedNeeds] = useState<string[]>(Object.entries(p.accessNeeds).filter(([, n]) => n.visibility === 'shared').map(([k]) => k));
  const [sharedHiring, setSharedHiring] = useState(p.privacy.hiringPreferences === 'shared' ? p.hiringPreferences.filter((h) => job.hiringOptions.includes(h)) : []);
  const [accommodation, setAccommodation] = useState<AccommodationRequestValue>({ options: [], custom: p.privacy.supportNotes === 'shared' ? p.supportNotes : '' });
  const [open, setOpen] = useState<'message' | 'share' | 'accommodation' | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);

  if (job.status !== 'published' && !sentId) return <div className="ow-container ow-container--narrow"><Banner tone="warning" title="This job is no longer accepting applications"><p><Link to={`/companies/${employer.id}`}>See other jobs at {employer.name}</Link>.</p></Banner></div>;
  if (existing && !sentId) return <div className="ow-container ow-container--narrow"><Banner tone="info" title="You have already applied to this job"><p><Link to={`/applications/${existing.id}`}>View your application</Link>.</p></Banner></div>;

  const needChoices = Object.entries(p.accessNeeds).filter(([, n]) => n.visibility !== 'private');
  const prefChoices = DIMENSIONS.filter((d) => p.workPreferences[d.id] && p.workPreferences[d.id]!.visibility !== 'private');
  const hasAccommodation = accommodation.options.length > 0 || accommodation.custom.trim().length > 0;
  const toggle = (k: typeof open) => setOpen(open === k ? null : k);

  const submit = () => {
    const today = new Date().toISOString().slice(0, 10);
    const app: Application = {
      id: `app-${Date.now().toString(36)}`,
      jobId: job.id,
      candidateId: p.id,
      submittedOn: today,
      status: 'applied',
      history: [{ status: 'applied', on: today, note: 'Application submitted.' }],
      answers: note.trim() ? { note: note.trim() } : {},
      shared: { profile: true, resume: includeResume && !!p.resumeFileName, workExamples: includeExamples && p.workExamples.length > 0, sharedPreferences: sharedPrefs, sharedAccessNeeds: sharedNeeds, hiringPreferences: sharedHiring, accommodationRequest: hasAccommodation ? { options: accommodation.options, custom: accommodation.custom.trim() } : null },
    };
    dispatch({ type: 'submitApplication', application: app });
    setSentId(app.id);
    window.scrollTo({ top: 0 });
  };

  if (sentId) {
    const first = job.hiringStages[0];
    return (
      <div className="ow-container ow-container--narrow">
        <BlockStack gap="500">
          <Banner tone="success" title={`Your application to ${employer.name} was sent`}>
            <p>{hasAccommodation ? `Your accommodation request went to ${employer.accessibilityContact}. ` : ''}You will see every change in status on your applications page and by email.</p>
          </Banner>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                What happens next
              </Text>
              {first && (
                <Text as="p">
                  <strong>{first.name}</strong> — {first.description}
                  {first.duration ? ` Expect to hear back ${first.duration}.` : ''}
                </Text>
              )}
              <Text as="p" tone="subdued">
                {job.decisionTimeframe || 'The employer has not given a timeframe.'}
              </Text>
            </BlockStack>
          </Card>
          <HiringProcess job={job} />
          <InlineStack gap="300">
            <Button url={`/applications/${sentId}`} variant="primary">
              Track this application
            </Button>
            <Button url="/jobs">Back to jobs</Button>
          </InlineStack>
        </BlockStack>
      </div>
    );
  }

  const thin = p.strengths.length + p.skills.length + p.experience.length === 0;

  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Button url={`/jobs/${job.id}`} variant="plain">
            ← Back to the job
          </Button>
          <Text as="h1" variant="heading2xl">
            Apply to {job.title}
          </Text>
          <Text as="p" tone="subdued">
            {employer.name} · Below is the complete list of what they will receive. Change anything in place, then submit.
          </Text>
        </BlockStack>

        {thin && (
          <Banner tone="info" title="Your passport is nearly empty">
            <p>You can still apply. Adding a few strengths takes a minute and gives {employer.name} something to go on: <Link to="/passport">add strengths</Link>.</p>
          </Banner>
        )}

        <InlineGrid columns={{ xs: 1, lg: ['twoThirds', 'oneThird'] }} gap="500">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  What {employer.name} will see
                </Text>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Your passport
                  </Text>
                  <List type="bullet">
                    <List.Item>{p.name} · {p.email}{p.location ? ` · ${p.location}` : ''}{p.headline ? ` · ${p.headline}` : ''}</List.Item>
                    <List.Item>Strengths ({p.strengths.length}), skills ({p.skills.length}), experience and learning ({p.experience.length})</List.Item>
                    {p.firstJob && <List.Item>No résumé — your passport is your application</List.Item>}
                  </List>
                  <InlineStack gap="400" wrap>
                    {p.resumeFileName && <Checkbox label={`Attach résumé (${p.resumeFileName})`} checked={includeResume} onChange={setIncludeResume} />}
                    {p.workExamples.length > 0 && <Checkbox label={`Include work examples (${p.workExamples.length})`} checked={includeExamples} onChange={setIncludeExamples} />}
                  </InlineStack>
                </BlockStack>

                <Section title="A message" summary={note.trim() ? `“${note.trim().slice(0, 80)}${note.trim().length > 80 ? '…' : ''}”` : 'None (optional)'} open={open === 'message'} onToggle={() => toggle('message')} id="apply-message">
                  <TextField label="Anything you want them to know" value={note} onChange={setNote} multiline={3} autoComplete="off" maxLength={600} showCharacterCount />
                </Section>

                <Section title="What you need" summary={sharedNeeds.length + sharedPrefs.length === 0 ? 'Nothing — your needs stay private' : [...sharedNeeds.map((n) => ACCESS_FEATURE_BY_ID[n]?.label), ...sharedPrefs.map((d) => DIMENSION_BY_ID[d].label)].join(' · ')} open={open === 'share'} onToggle={() => toggle('share')} id="apply-share">
                  <BlockStack gap="400">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Sharing lets the employer plan for you. Not sharing changes nothing about how you are judged here.
                    </Text>
                    {needChoices.length > 0 ? (
                      <ChoiceChips label="Access needs to include" multiple options={needChoices.map(([id]) => ({ value: id, label: ACCESS_FEATURE_BY_ID[id]?.label ?? id }))} value={sharedNeeds} onChange={(v) => setSharedNeeds(v as string[])} />
                    ) : (
                      <Text as="p" variant="bodySm" tone="subdued">
                        No access needs on your passport yet. <Link to="/passport/access-needs">Add some</Link> or continue without.
                      </Text>
                    )}
                    {prefChoices.length > 0 && <ChoiceChips label="How you work best — include" multiple options={prefChoices.map((d) => ({ value: d.id, label: `${d.label}: ${optionOf(d.id, p.workPreferences[d.id]!.value)?.candidateLabel}` }))} value={sharedPrefs} onChange={(v) => setSharedPrefs(v as DimensionId[])} />}
                    {job.hiringOptions.some((h) => HIRING_OPTION_BY_ID[h].group === 'demonstrate') && <ChoiceChips label="How you would like to show your skills (offered here)" multiple options={job.hiringOptions.filter((h) => HIRING_OPTION_BY_ID[h].group === 'demonstrate').map((h) => ({ value: h, label: HIRING_OPTION_BY_ID[h].label }))} value={sharedHiring} onChange={(v) => setSharedHiring(v as typeof sharedHiring)} />}
                  </BlockStack>
                </Section>

                <Section title="Interview accommodation request" summary={hasAccommodation ? [...accommodation.options.map((o) => HIRING_OPTION_BY_ID[o].label), accommodation.custom.trim() && `“${accommodation.custom.trim().slice(0, 60)}”`].filter(Boolean).join(' · ') : 'None (optional)'} open={open === 'accommodation'} onToggle={() => toggle('accommodation')} id="apply-acc">
                  <AccommodationRequest job={job} employer={employer} value={accommodation} onChange={setAccommodation} bare />
                </Section>

                <Banner tone="info">
                  <p>Not included: anything not listed above — your other needs and preferences, your support notes, your saved jobs and other applications. No diagnosis exists anywhere to be included.</p>
                </Banner>
              </BlockStack>
            </Card>

            <div className="ow-actionbar">
              <InlineStack gap="300" blockAlign="center" wrap>
                <Button variant="primary" size="large" onClick={submit}>
                  Submit application
                </Button>
                <Button onClick={() => navigate(`/jobs/${job.id}`)}>Cancel</Button>
              </InlineStack>
            </div>
          </BlockStack>

          <BlockStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  What happens after you submit
                </Text>
                <List type="number">
                  {job.hiringStages.map((s) => (
                    <List.Item key={s.id}>
                      {s.name}
                      {s.duration ? ` — ${s.duration}` : ''}
                    </List.Item>
                  ))}
                </List>
                <Text as="p" variant="bodySm" tone="subdued">
                  {job.decisionTimeframe}
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Accommodation contact
                </Text>
                <Text as="p">{employer.accessibilityContact}</Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Requests go here only. No reason needed.
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </InlineGrid>
      </BlockStack>
    </div>
  );
}

function Section({ title, summary, open, onToggle, id, children }: { title: string; summary: string; open: boolean; onToggle: () => void; id: string; children: React.ReactNode }) {
  return (
    <Box borderBlockStartWidth="025" borderColor="border-secondary" paddingBlockStart="300">
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="start" wrap gap="200">
          <BlockStack gap="050">
            <Text as="h3" variant="headingSm">
              {title}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {summary}
            </Text>
          </BlockStack>
          <Button onClick={onToggle} ariaExpanded={open} ariaControls={id} disclosure={open ? 'up' : 'down'}>
            {open ? 'Done' : 'Change'}
          </Button>
        </InlineStack>
        <Collapsible id={id} open={open} transition={false}>
          <Box paddingBlockEnd="200">{children}</Box>
        </Collapsible>
      </BlockStack>
    </Box>
  );
}
