import { Banner, BlockStack, Button, EmptyState, Text } from '@shopify/polaris';
import { JobCard } from '../../components/JobCard';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

export function Saved() {
  useTitle('Saved jobs');
  const { state } = useStore();
  const saved = state.saved.map((s) => state.jobs.find((j) => j.id === s.jobId)).filter(Boolean);
  const closed = saved.filter((j) => j!.status !== 'published');

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <BlockStack gap="100">
          <Text as="h1" variant="heading2xl">
            Saved jobs
          </Text>
          <Text as="p" tone="subdued">
            {saved.length} saved. Only you can see this list.
          </Text>
        </BlockStack>

        {closed.length > 0 && (
          <Banner tone="warning" title={`${closed.length} saved job${closed.length === 1 ? ' is' : 's are'} no longer open`}>
            <p>They stay here so you can find similar jobs from the same employer.</p>
          </Banner>
        )}

        {saved.length === 0 ? (
          <EmptyState heading="Nothing saved yet" image="" action={{ content: 'Find jobs', url: '/jobs' }}>
            <p>Use “Save” on any job to keep it here. Saving is private.</p>
          </EmptyState>
        ) : (
          <BlockStack gap="300">
            {saved.map((j) => (
              <JobCard key={j!.id} job={j!} />
            ))}
          </BlockStack>
        )}
        <Button url="/jobs" variant="plain">
          Back to jobs
        </Button>
      </BlockStack>
    </div>
  );
}
