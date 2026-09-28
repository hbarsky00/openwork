import { BlockStack, Button, Form, FormLayout, Select, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { emailMatchesEmployer } from '../../lib/postDraft';
import type { EmployerLead } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/**
 * Companies listed from public information get claimed by a work email at
 * their own domain. Typing a company name never grants control: the address
 * has to match, and anything else goes to the trust team.
 */
export function ClaimCompany() {
  useTitle('Claim your company');
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const jobId = sp.get('job');
  const unclaimed = state.employers.filter((e) => !e.claimedBy);
  const [companyId, setCompanyId] = useState(sp.get('company') ?? unclaimed[0]?.id ?? '');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState(false);
  const company = state.employers.find((e) => e.id === companyId);
  const domainHint = company?.accessibilityContact.match(/@([a-z0-9.-]+)/i)?.[1];
  const openJobs = company ? state.jobs.filter((j) => j.employerId === company.id && j.status === 'published').length : 0;
  const job = jobId ? state.jobs.find((j) => j.id === jobId) : null;

  const lead = (stage: EmployerLead['stage'], employerId: string | null, message: string) =>
    dispatch({ type: 'addLead', lead: { id: `lead-${Date.now().toString(36)}`, company: company?.name ?? '', website: '', careersUrl: '', email: email.trim(), openJobs: String(openJobs), ats: 'Unknown', message, stage, createdOn: new Date().toISOString().slice(0, 10), notes: [], employerId } });

  const submit = () => {
    if (!company) return setError('Choose your company.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Enter your work email address.');
    setError(null);
    if (!emailMatchesEmployer(email, company)) {
      lead('verification', null, `Claim request for ${company.name} from an address outside its domain${job ? ` (via the ${job.title} posting)` : ''}. Needs trust-team review.`);
      setReview(true);
      window.scrollTo({ top: 0 });
      return;
    }
    dispatch({ type: 'claimEmployer', employerId: company.id, email: email.trim() });
    lead('active', company.id, `Claimed by work email${job ? ` from the ${job.title} posting` : ''}.`);
    navigate(job ? `/employer/jobs/${job.id}/enrich` : '/employer/start');
  };

  if (review) {
    return (
      <div className="ow-container ow-container--narrow">
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text as="h1" variant="heading2xl">
              We will check this by hand.
            </Text>
            <Text as="p" tone="subdued">
              {email} is not at {company?.name}’s domain{domainHint ? ` (${domainHint})` : ''}, so we will not hand over the company page automatically. Our trust team reviews it and comes back to you, usually within a business day.
            </Text>
          </BlockStack>
          <div className="ow-why">
            <Text as="p">
              Faster: claim it with an address at your company’s domain. Or <Link to="/employers/signup">create a new employer account</Link>, which does not touch the existing listing.
            </Text>
          </div>
          <Button url="/employers">Back to For employers</Button>
        </BlockStack>
      </div>
    );
  }

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Claim your company
          </Text>
          <Text as="p" tone="subdued">
            Openwork lists companies from public information. If yours is here, take it over with a work email at your domain. You keep everything already listed and can correct any of it.
          </Text>
        </BlockStack>

        {company && (
          <div className="ow-why">
            <BlockStack gap="050">
              <Text as="p" variant="headingMd">
                {company.name}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {openJobs} open job{openJobs === 1 ? '' : 's'} on Openwork{company.headquarters ? ` · ${company.headquarters}` : ''}
                {job ? ` · you came from ${job.title}` : ''}
              </Text>
              <Text as="p" variant="bodySm">
                Is this your company?
              </Text>
            </BlockStack>
          </div>
        )}

        {unclaimed.length === 0 ? (
          <div className="ow-sheet">
            <Text as="p">
              Every listed company has been claimed. <Link to="/employers/signup">Create a new employer account</Link> instead.
            </Text>
          </div>
        ) : (
          <div className="ow-sheet">
            <Form onSubmit={submit}>
              <FormLayout>
                <Select label="Your company" options={unclaimed.map((e) => ({ label: `${e.name} · ${e.headquarters}`, value: e.id }))} value={companyId} onChange={setCompanyId} />
                <TextField label="Your work email" type="email" value={email} onChange={(v) => { setEmail(v); setError(null); }} autoComplete="email" error={error ?? undefined} requiredIndicator helpText={domainHint ? `An address at ${domainHint}. We use it to confirm you work there.` : 'An address at your company’s domain.'} />
                <Button submit variant="primary" size="large">
                  Claim company
                </Button>
              </FormLayout>
            </Form>
          </div>
        )}
        <Text as="p" variant="bodySm" tone="subdued">
          Not listed? <Link to="/employers/signup">Create an employer account</Link>, <Link to="/import">import your jobs</Link>, or <Link to="/employers/founding">join Founding Employers</Link>.
        </Text>
      </BlockStack>
    </div>
  );
}
