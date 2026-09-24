import { BlockStack, Button, Card, InlineGrid, InlineStack, Text } from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { ChoiceChips } from '../../components/ChoiceChips';
import { JobCard } from '../../components/JobCard';
import { StrengthsPicker } from '../../components/StrengthsPicker';
import { JOB_FAMILIES } from '../../lib/access';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/**
 * Path B — "Help me find work I could do." Pick strengths, the job grid
 * filters live. Nothing is collapsed; every matching job is on the page.
 * Uses strengths and interests only — nothing about disability exists here.
 */
export function Discover() {
  useTitle('Find the right work');
  const { state, dispatch } = useStore();
  const profile = state.role === 'candidate' ? state.candidate : null;
  const [localStrengths, setLocalStrengths] = useState<string[]>(profile?.strengths ?? []);
  const [family, setFamily] = useState<string | null>(null);
  const strengths = profile ? profile.strengths : localStrengths;
  const setStrengths = (v: string[]) => (profile ? dispatch({ type: 'updateCandidate', patch: { strengths: v } }) : setLocalStrengths(v));

  const published = useMemo(() => state.jobs.filter((j) => j.status === 'published'), [state.jobs]);
  const mine = new Set(strengths.map((s) => s.toLowerCase()));

  const scored = useMemo(
    () =>
      published
        .map((j) => ({ j, used: j.strengthsUsed.filter((s) => mine.has(s.toLowerCase())) }))
        .filter((x) => (strengths.length === 0 || x.used.length > 0) && (!family || x.j.family === family))
        .sort((a, b) => b.used.length - a.used.length || b.j.postedOn.localeCompare(a.j.postedOn)),
    [published, strengths, family, mine],
  );

  const familiesWithJobs = JOB_FAMILIES.filter((f) => published.some((j) => j.family === f.id && (strengths.length === 0 || j.strengthsUsed.some((s) => mine.has(s.toLowerCase())))));

  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Find the right work
          </Text>
          <Text as="p" variant="bodyLg" tone="subdued">
            No job title or résumé needed. Tap what you are good at and the jobs below change to match.
          </Text>
        </BlockStack>

        <Card>
          <StrengthsPicker value={strengths} onChange={setStrengths} title="What are you good at?" />
        </Card>

        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="baseline" wrap gap="300">
            <Text as="h2" variant="headingXl">
              <span role="status" aria-live="polite">
                {scored.length} job{scored.length === 1 ? '' : 's'}
              </span>
              {strengths.length ? ' that use your strengths' : ' on Openwork'}
            </Text>
            {strengths.length > 0 && (
              <Button variant="plain" onClick={() => setStrengths([])}>
                Clear strengths
              </Button>
            )}
          </InlineStack>
          {familiesWithJobs.length > 1 && (
            <ChoiceChips label="Kind of work" labelHidden size="slim" options={[{ value: '__all', label: 'All kinds of work' }, ...familiesWithJobs.map((f) => ({ value: f.id, label: f.label }))]} value={family ?? '__all'} allowNone={false} onChange={(v) => setFamily(v === '__all' ? null : (v as string))} />
          )}
        </BlockStack>

        {scored.length === 0 ? (
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">
                No job lists these strengths yet
              </Text>
              <Text as="p" tone="subdued">
                That says something about the listings, not about you. Try removing a strength, or browse every job.
              </Text>
              <InlineStack>
                <Button url="/jobs">See every job</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        ) : (
          <InlineGrid columns={{ xs: 1, md: 2, xl: 3 }} gap="400">
            {scored.map(({ j, used }) => (
              <JobCard key={j.id} job={j} strengthsUsed={strengths.length ? used : undefined} />
            ))}
          </InlineGrid>
        )}

        {!profile && (
          <Card>
            <InlineStack align="space-between" blockAlign="center" wrap gap="300">
              <Text as="p">Create an account to keep these strengths, add what you need, and see each job compared with your passport.</Text>
              <Button url="/signup" variant="primary">
                Create account
              </Button>
            </InlineStack>
          </Card>
        )}
      </BlockStack>
    </div>
  );
}
