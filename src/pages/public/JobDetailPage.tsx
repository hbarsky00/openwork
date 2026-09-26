import { BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { Link, useParams } from 'react-router-dom';
import { EmployerLogo } from '../../components/EmployerLogo';
import { JobDetailContent } from '../../components/JobDetailContent';
import { QuickApplyButton, applyHint } from '../../components/QuickApplyButton';
import { SaveButton } from '../../components/SaveButton';
import { VerificationBadge } from '../../components/VerificationBadge';
import { MATCH_TIER_LABEL, matchJob, matchTier, type MatchResult } from '../../lib/match';
import { useTitle } from '../../lib/useTitle';
import { useApplicantCount, useJob, useMyApplication, useStore } from '../../state/store';
import { NotFound } from './NotFound';

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  const word = total === 0 ? 'Not compared' : pct >= 80 ? 'Strong' : pct >= 50 ? 'Good' : 'Worth reviewing';
  return (
    <div className={`ow-bar${total === 0 ? ' ow-bar--none' : pct < 50 ? ' ow-bar--warn' : ''}`}>
      <div className="ow-bar__head">
        <span>{label}</span>
        <strong>{word}</strong>
      </div>
      <div className="ow-bar__track">
        <div className="ow-bar__fill" style={{ width: `${total === 0 ? 100 : pct}%` }} />
      </div>
    </div>
  );
}

function YourMatch({ r, jobId }: { r: MatchResult; jobId: string }) {
  const needsOk = r.confirmed.filter((x) => x.kind === 'need').length;
  const needsAll = r.confirmed.concat(r.review, r.different, r.needsConfirmation).filter((x) => x.kind === 'need').length;
  const prefsOk = r.confirmed.filter((x) => x.kind === 'preference').length;
  const prefsAll = r.confirmed.concat(r.review, r.different).filter((x) => x.kind === 'preference').length;
  const tier = matchTier(r);
  return (
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center">
        <Text as="h2" variant="headingMd">
          Your match
        </Text>
        <span className={`ow-matchlabel ow-matchlabel--${tier}`}>{MATCH_TIER_LABEL[tier]}</span>
      </InlineStack>
      <Bar label="Skills" value={r.skillsMatched.length + r.strengthsMatched.length} total={r.skillsMatched.length + r.strengthsMatched.length > 0 ? r.skillsMatched.length + r.strengthsMatched.length + 1 : 0} />
      <Bar label="How you work" value={prefsOk} total={prefsAll} />
      <Bar label="Accessibility" value={needsOk} total={needsAll} />
      <Button url={`/jobs/${jobId}/match`} variant="plain">
        See full match
      </Button>
    </BlockStack>
  );
}

/** Full job page, reference layout: sheet + sticky sidebar (Your match, About the company). */
export function JobDetailPage() {
  const { id } = useParams();
  const job = useJob(id);
  const { state } = useStore();
  const myApplication = useMyApplication(id ?? '');
  const applicants = useApplicantCount(id ?? '');
  useTitle(job ? job.title : 'Job not found');
  if (!job) return <NotFound message="This job may have been removed or the link is wrong." />;
  const employer = state.employers.find((e) => e.id === job.employerId);
  if (!employer) return null;
  const profile = state.role === 'candidate' ? state.candidate : null;
  const result = profile ? matchJob(profile, job, employer) : null;

  const back = state.lastSearch ? `/jobs?${state.lastSearch}` : '/jobs';
  const closed = job.status !== 'published';

  return (
    <div className="ow-container">
      <div className="ow-pagehead">
        <Link to={back} className="ow-backlink">
          ← Back to search
        </Link>
      </div>
      <div className="ow-cols">
        <article className="ow-article">
          <JobDetailContent job={job} />
        </article>
        <aside className="ow-aside">
          <div className="ow-sheet ow-aside__card ow-aside__card--apply">
            <BlockStack gap="400">
              <QuickApplyButton job={job} fullWidth />
              <SaveButton jobId={job.id} size="large" fullWidth />
              {!myApplication && !closed && (
                <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                  {applyHint(job, state.role === 'candidate')}
                </Text>
              )}
              <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                {applicants} applicant{applicants === 1 ? '' : 's'} · replies {employer.typicalResponse}
              </Text>
            </BlockStack>
          </div>
          {result && result.comparable + result.skillsMatched.length + result.strengthsMatched.length > 0 && (
            <div className="ow-sheet ow-aside__card">
              <YourMatch r={result} jobId={job.id} />
            </div>
          )}
          <div className="ow-sheet ow-aside__card">
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                About {employer.name}
              </Text>
              <InlineStack gap="300" blockAlign="center" wrap={false}>
                <EmployerLogo employer={employer} size={44} />
                <Text as="p" variant="bodySm" tone="subdued">
                  {employer.industry} · {employer.size} · {employer.headquarters}
                </Text>
              </InlineStack>
              <Text as="p">{employer.mission}</Text>
              <VerificationBadge level={employer.verification} />
              <Button url={`/companies/${employer.id}`} variant="plain">
                View company profile
              </Button>
            </BlockStack>
          </div>
        </aside>
      </div>
    </div>
  );
}
