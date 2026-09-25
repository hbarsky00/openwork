import { BlockStack, Button, InlineGrid, InlineStack, Text } from '@shopify/polaris';
import { useTitle } from '../../lib/useTitle';

const STEPS = [
  { title: 'Search jobs', body: 'Type what you want to do and where. Filter by remote, job type, pay, or a need like captions or a step-free entrance. No account needed.' },
  { title: 'Read how the job really works', body: 'A typical day as a list. Hours, noise, meetings, how instructions arrive. What the employer provides, in plain words, and how hiring goes step by step.' },
  { title: 'Apply in a few minutes', body: 'Your name, your résumé if you have one, and a couple of friendly questions from the employer. Ask for anything you need at the interview. Send.' },
  { title: 'Track the reply', body: 'Every step the employer takes shows on your Applications page, with dates. Nothing you did not send ever reaches them.' },
];

export function HowItWorks() {
  useTitle('How it works');
  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="800">
        <BlockStack gap="300">
          <Text as="h1" variant="heading2xl">
            How Openwork works
          </Text>
          <Text as="p" variant="bodyLg" tone="subdued">
            Jobs that tell you how they actually work, and an application that takes minutes.
          </Text>
        </BlockStack>

        <ol className="ow-howto">
          {STEPS.map((s, i) => (
            <li key={s.title} className="ow-howto__step">
              <span className="ow-howto__n" aria-hidden="true">
                {i + 1}
              </span>
              <BlockStack gap="100">
                <Text as="h2" variant="headingLg">
                  {s.title}
                </Text>
                <Text as="p" variant="bodyLg">
                  {s.body}
                </Text>
              </BlockStack>
            </li>
          ))}
        </ol>

        <div className="ow-sheet">
          <BlockStack gap="300">
            <Text as="h2" variant="headingLg">
              What we never do
            </Text>
            <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
              <Text as="p">Ask for a diagnosis. There is no field for one anywhere.</Text>
              <Text as="p">Decide what you can do. You read the job, you decide.</Text>
              <Text as="p">Show “not answered” as a yes. If the employer has not said, you see that.</Text>
              <Text as="p">Send an employer anything that was not on your apply page.</Text>
              <Text as="p">Require a résumé, a phone call, or a mouse.</Text>
              <Text as="p">Hide a job behind a questionnaire. Jobs come first.</Text>
            </InlineGrid>
          </BlockStack>
        </div>

        <InlineStack gap="300">
          <Button url="/jobs" variant="primary" size="large">
            Browse jobs
          </Button>
          <Button url="/for-employers" size="large">
            I’m hiring
          </Button>
        </InlineStack>
      </BlockStack>
    </div>
  );
}
