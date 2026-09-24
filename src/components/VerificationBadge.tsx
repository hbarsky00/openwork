import { Badge, BlockStack, Text, Tooltip } from '@shopify/polaris';
import { VERIFICATION_DESCRIPTION, VERIFICATION_LABEL } from '../lib/format';
import type { VerificationLevel } from '../lib/types';

const TONE: Record<VerificationLevel, 'success' | 'info' | undefined> = {
  listed: undefined,
  practicesCompleted: 'info',
  verifiedPractices: 'success',
};

export function VerificationBadge({ level, detailed = false }: { level: VerificationLevel; detailed?: boolean }) {
  if (detailed) {
    return (
      <BlockStack gap="100">
        <div>
          <Badge tone={TONE[level]}>{VERIFICATION_LABEL[level]}</Badge>
        </div>
        <Text as="p" variant="bodySm" tone="subdued">
          {VERIFICATION_DESCRIPTION[level]}
        </Text>
      </BlockStack>
    );
  }
  return (
    <Tooltip content={VERIFICATION_DESCRIPTION[level]}>
      <Badge tone={TONE[level]}>{VERIFICATION_LABEL[level]}</Badge>
    </Tooltip>
  );
}
