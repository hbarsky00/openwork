import { Banner, BlockStack, Button, Card, InlineGrid, InlineStack, Text, TextField } from '@shopify/polaris';
import { ChoiceChips } from '../../components/ChoiceChips';
import { PreferenceControl } from '../../components/PreferenceControl';
import { HIRING_OPTIONS, type HiringOptionId } from '../../lib/access';
import { DIMENSIONS, type DimensionId } from '../../lib/dimensions';
import type { CandidatePreference } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

export function WorkPreferences() {
  useTitle('How I work best');
  const { state, dispatch } = useStore();
  const p = state.candidate!;
  const patch = (x: Partial<typeof p>) => dispatch({ type: 'updateCandidate', patch: x });
  const answered = DIMENSIONS.filter((d) => p.workPreferences[d.id]).length;
  const setPref = (id: DimensionId, next: CandidatePreference | undefined) => {
    const wp = { ...p.workPreferences };
    if (next) wp[id] = next;
    else delete wp[id];
    patch({ workPreferences: wp });
  };

  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Button url="/passport" variant="plain">
            ← My passport
          </Button>
          <Text as="h1" variant="heading2xl">
            How I work best
          </Text>
          <Text as="p" tone="subdued">
            {answered} of {DIMENSIONS.length} answered. Tap an answer; each saves immediately. You never have to explain why.
          </Text>
        </BlockStack>

        <Banner tone="info" title="Who sees this">
          <p>Every answer starts as “Used for matching” — employers never see it. Change any to “Shared with employer” to include it when you apply; you still confirm the exact list before anything is sent.</p>
        </Banner>

        <InlineGrid columns={{ xs: 1, lg: 2 }} gap="400">
          {DIMENSIONS.map((d) => (
            <PreferenceControl key={d.id} dimension={d} value={p.workPreferences[d.id]} onChange={(v) => setPref(d.id, v)} />
          ))}
        </InlineGrid>

        <InlineGrid columns={{ xs: 1, lg: 2 }} gap="400">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                How I want to be hired
              </Text>
              <ChoiceChips label="Ways to show your skills and interview accessibility" multiple options={HIRING_OPTIONS.map((h) => ({ value: h.id, label: h.label, helpText: h.description }))} value={p.hiringPreferences} onChange={(v) => patch({ hiringPreferences: v as HiringOptionId[] })} helpText="Jobs that offer these are pointed out, and you can request them when you apply." />
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Support I may request
              </Text>
              <TextField label="Anything practical that would help during hiring" value={p.supportNotes} onChange={(v) => patch({ supportNotes: v })} multiline={4} autoComplete="off" placeholder="e.g. I would like the interview questions at least two days ahead." helpText="Private to you unless you send it with a specific application." />
            </BlockStack>
          </Card>
        </InlineGrid>

        <InlineStack>
          <Button url="/jobs" variant="primary">
            Done — see jobs that work for me
          </Button>
        </InlineStack>
      </BlockStack>
    </div>
  );
}
