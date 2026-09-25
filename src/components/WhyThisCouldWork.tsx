import { BlockStack, Button, InlineStack, List, Text } from '@shopify/polaris';
import { Link } from 'react-router-dom';
import type { MatchReason, MatchResult } from '../lib/match';
import type { Job } from '../lib/types';
import { AskEmployerButton } from './AskEmployerModal';
import { MatchSummaryBadge } from './MatchStateBadge';

/**
 * For signed-in candidates: what you asked for, next to what the employer
 * said. Three short lists, plain words. No sources, dates or symbols — the
 * job page already says who confirmed what.
 */
export function WhyThisCouldWork({ result, job, showEditLink = true }: { result: MatchResult; job: Job; showEditLink?: boolean }) {
  if (result.reasons.length === 0) {
    return (
      <div className="ow-foryou">
        <InlineStack align="space-between" blockAlign="center" wrap gap="300">
          <Text as="p">Tell us what you need at work and we will show, on every job, what matches.</Text>
          <Button url="/passport/access-needs">Add what I need</Button>
        </InlineStack>
      </div>
    );
  }
  const names = (rs: MatchReason[]) => rs.map((r) => r.label);
  const notYet = result.needsConfirmation;

  return (
    <div className="ow-foryou">
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center" wrap gap="200">
          <Text as="h2" variant="headingLg">
            For you
          </Text>
          <MatchSummaryBadge result={result} />
        </InlineStack>

        {result.confirmed.length > 0 && (
          <Text as="p">
            <strong>Matches what you need:</strong> {names(result.confirmed).join(', ')}.
          </Text>
        )}
        {(result.strengthsMatched.length > 0 || result.skillsMatched.length > 0) && (
          <Text as="p">
            <strong>Uses your strengths:</strong> {[...result.strengthsMatched, ...result.skillsMatched].join(', ')}.
          </Text>
        )}
        {(result.different.length > 0 || result.review.length > 0) && (
          <BlockStack gap="100">
            <Text as="p">
              <strong>Different from what you asked for:</strong>
            </Text>
            <List type="bullet">
              {[...result.different, ...result.review].map((r) => (
                <List.Item key={r.id}>
                  {r.label} — {r.explanation}
                </List.Item>
              ))}
            </List>
          </BlockStack>
        )}
        {notYet.length > 0 && (
          <InlineStack gap="300" blockAlign="center" wrap>
            <Text as="p">
              <strong>Not answered yet:</strong> {names(notYet).join(', ')}.
            </Text>
            <AskEmployerButton job={job} featureId={notYet.length === 1 && notYet[0].kind === 'need' ? notYet[0].id : null} />
          </InlineStack>
        )}
        {showEditLink && (
          <Text as="p" variant="bodySm" tone="subdued">
            Based on what you told us. <Link to="/passport/access-needs">Change it</Link>.
          </Text>
        )}
      </BlockStack>
    </div>
  );
}
