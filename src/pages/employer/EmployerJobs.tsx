import { ActionList, Badge, BlockStack, Button, Card, EmptyState, InlineStack, Page, Popover, Text } from '@shopify/polaris';
import { MenuHorizontalIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import type { Job } from '../../lib/types';
import { DIMENSIONS } from '../../lib/dimensions';
import { postedAgo, salary } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';
import { employerVisible, useStore } from '../../state/store';

/** Everything but Edit lives here: preview, duplicate, auto-apply, close or reopen. One control per row instead of five. */
function JobRowActions({ job: j }: { job: Job }) {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const act = (fn: () => void) => () => { setOpen(false); fn(); };
  return (
    <Popover
      active={open}
      onClose={() => setOpen(false)}
      activator={<Button icon={MenuHorizontalIcon} onClick={() => setOpen((o) => !o)} accessibilityLabel={`More actions for ${j.title}`} disclosure={false} />}
    >
      <ActionList
        actionRole="menuitem"
        items={[
          { content: 'Preview as candidates see it', url: `/employer/jobs/${j.id}/preview` },
          { content: 'Duplicate', onAction: act(() => dispatch({ type: 'upsertJob', job: { ...j, id: `j-${Date.now().toString(36)}`, title: `${j.title} (copy)`, status: 'draft', postedOn: new Date().toISOString().slice(0, 10) } })) },
          { content: j.acceptsAutoApply ? 'Turn auto-apply off' : 'Turn auto-apply on', helpText: j.acceptsAutoApply ? 'Openwork will stop sending applications for candidates.' : 'Let Openwork send applications for candidates who fit.', onAction: act(() => dispatch({ type: 'upsertJob', job: { ...j, acceptsAutoApply: !j.acceptsAutoApply } })) },
          ...(j.status === 'published' ? [{ content: 'Close job', destructive: true, onAction: act(() => dispatch({ type: 'upsertJob', job: { ...j, status: 'closed' as const } })) }] : []),
          ...(j.status === 'closed' ? [{ content: 'Reopen job', onAction: act(() => dispatch({ type: 'upsertJob', job: { ...j, status: 'published' as const } })) }] : []),
        ]}
      />
    </Popover>
  );
}

export function EmployerJobs() {
  useTitle('Jobs');
  const { state } = useStore();
  const jobs = state.jobs.filter((j) => j.employerId === state.employerId).sort((a, b) => b.postedOn.localeCompare(a.postedOn));

  return (
    <Page fullWidth title="Jobs" primaryAction={{ content: 'Create job', url: '/employer/jobs/new' }} secondaryActions={[{ content: 'Import from careers page', url: '/employer/jobs/import' }]}>
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
                      {j.department} · {salary(j)} · {postedAgo(j.postedOn)} · {apps} applicant{apps === 1 ? '' : 's'} · environment {done}/{DIMENSIONS.length} · auto-apply {j.acceptsAutoApply ? 'on' : 'off'}
                    </Text>
                  </BlockStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Button url={`/employer/jobs/${j.id}/edit`}>Edit</Button>
                    <JobRowActions job={j} />
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
