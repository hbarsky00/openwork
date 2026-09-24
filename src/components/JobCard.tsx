import { Badge, BlockStack, Box, Button, InlineStack, Text } from '@shopify/polaris';
import { Link, useNavigate } from 'react-router-dom';
import { ACCESS_FEATURE_BY_ID, TECH_A11Y } from '../lib/access';
import { optionOf } from '../lib/dimensions';
import { EMPLOYMENT_TYPE_LABEL, WORK_LOCATION_LABEL, postedAgo, salary } from '../lib/format';
import { cardSignals, matchJob, type MatchReason, type MatchState } from '../lib/match';
import type { Employer, Job } from '../lib/types';
import { useStore } from '../state/store';
import { EmployerLogo } from './EmployerLogo';
import { evidenceState } from './EvidenceLine';
import { MatchSummaryBadge } from './MatchStateBadge';
import { SaveButton } from './SaveButton';
import { Signal } from './Signal';

interface Props {
  job: Job;
  onSelect?: (id: string) => void;
  selected?: boolean;
  compact?: boolean;
  /** Discover page: the candidate's strengths this job lists. */
  strengthsUsed?: string[];
}

function shortLabel(reason: MatchReason, job: Job): string {
  if (reason.kind === 'need') return ACCESS_FEATURE_BY_ID[reason.id]?.label ?? reason.label;
  const dimId = reason.id.replace('pref:', '') as keyof Job['environment'];
  const jobOpt = optionOf(dimId, job.environment[dimId] ?? null);
  return jobOpt?.employerLabel ?? reason.label;
}

/**
 * Without a signed-in candidate the card shows the job's own facts, sourced —
 * a few confirmed, and always one thing the employer has not said.
 */
function factSignals(job: Job, employer: Employer): { state: MatchState; label: string }[] {
  const out: { state: MatchState; label: string }[] = [];
  const headline = ['stepFreeEntrance', 'accessibleRestroom', 'accessibleWorkstation', 'interpreter', 'jobCoach', 'accessibleDocuments'];
  for (const id of headline) {
    const ev = job.accessibility[id] ?? employer.accessibility[id];
    if (ev && out.length < 3) out.push({ state: evidenceState(ev), label: ACCESS_FEATURE_BY_ID[id].label });
  }
  if (job.environment.schedulePredictability === 'fixed' && out.length < 4) out.push({ state: 'confirmed', label: 'Same hours every week' });
  if (job.environment.instructions === 'written' && out.length < 4) out.push({ state: 'confirmed', label: 'Written instructions' });
  const sr = job.technology.length ? (job.technology.every((t) => t.accessibility.screenReader?.status === 'confirmed') ? 'confirmed' : job.technology.some((t) => t.accessibility.screenReader?.status === 'notAvailable') ? 'different' : 'needsConfirmation') : 'needsConfirmation';
  out.push({ state: sr, label: sr === 'confirmed' ? 'Software screen-reader tested' : sr === 'different' ? 'Some software not screen-reader accessible' : 'Software accessibility not verified' });
  const missing = headline.find((id) => !(job.accessibility[id] ?? employer.accessibility[id]));
  if (missing && !out.some((s) => s.state === 'needsConfirmation')) out.push({ state: 'needsConfirmation', label: `${ACCESS_FEATURE_BY_ID[missing].label}: not provided` });
  return out.slice(0, 5);
}

export function JobCard({ job, onSelect, selected = false, compact = false, strengthsUsed }: Props) {
  const { state } = useStore();
  const navigate = useNavigate();
  const employer = state.employers.find((e) => e.id === job.employerId);
  const profile = state.role === 'candidate' ? state.candidate : null;
  const hasInputs = !!profile && (Object.keys(profile.workPreferences).length > 0 || Object.keys(profile.accessNeeds).length > 0);
  const result = profile && employer && hasInputs ? matchJob(profile, job, employer) : null;
  const applied = profile ? state.applications.some((a) => a.jobId === job.id && a.candidateId === profile.id) : false;
  void TECH_A11Y;

  const select = () => {
    if (onSelect && state.displayMode !== 'simplified' && window.matchMedia('(min-width: 1024px)').matches) onSelect(job.id);
    else navigate(`/jobs/${job.id}`);
  };

  const titleEl = onSelect ? (
    <button type="button" onClick={select} aria-current={selected ? 'true' : undefined}>
      {job.title}
    </button>
  ) : (
    <Link to={`/jobs/${job.id}`}>{job.title}</Link>
  );

  return (
    <article className={`ow-jobcard${selected ? ' ow-jobcard--selected' : ''}`} aria-label={`${job.title} at ${employer?.name ?? ''}`}>
      <BlockStack gap="300">
        <InlineStack gap="300" blockAlign="start" wrap={false}>
          {employer && <EmployerLogo employer={employer} size={48} />}
          <BlockStack gap="050">
            <h3 className="ow-jobcard__title">{titleEl}</h3>
            <Text as="p" variant="bodyMd" tone="subdued">
              {employer?.name} · {job.location}
            </Text>
          </BlockStack>
        </InlineStack>

        <InlineStack gap="200" blockAlign="center" wrap>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {salary(job)}
          </Text>
          <Text as="span" variant="bodyMd" tone="subdued">·</Text>
          <Text as="span" variant="bodyMd">{WORK_LOCATION_LABEL[job.environment.workLocation ?? ''] ?? 'Location not stated'}</Text>
          <Text as="span" variant="bodyMd" tone="subdued">·</Text>
          <Text as="span" variant="bodyMd">{EMPLOYMENT_TYPE_LABEL[job.employmentType]}</Text>
        </InlineStack>

        {strengthsUsed && strengthsUsed.length > 0 && (
          <Text as="p" variant="bodySm">
            Uses {strengthsUsed.length} of your strengths: <strong>{strengthsUsed.join(', ')}</strong>
          </Text>
        )}

        {result ? (
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="center" wrap>
              <MatchSummaryBadge result={result} />
              {applied && <Badge tone="info">Applied</Badge>}
              {(result.strengthsMatched.length > 0 || result.skillsMatched.length > 0) && (
                <Text as="span" variant="bodySm" tone="subdued">
                  Uses {result.strengthsMatched.length + result.skillsMatched.length} of your strengths and skills
                </Text>
              )}
            </InlineStack>
            <BlockStack as="ul" gap="100">
              {cardSignals(result).map((r) => (
                <li key={r.id}>
                  <Signal state={r.state}>{shortLabel(r, job)}</Signal>
                </li>
              ))}
            </BlockStack>
          </BlockStack>
        ) : (
          employer && (
            <BlockStack as="ul" gap="100">
              {factSignals(job, employer).map((s) => (
                <li key={s.label}>
                  <Signal state={s.state}>{s.label}</Signal>
                </li>
              ))}
            </BlockStack>
          )
        )}

        {!compact ? (
          <InlineStack align="space-between" blockAlign="center" wrap gap="200">
            <Text as="span" variant="bodySm" tone="subdued">
              {postedAgo(job.postedOn)}
            </Text>
            <InlineStack gap="200">
              <SaveButton jobId={job.id} size="slim" />
              <Button size="slim" url={`/jobs/${job.id}${result ? '#why' : ''}`}>
                {result ? 'Why this could work' : 'View job'}
              </Button>
            </InlineStack>
          </InlineStack>
        ) : (
          <Box>
            <Text as="span" variant="bodySm" tone="subdued">
              {postedAgo(job.postedOn)}
            </Text>
          </Box>
        )}
      </BlockStack>
    </article>
  );
}
