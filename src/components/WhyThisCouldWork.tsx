import { BlockStack, Box, Button, Card, InlineStack, Tag, Text } from '@shopify/polaris';
import { Link } from 'react-router-dom';
import { ACCESS_CATEGORIES, EVIDENCE_SOURCE_LABEL } from '../lib/access';
import { longDate } from '../lib/format';
import { MATCH_STATE_LABEL, type MatchReason, type MatchResult } from '../lib/match';
import type { Job } from '../lib/types';
import { AskEmployerButton } from './AskEmployerModal';
import { MatchSummaryBadge } from './MatchStateBadge';
import { StateSymbol } from './Signal';

const CATEGORY_LABEL = Object.fromEntries(ACCESS_CATEGORIES.map((c) => [c.id, c.label])) as Record<string, string>;

function Reason({ reason, job }: { reason: MatchReason; job: Job }) {
  return (
    <li className={`ow-reason ow-reason--${reason.state}`} style={{ gridTemplateColumns: '28px 1fr' }}>
      <StateSymbol state={reason.state} />
      <BlockStack gap="100">
        <InlineStack gap="200" blockAlign="baseline" wrap>
          <Text as="h4" variant="headingSm">
            {reason.label}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {MATCH_STATE_LABEL[reason.state]}
            {reason.kind === 'need' && reason.category ? ` · ${CATEGORY_LABEL[reason.category]}` : reason.kind === 'preference' ? ' · How you work best' : ''}
          </Text>
        </InlineStack>
        <Text as="p" variant="bodyMd">
          {reason.explanation}
        </Text>
        {reason.employerNote && (
          <Text as="p" variant="bodySm" tone="subdued">
            Employer’s note: “{reason.employerNote}”
          </Text>
        )}
        {(reason.source || reason.confirmedOn) && (
          <Text as="p" variant="bodySm" tone="subdued">
            Source: {reason.source ? EVIDENCE_SOURCE_LABEL[reason.source] : 'Employer'}
            {reason.confirmedOn ? ` · ${longDate(reason.confirmedOn)}` : ''}
          </Text>
        )}
        {reason.askable && <AskEmployerButton job={job} featureId={reason.kind === 'need' ? reason.id : null} />}
      </BlockStack>
    </li>
  );
}

function Group({ heading, help, reasons, job }: { heading: string; help?: string; reasons: MatchReason[]; job: Job }) {
  if (reasons.length === 0) return null;
  return (
    <BlockStack gap="200">
      <BlockStack gap="050">
        <Text as="h3" variant="headingMd">
          {heading} ({reasons.length})
        </Text>
        {help && (
          <Text as="p" variant="bodySm" tone="subdued">
            {help}
          </Text>
        )}
      </BlockStack>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {reasons.map((r) => (
          <Reason key={r.id} reason={r} job={job} />
        ))}
      </ul>
    </BlockStack>
  );
}

/**
 * The defining feature. Every line is a sentence built from what the
 * candidate said they need and what the employer said the job provides, with
 * the source. The candidate decides. Nothing is a score.
 */
export function WhyThisCouldWork({ result, job, showEditLink = true }: { result: MatchResult; job: Job; showEditLink?: boolean }) {
  if (result.reasons.length === 0) {
    return (
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingLg" id="why">
            Why this could work for you
          </Text>
          <Text as="p" variant="bodyMd">
            Tell us what you need to do your best work — what helps, what to avoid, what support you use — and we will compare it with what this employer has said about the job, line by line.
          </Text>
          <InlineStack gap="200">
            <Button url="/passport/access-needs" variant="primary">
              Add what I need
            </Button>
            <Button url="/passport/how-i-work">Add how I work best</Button>
          </InlineStack>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="500">
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center" wrap gap="200">
            <Text as="h2" variant="headingLg" id="why">
              Why this could work for you
            </Text>
            <MatchSummaryBadge result={result} />
          </InlineStack>
          <Text as="p" variant="bodyMd" tone="subdued">
            Compared {result.reasons.length} thing{result.reasons.length === 1 ? '' : 's'} you told us with what this employer has said. Unknown never counts as a match. You decide whether it fits.
          </Text>
        </BlockStack>

        {(result.skillsMatched.length > 0 || result.strengthsMatched.length > 0) && (
          <BlockStack gap="200">
            <Text as="h3" variant="headingMd">
              Skills and strengths this job uses
            </Text>
            <InlineStack gap="200" wrap>
              {result.strengthsMatched.map((s) => (
                <Tag key={`st-${s}`}>{`✓ ${s}`}</Tag>
              ))}
              {result.skillsMatched.map((s) => (
                <Tag key={`sk-${s}`}>{`✓ ${s}`}</Tag>
              ))}
            </InlineStack>
          </BlockStack>
        )}

        <Group heading="Confirmed" help="The employer has stated this, and it meets what you need." reasons={result.confirmed} job={job} />
        <Group heading="Worth reviewing" help="Close, or the employer has asked to be contacted about it." reasons={result.review} job={job} />
        <Group heading="Different from your need" help="The employer’s answer does not meet what you asked for. Only you can judge how much it matters." reasons={result.different} job={job} />
        <Group heading="Needs confirmation" help="The employer has not said. Asking takes one click and shares nothing else." reasons={result.needsConfirmation} job={job} />
        <Group heading="You said these don’t matter to you" reasons={result.notImportant} job={job} />

        {showEditLink && (
          <Box paddingBlockStart="200">
            <Text as="p" variant="bodySm" tone="subdued">
              Something here no longer true for you? <Link to="/passport">Update your passport</Link>.
            </Text>
          </Box>
        )}
      </BlockStack>
    </Card>
  );
}
