import { BlockStack, Box, Button, Collapsible, InlineStack, Text } from '@shopify/polaris';
import { ChevronDownIcon, ChevronUpIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { ACCESS_CATEGORIES, ACCESS_FEATURE_BY_ID, featuresIn, type AccessCategoryId } from '../lib/access';
import { IMPORTANCE_LABEL, VISIBILITY_LABEL } from '../lib/format';
import type { AccessNeeds, Importance, Visibility } from '../lib/types';
import { ChoiceChips } from './ChoiceChips';

const IMPORTANCE = (Object.keys(IMPORTANCE_LABEL) as Importance[]).map((k) => ({ value: k, label: IMPORTANCE_LABEL[k] }));
const VISIBILITY = (Object.keys(VISIBILITY_LABEL) as Visibility[]).map((k) => ({ value: k, label: VISIBILITY_LABEL[k] }));

interface Props {
  value: AccessNeeds;
  onChange: (next: AccessNeeds) => void;
  showVisibility?: boolean;
  /** Only render these categories (onboarding shows one per screen). */
  only?: AccessCategoryId[];
  /** Flat: no collapsible wrapper, big question. */
  hero?: boolean;
}

/**
 * "What would make work more accessible for you?" Needs as tap-to-select
 * chips per category; refine importance and privacy for the ones you picked.
 */
export function AccessNeedsForm({ value, onChange, showVisibility = true, only, hero = false }: Props) {
  const cats = ACCESS_CATEGORIES.filter((c) => !only || only.includes(c.id));
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(cats.map((c) => [c.id, hero || featuresIn(c.id).some((f) => value[f.id])])));

  const setCategory = (cat: AccessCategoryId, picked: string[]) => {
    const next = { ...value };
    for (const f of featuresIn(cat)) {
      if (picked.includes(f.id)) next[f.id] = value[f.id] ?? { importance: 'preferred', visibility: 'matching' };
      else delete next[f.id];
    }
    onChange(next);
  };

  return (
    <BlockStack gap="300">
      {cats.map((c) => {
        const features = featuresIn(c.id);
        const picked = features.filter((f) => value[f.id]).map((f) => f.id);
        const isOpen = hero || !!open[c.id];
        const panelId = `needs-${c.id}`;
        const inner = (
          <BlockStack gap="400">
            <ChoiceChips label={hero ? c.label : `${c.label} — pick any`} labelHidden={hero} helpText={c.intro} multiple options={features.map((f) => ({ value: f.id, label: f.label }))} value={picked} size={hero ? 'large' : 'medium'} onChange={(v) => setCategory(c.id, v as string[])} />
            {picked.length > 0 && (
              <BlockStack gap="300">
                <Text as="h4" variant="headingSm">
                  Refine what you picked
                </Text>
                {picked.map((id) => {
                  const need = value[id];
                  return (
                    <Box key={id} padding="300" background="bg-surface-secondary" borderRadius="200">
                      <BlockStack gap="200">
                        <Text as="p" fontWeight="semibold">
                          {ACCESS_FEATURE_BY_ID[id].label}
                        </Text>
                        <InlineStack gap="600" wrap>
                          <ChoiceChips label="How much does this matter?" options={IMPORTANCE} value={need.importance} allowNone={false} size="slim" onChange={(v) => onChange({ ...value, [id]: { ...need, importance: v as Importance } })} />
                          {showVisibility && <ChoiceChips label="Who can see this?" options={VISIBILITY} value={need.visibility} allowNone={false} size="slim" onChange={(v) => onChange({ ...value, [id]: { ...need, visibility: v as Visibility } })} />}
                        </InlineStack>
                      </BlockStack>
                    </Box>
                  );
                })}
              </BlockStack>
            )}
          </BlockStack>
        );
        if (hero) return <div key={c.id}>{inner}</div>;
        return (
          <Box key={c.id} borderColor="border-secondary" borderWidth="025" borderRadius="300" background="bg-surface">
            <Button variant="monochromePlain" fullWidth textAlign="left" icon={isOpen ? ChevronUpIcon : ChevronDownIcon} onClick={() => setOpen((o) => ({ ...o, [c.id]: !isOpen }))} ariaExpanded={isOpen} ariaControls={panelId}>
              {`${c.label}${picked.length ? ` · ${picked.length} selected` : ''}`}
            </Button>
            <Collapsible id={panelId} open={isOpen} transition={false}>
              <Box padding="400" paddingBlockStart="0">
                {inner}
              </Box>
            </Collapsible>
          </Box>
        );
      })}
    </BlockStack>
  );
}
