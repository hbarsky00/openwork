import { BlockStack, Button, Card, Form, FormLayout, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Employer } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/** Two fields. Everything else is a checklist on the overview. */
export function EmployerSignUp() {
  useTitle('Create employer account');
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Enter the organization name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter a work email address.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const employer: Employer = { id: `emp-${Date.now().toString(36)}`, name: name.trim(), industry: '', size: '', headquarters: '', about: '', mission: '', benefits: [], verification: 'listed', verifiedOn: null, workplace: { communicationNorms: '', onboarding: '', accommodationRoute: `Email ${email.trim()}. No reason needed.`, managerCadence: '' }, accessibility: {}, accessibilityContact: email.trim(), logoColor: '#4A5568' };
    dispatch({ type: 'createEmployer', employer });
    navigate('/employer');
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Create an employer account
          </Text>
          <Text as="p" tone="subdued">
            Two fields now. Your overview then walks you through three things: workplace accessibility, your first job, and your company page.
          </Text>
        </BlockStack>
        <Card>
          <Form onSubmit={submit}>
            <FormLayout>
              <TextField label="Organization name" value={name} onChange={setName} autoComplete="organization" error={errors.name} requiredIndicator />
              <TextField label="Your work email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} requiredIndicator helpText="Becomes your accessibility contact until you name someone else." />
              <Button submit variant="primary" size="large">
                Create account
              </Button>
            </FormLayout>
          </Form>
        </Card>
      </BlockStack>
    </div>
  );
}
