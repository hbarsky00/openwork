import { BlockStack, Button, FormLayout, InlineStack, Select, Text, TextField } from '@shopify/polaris';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/** Settings: who candidates reach, how fast you reply, and account. */
export function EmployerSettings() {
  useTitle('Settings');
  const { state, dispatch } = useStore();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  const patch = (x: Partial<typeof employer>) => dispatch({ type: 'updateEmployer', employerId: employer.id, patch: x });
  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <BlockStack gap="100">
            <Text as="h1" variant="heading2xl">
              Settings
            </Text>
            <Text as="p" tone="subdued">
              Shown to candidates on every job: who to contact and how quickly you reply.
            </Text>
          </BlockStack>
        </div>
        <div className="ow-sheet">
          <BlockStack gap="600">
            <FormLayout>
              <TextField label="Accessibility contact" value={employer.accessibilityContact} onChange={(v) => patch({ accessibilityContact: v })} autoComplete="off" helpText="A named person or address. Interview requests go here." />
              <Select label="Typical reply time" options={['within 3 business days', 'within a week', 'within two weeks', 'within a month'].map((v) => ({ label: v, value: v }))} value={employer.typicalResponse} onChange={(v) => patch({ typicalResponse: v })} />
              <TextField label="Accommodation process" value={employer.workplace.accommodationRoute} onChange={(v) => patch({ workplace: { ...employer.workplace, accommodationRoute: v } })} multiline={2} autoComplete="off" helpText="How a candidate or new hire asks for something. Plain words." />
            </FormLayout>
            <InlineStack gap="300">
              <Button url="/employer/company">Company profile</Button>
              <Button url="/employer/accessibility">Workplace accessibility</Button>
              <Button variant="plain" tone="critical" onClick={() => dispatch({ type: 'signOut' })}>
                Sign out
              </Button>
            </InlineStack>
          </BlockStack>
        </div>
      </BlockStack>
    </div>
  );
}
