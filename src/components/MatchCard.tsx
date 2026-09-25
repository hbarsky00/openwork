import { Badge, BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { AlertCircleIcon, CheckCircleIcon, InfoIcon, StarFilledIcon, StarIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { EMPLOYMENT_TYPE_LABEL, WORK_LOCATION_LABEL, postedAgo, salary } from '../lib/format';
import { MATCH_TIER_LABEL, evidenceLines, matchJob, matchTier } from '../lib/match';
import type { Job } from '../lib/types';
import { useIsSaved, useMyApplication, useStore } from '../state/store';
import { EmployerLogo } from './EmployerLogo';

const ICON = { ok: CheckCircleIcon, info: InfoIcon, warn: AlertCircleIcon };

/**
 * Reference job card: logo, title, company · location, pills, match label,
 * three evidence lines (Career · Work · Accessibility), then View job /
 * Prepare application / Save. `hero` is the big Top Match card.
 */
export function MatchCard({ job, hero = false }: { job: Job; hero?: boolean }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const saved = useIsSaved(job.id);
  const mine = useMyApplication(job.id);
  const employer = state.employers.find((e) => e.id === job.employerId);
  const profile = state.role === 'candidate' ? state.candidate : null;
  const result = profile && employer ? matchJob(profile, job, employer) : null;
  const tier = matchTier(result);
  const lines = result ? evidenceLines(result, job) : [];
  if (!employer) return null;

  return (
    <article className={`ow-sheet ${hero ? 'ow-hero-match' : 'ow-aside__card'}`}>
      <BlockStack gap={hero ? '500' : '300'}>
        <InlineStack align="space-between" blockAlign="center" wrap gap="200">
          <InlineStack gap="200" blockAlign="center">
            <span className={`ow-matchlabel ow-matchlabel--${tier}`}>{hero ? 'Top match' : MATCH_TIER_LABEL[tier]}</span>
            <Text as="span" variant="bodySm" tone="subdued">
              {postedAgo(job.postedOn)}
            </Text>
          </InlineStack>
          {!hero && <Button icon={saved ? StarFilledIcon : StarIcon} variant="tertiary" pressed={saved} onClick={() => dispatch({ type: 'toggleSave', jobId: job.id })} accessibilityLabel={saved ? 'Saved — remove' : 'Save job'} />}
        </InlineStack>

        <div className={hero ? 'ow-cols' : undefined}>
          <BlockStack gap="300">
            <InlineStack gap="300" blockAlign="center" wrap={false}>
              <EmployerLogo employer={employer} size={hero ? 64 : 48} />
              <BlockStack gap="050">
                <Text as="h3" variant={hero ? 'headingXl' : 'headingMd'}>
                  <a href={`/jobs/${job.id}`} className="ow-plainlink" onClick={(e) => { e.preventDefault(); navigate(`/jobs/${job.id}`); }}>
                    {job.title}
                  </a>
                </Text>
                <Text as="p" tone="subdued">
                  {employer.name} • {job.location}
                </Text>
              </BlockStack>
            </InlineStack>
            <InlineStack gap="150" wrap>
              <Badge>{salary(job)}</Badge>
              <Badge>{EMPLOYMENT_TYPE_LABEL[job.employmentType]}</Badge>
              <Badge>{WORK_LOCATION_LABEL[job.environment.workLocation ?? ''] ?? 'On-site'}</Badge>
              {job.environment.schedulePredictability === 'flexible' && <Badge>Flexible hours</Badge>}
            </InlineStack>

            {lines.length > 0 && (
              <div className="ow-why">
                {hero && (
                  <Text as="p" variant="bodySm" fontWeight="semibold">
                    Why this is a great fit for you
                  </Text>
                )}
                {lines.map((l) => {
                  const I = ICON[l.tone];
                  return (
                    <div key={l.heading} className={`ow-why__row ow-why__row--${l.tone}`}>
                      <I />
                      <span>
                        <strong>{l.heading}:</strong> {l.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </BlockStack>

          <div className={hero ? 'ow-aside' : undefined}>
            <InlineStack gap="200" wrap>
              {mine ? (
                <Button url={`/applications/${mine.id}`} variant="primary" size={hero ? 'large' : 'medium'} fullWidth={hero}>
                  Applied · view
                </Button>
              ) : (
                <Button variant="primary" size={hero ? 'large' : 'medium'} fullWidth={hero} onClick={() => navigate(`/jobs/${job.id}/apply`)}>
                  Prepare application
                </Button>
              )}
              {hero ? (
                <Button icon={saved ? StarFilledIcon : StarIcon} size="large" fullWidth pressed={saved} onClick={() => dispatch({ type: 'toggleSave', jobId: job.id })}>
                  {saved ? 'Saved' : 'Save job'}
                </Button>
              ) : (
                <Button url={`/jobs/${job.id}`} size="medium">
                  View job
                </Button>
              )}
            </InlineStack>
          </div>
        </div>
      </BlockStack>
    </article>
  );
}
