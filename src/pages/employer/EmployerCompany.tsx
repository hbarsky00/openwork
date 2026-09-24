import { Banner, BlockStack, Button, Card, FormLayout, InlineStack, Layout, Page, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { CompletenessMeter } from '../../components/CompletenessMeter';
import { VerificationBadge } from '../../components/VerificationBadge';
import type { Employer } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

export function EmployerCompany() {
  useTitle('Company profile');
  const { state, dispatch } = useStore();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  const [draft, setDraft] = useState<Employer>(employer);
  const [saved, setSaved] = useState(false);
  const set = (p: Partial<Employer>) => { setDraft((d) => ({ ...d, ...p })); setSaved(false); };
  const setWp = (p: Partial<Employer['workplace']>) => set({ workplace: { ...draft.workplace, ...p } });
  const done = Object.values(draft.workplace).filter((v) => v.trim()).length;

  const save = () => {
    dispatch({ type: 'updateEmployer', employerId: employer.id, patch: draft });
    setSaved(true);
  };

  return (
    <Page title="Company and workplace" titleMetadata={<VerificationBadge level={employer.verification} />} primaryAction={{ content: 'Save', onAction: save }} secondaryActions={[{ content: 'Workplace accessibility', url: '/employer/accessibility' }, { content: 'View public profile', url: `/companies/${employer.id}` }]}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {saved && <Banner tone="success" title="Saved" onDismiss={() => setSaved(false)} />}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Company
                </Text>
                <FormLayout>
                  <TextField label="Name" value={draft.name} onChange={(v) => set({ name: v })} autoComplete="organization" />
                  <FormLayout.Group>
                    <TextField label="Industry" value={draft.industry} onChange={(v) => set({ industry: v })} autoComplete="off" />
                    <TextField label="Size" value={draft.size} onChange={(v) => set({ size: v })} autoComplete="off" placeholder="e.g. 120 employees" />
                  </FormLayout.Group>
                  <TextField label="Headquarters" value={draft.headquarters} onChange={(v) => set({ headquarters: v })} autoComplete="off" />
                  <TextField label="About" value={draft.about} onChange={(v) => set({ about: v })} multiline={3} autoComplete="off" helpText="What the company does and what kinds of jobs it has. Plain and specific." />
                  <TextField label="Mission, in one sentence" value={draft.mission} onChange={(v) => set({ mission: v })} autoComplete="off" />
                  <TextField label="Benefits" value={draft.benefits.join('\n')} onChange={(v) => set({ benefits: v.split('\n') })} onBlur={() => set({ benefits: draft.benefits.map((b) => b.trim()).filter(Boolean) })} multiline={4} autoComplete="off" helpText="One per line." />
                </FormLayout>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingLg">
                    How your workplace runs
                  </Text>
                  <Text as="p" tone="subdued">
                    Shown on your company page and every job. Describe what actually happens, not what you aspire to. Candidates compare this with their own experience.
                  </Text>
                </BlockStack>
                <FormLayout>
                  <TextField label="How people communicate" value={draft.workplace.communicationNorms} onChange={(v) => setWp({ communicationNorms: v })} multiline={2} autoComplete="off" helpText="Where do tasks come from? Chat, email, meetings, phone? What is written down?" />
                  <TextField label="Onboarding" value={draft.workplace.onboarding} onChange={(v) => setWp({ onboarding: v })} multiline={2} autoComplete="off" helpText="Is there a written plan? A named person? How long before someone works alone?" />
                  <TextField label="Manager check-ins" value={draft.workplace.managerCadence} onChange={(v) => setWp({ managerCadence: v })} autoComplete="off" helpText="How often, how long, scheduled or ad hoc." />
                  <TextField label="How someone asks for an adjustment" value={draft.workplace.accommodationRoute} onChange={(v) => setWp({ accommodationRoute: v })} multiline={2} autoComplete="off" helpText="A named person or address. Say whether a reason is needed — it should not be." />
                </FormLayout>
              </BlockStack>
            </Card>
            <InlineStack>
              <Button variant="primary" onClick={save}>
                Save
              </Button>
            </InlineStack>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            <Card>
              <CompletenessMeter id="cm-wp" done={done} total={4} label="Workplace profile" why="Candidates read this before they apply. Four short answers." />
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Verification
                </Text>
                <VerificationBadge level={employer.verification} detailed />
                <Text as="p" variant="bodySm" tone="subdued">
                  Levels are set by the Openwork trust team, not by you. Completing this page and every job’s workplace section is the first step.
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
