import { BlockStack, Button, Card, Form, FormLayout, InlineStack, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

export function SignUp() {
  useTitle('Create account');
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submit = (then: 'onboarding' | 'jobs') => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Enter the name you want employers to see.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter an email address like name@example.com.';
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch({ type: 'signUpCandidate', name: name.trim(), email: email.trim() });
    const next = sp.get('next');
    if (then === 'jobs') {
      dispatch({ type: 'updateCandidate', patch: { onboardingComplete: true } });
      navigate(next ?? '/jobs');
    } else navigate(`/onboarding${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Create your account
          </Text>
          <Text as="p" tone="subdued">
            Two fields. Then a few one-tap questions about what you are good at and what you need — or skip them and browse.
          </Text>
        </BlockStack>
        <Card>
          <Form onSubmit={() => submit('onboarding')}>
            <FormLayout>
              <TextField label="Your name" value={name} onChange={setName} autoComplete="name" error={errors.name} requiredIndicator />
              <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} requiredIndicator helpText="For signing in and application updates. Never shared with employers unless you apply." />
              <InlineStack gap="300" wrap>
                <Button submit variant="primary" size="large">
                  Continue
                </Button>
                <Button size="large" onClick={() => submit('jobs')}>
                  Skip questions — just browse
                </Button>
              </InlineStack>
            </FormLayout>
          </Form>
        </Card>
        <Text as="p" variant="bodySm" tone="subdued">
          Already have an account? <Link to="/signin">Sign in</Link>. Hiring? <Link to="/employers/signup">Create an employer account</Link>.
        </Text>
      </BlockStack>
    </div>
  );
}
