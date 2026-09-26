import { Banner, BlockStack, Button, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { OptionGrid } from '../../components/OptionGrid';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const PROVIDERS = ['Greenhouse', 'Lever', 'Workday', 'Ashby', 'SmartRecruiters', 'iCIMS', 'Other'];

/**
 * ATS connection, designed ahead of the integrations. Nothing here pretends to
 * sync: the employer names their system, we record the request, and the jobs
 * page shows "Not connected" until it is real.
 */
export function ConnectAts() {
  useTitle('Connect your ATS');
  const { state, dispatch } = useStore();
  const employer = state.employers.find((e) => e.id === state.employerId) ?? null;
  const [provider, setProvider] = useState<string | null>(employer?.ats?.provider ?? null);
  const [email, setEmail] = useState(employer?.accessibilityContact.match(/[^\s]+@[^\s]+/)?.[0] ?? '');
  const [sent, setSent] = useState(false);
  const requested = employer?.ats?.status === 'requested';

  const submit = () => {
    if (!provider) return;
    if (employer) dispatch({ type: 'requestAts', provider });
    else localStorage.setItem('openwork.atsInterest', JSON.stringify({ provider, email, on: new Date().toISOString().slice(0, 10) }));
    setSent(true);
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Connect your ATS
          </Text>
          <Text as="p" tone="subdued">
            Your jobs stay in your system and appear on Openwork automatically. Open, edit or close a job there and it changes here. You never maintain two lists.
          </Text>
        </BlockStack>

        {(sent || requested) && (
          <Banner tone="success" title={`${employer?.ats?.provider ?? provider} connection requested`}>
            <p>Integrations are being built one system at a time. We will email {employer ? 'your accessibility contact' : email || 'you'} when yours is ready to switch on. Until then, <Link to={employer ? '/employer/jobs/import' : '/import'}>import from your careers page</Link> keeps your jobs current.</p>
          </Banner>
        )}

        <div className="ow-sheet">
          <BlockStack gap="400">
            <OptionGrid label="Which system do you use?" options={PROVIDERS.map((p) => ({ value: p, label: p, helpText: p === 'Other' ? 'Tell us which' : 'Integration in development' }))} value={provider} onChange={(v) => setProvider(v as string | null)} />
            {!employer && <TextField label="Work email" type="email" value={email} onChange={setEmail} autoComplete="email" helpText="So we can tell you when it is ready. Nothing else." />}
            <Text as="p" variant="bodySm" tone="subdued">
              What syncs: title, location, pay, description, status. What Openwork adds on top, once per job: schedule, environment, physical requirements, digital accessibility, hiring steps and accessible hiring options. That part takes about three minutes and never changes your ATS record.
            </Text>
            <Button variant="primary" size="large" disabled={!provider || sent || requested} onClick={submit}>
              {requested || sent ? 'Requested' : 'Request connection'}
            </Button>
          </BlockStack>
        </div>
        <Text as="p" variant="bodySm" tone="subdued">
          Not ready to connect? <Link to={employer ? '/employer/jobs/import' : '/import'}>Import from your careers page</Link> instead. It takes one paste.
        </Text>
      </BlockStack>
    </div>
  );
}
