import { BlockStack, Button, InlineGrid, InlineStack, Text } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import { EmployerLogo } from '../../components/EmployerLogo';
import { EMPLOYMENT_TYPE_LABEL, WORK_LOCATION_LABEL, salary } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const POINTS = [
  { t: 'Jobs that fit more than your résumé', b: 'Matches use your skills, goals, how you like to work and what you need at work — together.' },
  { t: 'Know what the workplace is actually like', b: 'Hours, noise, meetings, instructions, and what the employer provides, with the source, before you apply.' },
  { t: 'Apply with help from Openwork', b: 'Your profile and résumé are reused. The employer’s few questions are all that is left to write.' },
  { t: 'You control what employers see', b: 'Private, matching only, or okay to share. Nothing reaches an employer that you did not mark shareable.' },
  { t: 'Built for different ways of working', b: 'Screen readers, keyboards, captions, plain language, simplified view. Accessibility is the intelligence underneath, not a badge on top.' },
];

/** Landing per the master spec: promise, product preview, five short points, employer CTA. */
export function Landing() {
  useTitle('');
  const { state } = useStore();
  const demo = state.jobs.find((j) => j.id === 'j-dataquality') ?? state.jobs[0];
  const emp = demo && state.employers.find((e) => e.id === demo.employerId);

  return (
    <>
      <section className="ow-hero">
        <div className="ow-container">
          <div className="ow-hero__grid">
            <BlockStack gap="600">
              <BlockStack gap="400">
                <h1>Find the right job. Apply with confidence.</h1>
                <Text as="p" variant="bodyLg" tone="subdued">
                  Openwork finds jobs that match your skills, goals, work preferences and accessibility needs — then helps you apply.
                </Text>
              </BlockStack>
              <InlineStack gap="300">
                <Button url="/signup" variant="primary" size="large">
                  Find my matches
                </Button>
                <Button url="/jobs" size="large">
                  Search jobs
                </Button>
              </InlineStack>
              <Text as="p" variant="bodySm" tone="subdued">
                Free for job seekers. Hiring? <a href="/for-employers">For employers</a>.
              </Text>
            </BlockStack>

            {demo && emp && (
              <div className="ow-sheet ow-hero-match">
                <BlockStack gap="400">
                  <InlineStack gap="300" blockAlign="center" wrap={false}>
                    <EmployerLogo employer={emp} size={56} />
                    <BlockStack gap="050">
                      <Text as="p" variant="headingLg">
                        {demo.title}
                      </Text>
                      <Text as="p" tone="subdued">
                        {emp.name} • {WORK_LOCATION_LABEL[demo.environment.workLocation ?? ''] ?? demo.location} • {salary(demo)} • {EMPLOYMENT_TYPE_LABEL[demo.employmentType]}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                  <span className="ow-matchlabel ow-matchlabel--strong">Strong match</span>
                  <div className="ow-why">
                    {['9 of 11 skills align', 'Remote matches your preference', 'Flexible schedule', 'Interview accommodations available', 'Accessibility information confirmed'].map((t) => (
                      <div key={t} className="ow-why__row ow-why__row--ok">
                        <CheckCircleIcon />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <InlineStack>
                    <Button url={`/jobs/${demo.id}`}>Why this matches</Button>
                  </InlineStack>
                </BlockStack>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="ow-container">
        <BlockStack gap="800">
          <InlineGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="600">
            {POINTS.map((pt) => (
              <BlockStack key={pt.t} gap="200">
                <Text as="h2" variant="headingLg">
                  {pt.t}
                </Text>
                <Text as="p" tone="subdued">
                  {pt.b}
                </Text>
              </BlockStack>
            ))}
          </InlineGrid>
        </BlockStack>
      </section>
    </>
  );
}
