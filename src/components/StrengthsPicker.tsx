import { BlockStack, Button, InlineStack, Tag, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { STRENGTHS } from '../lib/access';
import { ChoiceChips } from './ChoiceChips';

/** Strengths as a chip grid — all 24 visible in a few rows. Custom entries welcome. */
export function StrengthsPicker({ value, onChange, title = 'What are you good at?', labelHidden = false }: { value: string[]; onChange: (v: string[]) => void; title?: string; labelHidden?: boolean }) {
  const [draft, setDraft] = useState('');
  const custom = value.filter((v) => !STRENGTHS.includes(v));
  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  };
  return (
    <BlockStack gap="400">
      <ChoiceChips label={title} labelHidden={labelHidden} multiple options={STRENGTHS.map((s) => ({ value: s, label: s }))} value={value.filter((v) => STRENGTHS.includes(v))} onChange={(picked) => onChange([...(picked as string[]), ...custom])} />
      <InlineStack gap="200" blockAlign="end" wrap>
        <div style={{ flex: '1 1 240px' }}>
          <TextField label="Something else you are good at" value={draft} onChange={setDraft} autoComplete="off" onBlur={add} />
        </div>
        <Button onClick={add}>Add</Button>
        {custom.map((c) => (
          <Tag key={c} onRemove={() => onChange(value.filter((v) => v !== c))}>
            {c}
          </Tag>
        ))}
      </InlineStack>
    </BlockStack>
  );
}
