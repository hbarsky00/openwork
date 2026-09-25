import { Banner, BlockStack, Button, Card, Divider, InlineStack, Text } from '@shopify/polaris';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SAMPLE_CANDIDATES } from '../../data/candidates';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const SCENARIO: Record<string, string> = {
  'c-priya': 'Prefers written instructions, a fixed schedule and few interruptions. Never states a diagnosis.',
  'c-devon': 'Needs screen-reader compatible software, keyboard access and accessible documents. Remote.',
  'c-rosa': 'Needs step-free access, an accessible restroom and workstation, and the option to sit.',
  'c-sam': 'Needs captions, text-based communication and an interpreter at interview.',
  'c-tyler': 'First regular job. No résumé. Strong practical skills, works with a job coach.',
};

export function SignIn() {
  useTitle('Sign in');
  const { state, dispatch } = useStore();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const next = sp.get('next');
  const reason = sp.get('reason');
  const wantedRole = sp.get('role');
  const go = (fallback: string) => navigate(next && !next.startsWith('/signin') ? next : fallback);

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Sign in
          </Text>
          <Text as="p" tone="subdued">
            This is a prototype. Choose an account to continue. Each candidate demonstrates one scenario.
          </Text>
        </BlockStack>

        {reason === 'save' && <Banner tone="info" title="Sign in to save jobs"><p>Saved jobs need an account so we can keep them for you. Browsing does not.</p></Banner>}
        {reason === 'apply' && <Banner tone="info" title="Sign in to apply"><p>Applying uses your passport so you do not have to retype it, and lets you control what the employer sees.</p></Banner>}
        {reason === 'ask' && <Banner tone="info" title="Sign in to ask an employer"><p>So the answer can come back to you. The question shares nothing else.</p></Banner>}

        {(!wantedRole || wantedRole === 'candidate') && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Job seekers
              </Text>
              {SAMPLE_CANDIDATES.map((c) => (
                <InlineStack key={c.id} align="space-between" blockAlign="center" wrap gap="300">
                  <BlockStack gap="050">
                    <Text as="p" fontWeight="semibold">
                      {c.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {SCENARIO[c.id] ?? c.headline}
                    </Text>
                  </BlockStack>
                  <Button onClick={() => { dispatch({ type: 'signInCandidate', profile: c }); go('/matches'); }}>Sign in as {c.name.split(' ')[0]}</Button>
                </InlineStack>
              ))}
              <Divider />
              <Text as="p" variant="bodySm">
                New here? <Link to={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</Link> — about five minutes, everything optional.
              </Text>
            </BlockStack>
          </Card>
        )}

        {(!wantedRole || wantedRole === 'employer') && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Employers
              </Text>
              {state.employers.filter((e) => ['meridian', 'northline', 'dalgren', 'kesslervance', 'corvid'].includes(e.id)).map((e) => (
                <InlineStack key={e.id} align="space-between" blockAlign="center" wrap gap="300">
                  <BlockStack gap="050">
                    <Text as="p" fontWeight="semibold">
                      {e.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {e.industry} · {e.headquarters}
                    </Text>
                  </BlockStack>
                  <Button onClick={() => { dispatch({ type: 'signInEmployer', employerId: e.id }); go('/employer'); }}>Sign in</Button>
                </InlineStack>
              ))}
              <Divider />
              <Text as="p" variant="bodySm">
                <Link to="/employers/signup">Create an employer account</Link>
              </Text>
            </BlockStack>
          </Card>
        )}

        {(!wantedRole || wantedRole === 'admin') && (
          <Card>
            <InlineStack align="space-between" blockAlign="center" wrap gap="300">
              <BlockStack gap="050">
                <Text as="h2" variant="headingLg">
                  Trust team
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Employer verification and reported information.
                </Text>
              </BlockStack>
              <Button onClick={() => { dispatch({ type: 'signInAdmin' }); go('/admin'); }}>Sign in</Button>
            </InlineStack>
          </Card>
        )}
      </BlockStack>
    </div>
  );
}
