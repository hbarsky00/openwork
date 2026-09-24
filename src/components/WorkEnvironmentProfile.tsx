import { BlockStack, Card, InlineStack, Text } from '@shopify/polaris';
import { DIMENSIONS, optionOf } from '../lib/dimensions';
import type { Job } from '../lib/types';

/**
 * "How this job actually works." Every dimension is shown, including the ones
 * the employer skipped — a gap is information too.
 */
export function WorkEnvironmentProfile({ job, heading = 'How this job actually works' }: { job: Job; heading?: string }) {
  const answered = DIMENSIONS.filter((d) => job.environment[d.id]).length;

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <InlineStack align="space-between" blockAlign="baseline" wrap>
            <Text as="h2" variant="headingLg" id="how-it-works">
              {heading}
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              {answered} of {DIMENSIONS.length} answered by the employer
            </Text>
          </InlineStack>
          <Text as="p" variant="bodyMd" tone="subdued">
            Provided by the employer. Where they have not answered, we say so rather than guess.
          </Text>
        </BlockStack>

        <dl className="ow-env" style={{ margin: 0 }}>
          {DIMENSIONS.map((dim) => {
            const value = job.environment[dim.id] ?? null;
            const opt = optionOf(dim.id, value);
            const note = job.environmentNotes[dim.id];
            return (
              <div key={dim.id} className={`ow-env__item${opt ? '' : ' ow-env__item--unknown'}`}>
                <Text as="dt" variant="bodySm" tone="subdued">
                  {dim.label}
                </Text>
                <Text as="dd" variant="bodyMd" fontWeight={opt ? 'semibold' : 'regular'} tone={opt ? 'base' : 'subdued'}>
                  {opt ? opt.employerLabel : 'Not provided by this employer'}
                </Text>
                {note && (
                  <Text as="dd" variant="bodySm">
                    {note}
                  </Text>
                )}
              </div>
            );
          })}
        </dl>
      </BlockStack>
    </Card>
  );
}
