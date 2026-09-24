import { Banner, BlockStack, Button, Checkbox, InlineStack, Tag, Text, TextField } from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccessNeedsForm } from '../../components/AccessNeedsForm';
import { ChoiceChips } from '../../components/ChoiceChips';
import { PreferenceControl } from '../../components/PreferenceControl';
import { Stepper } from '../../components/Stepper';
import { StrengthsPicker } from '../../components/StrengthsPicker';
import { ACCESS_CATEGORIES, ACCESS_FEATURE_BY_ID, JOB_FAMILIES, type AccessCategoryId } from '../../lib/access';
import { DIMENSION_BY_ID, type DimensionId } from '../../lib/dimensions';
import { VISIBILITY_HELP, VISIBILITY_LABEL } from '../../lib/format';
import type { CandidatePreference, Visibility } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const GOALS = [
  { value: 'first-job', label: 'My first regular job' },
  { value: 'better-fit', label: 'A job that fits me better' },
  { value: 'return', label: 'Back to work after time away' },
  { value: 'explore', label: 'Help me discover what I could do' },
];
const DIMS: DimensionId[] = ['instructions', 'schedulePredictability', 'noise', 'taskStructure', 'workLocation'];

type Step = { kind: 'goal' } | { kind: 'interests' } | { kind: 'strengths' } | { kind: 'dim'; id: DimensionId } | { kind: 'needCats' } | { kind: 'needs'; cat: AccessCategoryId } | { kind: 'privacy' };

/**
 * One question per screen. The list of screens is built from the answers:
 * pick two access categories and you get two screens, pick none and you get
 * none. Everything saves as you go; "Do this later" is on every screen.
 */
