import { BlockStack, Card, DescriptionList, InlineGrid, InlineStack, List, Text } from '@shopify/polaris';
import { Link, useParams } from 'react-router-dom';
import { EmployerLogo } from '../../components/EmployerLogo';
import { JobCard } from '../../components/JobCard';
import { VerificationBadge } from '../../components/VerificationBadge';
import { WORKPLACE_EVIDENCE_FEATURES } from '../../lib/access';
import { longDate } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';
import { useEmployer, useStore } from '../../state/store';
import { NotFound } from './NotFound';

export function Company() {
  const { id } = useParams();
  const employer = useEmployer(id);
  const { state } = useStore();
  useTitle(employer?.name ?? 'Company not found');
  if (!employer) return <NotFound message="This company is not listed on Openwork." />;

  const jobs = state.jobs.filter((j) => j.employerId === employer.id && j.status === 'published');
  const provided = WORKPLACE_EVIDENCE_FEATURES.filter((f) => employer.accessibility[f.id]);
  const missing = WORKPLACE_EVIDENCE_FEATURES.filter((f) => !employer.accessibility[f.id]);

  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <InlineStack gap="400" blockAlign="center" wrap>
          <EmployerLogo employer={employer} size={72} />
          <BlockStack gap="200">
            <Text as="h1" variant="heading2xl">
              {employer.name}
            </Text>
            <InlineStack gap="200" blockAlign="center" wrap>
              <Text as="span" tone="subdued">
                {employer.industry} · {employer.size} · {employer.headquarters}
              </Text>
              <VerificationBadge level={employer.verification} />
              {state.role !== 'employer' && !employer.claimedBy && (
                <Link to={`/claim?company=${employer.id}`}>Work here? Claim this page</Link>
              )}
            </InlineStack>
          </BlockStack>
        </InlineStack>

        <InlineGrid columns={{ xs: 1, lg: ['twoThirds', 'oneThird'] }} gap="500">
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingLg">
                    Workplace accessibility
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {provided.length} of {WORKPLACE_EVIDENCE_FEATURES.length} workplace questions answered. Each answer shows who confirmed it and when. Job-specific details (software, workstation, breaks) are on each job.
                  </Text>
                </BlockStack>
                {(
                  [
                    ['Provided', provided.filter((f) => employer.accessibility[f.id].status === 'confirmed'), 'ok'],
                    ['On request', provided.filter((f) => employer.accessibility[f.id].status === 'contact'), 'warn'],
                    ['Not available', provided.filter((f) => employer.accessibility[f.id].status === 'notAvailable'), 'no'],
                  ] as const
                ).map(([title, items, tone]) =>
                  items.length ? (
                    <BlockStack key={title} gap="200">
                      <Text as="h3" variant="headingSm">
                        {title}
                      </Text>
                      <ul className={`ow-factlist ow-factlist--${tone}`}>
                        {items.map((f) => {
                          const ev = employer.accessibility[f.id];
                          return (
                            <li key={f.id}>
                              <Text as="span" fontWeight="medium">
                                {f.label}
                              </Text>
                              {ev.note && (
                                <Text as="span" variant="bodySm" tone="subdued">
                                  {' '}
                                  — {ev.note}
                                </Text>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </BlockStack>
                  ) : null,
                )}
                {missing.length > 0 && (
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      Not provided
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {missing.map((f) => f.label).join(' · ')}
                    </Text>
                  </BlockStack>
                )}
                <Text as="p" variant="bodySm" tone="subdued">
                  Reported by the employer{employer.verifiedOn ? `, checked by Openwork ${longDate(employer.verifiedOn)}` : ''}. Latest answer {longDate(provided.map((f) => employer.accessibility[f.id].confirmedOn).sort().at(-1) ?? employer.verifiedOn ?? new Date().toISOString().slice(0, 10))}.
                </Text>
                <Text as="p">
                  <strong>Accessibility contact:</strong> {employer.accessibilityContact}
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  How this workplace runs
                </Text>
                <DescriptionList
                  items={[
                    { term: 'Communication', description: employer.workplace.communicationNorms },
                    { term: 'Onboarding', description: employer.workplace.onboarding },
                    { term: 'Manager check-ins', description: employer.workplace.managerCadence },
                    { term: 'Asking for an adjustment', description: employer.workplace.accommodationRoute },
                  ]}
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">
                  About
                </Text>
                <Text as="p" variant="bodyLg">
                  <span className="ow-prose">{employer.about}</span>
                </Text>
                <Text as="p" tone="subdued">
                  {employer.mission}
                </Text>
              </BlockStack>
            </Card>

            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                Open jobs ({jobs.length})
              </Text>
              {jobs.length === 0 ? (
                <Card>
                  <Text as="p" tone="subdued">
                    No open jobs right now.
                  </Text>
                </Card>
              ) : (
                jobs.map((j) => <JobCard key={j.id} job={j} />)
              )}
            </BlockStack>
          </BlockStack>

          <BlockStack gap="500">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Verification
                </Text>
                <VerificationBadge level={employer.verification} detailed />
                {employer.verifiedOn && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    Last checked {employer.verifiedOn}.
                  </Text>
                )}
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Benefits
                </Text>
                <List type="bullet">
                  {employer.benefits.map((b) => (
                    <List.Item key={b}>{b}</List.Item>
                  ))}
                </List>
              </BlockStack>
            </Card>
          </BlockStack>
        </InlineGrid>
      </BlockStack>
    </div>
  );
}
