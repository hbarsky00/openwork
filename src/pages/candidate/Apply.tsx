import { Badge, Banner, BlockStack, Button, DropZone, Form, FormLayout, Icon, InlineStack, List, Text, TextField } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmployerLogo } from '../../components/EmployerLogo';
import { JobCard } from '../../components/JobCard';
import { ACCESS_FEATURE_BY_ID } from '../../lib/access';
import { buildApplication } from '../../lib/apply';
import { salary } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';
import { useJob, useMyApplication, useStore } from '../../state/store';
import { NotFound } from '../public/NotFound';

/**
 * Apply. One page, top to bottom: who you are, your résumé, a couple of
 * friendly questions from the employer, send. No steps, no stars, no
 * captions. Works without an account; the account is made from the same
 * two fields when you send.
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
  const doneHeading = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (sentId) doneHeading.current?.focus();
  }, [sentId]);

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

  const missing = job.screeningQuestions.filter((_, i) => !answers[i]?.trim()).length;
  const sharedNeeds = p ? Object.entries(p.accessNeeds).filter(([, n]) => n.visibility === 'shared').map(([k]) => k) : [];

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Enter your name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter an email address like name@example.com.';
    job.screeningQuestions.forEach((_, i) => {
      if (!answers[i]?.trim()) e[`q${i}`] = `${employer.name} needs an answer here. A couple of sentences is plenty.`;
    });
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`apply-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    if (!p) dispatch({ type: 'signUpCandidate', name: name.trim(), email: email.trim() });
    dispatch({ type: 'updateCandidate', patch: { name: name.trim(), email: email.trim(), phone: phone.trim(), resumeFileName: resume, onboardingComplete: true } });

    const app = buildApplication(job, p, Object.fromEntries(job.screeningQuestions.map((q, i) => [q, answers[i].trim()])), need);
    dispatch({ type: 'submitApplication', application: app });
    setSentId(app.id);
    window.scrollTo({ top: 0 });
  };

  if (sentId) {
    const similar = state.jobs.filter((j) => j.status === 'published' && j.id !== job.id && (j.family === job.family || j.employerId === job.employerId)).slice(0, 3);
    return (
      <div className="ow-container ow-container--narrow">
        <BlockStack gap="600">
          <div className="ow-done">
            <span className="ow-done__icon" aria-hidden="true">
              <Icon source={CheckCircleIcon} />
            </span>
            <BlockStack gap="100">
              <Text as="h1" variant="heading2xl">
                <span ref={doneHeading} tabIndex={-1}>
                  Sent to {employer.name}
                </span>
              </Text>
              <Text as="p" variant="bodyLg">
                Your application for {job.title} is in. A copy is in your email.
              </Text>
            </BlockStack>
          </div>

          <div className="ow-sheet">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                What happens next
              </Text>
              <List type="number">
                {job.hiringStages.map((s) => (
                  <List.Item key={s.id}>
                    <strong>{s.name}</strong>
                    {s.duration ? ` — ${s.duration}` : ''}
                  </List.Item>
                ))}
              </List>
              <Text as="p" tone="subdued">
                {job.decisionTimeframe} {employer.name} will email you at {email}.
              </Text>
              <InlineStack gap="300">
                <Button url={`/applications/${sentId}`} variant="primary" size="large">
                  Track this application
                </Button>
                <Button url="/jobs" size="large">
                  Back to jobs
                </Button>
              </InlineStack>
            </BlockStack>
          </div>

          {similar.length > 0 && (
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                Three more like this
              </Text>
              {similar.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </BlockStack>
          )}
        </BlockStack>
      </div>
    );
  }

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <div className="ow-applyhead">
          <Link to={`/jobs/${job.id}`} className="ow-applyhead__back">
            ← Back to the job
          </Link>
          <InlineStack gap="300" blockAlign="center" wrap={false}>
            <EmployerLogo employer={employer} size={56} />
            <BlockStack gap="050">
              <Text as="h1" variant="heading2xl">
                Apply to {job.title}
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                {employer.name} · {salary(job)} · {job.location}
              </Text>
            </BlockStack>
          </InlineStack>
          {!p && (
            <Text as="p" variant="bodyMd">
              Applied before? <Link to={`/signin?next=${encodeURIComponent(`/jobs/${job.id}/apply`)}`}>Sign in</Link> and this fills itself in.
            </Text>
          )}
        </div>

        {Object.keys(errors).length > 0 && (
          <Banner tone="critical" title={`${Object.keys(errors).length} thing${Object.keys(errors).length === 1 ? '' : 's'} to fix before sending`}>
            <List type="bullet">
              {Object.entries(errors).map(([k, v]) => (
                <List.Item key={k}>
                  <a href={`#apply-${k}`}>{k === 'name' ? 'Your name' : k === 'email' ? 'Email' : `Question ${Number(k.slice(1)) + 1}`}</a>: {v}
                </List.Item>
              ))}
            </List>
          </Banner>
        )}

        <Form onSubmit={submit}>
          <div className="ow-sheet">
            <BlockStack gap="800">
              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">
                  About you
                </Text>
                <FormLayout>
                  <FormLayout.Group>
                    <TextField id="apply-name" label="Your name" value={name} onChange={setName} autoComplete="name" error={errors.name} />
                    <TextField id="apply-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
                  </FormLayout.Group>
                  <TextField label="Phone (optional)" type="tel" value={phone} onChange={setPhone} autoComplete="tel" />
                </FormLayout>
              </BlockStack>

              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">
                  Résumé
                </Text>
                {resume ? (
                  <InlineStack gap="300" blockAlign="center" wrap>
                    <Icon source={CheckCircleIcon} tone="success" />
                    <Text as="p" fontWeight="semibold">
                      {resume}
                    </Text>
                    <Button variant="plain" onClick={() => setResume(null)}>
                      Use a different file
                    </Button>
                  </InlineStack>
                ) : (
                  <div className="ow-drop">
                    <DropZone accept=".pdf,.doc,.docx,.txt" type="file" allowMultiple={false} onDrop={(_d, accepted) => accepted[0] && setResume(accepted[0].name)}>
                      <DropZone.FileUpload actionTitle="Upload your résumé" actionHint={`PDF or Word. No résumé? Skip this — ${job.screeningQuestions.length ? 'your answers below count' : 'your name and email are enough to start'}.`} />
                    </DropZone>
                  </div>
                )}
              </BlockStack>

              {job.screeningQuestions.length > 0 && (
                <BlockStack gap="400">
                  <BlockStack gap="100">
                    <InlineStack gap="200" blockAlign="center" wrap>
                      <Text as="h2" variant="headingLg">
                        Questions from {employer.name}
                      </Text>
                      <Badge tone="attention">Required</Badge>
                    </InlineStack>
                    <Text as="p" tone="subdued">
                      {employer.name} needs these answered before you can send. In your own words — a couple of sentences is plenty.
                    </Text>
                  </BlockStack>
                  {job.screeningQuestions.map((q, i) => (
                    <TextField key={q} id={`apply-q${i}`} label={q} value={answers[i]} onChange={(v) => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))} multiline={4} autoComplete="off" error={errors[`q${i}`]} />
                  ))}
                </BlockStack>
              )}

              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">
                  Anything you need for the interview? (optional)
                </Text>
                <TextField label="Interview needs" labelHidden value={need} onChange={setNeed} multiline={2} autoComplete="off" placeholder="For example: the questions ahead of time, a step-free room, an ASL interpreter. You never have to say why." />
                {sharedNeeds.length > 0 && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    Also going with this: {sharedNeeds.map((n) => ACCESS_FEATURE_BY_ID[n]?.label).join(', ')}. <Link to="/passport/sharing">Change</Link>
                  </Text>
                )}
              </BlockStack>
            </BlockStack>
          </div>

          <div className="ow-actionbar">
            <InlineStack align="space-between" blockAlign="center" wrap gap="300">
              <Text as="p" variant="bodySm" tone={missing > 0 ? 'critical' : 'subdued'}>
                {missing > 0
                  ? `Answer ${missing} question${missing === 1 ? '' : 's'} from ${employer.name} to send.`
                  : p
                    ? `${employer.name} sees only what is on this page.`
                    : 'Sending creates your free account so you can track the reply.'}
              </Text>
              <Button submit variant="primary" size="large">
                Send application
              </Button>
            </InlineStack>
          </div>
        </Form>
      </BlockStack>
    </div>
  );
}
