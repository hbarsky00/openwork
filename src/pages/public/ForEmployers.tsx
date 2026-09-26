import { BlockStack, Button, Card, InlineGrid, InlineStack, Text } from '@shopify/polaris';
import { ACCESS_CATEGORIES } from '../../lib/access';
import { useTitle } from '../../lib/useTitle';

export function ForEmployers() {
  useTitle('For employers');
  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="800">
        <BlockStack gap="300">
          <Text as="h1" variant="heading2xl">
            Describe what the job requires and what your workplace supports. Reach people who will do it well.
          </Text>
          <Text as="p" variant="bodyLg" tone="subdued">
            Most hiring mismatches are about the environment, the technology or the process — not the work. Openwork asks you to state each one plainly, shows candidates the evidence, and lets them tell you what they need without telling you why.
          </Text>
          <InlineStack gap="300">
            <Button url="/employers/signup" variant="primary" size="large">
              Post a job
            </Button>
            <Button url="/signin?role=employer" size="large">
              Log in
            </Button>
          </InlineStack>
        </BlockStack>

        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                A job builder that asks the real questions
              </Text>
              <Text as="p" tone="subdued">
                Typical day as tasks. Physical requirements. How work is communicated. The actual software and its accessibility. Environment, schedule, hiring steps, support. “Not sure” is always allowed.
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                A workplace accessibility profile with evidence
              </Text>
              <Text as="p" tone="subdued">
                Entrance, restrooms, parking, alarms, interpreters, job coaching, transport — each answered once, dated, and shown on every job. Openwork can verify them.
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Candidate questions you can answer
              </Text>
              <Text as="p" tone="subdued">
                Where you have not said, candidates ask. You answer once and the answer appears on the job for everyone. Fewer surprises for both sides.
              </Text>
            </BlockStack>
          </Card>
        </InlineGrid>

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              The nine areas candidates compare against
            </Text>
            <InlineGrid columns={{ xs: 1, sm: 3 }} gap="300">
              {ACCESS_CATEGORIES.map((c) => (
                <BlockStack key={c.id} gap="050">
                  <Text as="h3" variant="headingSm">
                    {c.label}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {c.intro}
                  </Text>
                </BlockStack>
              ))}
            </InlineGrid>
            <Text as="p" variant="bodySm" tone="subdued">
              You only ever see a candidate’s need — “needs step-free access”, “needs captions” — and only when they choose to share it on an application. Never a diagnosis.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </div>
  );
}
