import { BlockStack, Box, Button, Card, InlineGrid, InlineStack, Text } from '@shopify/polaris';
import { Link } from 'react-router-dom';
import { ACCESS_FEATURE_BY_ID } from '../../lib/access';
import { CANDIDATE_BY_ID } from '../../data/candidates';
import { JOB_BY_ID } from '../../data/jobs';
import { EMPLOYER_BY_ID } from '../../data/employers';
import { WhyThisCouldWork } from '../../components/WhyThisCouldWork';
import { JobCard } from '../../components/JobCard';
import { matchJob } from '../../lib/match';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/** Real needs → real filtered results. No diagnosis is ever selected here. */
const NEED_CHIPS = ['screenReaderCompatible', 'stepFreeEntrance', 'interpreter', 'writtenCommunication', 'flexibleHours', 'quietWorkspace', 'remoteWork', 'jobCoach', 'captions', 'alternativeInterview', 'questionsInAdvanceComm', 'keyboardNavigation', 'accessibleWorkstation', 'structuredOnboardingCog', 'abilityToSit', 'textBasedCommunication'];

export function Landing() {
  useTitle('');
  const { state } = useStore();
  const demoJob = JOB_BY_ID['j-inventory'];
  const demoResult = matchJob(CANDIDATE_BY_ID['c-rosa'], JOB_BY_ID['j-ap'], EMPLOYER_BY_ID['kesslervance']);
  const featured = state.jobs.filter((j) => j.status === 'published').slice(0, 3);

  return (
    <>
      <section className="ow-hero">
        <div className="ow-container">
          <div className="ow-hero__grid">
            <BlockStack gap="600">
              <BlockStack gap="400">
                <h1>Find work built around what you can do.</h1>
                <Text as="p" variant="bodyLg" tone="subdued">
                  Find jobs where the workplace, the technology, the environment, the hiring process and the support line up with what you need to succeed — and see exactly what the employer has confirmed before you apply.
                </Text>
              </BlockStack>
              <InlineStack gap="300">
                <Button url="/discover" variant="primary" size="large">
                  Find the right work
                </Button>
                <Button url="/for-employers" size="large">
                  I’m an employer
                </Button>
              </InlineStack>
              <Text as="p" variant="bodySm" tone="subdued">
                Browse without an account. We never ask for a diagnosis. Nothing is shared with an employer until you say so.
              </Text>
            </BlockStack>

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingLg">
                    What do you need to do your best work?
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Pick anything. Each one shows only jobs where the employer has confirmed it.
                  </Text>
                </BlockStack>
                <ul className="ow-chips">
                  {NEED_CHIPS.map((id) => (
                    <li key={id}>
                      <Link className="ow-chip" to={`/jobs?need=${id}`}>
                        {ACCESS_FEATURE_BY_ID[id].label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <InlineStack>
                  <Button url="/jobs" size="slim">
                    Or see every job
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </div>
        </div>
      </section>

      <section className="ow-container">
        <BlockStack gap="800">
          <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Every job states what it really requires
                </Text>
                <Text as="p" tone="subdued">
                  A typical day as a list of tasks. Standing, lifting, phone calls, meetings. The actual software, and whether it has been tested with a screen reader.
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Every workplace shows its evidence
                </Text>
                <Text as="p" tone="subdued">
                  Step-free entrance, accessible restroom, interpreters, job coach welcome — each one marked ✓ confirmed, △ contact employer, ✗ not available or ? not provided, with who said it and when.
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  You compare it with what you need
                </Text>
                <Text as="p" tone="subdued">
                  Your Work Accessibility Passport holds your strengths, how you work and what makes work accessible for you. It is private by default, and you choose what any employer sees.
                </Text>
              </BlockStack>
            </Card>
          </InlineGrid>

          <BlockStack gap="400">
            <Text as="h2" variant="headingXl">
              What a candidate sees — including what the employer hasn’t said
            </Text>
            <Text as="p" tone="subdued">
              A real comparison from this site: an accounts payable job at a firm whose office has steps and no elevator, viewed by a candidate who needs step-free access. We show the ✗, the ✓ and the ?. The candidate decides.
            </Text>
            <WhyThisCouldWork result={demoResult} job={JOB_BY_ID['j-ap']} showEditLink={false} />
          </BlockStack>

          <InlineGrid columns={{ xs: 1, md: 2 }} gap="500">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">
                  I know what I want
                </Text>
                <Text as="p" tone="subdued">
                  Search by title, skill, place or company, then filter by what you need — from captions to step-free access to a predictable schedule.
                </Text>
                <InlineStack>
                  <Button url="/jobs">Search jobs</Button>
                </InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">
                  Help me find work I could do
                </Text>
                <Text as="p" tone="subdued">
                  No job title, no résumé, no experience needed. Pick what you are good at and what you enjoy, and we show kinds of work that use those strengths.
                </Text>
                <InlineStack>
                  <Button url="/discover" variant="primary">
                    Start with my strengths
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </InlineGrid>

          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="baseline">
              <Text as="h2" variant="headingXl">
                Recently posted
              </Text>
              <Button url="/jobs" size="slim">See all jobs</Button>
            </InlineStack>
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
              {featured.map((j) => (
                <JobCard key={j.id} job={j} compact />
              ))}
            </InlineGrid>
            <Box>
              <Text as="p" variant="bodySm" tone="subdued">
                Example above: {demoJob.title} at Northline lists {demoJob.tasks.length} daily tasks, {Object.keys(demoJob.physical).length} physical requirements and {demoJob.technology.length} tools with accessibility evidence.
              </Text>
            </Box>
          </BlockStack>
        </BlockStack>
      </section>
    </>
  );
}
