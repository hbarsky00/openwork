import { Badge, BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { jobCompleteness, jobNeedsInfo } from '../../lib/jobs';
import { salary } from '../../lib/format';
import type { Job } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const today = () => new Date().toISOString().slice(0, 10);

/**
 * What happened after an import. Three groups, never a list of 34 forms:
 * ready to publish now, needs information first, and anything already live.
 */
export function ImportReview() {
  useTitle('Import review');
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const batch = sp.get('batch');
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  const all = state.jobs.filter((j) => j.employerId === employer.id && j.origin?.kind !== 'manual');
  const imported = batch ? all.filter((j) => j.origin?.batchId === batch) : all;
  const ready = imported.filter((j) => j.status === 'draft' && !jobNeedsInfo(j));
  const needs = imported.filter((j) => j.status === 'draft' && jobNeedsInfo(j));
  const live = imported.filter((j) => j.status === 'published');
  const source = imported[0]?.origin?.url;

  const publishReady = () => {
    ready.forEach((j) => dispatch({ type: 'upsertJob', job: { ...j, status: 'published', postedOn: today() } }));
    navigate('/employer/jobs?tab=active');
  };

  const Row = ({ j, action }: { j: Job; action: 'enrich' | 'edit' }) => {
    const { done, total } = jobCompleteness(j);
    return (
      <div className="ow-sheet ow-aside__card">
        <InlineStack align="space-between" blockAlign="center" wrap gap="300">
          <BlockStack gap="050">
            <Text as="h3" variant="headingMd">
              <Link to={`/employer/jobs/${j.id}/${action}`} className="ow-plainlink">
                {j.title}
              </Link>
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {[j.location || 'Location not stated', j.salaryMax ? salary(j) : 'Pay not stated', `${done} of ${total} answered`].join(' · ')}
            </Text>
          </BlockStack>
          <Button url={`/employer/jobs/${j.id}/${action}`} variant={action === 'enrich' ? 'primary' : 'secondary'}>
            {action === 'enrich' ? 'Add information' : 'Review'}
          </Button>
        </InlineStack>
      </div>
    );
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <Link to="/employer/jobs" className="ow-backlink">
            ← Jobs
          </Link>
        </div>
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Your jobs are in Openwork.
          </Text>
          <Text as="p" tone="subdued">
            {imported.length} imported{source ? ` from ${source.replace(/^https?:\/\//, '')}` : ''}. Nothing is visible to candidates until you publish it.
          </Text>
        </BlockStack>

        <div className="ow-readiness" role="status" aria-label="Import summary">
          <span className="ow-readiness__item ow-readiness__item--info">
            <span>
              <strong>{imported.length}</strong> imported
            </span>
          </span>
          <span className="ow-readiness__item ow-readiness__item--ok">
            <span>
              <strong>{ready.length}</strong> ready
            </span>
          </span>
          <span className="ow-readiness__item ow-readiness__item--todo">
            <span>
              <strong>{needs.length}</strong> need information
            </span>
          </span>
        </div>

        {ready.length > 0 && (
          <div className="ow-sheet">
            <BlockStack gap="300">
              <BlockStack gap="050">
                <Text as="h2" variant="headingLg">
                  Ready to publish
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  These carry enough for a candidate to judge the job: pay, location and what the work involves. You can publish now and add the rest whenever you like.
                </Text>
              </BlockStack>
              <InlineStack gap="200">
                <Button variant="primary" size="large" onClick={publishReady}>
                  {`Publish ${ready.length} ready job${ready.length === 1 ? '' : 's'}`}
                </Button>
              </InlineStack>
              <BlockStack gap="200">
                {ready.map((j) => (
                  <Row key={j.id} j={j} action="edit" />
                ))}
              </BlockStack>
            </BlockStack>
          </div>
        )}

        {needs.length > 0 && (
          <div className="ow-sheet">
            <BlockStack gap="300">
              <BlockStack gap="050">
                <Text as="h2" variant="headingLg">
                  Need information
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  A careers page rarely says how a job actually works. About three minutes each, and candidates can compare them properly. Nothing here changes what the job requires.
                </Text>
              </BlockStack>
              <BlockStack gap="200">
                {needs.map((j) => (
                  <Row key={j.id} j={j} action="enrich" />
                ))}
              </BlockStack>
            </BlockStack>
          </div>
        )}

        {live.length > 0 && (
          <div className="ow-sheet">
            <BlockStack gap="200">
              <InlineStack gap="200" blockAlign="center" wrap>
                <Text as="h2" variant="headingLg">
                  Already live
                </Text>
                <Badge tone="success">{`${live.length} updated`}</Badge>
              </InlineStack>
              <Text as="p" variant="bodySm" tone="subdued">
                These were already in your account, so the import updated them instead of making a second copy.
              </Text>
            </BlockStack>
          </div>
        )}

        <Text as="p" variant="bodySm" tone="subdued">
          Careers-page imports are one-off. To keep Openwork in step with your hiring system automatically, <Link to="/employer/connect">connect your ATS</Link>.
        </Text>
      </BlockStack>
    </div>
  );
}
