import { BlockStack, Card, Text, TextField } from '@shopify/polaris';
import { HIRING_OPTION_BY_ID, type HiringOptionId } from '../lib/access';
import type { Employer, Job } from '../lib/types';
import { ChoiceChips } from './ChoiceChips';

export interface AccommodationRequestValue {
  options: HiringOptionId[];
  custom: string;
}

/**
 * Practical selections, not a legal essay. Only the interview options this
 * employer actually offers are listed; anything else goes in the free-text
 * box. The request goes to the named accessibility contact and needs no reason.
 */
export function AccommodationRequest({ job, employer, value, onChange, bare = false }: { job: Job; employer: Employer; value: AccommodationRequestValue; onChange: (v: AccommodationRequestValue) => void; bare?: boolean }) {
  const offered = job.hiringOptions.filter((h) => HIRING_OPTION_BY_ID[h].group === 'interview');
  const body = (
    <BlockStack gap="400">
      {!bare && (
        <BlockStack gap="100">
          <Text as="h2" variant="headingLg">
            Request an interview accommodation
          </Text>
        </BlockStack>
      )}
      <Text as="p" variant="bodySm" tone="subdued">
        Goes to {employer.accessibilityContact}. No reason needed; not shared with anyone else at the company.
      </Text>
      {offered.length > 0 && <ChoiceChips label="Options this employer already offers" multiple options={offered.map((h) => ({ value: h, label: HIRING_OPTION_BY_ID[h].label, helpText: HIRING_OPTION_BY_ID[h].description }))} value={value.options} onChange={(v) => onChange({ ...value, options: v as HiringOptionId[] })} />}
      <TextField label="Anything else you need for the hiring process" value={value.custom} onChange={(custom) => onChange({ ...value, custom })} multiline={2} autoComplete="off" placeholder="e.g. Please send the work sample as a spreadsheet, not a PDF." helpText="Say what you need, not why." />
    </BlockStack>
  );
  return bare ? body : <Card>{body}</Card>;
}
