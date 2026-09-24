import { Badge, BlockStack, Button, Card, InlineGrid, InlineStack, Layout, Page, Select, Text } from '@shopify/polaris';
import { Link } from 'react-router-dom';
import { VerificationBadge } from '../../components/VerificationBadge';
import { DIMENSIONS } from '../../lib/dimensions';
import { VERIFICATION_LABEL, longDate } from '../../lib/format';
import type { VerificationLevel } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/** Moderation foundation: verification levels and reported jobs. */
export function Admin() {
  useTitle('Moderation');
  const { state, dispatch } = useStore();
  const openReports = state.reports.filter((r) => !r.resolved);

  return (
    <Page title="Trust and moderation" subtitle={`${state.employers.length} employers · ${state.jobs.filter((j) => j.status === 'published').length} live jobs · ${openReports.length} open report${openReports.length === 1 ? '' : 's'}`}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Employer verification
                </Text>
                <Text as="p" tone="subdued">
                  “Verified practices” means the trust team has checked the accommodation route, alternative assessments and onboarding against what the employer publishes. It is never self-awarded.
                </Text>
                {state.employers.map((e) => {
                  const jobs = state.jobs.filter((j) => j.employerId === e.id && j.status === 'published');
                  const complete = jobs.filter((j) => DIMENSIONS.every((d) => j.environment[d.id])).length;
                  const wpDone = Object.values(e.workplace).filter((v) => v.trim()).length;
                  return (
                    <InlineStack key={e.id} align="space-between" blockAlign="center" wrap gap="300">
                      <BlockStack gap="050">
                        <Text as="p" fontWeight="semibold">
                          <Link to={`/companies/${e.id}`}>{e.name}</Link>
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {jobs.length} live job{jobs.length === 1 ? '' : 's'} · {complete} with complete workplace info · workplace profile {wpDone}/4
                          {e.verifiedOn ? ` · checked ${longDate(e.verifiedOn)}` : ''}
                        </Text>
                      </BlockStack>
                      <div style={{ minWidth: 220 }}>
                        <Select
                          label={`Verification for ${e.name}`}
                          labelHidden
                          options={(Object.keys(VERIFICATION_LABEL) as VerificationLevel[]).map((k) => ({ label: VERIFICATION_LABEL[k], value: k }))}
                          value={e.verification}
                          onChange={(v) =>
                            dispatch({
                              type: 'updateEmployer',
                              employerId: e.id,
                              patch: { verification: v as VerificationLevel, verifiedOn: v === 'verifiedPractices' ? new Date().toISOString().slice(0, 10) : e.verifiedOn },
                            })
                          }
                        />
                      </div>
                    </InlineStack>
                  );
                })}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Reported jobs
                </Text>
                {state.reports.length === 0 ? (
                  <Text as="p" tone="subdued">
                    No reports. Candidates can report a job from its detail page.
                  </Text>
                ) : (
                  state.reports.map((r) => {
                    const job = state.jobs.find((j) => j.id === r.jobId);
                    return (
                      <InlineStack key={r.id} align="space-between" blockAlign="center" wrap gap="300">
                        <BlockStack gap="050">
                          <InlineStack gap="200" blockAlign="center">
                            <Text as="p" fontWeight="semibold">
                              {job?.title ?? r.jobId}
                            </Text>
                            <Badge tone={r.resolved ? undefined : 'attention'}>{r.resolved ? 'Resolved' : r.reason}</Badge>
                          </InlineStack>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {longDate(r.on)} · {r.detail}
                          </Text>
                        </BlockStack>
                        {!r.resolved && (
                          <InlineStack gap="200">
                            {job && job.status === 'published' && (
                              <Button onClick={() => dispatch({ type: 'upsertJob', job: { ...job, status: 'closed' } })}>Take down</Button>
                            )}
                            <Button onClick={() => dispatch({ type: 'resolveReport', reportId: r.id })}>Mark resolved</Button>
                          </InlineStack>
                        )}
                      </InlineStack>
                    );
                  })
                )}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <InlineGrid columns={1} gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Levels
                </Text>
                <VerificationBadge level="listed" detailed />
                <VerificationBadge level="practicesCompleted" detailed />
                <VerificationBadge level="verifiedPractices" detailed />
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
