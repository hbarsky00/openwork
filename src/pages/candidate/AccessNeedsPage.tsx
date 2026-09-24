import { Banner, BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { AccessNeedsForm } from '../../components/AccessNeedsForm';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

export function AccessNeedsPage() {
  useTitle('What makes work accessible for me');
  const { state, dispatch } = useStore();
  const p = state.candidate!;
  const count = Object.keys(p.accessNeeds).length;
  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Button url="/passport" variant="plain">
            ← My passport
          </Button>
          <Text as="h1" variant="heading2xl">
            What would make work more accessible for you?
          </Text>
          <Text as="p" tone="subdued">
            {count} selected. Open an area, tap what applies. Nine areas of need — not diagnoses. Saves as you go.
          </Text>
        </BlockStack>
        <Banner tone="info" title="Need, not condition">
          <p>We ask for what would help — “captions”, “step-free entrance”, “written instructions” — never why. Employers see a need only if you choose to share it on an application.</p>
        </Banner>
        <AccessNeedsForm value={p.accessNeeds} onChange={(v) => dispatch({ type: 'updateCandidate', patch: { accessNeeds: v } })} />
        <InlineStack gap="200">
          <Button url="/jobs" variant="primary">
            See jobs that work for me
          </Button>
          <Button url="/passport">Back to my passport</Button>
        </InlineStack>
      </BlockStack>
    </div>
  );
}
