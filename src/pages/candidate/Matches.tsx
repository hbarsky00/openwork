import { Banner, BlockStack, Button, InlineGrid, InlineStack, Select, Text } from '@shopify/polaris';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MatchCard } from '../../components/MatchCard';
import { matchJob, matchTier, rankScore } from '../../lib/match';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/**
 * Home for signed-in candidates. Not a dashboard: a greeting, one Top Match
 * card, then the feed. Sort and a link to preferences; nothing else.
 */
export function Matches() {
  useTitle('Matches');
  const { state, dispatch } = useStore();
  const p = state.candidate!;
  useEffect(() => {
    dispatch({ type: 'runAutoApply' });
  }, [dispatch]);
  const todayStr = new Date().toISOString().slice(0, 10);
  const sentToday = state.applications.filter((a) => a.candidateId === p.id && a.sentBy === 'openwork' && a.status !== 'prepared' && a.submittedOn === todayStr);
  const prepared = state.applications.filter((a) => a.candidateId === p.id && a.status === 'prepared');
  const [sort, setSort] = useState<'best' | 'newest' | 'pay'>('best');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const hasInputs = Object.keys(p.accessNeeds).length > 0 || Object.keys(p.workPreferences).length > 0 || p.strengths.length > 0 || p.skills.length > 0;

  const ranked = useMemo(() => {
    const applied = new Set(state.applications.filter((a) => a.candidateId === p.id && a.status !== 'prepared').map((a) => a.jobId));
    const rows = state.jobs
      .filter((j) => j.status === 'published' && !applied.has(j.id))
      .map((j) => {
        const e = state.employers.find((x) => x.id === j.employerId)!;
        const r = matchJob(p, j, e);
        return { j, r, score: rankScore(r), tier: matchTier(r), hourly: j.salaryUnit === 'hour' ? j.salaryMax : j.salaryMax / 2080 };
      });
    if (sort === 'newest') rows.sort((a, b) => b.j.postedOn.localeCompare(a.j.postedOn));
    else if (sort === 'pay') rows.sort((a, b) => b.hourly - a.hourly);
    else rows.sort((a, b) => b.score - a.score || b.j.postedOn.localeCompare(a.j.postedOn));
    return rows;
  }, [state.jobs, state.employers, state.applications, p, sort]);

  const strong = ranked.filter((x) => x.tier === 'strong' || x.tier === 'good').length;
  const [top, ...rest] = ranked;

  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <div className="ow-pagehead">
          <BlockStack gap="100">
            <Text as="p" tone="subdued">
              {greeting}, {p.name.split(' ')[0]}
            </Text>
            <Text as="h1" variant="heading2xl">
              {hasInputs ? `${strong} strong match${strong === 1 ? '' : 'es'} for you` : `${ranked.length} jobs to start from`}
            </Text>
            <Text as="p" tone="subdued">
              {hasInputs ? (
                <>
                  Based on your profile, preferences and how you work best. <Link to="/passport/assist">How Openwork helps</Link>
                </>
              ) : (
                'Tell us what you want and how you work, and these become real matches.'
              )}
            </Text>
          </BlockStack>
          {!hasInputs && (
            <Button url="/onboarding" variant="primary">
              Set up matching
            </Button>
          )}
        </div>

        {(sentToday.length > 0 || prepared.length > 0) && (
          <Banner tone="info" title={sentToday.length ? `Openwork sent ${sentToday.length} application${sentToday.length === 1 ? '' : 's'} for you today` : `${prepared.length} application${prepared.length === 1 ? '' : 's'} ready for your approval`}>
            <p>
              {sentToday.length ? sentToday.map((a) => state.jobs.find((j) => j.id === a.jobId)?.title).filter(Boolean).join(', ') + '. ' : ''}
              {prepared.length && sentToday.length ? `${prepared.length} more ${prepared.length === 1 ? 'is' : 'are'} waiting for your approval. ` : ''}
              <Button url="/applications" variant="plain">
                {prepared.length ? 'Review and send' : 'See applications'}
              </Button>
              {' · '}
              <Button url="/passport/assist" variant="plain">
                Change rules
              </Button>
            </p>
          </Banner>
        )}

        {p.assistMode === 'review' && (
          <div className="ow-why">
            <InlineStack align="space-between" blockAlign="center" wrap gap="300">
              <Text as="p" variant="bodySm">
                <strong>Let Openwork apply for you.</strong> Plus prepares applications for strong matches; Pro sends them within your rules.
              </Text>
              <Button url="/passport/assist" size="medium">
                See plans
              </Button>
            </InlineStack>
          </div>
        )}

        {top && <MatchCard job={top.j} hero />}

        {rest.length > 0 && (
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center" wrap gap="300">
              <Text as="h2" variant="headingLg">
                More recommended roles
              </Text>
              <Select label="Sort" labelInline options={[{ label: 'Best match', value: 'best' }, { label: 'Newest', value: 'newest' }, { label: 'Highest pay', value: 'pay' }]} value={sort} onChange={(v) => setSort(v as typeof sort)} />
            </InlineStack>
            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
              {rest.map((x) => (
                <MatchCard key={x.j.id} job={x.j} />
              ))}
            </InlineGrid>
          </BlockStack>
        )}

        {ranked.length === 0 && (
          <div className="ow-sheet">
            <Text as="p">You have applied to every open job that fits. Check Applications for updates, or search for more.</Text>
          </div>
        )}
      </BlockStack>
    </div>
  );
}
