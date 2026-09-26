import { BlockStack, Button, Form, FormLayout, Select, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { emailMatchesEmployer } from '../../lib/postDraft';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/** Companies already listed get claimed by a work email at their domain. In the prototype the domain check stands in for the confirmation email. */
export function ClaimCompany() {
  useTitle('Claim your company page');
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const unclaimed = state.employers.filter((e) => !e.claimedBy);
  const [companyId, setCompanyId] = useState(sp.get('company') ?? unclaimed[0]?.id ?? '');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const company = state.employers.find((e) => e.id === companyId);
  const domainHint = company?.accessibilityContact.match(/@([a-z0-9.-]+)/i)?.[1];

  const submit = () => {
    if (!company) return setError('Choose your company.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Enter your work email address.');
    if (!emailMatchesEmployer(email, company)) return setError(`That address is not at the ${company.name} domain${domainHint ? ` (${domainHint})` : ''}. Use your work email, or create a new employer account.`);
    setError(null);
    dispatch({ type: 'claimEmployer', employerId: company.id, email: email.trim() });
    navigate('/employer');
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Claim your company page
          </Text>
          <Text as="p" tone="subdued">
            Openwork lists companies from public information. If yours is here, take it over with a work email at your domain. You keep everything already listed and can correct it.
          </Text>
        </BlockStack>
        {unclaimed.length === 0 ? (
          <div className="ow-sheet">
            <Text as="p">Every listed company has been claimed. <Link to="/employers/signup">Create a new employer account</Link> instead.</Text>
          </div>
        ) : (
          <div className="ow-sheet">
            <Form onSubmit={submit}>
              <FormLayout>
                <Select label="Your company" options={unclaimed.map((e) => ({ label: `${e.name} · ${e.headquarters}`, value: e.id }))} value={companyId} onChange={setCompanyId} />
                <TextField label="Your work email" type="email" value={email} onChange={setEmail} autoComplete="email" error={error ?? undefined} requiredIndicator helpText={domainHint ? `An address at ${domainHint}. We use it to confirm you work there.` : 'An address at your company’s domain.'} />
                <Button submit variant="primary" size="large">
                  Claim this page
                </Button>
              </FormLayout>
            </Form>
          </div>
        )}
        <Text as="p" variant="bodySm" tone="subdued">
          Not listed? <Link to="/employers/signup">Create an employer account</Link> or <Link to="/post">post a job</Link> first.
        </Text>
      </BlockStack>
    </div>
  );
}
