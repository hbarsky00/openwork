import { BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { useId } from 'react';

export interface ChipOption {
  value: string;
  label: string;
  helpText?: string;
}

interface Props {
  label: React.ReactNode;
  labelHidden?: boolean;
  helpText?: React.ReactNode;
  options: ChipOption[];
  /** Single: string | null. Multi: string[]. */
  value: string | null | string[];
  onChange: (next: string | null | string[]) => void;
  multiple?: boolean;
  /** Allow deselecting the current single choice by tapping it again. */
  allowNone?: boolean;
  size?: 'slim' | 'medium' | 'large';
}

/**
 * Tap-to-select chips. One wrapping row of toggle buttons instead of a
 * vertical radio/checkbox stack — the whole option set is visible at once,
 * each target is 40–48px, and it works identically by keyboard (Tab to a
 * chip, Space/Enter to toggle). Built from Polaris `Button pressed`, which
 * renders `aria-pressed`, inside a labelled group.
 */
export function ChoiceChips({ label, labelHidden = false, helpText, options, value, onChange, multiple = false, allowNone = true, size = 'medium' }: Props) {
  const id = useId();
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const toggle = (v: string) => {
    if (multiple) {
      const next = new Set(selected);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      onChange([...next]);
    } else {
      onChange(selected.has(v) && allowNone ? null : v);
    }
  };
  return (
    <BlockStack gap="200">
      <Text as="span" variant="headingSm" id={id} visuallyHidden={labelHidden}>
        {label}
      </Text>
      <div role="group" aria-labelledby={id}>
        <InlineStack gap="200" wrap>
          {options.map((o) => (
            <Button key={o.value} size={size} pressed={selected.has(o.value)} onClick={() => toggle(o.value)} accessibilityLabel={o.helpText ? `${o.label}. ${o.helpText}` : undefined}>
              {o.label}
            </Button>
          ))}
        </InlineStack>
      </div>
      {helpText && (
        <Text as="p" variant="bodySm" tone="subdued">
          {helpText}
        </Text>
      )}
    </BlockStack>
  );
}
