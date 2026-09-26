import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { BlockStack, Button, Form, FormLayout, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { clerkEnabled } from '../../auth/clerk';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/** Name and email, then straight into setup. One button. */
export function SignUp() {
  useTitle('Sign up');
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const next = sp.get('next');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submit = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Enter the name you want employers to see.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter an email address like name@example.com.';
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch({ type: 'signUpCandidate', name: name.trim(), email: email.trim() });
    navigate(`/onboarding${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Sign up
          </Text>
          <Text as="p" tone="subdued">
            Your name and an email. Then a short setup so your matches fit you. Nothing is shared with employers until you apply.
          </Text>
        </BlockStack>

        {clerkEnabled ? (
          <div className="ow-clerk">
            <ClerkSignUp routing="path" path="/signup" signInUrl="/signin" fallbackRedirectUrl="/onboarding" />
          </div>
        ) : (
          <div className="ow-sheet">
            <Form onSubmit={submit}>
              <FormLayout>
                <TextField label="Your name" value={name} onChange={setName} autoComplete="name" error={errors.name} requiredIndicator />
                <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} requiredIndicator helpText="For logging in and application updates." />
                <Button submit variant="primary" size="large">
                  Sign up
                </Button>
              </FormLayout>
            </Form>
          </div>
        )}

        <Text as="p" variant="bodySm" tone="subdued">
          Already have an account? <Link to={`/signin${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Log in</Link>. Hiring? <Link to="/employers/signup">Create an employer account</Link>.
        </Text>
      </BlockStack>
    </div>
  );
}
