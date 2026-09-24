import { BlockStack, Text } from '@shopify/polaris';
import { CheckIcon } from '@shopify/polaris-icons';
import { APPLICATION_STATUS_LABEL, longDate } from '../lib/format';
import type { Application } from '../lib/types';

/** Only events that actually happened. Nothing is projected or invented. */
export function ApplicationStatusTimeline({ application }: { application: Application }) {
  const last = application.history.length - 1;
  return (
    <ol className="ow-timeline" aria-label="Application history">
      {application.history.map((ev, i) => {
        const isCurrent = i === last;
        return (
          <li
            key={`${ev.status}-${ev.on}-${i}`}
            className={`ow-timeline__item ${isCurrent ? 'ow-timeline__item--current' : 'ow-timeline__item--done'}`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span className="ow-timeline__marker" aria-hidden="true">
              {isCurrent ? i + 1 : <CheckIcon />}
            </span>
            <BlockStack gap="050">
              <Text as="h3" variant="headingSm">
                {APPLICATION_STATUS_LABEL[ev.status]}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {longDate(ev.on)}
              </Text>
              <Text as="p" variant="bodyMd">
                {ev.note}
              </Text>
            </BlockStack>
          </li>
        );
      })}
    </ol>
  );
}
