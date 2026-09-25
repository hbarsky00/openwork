import { Text } from '@shopify/polaris';
import { ACCESS_FEATURE_BY_ID } from '../lib/access';
import type { MatchReason, MatchResult } from '../lib/match';
import { Signal } from './Signal';

/**
 * AIApply-style fit on a card: one line with the count, then up to three
 * check/cross lines. Only for signed-in candidates who told us what they need.
 */
export function FitPanel({ result, compact = false }: { result: MatchResult; compact?: boolean }) {
  if (result.comparable === 0 && result.strengthsMatched.length === 0) return null;
  // Two things that match, then the one that does not — the cross is the
  // line people actually need to see. Fill up with matches if nothing differs.
  const limit = compact ? 3 : 4;
  const picked: MatchReason[] = [...result.confirmed.slice(0, limit - 1), ...[...result.different, ...result.review].slice(0, 1)];
  for (const r of result.confirmed.slice(limit - 1)) if (picked.length < limit) picked.push(r);
  const lines = picked.map((r) => ({ state: r.state, label: r.kind === 'need' ? ACCESS_FEATURE_BY_ID[r.id]?.label ?? r.label : r.label }));
  const strong = result.summary === 'strong' || result.summary === 'good';
  return (
    <div className={`ow-fit ow-fit--${strong ? 'good' : result.summary === 'mixed' ? 'mixed' : 'weak'}`}>
      <Text as="p" variant="bodySm" fontWeight="semibold">
        {result.comparable > 0 ? `Matches ${result.confirmed.length} of ${result.comparable} things you need` : `Uses ${result.strengthsMatched.length} of your strengths`}
      </Text>
      <div className="ow-jobcard__signals">
        {lines.map((s) => (
          <Signal key={s.label} state={s.state}>
            {s.label}
          </Signal>
        ))}
      </div>
    </div>
  );
}
