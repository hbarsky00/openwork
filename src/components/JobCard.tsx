import { Badge, BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { StarFilledIcon, StarIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { ACCESS_FEATURE_BY_ID } from '../lib/access';
import { EMPLOYMENT_TYPE_LABEL, WORK_LOCATION_LABEL, postedAgo, salary } from '../lib/format';
import { cardSignals, matchJob } from '../lib/match';
import type { Employer, Job } from '../lib/types';
import { useIsSaved, useStore } from '../state/store';
import { EmployerLogo } from './EmployerLogo';
import { MatchSummaryBadge } from './MatchStateBadge';
import { Signal } from './Signal';

interface Props {
  job: Job;
  onSelect?: (id: string) => void;
  selected?: boolean;
  /** Discover page: the candidate's strengths this job lists. */
  strengthsUsed?: string[];
}

type CardState = 'confirmed' | 'review' | 'different' | 'needsConfirmation';

/** Up to three facts worth a glance for a visitor with no profile. Never a wall. */
function facts(job: Job, employer: Employer): { state: CardState; label: string }[] {
  const out: { state: CardState; label: string }[] = [];
  for (const id of ['stepFreeEntrance', 'interpreter', 'jobCoach', 'accessibleDocuments']) {
    const ev = job.accessibility[id] ?? employer.accessibility[id];
    if (ev?.status === 'confirmed' && out.length < 2) out.push({ state: 'confirmed', label: ACCESS_FEATURE_BY_ID[id].label });
  }
  if (job.environment.schedulePredictability === 'fixed' && out.length < 3) out.push({ state: 'confirmed', label: 'Same hours every week' });
  if (job.environment.instructions === 'written' && out.length < 3) out.push({ state: 'confirmed', label: 'Written instructions' });
  return out.slice(0, 3);
}

/**
 * The whole card is the link. One secondary action (save) as an icon.
 * Title · company · pay · arrangement · type · two or three facts · posted.
 */
export function JobCard({ job, onSelect, selected = false, strengthsUsed }: Props) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const saved = useIsSaved(job.id);
  const employer = state.employers.find((e) => e.id === job.employerId);
  const profile = state.role === 'candidate' ? state.candidate : null;
  const hasInputs = !!profile && (Object.keys(profile.workPreferences).length > 0 || Object.keys(profile.accessNeeds).length > 0);
  const result = profile && employer && hasInputs ? matchJob(profile, job, employer) : null;
  const applied = profile ? state.applications.some((a) => a.jobId === job.id && a.candidateId === profile.id) : false;

  const open = () => {
    if (onSelect && state.displayMode !== 'simplified' && window.matchMedia('(min-width: 1024px)').matches) onSelect(job.id);
    else navigate(`/jobs/${job.id}`);
  };
  const save = () => {
    if (state.role !== 'candidate') return navigate(`/signin?next=${encodeURIComponent(`/jobs/${job.id}`)}&reason=save`);
    dispatch({ type: 'toggleSave', jobId: job.id });
  };

  const signals: { state: CardState; label: string }[] = result
    ? cardSignals(result, 3).map((r) => ({ state: r.state as CardState, label: r.kind === 'need' ? ACCESS_FEATURE_BY_ID[r.id]?.label ?? r.label : r.label }))
    : employer
      ? facts(job, employer)
      : [];

  return (
    <article className={`ow-jobcard ow-jobcard--clickable${selected ? ' ow-jobcard--selected' : ''}`} onClick={open} aria-current={selected ? 'true' : undefined}>
      <BlockStack gap="150">
        <InlineStack align="space-between" blockAlign="start" wrap={false} gap="300">
          <InlineStack gap="300" blockAlign="start" wrap={false}>
            {employer && <EmployerLogo employer={employer} size={44} />}
            <BlockStack gap="050">
              <h3 className="ow-jobcard__title">
                <a
                  href={`/jobs/${job.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    open();
                  }}
                >
                  {job.title}
                </a>
              </h3>
              <Text as="p" variant="bodySm" tone="subdued">
                {employer?.name} · {job.location}
              </Text>
            </BlockStack>
          </InlineStack>
          <span onClick={(e) => e.stopPropagation()}>
            <Button icon={saved ? StarFilledIcon : StarIcon} variant="tertiary" pressed={saved} onClick={save} accessibilityLabel={saved ? 'Saved — remove from saved jobs' : 'Save this job'} />
          </span>
        </InlineStack>

        <InlineStack gap="150" blockAlign="center" wrap>
          <Badge>{salary(job)}</Badge>
          <Badge>{WORK_LOCATION_LABEL[job.environment.workLocation ?? ''] ?? 'On-site'}</Badge>
          <Badge>{EMPLOYMENT_TYPE_LABEL[job.employmentType]}</Badge>
          {applied && <Badge tone="info">Applied</Badge>}
          {result && <MatchSummaryBadge result={result} />}
        </InlineStack>

        {strengthsUsed && strengthsUsed.length > 0 && (
          <Text as="p" variant="bodySm">
            Uses {strengthsUsed.length} of your strengths: <strong>{strengthsUsed.join(', ')}</strong>
          </Text>
        )}

        {signals.length > 0 && (
          <div className="ow-jobcard__signals">
            {signals.map((s) => (
              <Signal key={s.label} state={s.state}>
                {s.label}
              </Signal>
            ))}
          </div>
        )}

        <Text as="span" variant="bodySm" tone="subdued">
          {postedAgo(job.postedOn)}
        </Text>
      </BlockStack>
    </article>
  );
}
