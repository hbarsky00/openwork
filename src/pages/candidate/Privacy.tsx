import { Badge, BlockStack, Button, Card, DescriptionList, InlineStack, Select, Text } from '@shopify/polaris';
import { ACCESS_FEATURE_BY_ID } from '../../lib/access';
import { DIMENSIONS, optionOf } from '../../lib/dimensions';
import { VISIBILITY_HELP, VISIBILITY_LABEL } from '../../lib/format';
import type { Visibility } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const OPTIONS = (Object.keys(VISIBILITY_LABEL) as Visibility[]).map((k) => ({ label: VISIBILITY_LABEL[k], value: k }));

export function Privacy() {
  useTitle('Privacy & sharing');
  const { state, dispatch } = useStore();
  const p = state.candidate!;
  const patch = (x: Partial<typeof p>) => dispatch({ type: 'updateCandidate', patch: x });

  const setAll = (visibility: Visibility) =>
    patch({
      workPreferences: Object.fromEntries(Object.entries(p.workPreferences).map(([k, v]) => [k, { ...v!, visibility }])) as typeof p.workPreferences,
      accessNeeds: Object.fromEntries(Object.entries(p.accessNeeds).map(([k, v]) => [k, { ...v, visibility }])),
    });
  const needs = Object.entries(p.accessNeeds);

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Button url="/passport" variant="plain">
            ← My passport
          </Button>
          <Text as="h1" variant="heading2xl">
            Privacy &amp; sharing
          </Text>
          <Text as="p" tone="subdued">
            Three states, one meaning each. Nothing marked “Shared with employer” leaves Openwork until you confirm it on the “What this employer will see” step of an application.
          </Text>
        </BlockStack>

        <Card>
          <DescriptionList
            items={(Object.keys(VISIBILITY_LABEL) as Visibility[]).map((k) => ({
              term: VISIBILITY_LABEL[k],
              description: VISIBILITY_HELP[k],
            }))}
          />
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              What makes work accessible for me
            </Text>
            {needs.length === 0 && (
              <Text as="p" tone="subdued">
                No access needs added yet.
              </Text>
            )}
            {needs.map(([id, need]) => (
              <InlineStack key={id} align="space-between" blockAlign="center" wrap gap="300">
                <Text as="h3" variant="headingSm">
                  {ACCESS_FEATURE_BY_ID[id]?.label ?? id}
                </Text>
                <div style={{ minWidth: 220 }}>
                  <Select label={`Visibility for ${ACCESS_FEATURE_BY_ID[id]?.label ?? id}`} labelHidden options={OPTIONS} value={need.visibility} onChange={(v) => patch({ accessNeeds: { ...p.accessNeeds, [id]: { ...need, visibility: v as Visibility } } })} />
                </div>
              </InlineStack>
            ))}
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center" wrap gap="300">
              <Text as="h2" variant="headingLg">
                How I work best
              </Text>
              <InlineStack gap="200">
                <Button onClick={() => setAll('matching')}>Set everything to matching only</Button>
                <Button onClick={() => setAll('shared')}>Set everything to OK to share</Button>
              </InlineStack>
            </InlineStack>
            {DIMENSIONS.filter((d) => p.workPreferences[d.id]).length === 0 && (
              <Text as="p" tone="subdued">
                You have not answered any questions yet.
              </Text>
            )}
            {DIMENSIONS.filter((d) => p.workPreferences[d.id]).map((d) => {
              const pref = p.workPreferences[d.id]!;
              const opt = optionOf(d.id, pref.value);
              return (
                <InlineStack key={d.id} align="space-between" blockAlign="center" wrap gap="300">
                  <BlockStack gap="050">
                    <Text as="h3" variant="headingSm">
                      {d.label}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {opt?.candidateLabel}
                    </Text>
                  </BlockStack>
                  <div style={{ minWidth: 220 }}>
                    <Select label={`Visibility for ${d.label}`} labelHidden options={OPTIONS} value={pref.visibility} onChange={(v) => patch({ workPreferences: { ...p.workPreferences, [d.id]: { ...pref, visibility: v as Visibility } } })} />
                  </div>
                </InlineStack>
              );
            })}
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              Other information
            </Text>
            <Select label="Support I may request" helpText={VISIBILITY_HELP[p.privacy.supportNotes]} options={OPTIONS} value={p.privacy.supportNotes} onChange={(v) => patch({ privacy: { ...p.privacy, supportNotes: v as Visibility } })} />
            <Select label="Ways I want to demonstrate my skills" helpText={VISIBILITY_HELP[p.privacy.hiringPreferences]} options={OPTIONS} value={p.privacy.hiringPreferences} onChange={(v) => patch({ privacy: { ...p.privacy, hiringPreferences: v as Visibility } })} />
            <Select label="Work examples" helpText={VISIBILITY_HELP[p.privacy.workExamples]} options={OPTIONS.filter((o) => o.value !== 'matching')} value={p.privacy.workExamples} onChange={(v) => patch({ privacy: { ...p.privacy, workExamples: v as Visibility } })} />
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingLg">
              What Openwork never collects
            </Text>
            <InlineStack gap="200" wrap>
              <Badge>Diagnosis</Badge>
              <Badge>Medical history</Badge>
              <Badge>“Functioning level”</Badge>
              <Badge>Disability status</Badge>
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              There are no fields for these anywhere on the platform. Matching uses only the practical preferences you choose to enter.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </div>
  );
}
