import { Badge, Banner, BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { Link, useParams } from 'react-router-dom';
import { discoverableFor, publicCandidateFacts } from '../../lib/employer';
import { salary } from '../../lib/format';
import { MATCH_TIER_LABEL } from '../../lib/match';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';
import { NotFound } from '../public/NotFound';

/**
 * Candidates who turned discovery on, ranked against one job. The employer
 * sees qualifications and nothing else: no access needs, no work preferences,
 * no notes, no contact details. Those arrive only with an application the
 * candidate has confirmed.
 */
export function JobMatches() {
  const { id } = useParams();
  const { state } = useStore();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  const job = state.jobs.find((j) => j.id === id && j.employerId === employer.id);
  useTitle(job ? `Candidate matches · ${job.title}` : 'Candidate matches');
  if (!job) return <NotFound message="That job is not in your account." />;
  const rows = discoverableFor(state, job, employer);
  const strong = rows.filter((r) => r.tier === 'strong').length;

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
            Candidate matches
          </Text>
          <Text as="p" tone="subdued">
            {job.title} · {salary(job)} · {job.location}
          </Text>
        </BlockStack>

        <div className="ow-readiness" role="status" aria-label="Match summary">
          <span className="ow-readiness__item ow-readiness__item--info">
            <span>
              <strong>{rows.length}</strong> potential candidate{rows.length === 1 ? '' : 's'}
            </span>
          </span>
          <span className="ow-readiness__item ow-readiness__item--ok">
            <span>
              <strong>{strong}</strong> strong match{strong === 1 ? '' : 'es'}
            </span>
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="ow-sheet">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                No one has opted in for this job yet
              </Text>
              <Text as="p" tone="subdued">
                Candidates choose whether employers can find them before they apply. The more this job says about how the work actually happens, the more people it can be matched against.
              </Text>
              <InlineStack gap="200">
                <Button url={`/employer/jobs/${job.id}/enrich`} variant="primary">
                  Add information to this job
                </Button>
              </InlineStack>
            </BlockStack>
          </div>
        ) : (
          <BlockStack gap="300">
            {rows.map(({ candidate, tier }) => {
              const f = publicCandidateFacts(candidate);
              return (
                <div key={candidate.id} className="ow-sheet ow-aside__card">
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center" wrap>
                      <Text as="h2" variant="headingMd">
                        {f.headline || 'Candidate'}
                      </Text>
                      <span className={`ow-matchlabel ow-matchlabel--${tier}`}>{MATCH_TIER_LABEL[tier]}</span>
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {[f.location, f.years ? `${f.years} years of experience` : null].filter(Boolean).join(' · ')}
                    </Text>
                    {f.skills.length > 0 && (
                      <Text as="p" variant="bodySm">
                        <strong>Skills:</strong> {f.skills.slice(0, 8).join(', ')}
                      </Text>
                    )}
                    {f.strengths.length > 0 && (
                      <Text as="p" variant="bodySm">
                        <strong>Strengths:</strong> {f.strengths.slice(0, 6).join(', ')}
                      </Text>
                    )}
                    <InlineStack gap="200" blockAlign="center" wrap>
                      <Badge>Not applied yet</Badge>
                      <Text as="span" variant="bodySm" tone="subdued">
                        Name and contact details arrive if they apply.
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </div>
              );
            })}
          </BlockStack>
        )}

        <Banner tone="info" title="What you can and cannot see">
          <p>Openwork ranks candidates using their skills, experience, role and location preferences, and the work preferences and accessibility alignment they agreed could be used for matching. You see qualifications only. Access needs, private answers and anything marked matching-only stay with the candidate unless they share them on an application.</p>
        </Banner>
      </BlockStack>
    </div>
  );
}
