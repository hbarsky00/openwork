import { Banner, BlockStack, Button, Card, DropZone, Form, FormLayout, InlineStack, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ACCESS_FEATURE_BY_ID } from '../../lib/access';
import { salary } from '../../lib/format';
import type { Application } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useJob, useMyApplication, useStore } from '../../state/store';
import { NotFound } from '../public/NotFound';

/**
 * Apply. One page: who you are, your résumé, the employer's few questions,
 * anything you need for the interview, Submit. Works with no account — the
 * account is created from the same fields. What is on this page is exactly
 * what the employer receives.
 */
export function Apply() {
  const { id } = useParams();
  const job = useJob(id);
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const existing = useMyApplication(id ?? '');
  const employer = job ? state.employers.find((e) => e.id === job.employerId) : null;
  const p = state.role === 'candidate' ? state.candidate : null;
  useTitle(job ? `Apply · ${job.title}` : 'Apply');

  const [name, setName] = useState(p?.name ?? '');
  const [email, setEmail] = useState(p?.email ?? '');
  const [phone, setPhone] = useState(p?.phone ?? '');
  const [resume, setResume] = useState<string | null>(p?.resumeFileName ?? null);
  const [answers, setAnswers] = useState<string[]>(() => (job?.screeningQuestions ?? []).map(() => ''));
  const [need, setNeed] = useState(p?.privacy.supportNotes === 'shared' ? p.supportNotes : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sentId, setSentId] = useState<string | null>(null);

  if (!job || !employer) return <NotFound message="This job is not available." />;
  if (state.role === 'employer')
    return (
      <div className="ow-container ow-container--narrow">
        <Banner tone="warning">
          <p>
            You are signed in as an employer.{' '}
            <Button
              variant="plain"
              onClick={() => {
                dispatch({ type: 'signOut' });
                navigate(`/jobs/${job.id}/apply`);
              }}
            >
              Sign out
            </Button>{' '}
            to apply.
          </p>
        </Banner>
      </div>
    );
  if (job.status !== 'published' && !sentId)
    return (
      <div className="ow-container ow-container--narrow">
        <Banner tone="warning" title="This job is no longer accepting applications">
          <p>
            <Link to={`/companies/${employer.id}`}>See other jobs at {employer.name}</Link>.
          </p>
        </Banner>
      </div>
    );
  if (existing && !sentId)
    return (
      <div className="ow-container ow-container--narrow">
        <Banner tone="info" title="You already applied to this job">
          <p>
            <Link to={`/applications/${existing.id}`}>View your application</Link>.
          </p>
        </Banner>
      </div>
    );

  const sharedNeeds = p ? Object.entries(p.accessNeeds).filter(([, n]) => n.visibility === 'shared').map(([k]) => k) : [];

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Enter your name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter an email address like name@example.com.';
    job.screeningQuestions.forEach((_, i) => {
      if (!answers[i]?.trim()) e[`q${i}`] = 'A sentence is enough.';
    });
    setErrors(e);
    if (Object.keys(e).length) {
      window.scrollTo({ top: 0 });
      return;
    }
    if (!p) dispatch({ type: 'signUpCandidate', name: name.trim(), email: email.trim() });
    dispatch({ type: 'updateCandidate', patch: { name: name.trim(), email: email.trim(), phone: phone.trim(), resumeFileName: resume, onboardingComplete: true } });

    const today = new Date().toISOString().slice(0, 10);
    const app: Application = {
      id: `app-${Date.now().toString(36)}`,
      jobId: job.id,
      candidateId: p?.id ?? 'pending',
      submittedOn: today,
      status: 'applied',
      history: [{ status: 'applied', on: today, note: 'Application submitted.' }],
      answers: Object.fromEntries(job.screeningQuestions.map((q, i) => [q, answers[i].trim()])),
      shared: { profile: true, resume: !!resume, workExamples: false, sharedPreferences: [], sharedAccessNeeds: sharedNeeds, hiringPreferences: [], accommodationRequest: need.trim() ? { options: [], custom: need.trim() } : null },
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
          <Banner tone="success" title={`Application sent to ${employer.name}`}>
            <p>
              {first ? `Next: ${first.name.toLowerCase()}${first.duration ? `, ${first.duration}` : ''}. ` : ''}
              {job.decisionTimeframe} You will hear back by email and can track it here.
            </p>
          </Banner>
          <InlineStack gap="300">
            <Button url="/jobs" variant="primary" size="large">
              Back to jobs
            </Button>
            <Button url={`/applications/${sentId}`} size="large">
              Track this application
            </Button>
          </InlineStack>
        </BlockStack>
      </div>
    );
  }

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <BlockStack gap="100">
          <Button url={`/jobs/${job.id}`} variant="plain">
            ← Back to the job
          </Button>
          <Text as="h1" variant="heading2xl">
            Apply to {job.title}
          </Text>
          <Text as="p" tone="subdued">
            {employer.name} · {salary(job)} · {job.location}. {employer.name} receives exactly what is on this page.
          </Text>
        </BlockStack>

        <Form onSubmit={submit}>
          <BlockStack gap="400">
            <Card>
              <FormLayout>
                <FormLayout.Group>
                  <TextField label="Your name" value={name} onChange={setName} autoComplete="name" error={errors.name} requiredIndicator />
                  <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} requiredIndicator />
                </FormLayout.Group>
                <TextField label="Phone (optional)" type="tel" value={phone} onChange={setPhone} autoComplete="tel" />
              </FormLayout>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Résumé
                </Text>
                {resume ? (
                  <InlineStack gap="300" blockAlign="center" wrap>
                    <Text as="p" fontWeight="semibold">
                      {resume}
                    </Text>
                    <Button variant="plain" onClick={() => setResume(null)}>
                      Replace
                    </Button>
                  </InlineStack>
                ) : (
                  <DropZone accept=".pdf,.doc,.docx,.txt" type="file" allowMultiple={false} onDrop={(_d, accepted) => accepted[0] && setResume(accepted[0].name)}>
                    <DropZone.FileUpload actionTitle="Add a résumé" actionHint="PDF or Word. Optional — your answers below count just as much." />
                  </DropZone>
                )}
                {p?.firstJob && !resume && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    No résumé is fine. Your profile — strengths, school, volunteering — goes with this application.
                  </Text>
                )}
              </BlockStack>
            </Card>

            {job.screeningQuestions.length > 0 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    {employer.name} asks
                  </Text>
                  {job.screeningQuestions.map((q, i) => (
                    <TextField key={q} label={q} value={answers[i]} onChange={(v) => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))} multiline={2} autoComplete="off" error={errors[`q${i}`]} requiredIndicator />
                  ))}
                </BlockStack>
              </Card>
            )}

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Anything you need for the interview? (optional)
                </Text>
                <TextField label="Interview needs" labelHidden value={need} onChange={setNeed} multiline={2} autoComplete="off" placeholder="e.g. Please send the questions two days ahead. / I need a step-free room. / An ASL interpreter." helpText={`Goes to ${employer.accessibilityContact}. No reason needed.`} />
                {sharedNeeds.length > 0 && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    Also included from your profile: {sharedNeeds.map((n) => ACCESS_FEATURE_BY_ID[n]?.label).join(', ')}. <Link to="/passport/sharing">Change</Link>
                  </Text>
                )}
              </BlockStack>
            </Card>

            <div className="ow-actionbar">
              <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                <Text as="p" variant="bodySm" tone="subdued">
                  {p ? 'Employers never see a diagnosis — there is no such field.' : 'Submitting creates your free account so you can track this application.'}
                </Text>
                <Button submit variant="primary" size="large">
                  Submit application
                </Button>
              </InlineStack>
            </div>
          </BlockStack>
        </Form>

        {!p && (
          <Text as="p" variant="bodySm" tone="subdued">
            Applied before? <Link to={`/signin?next=${encodeURIComponent(`/jobs/${job.id}/apply`)}`}>Sign in</Link> to reuse your résumé.
          </Text>
        )}
      </BlockStack>
    </div>
  );
}
