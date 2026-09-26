import { Button, Text } from '@shopify/polaris';
import { MagicIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { suggestRewrites, type SuggestContext, type SuggestKind } from '../lib/suggest';

/** "Suggest rewrites" for one résumé field. Shows up to three options; the person picks one or keeps their own words. */
export function SuggestRewrite({ kind, text, context, onUse, label = 'Suggest rewrites' }: { kind: SuggestKind; text: string; context: SuggestContext; onUse: (text: string) => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const out = await suggestRewrites(kind, text, context);
      setOptions(out);
      if (out.length === 0) setError('No suggestions came back. Your text may already be as clear as it gets.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suggestions are unavailable right now.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ow-suggest">
      <Button size="slim" icon={MagicIcon} loading={busy} disabled={!text.trim()} onClick={run}>
        {options.length ? 'Suggest again' : label}
      </Button>
      {error && (
        <Text as="p" variant="bodySm" tone="subdued">
          {error}
        </Text>
      )}
      {options.length > 0 && (
        <ul className="ow-suggest__list" aria-label="Suggested rewrites">
          {options.map((o, i) => (
            <li key={i} className="ow-suggest__item">
              <Text as="p">{o}</Text>
              <Button size="slim" onClick={() => { onUse(o); setOptions([]); }}>
                Use this
              </Button>
            </li>
          ))}
          <li className="ow-suggest__keep">
            <Button variant="plain" onClick={() => setOptions([])}>
              Keep my words
            </Button>
          </li>
        </ul>
      )}
    </div>
  );
}
