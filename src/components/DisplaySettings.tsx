import { Button, Popover, Text } from '@shopify/polaris';
import { ViewIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import type { DisplayMode } from '../lib/types';
import { useStore } from '../state/store';
import { OptionCard } from './OptionCard';

const MODES: { value: DisplayMode; label: string; help: string }[] = [
  { value: 'standard', label: 'Standard', help: 'Full layout.' },
  { value: 'simplified', label: 'Simplified', help: 'One column, one thing at a time, larger controls.' },
  { value: 'largeText', label: 'Large text', help: 'Everything one size up.' },
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
    <Popover active={open} onClose={() => setOpen(false)} preferredAlignment="right" activator={<Button icon={ViewIcon} onClick={() => setOpen((o) => !o)} ariaExpanded={open} accessibilityLabel="Display settings" />}>
      <div className="ow-menu" role="group" aria-label="Display">
        <Text as="h2" variant="headingSm">
          Display
        </Text>
        <div className="ow-optcards ow-optcards--tight">
          {MODES.map((m) => (
            <OptionCard key={m.value} title={m.label} help={m.help} selected={state.displayMode === m.value} onClick={() => dispatch({ type: 'setDisplayMode', mode: m.value })} />
          ))}
        </div>
        <Text as="p" variant="bodySm" tone="subdued">
          Your browser’s zoom, contrast and reduced-motion settings always apply too.
        </Text>
      </div>
    </Popover>
  );
}
