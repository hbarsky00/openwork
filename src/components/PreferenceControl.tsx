import { BlockStack, Box, Button, InlineStack, Text } from '@shopify/polaris';
import type { Dimension } from '../lib/dimensions';
import { IMPORTANCE_LABEL, VISIBILITY_LABEL } from '../lib/format';
import type { CandidatePreference, Importance, Visibility } from '../lib/types';
import { ChoiceChips } from './ChoiceChips';

interface Props {
  dimension: Dimension;
  value: CandidatePreference | undefined;
  onChange: (next: CandidatePreference | undefined) => void;
  showVisibility?: boolean;
  /** Onboarding: bigger question, no card border. */
  hero?: boolean;
}

const IMPORTANCE = (Object.keys(IMPORTANCE_LABEL) as Importance[]).map((k) => ({ value: k, label: IMPORTANCE_LABEL[k] }));
const VISIBILITY = (Object.keys(VISIBILITY_LABEL) as Visibility[]).map((k) => ({ value: k, label: VISIBILITY_LABEL[k] }));

/** One "How I work best" question: answer chips, then importance and privacy chips. */
export function PreferenceControl({ dimension, value, onChange, showVisibility = true, hero = false }: Props) {
  const body = (
    <BlockStack gap="400">
      {hero ? (
        <Text as="h1" variant="headingXl">
          {dimension.candidateQuestion}
        </Text>
      ) : null}
      <ChoiceChips
        label={dimension.candidateQuestion}
        labelHidden={hero}
        options={dimension.options.map((o) => ({ value: o.value, label: o.candidateLabel }))}
        value={value?.value ?? null}
        size={hero ? 'large' : 'medium'}
        onChange={(v) => onChange(v ? { value: v as string, importance: value?.importance ?? 'preferred', visibility: value?.visibility ?? 'matching' } : undefined)}
      />
      {value && (
        <InlineStack gap="600" wrap blockAlign="start">
          <ChoiceChips label="How much does this matter?" options={IMPORTANCE} value={value.importance} allowNone={false} size="slim" onChange={(v) => onChange({ ...value, importance: v as Importance })} />
          {showVisibility && <ChoiceChips label="Who can see this?" options={VISIBILITY} value={value.visibility} allowNone={false} size="slim" onChange={(v) => onChange({ ...value, visibility: v as Visibility })} />}
          <Box paddingBlockStart="600">
            <Button variant="plain" onClick={() => onChange(undefined)}>
              Clear
            </Button>
          </Box>
        </InlineStack>
      )}
    </BlockStack>
  );
  if (hero) return body;
  return (
    <Box padding="400" borderColor="border-secondary" borderWidth="025" borderRadius="300" background="bg-surface">
      {body}
    </Box>
  );
}
