import { BlockStack, InlineStack, Text } from '@shopify/polaris';
import { EVIDENCE_SOURCE_LABEL, type Evidence } from '../lib/access';
import { longDate } from '../lib/format';
import type { MatchState } from '../lib/match';
import { StateSymbol } from './Signal';

export function evidenceState(ev: Evidence | undefined): MatchState {
  if (!ev) return 'needsConfirmation';
  if (ev.status === 'confirmed') return 'confirmed';
  if (ev.status === 'contact') return 'review';
  return 'different';
}

const STATUS_TEXT: Record<MatchState, string> = {
  confirmed: 'Confirmed',
  review: 'Contact employer',
  different: 'Not available',
  needsConfirmation: 'Not provided',
  notImportant: '',
};

/**
 * One accessibility fact with who said it and when. This is what replaces a
 * "Disability friendly ✓" badge: specific, sourced, dated.
 */
export function EvidenceLine({ label, evidence, action }: { label: string; evidence: Evidence | undefined; action?: React.ReactNode }) {
  const state = evidenceState(evidence);
  return (
    <li className={`ow-evidence__row ow-evidence__row--${state}`}>
      <StateSymbol state={state} />
      <BlockStack gap="050">
        <InlineStack gap="200" blockAlign="baseline" wrap>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {label}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {STATUS_TEXT[state]}
            {evidence ? ` · ${EVIDENCE_SOURCE_LABEL[evidence.source]} · ${longDate(evidence.confirmedOn)}` : ''}
          </Text>
        </InlineStack>
        {evidence?.note && (
          <Text as="p" variant="bodySm">
            “{evidence.note}”
          </Text>
        )}
        {action}
      </BlockStack>
    </li>
  );
}
