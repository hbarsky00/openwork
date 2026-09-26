import { BlockStack, Button, InlineGrid, InlineStack, List, Text } from '@shopify/polaris';
import { Link } from 'react-router-dom';
import { useTitle } from '../../lib/useTitle';

const STEPS: [string, string][] = [
  ['Import', 'Paste your careers page. We read every open role.'],
  ['Claim', 'A work email at your domain takes over your company page.'],
  ['Enrich', 'Three minutes per job on what an ATS never says: schedule, environment, access.'],
  ['Match', 'Candidates see why the job fits them. You see who fits the job.'],
  ['Hire', 'Structured, accessible hiring steps candidates can see before they apply.'],
];
const FOUNDING = ['Free job imports and postings', 'Company profile and Workplace Accessibility Profile', 'Candidate matching from day one', 'Accessible hiring tools: questions in advance, work samples, interpreter booking', 'Founding Employer recognition on every job', 'No long-term commitment'];

/** Employer front door: import first, connect second, post third. */
export function ForEmployers() {
  useTitle('For employers');
  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="800">
        <BlockStack gap="300">
          <Text as="h1" variant="heading2xl">
            Reach qualified candidates other job boards overlook.
          </Text>
          <Text as="p" variant="bodyLg" tone="subdued">
            Import your existing jobs into Openwork and connect with candidates based on skills, work preferences and accessibility needs.
          </Text>
          <InlineStack gap="300" blockAlign="center" wrap>
            <Button url="/import" variant="primary" size="large">
              Import my jobs
            </Button>
            <Button url="/connect" size="large">
              Connect my ATS
            </Button>
            <Button url="/post" variant="plain">
              Post a job
            </Button>
          </InlineStack>
          <Text as="p" variant="bodySm" tone="subdued">
            No account needed to start. Already listed here? <Link to="/claim">Claim your company page</Link>. <Link to="/pricing">Pricing</Link>. <Link to="/signin?role=employer">Log in</Link>.
          </Text>
        </BlockStack>

        <ol className="ow-stages ow-stages--row" aria-label="How it works for employers">
          {STEPS.map(([t, d], i) => (
            <li key={t}>
              <span className="ow-stages__n" aria-hidden="true">{i + 1}</span>
              <div>
                <Text as="p" fontWeight="semibold">
                  {t}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {d}
                </Text>
              </div>
            </li>
          ))}
        </ol>

        <div className="ow-sheet">
          <InlineGrid columns={{ xs: 1, md: ['twoThirds', 'oneThird'] }} gap="500">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                Become a Founding Employer
              </Text>
              <Text as="p">
                We are opening Openwork with a small group of employers who want to hire well. Founding Employers shape the product and get everything free while we do.
              </Text>
              <List type="bullet">
                {FOUNDING.map((f) => (
                  <List.Item key={f}>{f}</List.Item>
                ))}
              </List>
            </BlockStack>
            <BlockStack gap="300">
              <Button url="/import" variant="primary" size="large" fullWidth>
                Become a Founding Employer
              </Button>
              <Text as="p" variant="bodySm" tone="subdued">
                Import or post your first job and the Founding Employer status is applied to your account.
              </Text>
            </BlockStack>
          </InlineGrid>
        </div>

        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          {[
            ['Jobs that say how they actually work', 'Schedule, meetings, communication, environment, physical requirements and the software used. Candidates compare this with how they work best.'],
            ['Evidence, not a badge', 'Each accessibility fact carries who confirmed it and when. Candidates trust it because it is specific.'],
            ['Hiring people can see before they apply', 'Steps, timing and the accessible options you offer, from questions in advance to work samples.'],
          ].map(([t, d]) => (
            <BlockStack key={t} gap="200">
              <Text as="h2" variant="headingMd">
                {t}
              </Text>
              <Text as="p" tone="subdued">
                {d}
              </Text>
            </BlockStack>
          ))}
        </InlineGrid>
        <Text as="p" variant="bodySm" tone="subdued">
          You only ever see a candidate’s need (“needs step-free access”, “needs captions”) and only when they choose to share it on an application. Never a diagnosis.
        </Text>
      </BlockStack>
    </div>
  );
}
