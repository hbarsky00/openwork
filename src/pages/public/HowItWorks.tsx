import { BlockStack, Button, Card, InlineGrid, InlineStack, Text } from '@shopify/polaris';
import { useTitle } from '../../lib/useTitle';

const STEPS = [
  { title: 'Start with what you can do', body: 'Pick strengths from a plain list — organizing, working with numbers, following a process, helping customers, building things. Add job titles if you know them. No résumé needed to begin.' },
  { title: 'Say what makes work accessible for you', body: 'Nine categories of need — vision, hearing, mobility, dexterity, communication, focus, color, schedule, support — in any combination. “I need captions”, never “I am Deaf”. Every answer has an importance and a privacy setting.' },
  { title: 'See what each job actually requires', body: 'A typical day as a task list. Standing, lifting, walking, driving. Phone calls, meetings, presentations. The actual software and whether it works with a screen reader or keyboard. Noise, interruptions, schedule.' },
  { title: 'See what each workplace has confirmed', body: 'Step-free entrance, accessible restroom, interpreters, visual alarms, job coach welcome — each marked ✓ △ ✗ or ?, with who confirmed it and when. An unknown is never shown as a match.' },
  { title: 'Compare, line by line', body: '“Why this could work for you” puts your needs next to the employer’s answers, in sentences, with sources. Where the employer has not said, one click asks them. You decide.' },
  { title: 'Apply on your terms', body: 'Choose what to share. Request an interview accommodation from a practical list. See the exact list of what the employer will receive before anything is sent. Track every step the employer takes.' },
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
            A job listing should tell you whether you can do the job and whether the workplace will let you do it well. Openwork asks employers to state what a job requires and what the workplace supports — with evidence — and lets you compare that with what you need, privately.
          </Text>
        </BlockStack>

        <BlockStack gap="400">
          {STEPS.map((s, i) => (
            <Card key={s.title}>
              <InlineStack gap="400" blockAlign="start" wrap={false}>
                <span className="ow-timeline__marker" style={{ position: 'static' }} aria-hidden="true">
                  {i + 1}
                </span>
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd">
                    {s.title}
                  </Text>
                  <Text as="p">{s.body}</Text>
                </BlockStack>
              </InlineStack>
            </Card>
          ))}
        </BlockStack>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingLg">
              What we never do
            </Text>
            <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
              <Text as="p">We never ask for a diagnosis. There is no field for one anywhere on Openwork, and nothing is ever inferred from one.</Text>
              <Text as="p">We never decide what you can do. We compare what you said you need with what the employer said. The decision is yours.</Text>
              <Text as="p">We never treat “not provided” as a match. Unknown is shown as unknown, with a button to ask.</Text>
              <Text as="p">We never send an employer anything you have not confirmed on the “What this employer will see” step.</Text>
              <Text as="p">We never give an employer an “accessible” badge for ticking a box. Every fact shows who confirmed it and when.</Text>
              <Text as="p">We never require a résumé, a phone call, or a mouse.</Text>
            </InlineGrid>
          </BlockStack>
        </Card>

        <InlineStack gap="300">
          <Button url="/discover" variant="primary" size="large">
            Find the right work
          </Button>
          <Button url="/jobs" size="large">
            Browse all jobs
          </Button>
        </InlineStack>
      </BlockStack>
    </div>
  );
}
