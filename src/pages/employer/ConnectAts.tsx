import { Badge, Banner, BlockStack, Button, InlineStack, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ATS_PROVIDERS, ATS_STATUS_LABEL, type AtsProvider } from '../../lib/ats';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const TONE = { available: 'success', beta: 'info', comingSoon: 'attention', requestIntegration: undefined } as const;

/**
 * ATS connection, designed ahead of the integrations. Nothing here claims to
 * sync: the employer names their system, we record the request, and the jobs
 * list keeps saying "not connected" until a real integration exists.
 */
export function ConnectAts() {
  useTitle('Connect your ATS');
  const { state, dispatch } = useStore();
  const employer = state.employers.find((e) => e.id === state.employerId) ?? null;
  const [chosen, setChosen] = useState<AtsProvider | null>(ATS_PROVIDERS.find((p) => p.name === employer?.ats?.provider) ?? null);
  const [email, setEmail] = useState(employer?.accessibilityContact.match(/[^\s(]+@[^\s)]+/)?.[0] ?? '');
  const [sent, setSent] = useState(false);
  const requested = employer?.ats?.status === 'requested';

  const request = (p: AtsProvider) => {
    setChosen(p);
    if (employer) dispatch({ type: 'requestAts', provider: p.name });
    else localStorage.setItem('openwork.atsInterest', JSON.stringify({ provider: p.name, email, on: new Date().toISOString().slice(0, 10) }));
    setSent(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <Link to={employer ? '/employer/settings' : '/employers'} className="ow-backlink">
            {employer ? '← Settings' : '← For employers'}
          </Link>
        </div>
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Connect your hiring system
          </Text>
          <Text as="p" tone="subdued">
            Keep Openwork in step with the system your recruiting team already uses. Open, edit or close a job there and it changes here. Nobody maintains two lists.
          </Text>
        </BlockStack>

        {(sent || requested) && (
          <Banner tone="success" title={`${employer?.ats?.provider ?? chosen?.name} noted`}>
            <p>
              No integration is live yet, so nothing is syncing. We will email {employer ? 'your accessibility contact' : email || 'you'} the day yours can be switched on. Until then, <Link to={employer ? '/employer/jobs/import' : '/import'}>importing from your careers page</Link> keeps your jobs current.
            </p>
          </Banner>
        )}

        <Banner tone="info" title="Where integrations actually stand">
          <p>None of these are connected yet. We are building them one at a time and starting with whichever our founding employers use most, which is why telling us yours matters.</p>
        </Banner>

        <div className="ow-sheet">
          <BlockStack gap="300">
            <Text as="h2" variant="headingLg">
              Your system
            </Text>
            <ul className="ow-picked ow-picked--stack" aria-label="Hiring systems">
              {ATS_PROVIDERS.map((p) => (
                <li key={p.id} className="ow-picked__row ow-picked__row--tall">
                  <BlockStack gap="050">
                    <InlineStack gap="200" blockAlign="center" wrap>
                      <Text as="h3" variant="headingSm">
                        {p.name}
                      </Text>
                      <Badge tone={TONE[p.status]}>{ATS_STATUS_LABEL[p.status]}</Badge>
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {p.note}
                    </Text>
                  </BlockStack>
                  <Button onClick={() => request(p)} disabled={sent && chosen?.id === p.id} accessibilityLabel={`Tell Openwork you use ${p.name}`}>
                    {sent && chosen?.id === p.id ? 'Noted' : p.status === 'comingSoon' ? 'Notify me' : 'Request'}
                  </Button>
                </li>
              ))}
            </ul>
            {!employer && <TextField label="Work email" type="email" value={email} onChange={setEmail} autoComplete="email" helpText="So we can tell you when it is ready. Nothing else." />}
          </BlockStack>
        </div>

        <div className="ow-why">
          <Text as="p" variant="bodySm">
            <strong>What will sync:</strong> title, location, pay, description and whether the job is open. <strong>What Openwork adds on top, once per job:</strong> schedule, environment, physical requirements, digital accessibility, hiring steps and accessible hiring options. That part takes about three minutes and never writes back to your ATS.
          </Text>
        </div>
        <Text as="p" variant="bodySm" tone="subdued">
          Not ready to connect? <Link to={employer ? '/employer/jobs/import' : '/import'}>Import from your careers page</Link> instead. It takes one paste.
        </Text>
      </BlockStack>
    </div>
  );
}
