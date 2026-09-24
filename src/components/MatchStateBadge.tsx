import { Badge } from '@shopify/polaris';
import { MATCH_STATE_LABEL, MATCH_STATE_SYMBOL, type MatchResult, type MatchState } from '../lib/match';

const TONE: Record<MatchState, 'success' | 'attention' | 'warning' | 'critical' | undefined> = {
  confirmed: 'success',
  review: 'attention',
  different: 'warning',
  notImportant: undefined,
  needsConfirmation: undefined,
};

export function MatchStateBadge({ state }: { state: MatchState }) {
  return (
    <Badge tone={TONE[state]} toneAndProgressLabelOverride={MATCH_STATE_LABEL[state]}>
      {`${MATCH_STATE_SYMBOL[state]} ${MATCH_STATE_LABEL[state]}`}
    </Badge>
  );
}

const SUMMARY_TONE: Record<MatchResult['summary'], 'success' | 'attention' | 'warning' | undefined> = {
  strong: 'success',
  good: 'success',
  mixed: 'attention',
  limited: 'warning',
  unconfirmed: undefined,
  none: undefined,
};

export function MatchSummaryBadge({ result }: { result: MatchResult }) {
  return (
    <Badge tone={SUMMARY_TONE[result.summary]} toneAndProgressLabelOverride={result.summaryLabel}>
      {result.summaryLabel}
    </Badge>
  );
}
