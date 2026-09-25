import { BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmployerLogo } from '../../components/EmployerLogo';
import { JobDetailContent } from '../../components/JobDetailContent';
import { SaveButton } from '../../components/SaveButton';
import { VerificationBadge } from '../../components/VerificationBadge';
import { salary } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';
import { useJob, useMyApplication, useStore } from '../../state/store';
import { NotFound } from './NotFound';

/**
 * Full job page: article + sidebar. The job reads on one white sheet; the
 * apply card sits beside it and stays put while you scroll. Same shape as
 * every other job site, which is the point.
 */
export function JobDetailPage() {
  const { id } = useParams();
  const job = useJob(id);
  const { state } = useStore();
  const navigate = useNavigate();
  const myApplication = useMyApplication(id ?? '');
  useTitle(job ? job.title : 'Job not found');
  if (!job) return <NotFound message="This job may have been removed or the link is wrong." />;
  const employer = state.employers.find((e) => e.id === job.employerId);
  if (!employer) return null;

  const back = state.lastSearch ? `/jobs?${state.lastSearch}` : '/jobs';
  const closed = job.status !== 'published';
  const q = job.screeningQuestions.length;

  return (
    <div className="ow-container">
      <div className="ow-pagehead">
        <Link to={back} className="ow-backlink">
          ← Back to jobs
        </Link>
      </div>
      <div className="ow-cols">
        <article className="ow-sheet ow-article">
          <JobDetailContent job={job} />
        </article>
        <aside className="ow-aside">
          <div className="ow-sheet ow-aside__card">
            <BlockStack gap="400">
              <BlockStack gap="100">
                <Text as="p" variant="headingLg">
                  {salary(job)}
                </Text>
                <Text as="p" tone="subdued">
                  {job.location}
                </Text>
              </BlockStack>
              {myApplication ? (
                <Button url={`/applications/${myApplication.id}`} variant="primary" size="large" fullWidth>
                  View your application
                </Button>
              ) : closed ? (
                <Button disabled size="large" fullWidth>
                  No longer accepting applications
                </Button>
              ) : (
                <Button variant="primary" size="large" fullWidth onClick={() => navigate(`/jobs/${job.id}/apply`)}>
                  Apply now
                </Button>
              )}
              <SaveButton jobId={job.id} size="large" fullWidth />
              {!myApplication && !closed && (
                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                  Résumé{q ? ` + ${q} short question${q === 1 ? '' : 's'}` : ''}. A few minutes.
                </Text>
              )}
            </BlockStack>
          </div>
          <div className="ow-sheet ow-aside__card">
            <BlockStack gap="300">
              <InlineStack gap="300" blockAlign="center" wrap={false}>
                <EmployerLogo employer={employer} size={48} />
                <BlockStack gap="050">
                  <Text as="p" variant="headingMd">
                    {employer.name}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {employer.industry} · {employer.size}
                  </Text>
                </BlockStack>
              </InlineStack>
              <VerificationBadge level={employer.verification} />
              <Text as="p">{employer.mission}</Text>
              <Button url={`/companies/${employer.id}`} variant="plain">
                All jobs at {employer.name}
              </Button>
            </BlockStack>
          </div>
        </aside>
      </div>
    </div>
  );
}
