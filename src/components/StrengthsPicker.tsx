import { Autocomplete, BlockStack, Button, Icon, Text } from '@shopify/polaris';
import { SearchIcon, XIcon } from '@shopify/polaris-icons';
import { useMemo, useState } from 'react';
import { STRENGTHS } from '../lib/access';

/**
 * Strengths: a typeahead over the shared list, selected ones as tags. Typing
 * something not on the list adds it as your own. One control, no chip wall.
 */
export function StrengthsPicker({ value, onChange, title = 'What are you good at?', labelHidden = false }: { value: string[]; onChange: (v: string[]) => void; title?: string; labelHidden?: boolean }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  // Eight rows at most. The list is a helper, not the page.
  const options = useMemo(() => STRENGTHS.filter((s) => !q || s.toLowerCase().includes(q)).filter((s) => !value.includes(s)).slice(0, 8).map((s) => ({ value: s, label: s })), [q, value]);
  const exact = STRENGTHS.some((s) => s.toLowerCase() === q) || value.some((s) => s.toLowerCase() === q);
  const addOwn = () => {
    const v = query.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setQuery('');
  };
  return (
    <BlockStack gap="300">
      <Autocomplete
        allowMultiple
        options={options}
        selected={[]}
        onSelect={(picked) => {
          onChange([...value, ...picked.filter((v) => !value.includes(v))]);
          setQuery('');
        }}
        actionBefore={q && !exact ? { content: `Add “${query.trim()}” as your own`, onAction: addOwn } : undefined}
        emptyState={
          <Text as="p" tone="subdued">
            Nothing on the list matches. Add it as your own above.
          </Text>
        }
        textField={<Autocomplete.TextField label={title} labelHidden={labelHidden} value={query} onChange={setQuery} autoComplete="off" prefix={<Icon source={SearchIcon} />} placeholder="Type a strength — organizing, numbers, fixing things…" />}
      />
      <PickedList items={value} label="Your strengths" onRemove={(s) => onChange(value.filter((v) => v !== s))} />
    </BlockStack>
  );
}

/** Chosen items as a plain list with one Remove per row. Nothing wraps into a cloud. */
export function PickedList({ items, label, onRemove }: { items: string[]; label: string; onRemove: (item: string) => void }) {
  if (items.length === 0) return null;
  return (
    <ul className="ow-picked" aria-label={label}>
      {items.map((s) => (
        <li key={s} className="ow-picked__row">
          <Text as="span">{s}</Text>
          <Button variant="plain" icon={XIcon} accessibilityLabel={`Remove ${s}`} onClick={() => onRemove(s)} />
        </li>
      ))}
    </ul>
  );
}
