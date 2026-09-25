import { Badge, BlockStack, Card, EmptyState, InlineGrid, InlineStack, Page, Select, Text } from '@shopify/polaris';
import { Link, useSearchParams } from 'react-router-dom';
import { ChoiceChips } from '../../components/ChoiceChips';
import { APPLICATION_STATUS_LABEL, longDate } from '../../lib/format';
import type { ApplicationStatus } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

export function EmployerCandidates() {
  useTitle('Candidates');
  const { state } = useStore();
  const [sp, setSp] = useSearchParams();
  const jobs = state.jobs.filter((j) => j.employerId === state.employerId);
  const jobFilter = sp.get('job') ?? '';
  const statusFilter = sp.getAll('status') as ApplicationStatus[];

  const apps = state.applications
    .filter((a) => jobs.some((j) => j.id === a.jobId))
    .filter((a) => !jobFilter || a.jobId === jobFilter)
    .filter((a) => statusFilter.length === 0 || statusFilter.includes(a.status))
    .sort((a, b) => b.submittedOn.localeCompare(a.submittedOn));

  return (
    <Page fullWidth title="Candidates" subtitle={`${apps.length} application${apps.length === 1 ? '' : 's'}`}>
      <InlineGrid columns={{ xs: 1, md: ['oneThird', 'twoThirds'] }} gap="500">
        <Card>
          <BlockStack gap="400">
            <Select
              label="Job"
              options={[{ label: 'All jobs', value: '' }, ...jobs.map((j) => ({ label: j.title, value: j.id }))]}
              value={jobFilter}
              onChange={(v) => {
                const n = new URLSearchParams(sp);
                if (v) n.set('job', v);
                else n.delete('job');
                setSp(n);
              }}
            />
            <ChoiceChips
              label="Status"
              multiple
              size="slim"
              options={(Object.keys(APPLICATION_STATUS_LABEL) as ApplicationStatus[]).map((st) => ({ value: st, label: APPLICATION_STATUS_LABEL[st] }))}
              value={statusFilter}
              onChange={(v) => {
                const n = new URLSearchParams(sp);
                n.delete('status');
                (v as string[]).forEach((st) => n.append('status', st));
                setSp(n);
              }}
            />
          </BlockStack>
        </Card>

        <BlockStack gap="300">
          {apps.length === 0 ? (
            <Card>
              <EmptyState heading="No applications match" image="">
                <p>Try clearing the filters.</p>
              </EmptyState>
            </Card>
          ) : (
            apps.map((a) => {
              const job = jobs.find((j) => j.id === a.jobId)!;
              const cand = state.candidates.find((c) => c.id === a.candidateId);
              return (
                <Card key={a.id}>
                  <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                    <BlockStack gap="100">
                      <Text as="h2" variant="headingMd">
                        <Link to={`/employer/candidates/${a.id}`}>{cand?.name ?? 'Candidate'}</Link>
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {cand?.headline}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {job.title} · Applied {longDate(a.submittedOn)}
                        {a.shared.accommodationRequest ? ' · Accommodation request included' : ''}
                      </Text>
                    </BlockStack>
                    <Badge tone={a.status === 'applied' ? 'attention' : a.status === 'withdrawn' || a.status === 'notSelected' ? undefined : 'info'}>{APPLICATION_STATUS_LABEL[a.status]}</Badge>
                  </InlineStack>
                </Card>
              );
            })
          )}
        </BlockStack>
      </InlineGrid>
    </Page>
  );
}
