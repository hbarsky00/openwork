import { Banner, BlockStack, Button, Text } from '@shopify/polaris';
import { JobCard } from '../../components/JobCard';
import { matchJob, rankScore } from '../../lib/match';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

export function Saved() {
  useTitle('Saved jobs');
  const { state } = useStore();
  const saved = state.saved.map((s) => state.jobs.find((j) => j.id === s.jobId)).filter(Boolean);
  const closed = saved.filter((j) => j!.status !== 'published');
  const p = state.candidate;
  const savedIds = new Set(state.saved.map((x) => x.jobId));
  const suggested = p
    ? state.jobs
        .filter((j) => j.status === 'published' && !savedIds.has(j.id))
        .map((j) => ({ j, score: rankScore(matchJob(p, j, state.employers.find((e) => e.id === j.employerId)!)) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((x) => x.j)
    : [];

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
          <BlockStack gap="400">
            <div className="ow-why">
              <Text as="p">
                <strong>Nothing saved yet.</strong> Press the star on any job to keep it here. Saving is private; employers never see it.
              </Text>
            </div>
            {suggested.length > 0 && (
              <BlockStack gap="300">
                <Text as="h2" variant="headingLg">
                  Worth saving
                </Text>
                {suggested.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </BlockStack>
            )}
          </BlockStack>
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