export function Onboarding() {
  useTitle('Let’s find work that works for you');
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const p = state.candidate!;
  const patch = (x: Partial<typeof p>) => dispatch({ type: 'updateCandidate', patch: x });
  const [i, setI] = useState(0);
  const [cats, setCats] = useState<AccessCategoryId[]>(() => ACCESS_CATEGORIES.filter((c) => Object.keys(p.accessNeeds).some((id) => ACCESS_FEATURE_BY_ID[id]?.category === c.id)).map((c) => c.id));
  const [roleDraft, setRoleDraft] = useState('');

  const steps = useMemo<Step[]>(() => [{ kind: 'goal' }, { kind: 'interests' }, { kind: 'strengths' }, ...DIMS.map((id) => ({ kind: 'dim', id }) as Step), { kind: 'needCats' }, ...cats.map((cat) => ({ kind: 'needs', cat }) as Step), { kind: 'privacy' }], [cats]);
  const step = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;

  const finish = (dest?: string) => {
    patch({ onboardingComplete: true });
    navigate(dest ?? sp.get('next') ?? (p.goal === 'explore' ? '/discover' : '/jobs'));
  };
  const setPref = (id: DimensionId, next: CandidatePreference | undefined) => {
    const wp = { ...p.workPreferences };
    if (next) wp[id] = next;
    else delete wp[id];
    patch({ workPreferences: wp });
  };
  const setAllVisibility = (visibility: Visibility) =>
    patch({
      workPreferences: Object.fromEntries(Object.entries(p.workPreferences).map(([k, v]) => [k, { ...v!, visibility }])) as typeof p.workPreferences,
      accessNeeds: Object.fromEntries(Object.entries(p.accessNeeds).map(([k, v]) => [k, { ...v, visibility }])),
    });
  const currentVisibility = (Object.values(p.accessNeeds)[0]?.visibility ?? Object.values(p.workPreferences)[0]?.visibility ?? 'matching') as Visibility;

  const label = step.kind === 'dim' ? DIMENSION_BY_ID[step.id].label : step.kind === 'needs' ? ACCESS_CATEGORIES.find((c) => c.id === step.cat)!.label : { goal: 'What you want', interests: 'Kinds of work', strengths: 'Strengths', needCats: 'Access', privacy: 'Privacy' }[step.kind];

  return (
    <Stepper title="Let’s find work that works for you" step={i} total={steps.length} stepLabel={label} onBack={i > 0 ? () => setI(i - 1) : undefined} onNext={() => (last ? finish() : setI(i + 1))} onSkip={last ? undefined : () => setI(i + 1)} nextLabel={last ? (p.goal === 'explore' ? 'Show me kinds of work' : 'Show me jobs that work for me') : 'Continue'} onLater={last ? undefined : () => finish()}>
      {step.kind === 'goal' && (
        <BlockStack gap="500">
          <Text as="h1" variant="headingXl">
            What are you looking for?
          </Text>
          <ChoiceChips label="What are you looking for?" labelHidden size="large" options={GOALS} value={p.goal} onChange={(v) => patch({ goal: v as string | null, firstJob: v === 'first-job' ? true : p.firstJob })} />
          <Checkbox label="I don’t have much traditional work history yet" helpText="Changes the words we use, not what you can apply for. School, volunteering and projects all count." checked={p.firstJob} onChange={(v) => patch({ firstJob: v })} />
          <Text as="p" variant="bodySm" tone="subdued">
            Every question is optional. Nothing here asks about a diagnosis — there is no field for one anywhere.
          </Text>
        </BlockStack>
      )}

      {step.kind === 'interests' && (
        <BlockStack gap="500">
          <Text as="h1" variant="headingXl">
            What kinds of work interest you?
          </Text>
          <ChoiceChips label="Kinds of work" labelHidden multiple size="large" options={JOB_FAMILIES.map((f) => ({ value: f.id, label: f.label, helpText: f.description }))} value={p.interestedFamilies} onChange={(v) => patch({ interestedFamilies: v as string[] })} helpText="Pick any. Not sure? Skip — your strengths are enough to start." />
          <InlineStack gap="200" blockAlign="end" wrap>
            <div style={{ flex: '1 1 240px' }}>
              <TextField label="Job titles, if you know them (optional)" value={roleDraft} onChange={setRoleDraft} autoComplete="off" onBlur={() => { const t = roleDraft.trim(); if (t && !p.desiredRoles.includes(t)) patch({ desiredRoles: [...p.desiredRoles, t] }); setRoleDraft(''); }} />
            </div>
            {p.desiredRoles.map((r) => (
              <Tag key={r} onRemove={() => patch({ desiredRoles: p.desiredRoles.filter((x) => x !== r) })}>
                {r}
              </Tag>
            ))}
          </InlineStack>
        </BlockStack>
      )}

      {step.kind === 'strengths' && (
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text as="h1" variant="headingXl">
              What are you good at?
            </Text>
            <Text as="p" tone="subdued">
              Plain words, not job titles. Jobs list the strengths they use, so this is how we find work you could do.
            </Text>
          </BlockStack>
          <StrengthsPicker value={p.strengths} onChange={(v) => patch({ strengths: v })} labelHidden />
        </BlockStack>
      )}

      {step.kind === 'dim' && (
        <BlockStack gap="300">
          <PreferenceControl dimension={DIMENSION_BY_ID[step.id]} value={p.workPreferences[step.id]} onChange={(v) => setPref(step.id, v)} showVisibility={false} hero />
          <Text as="p" variant="bodySm" tone="subdued">
            You never have to say why. Six more questions like this live on your passport for later.
          </Text>
        </BlockStack>
      )}

      {step.kind === 'needCats' && (
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text as="h1" variant="headingXl">
              What would make work more accessible for you?
            </Text>
            <Text as="p">
              Pick any areas that apply — or none. You only share what you are comfortable sharing; it stays private and improves your matches unless you decide otherwise.
            </Text>
          </BlockStack>
          <ChoiceChips label="Areas" labelHidden multiple size="large" options={ACCESS_CATEGORIES.map((c) => ({ value: c.id, label: c.label, helpText: c.intro }))} value={cats} onChange={(v) => setCats(v as AccessCategoryId[])} helpText="One short screen per area you pick." />
        </BlockStack>
      )}

      {step.kind === 'needs' && (
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text as="h1" variant="headingXl">
              {ACCESS_CATEGORIES.find((c) => c.id === step.cat)!.label}: what helps?
            </Text>
            <Text as="p" tone="subdued">
              Tap anything that applies. You can mark how much each matters, or leave the defaults.
            </Text>
          </BlockStack>
          <AccessNeedsForm value={p.accessNeeds} onChange={(v) => patch({ accessNeeds: v })} showVisibility={false} only={[step.cat]} hero />
        </BlockStack>
      )}

      {step.kind === 'privacy' && (
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text as="h1" variant="headingXl">
              Who can see how you work and what you need?
            </Text>
            <Text as="p" tone="subdued">
              One setting for everything for now. Change it per answer on your passport later.
            </Text>
          </BlockStack>
          <ChoiceChips label="Your answers are" size="large" allowNone={false} options={(Object.keys(VISIBILITY_LABEL) as Visibility[]).map((k) => ({ value: k, label: VISIBILITY_LABEL[k] }))} value={currentVisibility} onChange={(v) => setAllVisibility(v as Visibility)} helpText={VISIBILITY_HELP[currentVisibility]} />
          <Banner tone="success" title="Nothing is sent automatically">
            <p>Even “Shared with employer” answers go only when you apply, and only after you confirm the exact list.</p>
          </Banner>
          <InlineStack>
            <Button variant="plain" url="/passport">
              Review my whole passport first
            </Button>
          </InlineStack>
        </BlockStack>
      )}
    </Stepper>
  );
}
