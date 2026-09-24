import { Badge, BlockStack, Card, EmptyState, InlineStack, Text } from '@shopify/polaris';
import { Link } from 'react-router-dom';
import { EmployerLogo } from '../../components/EmployerLogo';
import { APPLICATION_STATUS_LABEL, longDate } from '../../lib/format';
import type { ApplicationStatus } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const TONE: Record<ApplicationStatus, 'info' | 'attention' | 'success' | 'critical' | undefined> = {
  applied: 'info',
  viewed: 'info',
  assessment: 'attention',
  interview: 'attention',
  offer: 'success',
  hired: 'success',
  notSelected: undefined,
  withdrawn: undefined,
};

export function Applications() {
  useTitle('Applications');
  const { state } = useStore();
  const mine = state.applications
    .filter((a) => a.candidateId === state.candidate!.id)
    .sort((a, b) => b.submittedOn.localeCompare(a.submittedOn));
  const active = mine.filter((a) => !['hired', 'notSelected', 'withdrawn'].includes(a.status));
  const past = mine.filter((a) => ['hired', 'notSelected', 'withdrawn'].includes(a.status));

  const row = (a: (typeof mine)[number]) => {
    const job = state.jobs.find((j) => j.id === a.jobId)!;
    const employer = state.employers.find((e) => e.id === job.employerId)!;
    const last = a.history[a.history.length - 1];
    return (
      <Card key={a.id}>
        <InlineStack gap="300" blockAlign="start" wrap={false}>
          <EmployerLogo employer={employer} size={44} />
          <BlockStack gap="200">
            <BlockStack gap="050">
              <Text as="h3" variant="headingMd">
                <Link to={`/applications/${a.id}`}>{job.title}</Link>
              </Text>
              <Text as="p" tone="subdued">
                {employer.name} · Applied {longDate(a.submittedOn)}
              </Text>
            </BlockStack>
            <InlineStack gap="200" blockAlign="center" wrap>
              <Badge tone={TONE[a.status]}>{APPLICATION_STATUS_LABEL[a.status]}</Badge>
              <Text as="span" variant="bodySm" tone="subdued">
                {last.note}
              </Text>
            </InlineStack>
          </BlockStack>
        </InlineStack>
      </Card>
    );
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <BlockStack gap="100">
          <Text as="h1" variant="heading2xl">
            Applications
          </Text>
          <Text as="p" tone="subdued">
            Statuses update only when an employer does something. We never guess.
          </Text>
        </BlockStack>

        {mine.length === 0 ? (
          <EmptyState heading="No applications yet" image="" action={{ content: 'Find jobs', url: '/jobs' }}>
            <p>When you apply, you will see each step the employer takes here.</p>
          </EmptyState>
        ) : (
          <>
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                Active ({active.length})
              </Text>
              {active.length === 0 ? <Text as="p" tone="subdued">None active.</Text> : active.map(row)}
            </BlockStack>
            {past.length > 0 && (
              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">
                  Closed ({past.length})
                </Text>
                {past.map(row)}
              </BlockStack>
            )}
          </>
        )}
      </BlockStack>
    </div>
  );
}
