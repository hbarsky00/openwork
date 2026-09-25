import { Autocomplete, BlockStack, Icon, InlineStack, Tag, Text } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { useMemo, useState } from 'react';
import { STRENGTHS } from '../lib/access';

/**
 * Strengths: a typeahead over the shared list, selected ones as tags. Typing
 * something not on the list adds it as your own. One control, no chip wall.
 */
export function StrengthsPicker({ value, onChange, title = 'What are you good at?', labelHidden = false }: { value: string[]; onChange: (v: string[]) => void; title?: string; labelHidden?: boolean }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const options = useMemo(() => STRENGTHS.filter((s) => !q || s.toLowerCase().includes(q)).map((s) => ({ value: s, label: s })), [q]);
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
        selected={value}
        onSelect={(picked) => {
          onChange(picked);
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
      {value.length > 0 && (
        <InlineStack gap="200" wrap>
          {value.map((s) => (
            <Tag key={s} onRemove={() => onChange(value.filter((v) => v !== s))}>
              {s}
            </Tag>
          ))}
        </InlineStack>
      )}
    </BlockStack>
  );
}
