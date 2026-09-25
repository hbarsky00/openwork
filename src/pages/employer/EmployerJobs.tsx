import { Badge, BlockStack, Button, Card, EmptyState, InlineStack, Page, Text } from '@shopify/polaris';
import { DIMENSIONS } from '../../lib/dimensions';
import { postedAgo, salary } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';
import { employerVisible, useStore } from '../../state/store';

export function EmployerJobs() {
  useTitle('Jobs');
  const { state, dispatch } = useStore();
  const jobs = state.jobs.filter((j) => j.employerId === state.employerId).sort((a, b) => b.postedOn.localeCompare(a.postedOn));

  return (
    <Page fullWidth title="Jobs" primaryAction={{ content: 'Create job', url: '/employer/jobs/new' }}>
      {jobs.length === 0 ? (
        <Card>
          <EmptyState heading="No jobs yet" image="" action={{ content: 'Create your first job', url: '/employer/jobs/new' }}>
            <p>A job takes about fifteen minutes to describe properly. Candidates see everything you enter.</p>
          </EmptyState>
        </Card>
      ) : (
        <BlockStack gap="300">
          {jobs.map((j) => {
            const apps = state.applications.filter((a) => employerVisible(a) && a.jobId === j.id && a.status !== 'withdrawn').length;
            const done = DIMENSIONS.filter((d) => j.environment[d.id]).length;
            return (
              <Card key={j.id}>
                <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                  <BlockStack gap="100">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="h2" variant="headingMd">
                        {j.title}
                      </Text>
                      <Badge tone={j.status === 'published' ? 'success' : j.status === 'draft' ? 'attention' : undefined}>{j.status === 'published' ? 'Published' : j.status === 'draft' ? 'Draft' : 'Closed'}</Badge>
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {j.department} · {salary(j)} · {postedAgo(j.postedOn)} · {apps} applicant{apps === 1 ? '' : 's'} · environment {done}/{DIMENSIONS.length}
                    </Text>
                  </BlockStack>
                  <InlineStack gap="200">
                    <Button pressed={j.acceptsAutoApply} onClick={() => dispatch({ type: 'upsertJob', job: { ...j, acceptsAutoApply: !j.acceptsAutoApply } })} accessibilityLabel={`Applications sent by Openwork: ${j.acceptsAutoApply ? 'accepted' : 'not accepted'}`}>
                      {j.acceptsAutoApply ? 'Openwork sends: on' : 'Openwork sends: off'}
                    </Button>
                    <Button url={`/employer/jobs/${j.id}/preview`}>Preview</Button>
                    <Button url={`/employer/jobs/${j.id}/edit`}>Edit</Button>
                    <Button onClick={() => dispatch({ type: 'upsertJob', job: { ...j, id: `j-${Date.now().toString(36)}`, title: `${j.title} (copy)`, status: 'draft', postedOn: new Date().toISOString().slice(0, 10) } })}>Duplicate</Button>
                    {j.status === 'published' && (
                      <Button onClick={() => dispatch({ type: 'upsertJob', job: { ...j, status: 'closed' } })}>Close</Button>
                    )}
                    {j.status === 'closed' && (
                      <Button onClick={() => dispatch({ type: 'upsertJob', job: { ...j, status: 'published' } })}>Reopen</Button>
                    )}
                  </InlineStack>
                </InlineStack>
              </Card>
            );
          })}
        </BlockStack>
      )}
    </Page>
  );
}
