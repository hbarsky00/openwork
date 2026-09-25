import { BlockStack, Text } from '@shopify/polaris';
import { useId } from 'react';

export interface GridOption {
  value: string;
  label: string;
  helpText?: string;
}

interface Props {
  label: React.ReactNode;
  helpText?: React.ReactNode;
  options: GridOption[];
  /** Single: string | null. Multi: string[]. */
  value: string | null | string[];
  onChange: (next: string | null | string[]) => void;
  multiple?: boolean;
  allowNone?: boolean;
}

/**
 * Reference "card select" in compact form: a grid of small option cards with
 * a radio/check dot. Single-select uses aria-pressed, multi uses
 * role=checkbox + aria-checked. Replaces chip rows on dense employer forms.
 */
export function OptionGrid({ label, helpText, options, value, onChange, multiple = false, allowNone = true }: Props) {
  const id = useId();
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const toggle = (v: string) => {
    if (multiple) {
      const next = new Set(selected);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      onChange([...next]);
    } else onChange(selected.has(v) && allowNone ? null : v);
  };
  return (
    <BlockStack gap="200">
      <Text as="span" variant="headingSm" id={id}>
        {label}
      </Text>
      {helpText && (
        <Text as="p" variant="bodySm" tone="subdued">
          {helpText}
        </Text>
      )}
      <div role={multiple ? 'group' : 'radiogroup'} aria-labelledby={id} className="ow-optgrid">
        {options.map((o) => {
          const on = selected.has(o.value);
          const aria = multiple ? { role: 'checkbox' as const, 'aria-checked': on } : { role: 'radio' as const, 'aria-checked': on };
          return (
            <button key={o.value} type="button" className={`ow-optcard ow-optcard--compact${multiple ? ' ow-optcard--check' : ''}`} onClick={() => toggle(o.value)} {...aria}>
              <span className="ow-optcard__dot" aria-hidden="true" />
              <span>
                <Text as="span" variant="bodyMd" fontWeight="medium">
                  {o.label}
                </Text>
                {o.helpText && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    {o.helpText}
                  </Text>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </BlockStack>
  );
}
