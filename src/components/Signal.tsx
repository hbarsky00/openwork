import { AlertTriangleIcon, CheckIcon, MinusCircleIcon, QuestionCircleIcon, XCircleIcon } from '@shopify/polaris-icons';
import { MATCH_STATE_LABEL, MATCH_STATE_SYMBOL, type MatchState } from '../lib/match';

const ICON: Record<MatchState, React.FunctionComponent<React.SVGProps<SVGSVGElement>>> = {
  confirmed: CheckIcon,
  review: AlertTriangleIcon,
  different: XCircleIcon,
  notImportant: MinusCircleIcon,
  needsConfirmation: QuestionCircleIcon,
};

/**
 * Compact icon + text state marker for job cards. Meaning never depends on
 * color: the state name is read out, and the icon shapes differ.
 */
export function Signal({ state, children }: { state: MatchState; children: React.ReactNode }) {
  const Icon = ICON[state];
  return (
    <span className={`ow-signal ow-signal--${state}`}>
      <span className="ow-signal__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="ow-visually-hidden">{MATCH_STATE_LABEL[state]}: </span>
      <span>{children}</span>
    </span>
  );
}

export function ReasonIcon({ state }: { state: MatchState }) {
  const Icon = ICON[state];
  return (
    <span className={`ow-reason__icon`} aria-hidden="true">
      <Icon />
    </span>
  );
}

/** Text symbol in a circle — ✓ △ ✗ ? – — for evidence lists. Label is read out. */
export function StateSymbol({ state }: { state: MatchState }) {
  return (
    <span className={`ow-symbol ow-symbol--${state}`} role="img" aria-label={MATCH_STATE_LABEL[state]}>
      {MATCH_STATE_SYMBOL[state]}
    </span>
  );
}
