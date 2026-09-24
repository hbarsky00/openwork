import { BlockStack, InlineStack, ProgressBar, Text } from '@shopify/polaris';

/**
 * Calm completeness. "8 of 11" with a reason, never a percentage badge or a
 * nudge to fill in things that are not true.
 */
export function CompletenessMeter({
  done,
  total,
  label,
  why,
  id,
}: {
  done: number;
  total: number;
  label: string;
  why: string;
  id: string;
}) {
  return (
    <BlockStack gap="200">
      <InlineStack align="space-between" blockAlign="baseline">
        <Text as="h3" variant="headingSm" id={id}>
          {label}
        </Text>
        <Text as="span" variant="bodySm" tone="subdued">
          {done} of {total}
        </Text>
      </InlineStack>
      <ProgressBar progress={total === 0 ? 0 : Math.round((done / total) * 100)} size="small" tone="primary" ariaLabelledBy={id} />
      <Text as="p" variant="bodySm" tone="subdued">
        {why}
      </Text>
    </BlockStack>
  );
}
