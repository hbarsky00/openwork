import { Banner, BlockStack, Page } from '@shopify/polaris';
import { useParams, useSearchParams } from 'react-router-dom';
import { JobDetailContent } from '../../components/JobDetailContent';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';
import { NotFound } from '../public/NotFound';

/** Exactly the candidate view, rendered inside the employer shell. No separate template to drift. */
export function JobPreview() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const { state } = useStore();
  const job = state.jobs.find((j) => j.id === id && j.employerId === state.employerId);
  useTitle(job ? `Preview · ${job.title}` : 'Preview');
  if (!job) return <NotFound message="That job is not in your account." />;

  return (
    <Page title="Candidate view" subtitle={job.title} backAction={{ content: 'Jobs', url: '/employer/jobs' }} primaryAction={{ content: 'Edit', url: `/employer/jobs/${job.id}/edit` }}>
      <BlockStack gap="500">
        {sp.get('published') && (
          <Banner tone="success" title="Published">
            <p>This job is live. Candidates can find it now.</p>
          </Banner>
        )}
        {job.status === 'draft' && (
          <Banner tone="info" title="Draft">
            <p>Only you can see this. Publish it from the editor when it is ready.</p>
          </Banner>
        )}
        <Banner tone="info">
          <p>This is what a candidate sees. Signed-in candidates also see a “Why this matches” section built from their own preferences.</p>
        </Banner>
        <JobDetailContent job={job} />
      </BlockStack>
    </Page>
  );
}
