import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { Banner, BlockStack, Text } from '@shopify/polaris';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { clerkEnabled } from '../../auth/clerk';
import { OptionCard, OptionCards } from '../../components/OptionCard';
import { SAMPLE_CANDIDATES } from '../../data/candidates';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const SCENARIO: Record<string, string> = {
  'c-priya': 'Prefers written instructions, a fixed schedule and few interruptions.',
  'c-devon': 'Needs screen-reader compatible software, keyboard access and accessible documents. Remote.',
  'c-rosa': 'Needs step-free access, an accessible restroom and workstation, and the option to sit.',
  'c-sam': 'Needs captions, text-based communication and an interpreter at interview.',
  'c-tyler': 'First regular job. No résumé. Strong practical skills, works with a job coach.',
};
const DEMO_EMPLOYERS = ['meridian', 'northline', 'dalgren', 'kesslervance', 'corvid'];

const REASON: Record<string, [string, string]> = {
  save: ['Log in to save jobs', 'Saved jobs need an account so we can keep them for you. Browsing does not.'],
  apply: ['Log in to apply', 'Your profile fills the application in, and you control what the employer sees.'],
  ask: ['Log in to ask an employer', 'So the answer can come back to you. The question shares nothing else.'],
  alert: ['Log in to get alerts', 'We need somewhere to send new matches for this search.'],
};

/** One click per account. Real email accounts go through Clerk when it is configured; demo accounts always work. */
export function SignIn() {
  useTitle('Log in');
  const { state, dispatch } = useStore();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const next = sp.get('next');
  const reason = sp.get('reason');
  const wantedRole = sp.get('role');
  const go = (fallback: string) => navigate(next && !next.startsWith('/signin') ? next : fallback);
  const sampleIds = new Set(SAMPLE_CANDIDATES.map((c) => c.id));
  const mine = state.candidates.filter((c) => !sampleIds.has(c.id));
  const showCandidates = !wantedRole || wantedRole === 'candidate';
  const showEmployers = !wantedRole || wantedRole === 'employer';
  const showAdmin = !wantedRole || wantedRole === 'admin';
  const signInAs = (id: string) => {
    const saved = state.candidates.find((x) => x.id === id) ?? SAMPLE_CANDIDATES.find((x) => x.id === id)!;
    dispatch({ type: 'signInCandidate', profile: saved });
    go('/matches');
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
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
              {clerkEnabled ? 'Use your email, or pick a demo account to look around.' : 'Pick an account. Each one shows a different way Openwork works.'}
            </Text>
          )}
        </BlockStack>

        {clerkEnabled && showCandidates && (
          <div className="ow-clerk">
            <ClerkSignIn routing="path" path="/signin" signUpUrl="/signup" fallbackRedirectUrl={next ?? '/matches'} />
          </div>
        )}

        {showCandidates && mine.length > 0 && !clerkEnabled && (
          <div className="ow-sheet">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                Your account
              </Text>
              <OptionCards>
                {mine.map((c) => (
                  <OptionCard key={c.id} title={c.name} help={c.email} selected={false} onClick={() => signInAs(c.id)} />
                ))}
              </OptionCards>
            </BlockStack>
          </div>
        )}

        {showCandidates && (
          <div className="ow-sheet">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                {clerkEnabled ? 'Demo job seekers' : 'Job seekers'}
              </Text>
              <OptionCards>
                {SAMPLE_CANDIDATES.map((c) => (
                  <OptionCard key={c.id} title={c.name} help={SCENARIO[c.id] ?? c.headline} selected={false} onClick={() => signInAs(c.id)} />
                ))}
              </OptionCards>
              {!clerkEnabled && (
                <Text as="p" variant="bodySm" tone="subdued">
                  New to Openwork? <Link to={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Sign up</Link>.
                </Text>
              )}
            </BlockStack>
          </div>
        )}

        {showEmployers && (
          <div className="ow-sheet">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                Employers
              </Text>
              <OptionCards>
                {state.employers.filter((e) => DEMO_EMPLOYERS.includes(e.id)).map((e) => (
                  <OptionCard key={e.id} title={e.name} help={`${e.industry} · ${e.headquarters}`} selected={false} onClick={() => { dispatch({ type: 'signInEmployer', employerId: e.id }); go('/employer'); }} />
                ))}
              </OptionCards>
              <Text as="p" variant="bodySm" tone="subdued">
                Hiring? <Link to="/employers/signup">Create an employer account</Link>.
              </Text>
            </BlockStack>
          </div>
        )}

        {showAdmin && (
          <div className="ow-sheet">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                Trust team
              </Text>
              <OptionCards>
                <OptionCard title="Openwork trust team" help="Employer verification and reported information." selected={false} onClick={() => { dispatch({ type: 'signInAdmin' }); go('/admin'); }} />
              </OptionCards>
            </BlockStack>
          </div>
        )}
      </BlockStack>
    </div>
  );
}
