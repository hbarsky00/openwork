import { BlockStack, Button, InlineStack, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import type { Evidence, EvidenceStatus } from '../lib/access';
import { ChoiceChips } from './ChoiceChips';

const OPTIONS = [
  { value: 'confirmed', label: 'Yes' },
  { value: 'notAvailable', label: 'No' },
  { value: 'contact', label: 'Contact us' },
  { value: '', label: 'Not sure' },
];

/**
 * One accessibility fact for an employer to answer: question, four taps, an
 * optional note. Replaces a Select + TextField pair, so twenty-five questions
 * fit on one screen instead of six.
 */
export function EvidencePicker({ question, evidence, onChange }: { question: string; evidence: Evidence | undefined; onChange: (status: EvidenceStatus | '', note?: string) => void }) {
  const [noteOpen, setNoteOpen] = useState(!!evidence?.note);
  return (
    <div className="ow-env__item">
      <BlockStack gap="200">
        <ChoiceChips label={question} options={OPTIONS} value={evidence?.status ?? ''} allowNone={false} size="slim" onChange={(v) => onChange((v as EvidenceStatus | '') ?? '')} />
        {evidence && !noteOpen && (
          <InlineStack>
            <Button variant="plain" onClick={() => setNoteOpen(true)}>
              Add detail in your words
            </Button>
          </InlineStack>
        )}
        {evidence && noteOpen && <TextField label="Detail (optional)" labelHidden value={evidence.note ?? ''} onChange={(v) => onChange(evidence.status, v)} autoComplete="off" placeholder="e.g. Level entrance with automatic doors." />}
        {!evidence && (
          <Text as="p" variant="bodySm" tone="subdued">
            Shown to candidates as “Not provided”, with a button to ask you.
          </Text>
        )}
      </BlockStack>
    </div>
  );
}
