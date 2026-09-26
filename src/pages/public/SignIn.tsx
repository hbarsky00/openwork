import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { Banner, BlockStack, Button, Form, FormLayout, InlineStack, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { clerkEnabled } from '../../auth/clerk';
import { SAMPLE_CANDIDATES } from '../../data/candidates';
import { employerEmail, findAccount, passwordOk, validEmail } from '../../lib/auth';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const DEMO_EMPLOYERS = ['meridian', 'northline', 'dalgren'];
const REASON: Record<string, [string, string]> = {
  save: ['Log in to save jobs', 'Saved jobs need an account so we can keep them for you. Browsing does not.'],
  apply: ['Log in to apply', 'Your profile fills the application in, and you control what the employer sees.'],
  ask: ['Log in to ask an employer', 'So the answer can come back to you. The question shares nothing else.'],
  alert: ['Log in to get alerts', 'We need somewhere to send new matches for this search.'],
};

/**
 * One form for everyone: email and password. Candidates, employers and the
 * trust team are told apart by the email. Demo accounts accept any password
 * and are one click away under the form.
 */
export function SignIn() {
  useTitle('Log in');
  const { state, dispatch } = useStore();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const next = sp.get('next');
  const reason = sp.get('reason');
  const wantedRole = sp.get('role');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const go = (fallback: string) => navigate(next && !next.startsWith('/signin') ? next : fallback);

  const enter = (acct: NonNullable<ReturnType<typeof findAccount>>) => {
    if (acct.kind === 'candidate') { dispatch({ type: 'signInCandidate', profile: acct.candidate }); go('/matches'); }
    else if (acct.kind === 'employer') { dispatch({ type: 'signInEmployer', employerId: acct.employer.id }); go('/employer'); }
    else { dispatch({ type: 'signInAdmin' }); go('/admin'); }
  };

  const submit = async () => {
    const e: typeof error = {};
    if (!validEmail(email)) e.email = 'Enter the email address you signed up with.';
    if (!password) e.password = 'Enter your password.';
    setError(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const acct = findAccount(email, state.candidates, state.employers);
    if (!acct) { setBusy(false); setError({ email: 'We could not find an account with that email. Check the spelling, or sign up.' }); return; }
    const hash = acct.kind === 'candidate' ? acct.candidate.passwordHash : acct.kind === 'employer' ? acct.employer.passwordHash : undefined;
    if (!(await passwordOk(hash, password))) { setBusy(false); setError({ password: 'That password does not match. Try again.' }); return; }
    setBusy(false);
    enter(acct);
  };

  const demoClick = (acct: NonNullable<ReturnType<typeof findAccount>>) => () => enter(acct);
  const demoEmployers = state.employers.filter((x) => DEMO_EMPLOYERS.includes(x.id));

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Log in
          </Text>
          {reason && REASON[reason] ? (
            <Banner tone="info" title={REASON[reason][0]}>
              <p>{REASON[reason][1]}</p>
            </Banner>
          ) : (
            <Text as="p" tone="subdued">
              {wantedRole === 'employer' ? 'Employers log in with the work email on the account.' : 'Job seekers and employers use the same form.'}
            </Text>
          )}
        </BlockStack>

        {clerkEnabled ? (
          <div className="ow-clerk">
            <ClerkSignIn routing="path" path="/signin" signUpUrl="/signup" fallbackRedirectUrl={next ?? '/matches'} />
          </div>
        ) : (
          <div className="ow-sheet">
            <Form onSubmit={submit}>
              <FormLayout>
                <TextField label="Email" type="email" value={email} onChange={(v) => { setEmail(v); setError({}); }} autoComplete="username" error={error.email} requiredIndicator />
                <TextField label="Password" type="password" value={password} onChange={(v) => { setPassword(v); setError({}); }} autoComplete="current-password" error={error.password} requiredIndicator />
                <InlineStack gap="300" blockAlign="center" wrap>
                  <Button submit variant="primary" size="large" loading={busy}>
                    Log in
                  </Button>
                  <Link to="/support#q-6">Forgot your password?</Link>
                </InlineStack>
              </FormLayout>
            </Form>
          </div>
        )}

        <Text as="p" variant="bodySm" tone="subdued">
          New to Openwork? <Link to={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Sign up</Link>. Hiring? <Link to="/import">Import your jobs</Link> or <Link to="/claim">claim your company page</Link>.
        </Text>

        <div className="ow-why">
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" fontWeight="semibold">
              Demo accounts (any password works)
            </Text>
            <Text as="p" variant="bodySm">
              Job seekers:{' '}
              {SAMPLE_CANDIDATES.map((c, i) => {
                const saved = state.candidates.find((x) => x.id === c.id) ?? c;
                return (
                  <span key={c.id}>
                    {i > 0 ? ' · ' : ''}
                    <Button variant="plain" onClick={demoClick({ kind: 'candidate', candidate: saved })}>
                      {c.name.split(' ')[0]}
                    </Button>
                  </span>
                );
              })}
            </Text>
            <Text as="p" variant="bodySm">
              Employers:{' '}
              {demoEmployers.map((e, i) => (
                <span key={e.id}>
                  {i > 0 ? ' · ' : ''}
                  <Button variant="plain" onClick={demoClick({ kind: 'employer', employer: e })}>
                    {e.name}
                  </Button>
                </span>
              ))}
              {' · '}
              <Button variant="plain" onClick={demoClick({ kind: 'admin' })}>
                Trust team
              </Button>
            </Text>
            <Text as="p" variant="bodyXs" tone="subdued">
              Or type one of their emails above, for example {SAMPLE_CANDIDATES[2].email} or {employerEmail(demoEmployers[0]) ?? 'an employer contact address'}.
            </Text>
          </BlockStack>
        </div>
      </BlockStack>
    </div>
  );
}
