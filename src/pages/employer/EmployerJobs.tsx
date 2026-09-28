import { ActionList, Badge, Banner, BlockStack, Button, InlineStack, Popover, Text } from '@shopify/polaris';
import { MenuHorizontalIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postedAgo, salary } from '../../lib/format';
import { jobCompleteness, jobNeedsInfo, originLabel } from '../../lib/jobs';
import type { Job } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { employerVisible, useStore } from '../../state/store';

type Tab = 'active' | 'imported' | 'needs' | 'draft' | 'closed';

/** Everything but the primary action lives here. One control per row. */
function JobRowActions({ job: j }: { job: Job }) {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const act = (fn: () => void) => () => { setOpen(false); fn(); };
  return (
    <Popover active={open} onClose={() => setOpen(false)} activator={<Button icon={MenuHorizontalIcon} onClick={() => setOpen((o) => !o)} accessibilityLabel={`More actions for ${j.title}`} disclosure={false} />}>
      <ActionList
        actionRole="menuitem"
        items={[
          { content: 'Edit in full editor', url: `/employer/jobs/${j.id}/edit` },
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
  const [sp, setSp] = useSearchParams();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  const jobs = state.jobs.filter((j) => j.employerId === employer.id).sort((a, b) => b.postedOn.localeCompare(a.postedOn));
  const groups: Record<Tab, Job[]> = {
    active: jobs.filter((j) => j.status === 'published'),
    imported: jobs.filter((j) => j.origin && j.origin.kind !== 'manual'),
    needs: jobs.filter((j) => j.status !== 'closed' && jobNeedsInfo(j)),
    draft: jobs.filter((j) => j.status === 'draft'),
    closed: jobs.filter((j) => j.status === 'closed'),
  };
  const tab = (sp.get('tab') as Tab) && groups[sp.get('tab') as Tab] ? (sp.get('tab') as Tab) : 'active';
  const importedN = Number(sp.get('imported') ?? 0);
  const list = groups[tab];
  const setTab = (t: Tab) => { const n = new URLSearchParams(sp); n.set('tab', t); n.delete('imported'); setSp(n); };

  return (
    <div className="ow-container">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <BlockStack gap="100">
            <Text as="h1" variant="heading2xl">
              Jobs
            </Text>
            <Text as="p" tone="subdued">
              {groups.active.length} live · {groups.needs.length} need information · ATS {employer.ats ? (employer.ats.status === 'connected' ? 'connected' : `connection requested (${employer.ats.provider})`) : 'not connected'}
            </Text>
          </BlockStack>
          <InlineStack gap="200">
            <Button url="/employer/jobs/import">Import from careers page</Button>
            <Button url="/employer/jobs/new" variant="primary">
              Create job
            </Button>
          </InlineStack>
        </div>

        {importedN > 0 && (
          <Banner tone="success" title={`${importedN} job${importedN === 1 ? '' : 's'} imported`}>
            <p>
              {groups.imported.filter((j) => !jobNeedsInfo(j)).length} ready to publish · {groups.imported.filter(jobNeedsInfo).length} need information. Adding information takes about three minutes per job and is what makes Openwork different from your careers page.
            </p>
          </Banner>
        )}

        <div className="ow-tabs" role="tablist" aria-label="Job status">
          {(
            [
              ['active', `Active (${groups.active.length})`],
              ['imported', `Imported (${groups.imported.length})`],
              ['needs', `Needs information (${groups.needs.length})`],
              ['draft', `Draft (${groups.draft.length})`],
              ['closed', `Closed (${groups.closed.length})`],
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
              {label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="ow-sheet">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                {tab === 'imported' ? 'Nothing imported yet' : tab === 'needs' ? 'Every job has the information candidates compare against' : tab === 'draft' ? 'No drafts' : tab === 'closed' ? 'Nothing closed' : 'No live jobs'}
              </Text>
              <Text as="p" tone="subdued">
                {tab === 'imported' ? 'Paste your careers page and every open role comes in as a draft.' : tab === 'active' ? 'Publish a draft or create a job.' : 'Nothing to do here.'}
              </Text>
              <InlineStack gap="200">
                {tab === 'imported' && <Button url="/employer/jobs/import" variant="primary">Import from careers page</Button>}
                {tab !== 'imported' && <Button url="/employer/jobs/new">Create job</Button>}
              </InlineStack>
            </BlockStack>
          </div>
        ) : (
          <BlockStack gap="300">
            {list.map((j) => {
              const apps = state.applications.filter((a) => employerVisible(a) && a.jobId === j.id && a.status !== 'withdrawn').length;
              const { done, total } = jobCompleteness(j);
              const needs = jobNeedsInfo(j);
              return (
                <div key={j.id} className="ow-sheet ow-aside__card">
                  <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                    <BlockStack gap="100">
                      <InlineStack gap="200" blockAlign="center" wrap>
                        <Text as="h2" variant="headingMd">
                          <Link to={`/employer/jobs/${j.id}/${needs ? 'enrich' : 'edit'}`} className="ow-plainlink">
                            {j.title}
                          </Link>
                        </Text>
                        <Badge tone={j.status === 'published' ? 'success' : j.status === 'draft' ? 'attention' : undefined}>{j.status === 'published' ? 'Published' : j.status === 'draft' ? 'Draft' : 'Closed'}</Badge>
                        {needs && j.status !== 'closed' && <Badge tone="warning">Needs information</Badge>}
                      </InlineStack>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {[j.department, salary(j), postedAgo(j.postedOn), `${apps} applicant${apps === 1 ? '' : 's'}`, `${done} of ${total} answered`, originLabel(j), `auto-apply ${j.acceptsAutoApply ? 'on' : 'off'}`].filter(Boolean).join(' · ')}
                      </Text>
                    </BlockStack>
                    <InlineStack gap="200" blockAlign="center">
                      {needs && j.status !== 'closed' ? (
                        <Button url={`/employer/jobs/${j.id}/enrich`} variant="primary">
                          Add information
                        </Button>
                      ) : (
                        <Button url={`/employer/jobs/${j.id}/edit`}>Edit</Button>
                      )}
                      <JobRowActions job={j} />
                    </InlineStack>
                  </InlineStack>
                </div>
              );
            })}
          </BlockStack>
        )}
      </BlockStack>
    </div>
  );
}
