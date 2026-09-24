import { BlockStack, Button, Card, InlineStack, Text } from '@shopify/polaris';
import { HIRING_OPTION_BY_ID } from '../lib/access';
import type { Job } from '../lib/types';
import { StateSymbol } from './Signal';

/** The hiring steps and accessible options, shown before anyone applies. Only employer-provided detail. */
export function HiringProcess({ job, onRequestAccommodation }: { job: Job; onRequestAccommodation?: () => void }) {
  const demonstrate = job.hiringOptions.filter((h) => HIRING_OPTION_BY_ID[h].group === 'demonstrate');
  const interview = job.hiringOptions.filter((h) => HIRING_OPTION_BY_ID[h].group === 'interview');
  return (
    <Card>
      <BlockStack gap="500">
        <BlockStack gap="100">
          <Text as="h2" variant="headingLg" id="hiring">
            Hiring process
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            {job.hiringStages.length} step{job.hiringStages.length === 1 ? '' : 's'}
            {job.decisionTimeframe ? ` · ${job.decisionTimeframe}` : ''}
          </Text>
        </BlockStack>

        <ol className="ow-timeline">
          {job.hiringStages.map((stage, i) => (
            <li key={stage.id} className="ow-timeline__item">
              <span className="ow-timeline__marker" aria-hidden="true">
                {i + 1}
              </span>
              <BlockStack gap="100">
                <InlineStack gap="200" blockAlign="baseline" wrap>
                  <Text as="h3" variant="headingSm">
                    {stage.name}
                  </Text>
                  {stage.duration && (
                    <Text as="span" variant="bodySm" tone="subdued">
                      {stage.duration}
                    </Text>
                  )}
                </InlineStack>
                <Text as="p" variant="bodyMd">
                  {stage.description}
                </Text>
              </BlockStack>
            </li>
          ))}
        </ol>

        {demonstrate.length > 0 && (
          <BlockStack gap="200">
            <Text as="h3" variant="headingMd">
              Ways to demonstrate your skills
            </Text>
            <ul className="ow-evidence">
              {demonstrate.map((id) => (
                <li key={id} className="ow-evidence__row ow-evidence__row--confirmed">
                  <StateSymbol state="confirmed" />
                  <BlockStack gap="050">
                    <Text as="span" fontWeight="semibold">
                      {HIRING_OPTION_BY_ID[id].label}
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {HIRING_OPTION_BY_ID[id].description}
                    </Text>
                  </BlockStack>
                </li>
              ))}
            </ul>
          </BlockStack>
        )}

        <BlockStack gap="200">
          <Text as="h3" variant="headingMd">
            Accessible hiring options
          </Text>
          {interview.length === 0 ? (
            <Text as="p" tone="subdued">
              This employer has not listed interview accessibility options. You can still ask.
            </Text>
          ) : (
            <ul className="ow-evidence">
              {interview.map((id) => (
                <li key={id} className="ow-evidence__row ow-evidence__row--confirmed">
                  <StateSymbol state="confirmed" />
                  <BlockStack gap="050">
                    <Text as="span" fontWeight="semibold">
                      {HIRING_OPTION_BY_ID[id].label}
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {HIRING_OPTION_BY_ID[id].description}
                    </Text>
                  </BlockStack>
                </li>
              ))}
            </ul>
          )}
        </BlockStack>

        <BlockStack gap="200">
          <Text as="h3" variant="headingMd">
            Asking for an adjustment
          </Text>
          <Text as="p" variant="bodyMd">
            {job.accommodationRoute || 'This employer has not said how to request an adjustment.'}
          </Text>
          {onRequestAccommodation && (
            <InlineStack>
              <Button onClick={onRequestAccommodation}>Request an interview accommodation</Button>
            </InlineStack>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
