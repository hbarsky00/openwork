import { Badge, BlockStack, Button, Card, Collapsible, InlineStack, Text } from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { JobCard } from '../../components/JobCard';
import { StrengthsPicker } from '../../components/StrengthsPicker';
import { JOB_FAMILIES } from '../../lib/access';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/**
 * Path B — "Help me find work I could do." Strengths in, kinds of work out.
 * Works signed out. Uses strengths and interests only; nothing about
 * disability exists here to be used.
 */
export function Discover() {
  useTitle('Find the right work');
  const { state, dispatch } = useStore();
  const profile = state.role === 'candidate' ? state.candidate : null;
  const [localStrengths, setLocalStrengths] = useState<string[]>(profile?.strengths ?? []);
  const [open, setOpen] = useState<string | null>(null);
  const strengths = profile ? profile.strengths : localStrengths;
  const setStrengths = (v: string[]) => (profile ? dispatch({ type: 'updateCandidate', patch: { strengths: v } }) : setLocalStrengths(v));

  const families = useMemo(() => {
    const mine = new Set(strengths.map((s) => s.toLowerCase()));
    return JOB_FAMILIES.map((f) => {
      const jobs = state.jobs.filter((j) => j.status === 'published' && j.family === f.id);
      const used = new Set<string>();
      for (const j of jobs) for (const s of j.strengthsUsed) if (mine.has(s.toLowerCase())) used.add(s);
      return { f, jobs, matched: [...used], interested: profile?.interestedFamilies.includes(f.id) ?? false };
    })
      .filter((x) => x.jobs.length > 0)
      .sort((a, b) => b.matched.length + (b.interested ? 2 : 0) - (a.matched.length + (a.interested ? 2 : 0)));
  }, [strengths, state.jobs, profile]);

  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Find the right work
          </Text>
          <Text as="p" variant="bodyLg" tone="subdued">
            No job title or résumé needed. Tick what you are good at, and we show kinds of work that use those strengths — with the real jobs behind them.
          </Text>
        </BlockStack>

        <Card>
          <StrengthsPicker value={strengths} onChange={setStrengths} />
        </Card>

        <BlockStack gap="400">
          <Text as="h2" variant="headingXl">
            Kinds of work {strengths.length ? 'that use your strengths' : 'on Openwork'}
          </Text>
          {families.map(({ f, jobs, matched, interested }) => {
            const isOpen = open === f.id;
            return (
              <Card key={f.id}>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="start" wrap gap="300">
                    <BlockStack gap="100">
                      <InlineStack gap="200" blockAlign="center" wrap>
                        <Text as="h3" variant="headingLg">
                          {f.label}
                        </Text>
                        {interested && <Badge tone="info">You said this interests you</Badge>}
                      </InlineStack>
                      <Text as="p" tone="subdued">
                        {f.description}
                      </Text>
                      {matched.length > 0 ? (
                        <Text as="p">
                          Uses {matched.length} of your strengths: <strong>{matched.join(', ')}</strong>
                        </Text>
                      ) : strengths.length > 0 ? (
                        <Text as="p" variant="bodySm" tone="subdued">
                          None of your ticked strengths yet — that does not mean you could not do it.
                        </Text>
                      ) : null}
                    </BlockStack>
                    <Button onClick={() => setOpen(isOpen ? null : f.id)} ariaExpanded={isOpen} ariaControls={`fam-${f.id}`} disclosure={isOpen ? 'up' : 'down'}>
                      {`${jobs.length} job${jobs.length === 1 ? '' : 's'}`}
                    </Button>
                  </InlineStack>
                  <Collapsible id={`fam-${f.id}`} open={isOpen} transition={false}>
                    <BlockStack gap="300">
                      {jobs.map((j) => (
                        <JobCard key={j.id} job={j} />
                      ))}
                    </BlockStack>
                  </Collapsible>
                </BlockStack>
              </Card>
            );
          })}
        </BlockStack>

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
