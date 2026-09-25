import { BlockStack, Button, InlineGrid, InlineStack, Text } from '@shopify/polaris';
import { JobCard } from '../../components/JobCard';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/** The About page. Short. The product is the jobs page; this just says why. */
export function Landing() {
  useTitle('About');
  const { state } = useStore();
  const featured = state.jobs.filter((j) => j.status === 'published').slice(0, 3);

  return (
    <>
      <section className="ow-hero">
        <div className="ow-container">
          <BlockStack gap="600">
            <BlockStack gap="400">
              <h1>Jobs that tell you how they actually work.</h1>
              <Text as="p" variant="bodyLg" tone="subdued">
                Hours, noise, meetings, how instructions arrive, what the employer provides. All of it on the job page, before you apply. Then an application that takes a few minutes.
              </Text>
            </BlockStack>
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
      </section>

      <section className="ow-container">
        <BlockStack gap="800">
          <InlineGrid columns={{ xs: 1, md: 3 }} gap="600">
            <BlockStack gap="200">
              <Text as="h2" variant="headingLg">
                Built for every access need
              </Text>
              <Text as="p" variant="bodyLg">
                Blind, Deaf, wheelchair users, people with learning disabilities, people bringing a job coach, people starting their first job. Never a diagnosis. Just what you need at work.
              </Text>
            </BlockStack>
            <BlockStack gap="200">
              <Text as="h2" variant="headingLg">
                Employers say what they provide
              </Text>
              <Text as="p" variant="bodyLg">
                Step-free entrance, captions, interpreters, written instructions, a mentor. If an employer has not said, you see that too, and you can ask.
              </Text>
            </BlockStack>
            <BlockStack gap="200">
              <Text as="h2" variant="headingLg">
                Apply like a person
              </Text>
              <Text as="p" variant="bodyLg">
                Your résumé if you have one, a couple of friendly questions, and a place to ask for what you need at the interview. No forms about forms.
              </Text>
            </BlockStack>
          </InlineGrid>

          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="baseline">
              <Text as="h2" variant="headingXl">
                Recently posted
              </Text>
              <Button url="/jobs" variant="plain">
                See all jobs
              </Button>
            </InlineStack>
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
              {featured.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </InlineGrid>
          </BlockStack>
        </BlockStack>
      </section>
    </>
  );
}
