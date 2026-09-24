import { Button, InlineStack } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useParams } from 'react-router-dom';
import { JobDetailContent } from '../../components/JobDetailContent';
import { useTitle } from '../../lib/useTitle';
import { useJob, useStore } from '../../state/store';
import { NotFound } from './NotFound';

export function JobDetailPage() {
  const { id } = useParams();
  const job = useJob(id);
  const { state } = useStore();
  useTitle(job ? job.title : 'Job not found');
  if (!job) return <NotFound message="This job may have been removed or the link is wrong." />;

  const back = state.lastSearch ? `/jobs?${state.lastSearch}` : '/jobs';
  return (
    <div className="ow-container">
      <InlineStack>
        <Button icon={ArrowLeftIcon} url={back} variant="plain">
          Back to jobs
        </Button>
      </InlineStack>
      <div style={{ height: 'var(--p-space-400)' }} />
      <JobDetailContent job={job} />
    </div>
  );
}
