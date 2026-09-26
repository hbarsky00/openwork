import { BlockStack, Button, Form, FormLayout, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { clearPostDraft, readPostDraft } from '../../lib/postDraft';
import type { Employer } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const today = () => new Date().toISOString().slice(0, 10);

/** Two fields. If a job was written first (/post), it is saved to the new account here and published if that was the intent. */
export function EmployerSignUp() {
  useTitle('Create employer account');
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const draft = sp.get('from') === 'post' ? readPostDraft() : null;
  const plan = (sp.get('plan') as Employer['plan']) ?? 'free';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Enter the organization name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter a work email address.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const employer: Employer = { id: `emp-${Date.now().toString(36)}`, name: name.trim(), industry: '', size: '', headquarters: '', about: '', mission: '', benefits: [], verification: 'listed', verifiedOn: null, workplace: { communicationNorms: '', onboarding: '', accommodationRoute: `Email ${email.trim()}. No reason needed.`, managerCadence: '' }, accessibility: {}, accessibilityContact: email.trim(), typicalResponse: 'within two weeks', logoColor: '#4A5568', claimedBy: email.trim(), plan: ['free', 'growth', 'enterprise'].includes(plan ?? '') ? plan : 'free' };
    dispatch({ type: 'createEmployer', employer });
    if (draft) {
      const publish = draft.intent === 'publish';
      const job = { ...draft.job, employerId: employer.id, status: publish ? ('published' as const) : ('draft' as const), postedOn: today(), accommodationRoute: draft.job.accommodationRoute || employer.workplace.accommodationRoute };
      dispatch({ type: 'upsertJob', job });
      clearPostDraft();
      navigate(publish ? `/employer/jobs/${job.id}/preview?published=1` : '/employer/jobs');
      return;
    }
    navigate('/employer/jobs/new');
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            {draft ? 'Almost done.' : 'Create an employer account'}
          </Text>
          <Text as="p" tone="subdued">
            {draft ? `Your organization name and a work email, and “${draft.job.title || 'your job'}” ${draft.intent === 'publish' ? 'goes live' : 'is saved as a draft'}.` : 'Two fields now. Then you write your first job.'}
          </Text>
        </BlockStack>
        <div className="ow-sheet">
          <Form onSubmit={submit}>
            <FormLayout>
              <TextField label="Organization name" value={name} onChange={setName} autoComplete="organization" error={errors.name} requiredIndicator />
              <TextField label="Your work email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} requiredIndicator helpText="Becomes your accessibility contact until you name someone else." />
              <Button submit variant="primary" size="large">
                {draft ? (draft.intent === 'publish' ? 'Create account and publish' : 'Create account and save draft') : 'Create account'}
              </Button>
            </FormLayout>
          </Form>
        </div>
        <Text as="p" variant="bodySm" tone="subdued">
          Already have an account? <Link to="/signin?role=employer">Log in</Link>. Is your company already listed? <Link to="/claim">Claim your company page</Link>. <Link to="/pricing">Pricing</Link>.
        </Text>
      </BlockStack>
    </div>
  );
}
