import { Box, Button, ChoiceList, Popover, Text } from '@shopify/polaris';
import { ViewIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import type { DisplayMode } from '../lib/types';
import { useStore } from '../state/store';

const MODES: { value: DisplayMode; label: string; helpText: string }[] = [
  { value: 'standard', label: 'Standard', helpText: 'Full layout.' },
  { value: 'simplified', label: 'Simplified', helpText: 'One column, one thing at a time, larger controls. Same features.' },
  { value: 'largeText', label: 'Large text', helpText: 'Everything one size up.' },
];

/**
 * Display preferences. Not a separate "accessible version": every mode has
 * every feature. Browser and OS settings (zoom, contrast, reduced motion) are
 * respected first and still apply on top.
 */
export function DisplaySettings() {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <Popover
      active={open}
      onClose={() => setOpen(false)}
      activator={
        <Button icon={ViewIcon} onClick={() => setOpen((o) => !o)} ariaExpanded={open} accessibilityLabel="Display settings">
        </Button>
      }
    >
      <Box padding="400" minWidth="280px">
        <ChoiceList
          title={
            <Text as="span" variant="headingSm">
              Display
            </Text>
          }
          choices={MODES}
          selected={[state.displayMode]}
          onChange={(v) => dispatch({ type: 'setDisplayMode', mode: (v[0] as DisplayMode) ?? 'standard' })}
        />
        <Box paddingBlockStart="300">
          <Text as="p" variant="bodySm" tone="subdued">
            Your browser’s zoom, contrast and reduced-motion settings always apply too.
          </Text>
        </Box>
      </Box>
    </Popover>
  );
}
