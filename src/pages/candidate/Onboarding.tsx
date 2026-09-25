import { BlockStack, Button, DropZone, FormLayout, InlineStack, Tag, Text, TextField } from '@shopify/polaris';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccessNeedsForm } from '../../components/AccessNeedsForm';
import { OptionCard, OptionCards } from '../../components/OptionCard';
import { PreferenceControl } from '../../components/PreferenceControl';
import { StrengthsPicker } from '../../components/StrengthsPicker';
import { ACCESS_CATEGORIES, JOB_FAMILIES, type AccessCategoryId } from '../../lib/access';
import { DIMENSION_BY_ID, type DimensionId } from '../../lib/dimensions';
import { EMPLOYMENT_TYPE_LABEL, VISIBILITY_HELP, VISIBILITY_LABEL, WORK_LOCATION_LABEL } from '../../lib/format';
import { matchJob, matchTier } from '../../lib/match';
import type { CandidatePreference, EmploymentType, Visibility } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const TOTAL = 6;
const TITLES = ['Welcome', 'Job goals', 'Experience', 'How I work best', 'Accessibility', 'Privacy'];
const DIMS: DimensionId[] = ['instructions', 'schedulePredictability', 'noise', 'feedbackStyle'];
const MODES = [
  { v: 'review', t: 'Review', h: 'Openwork finds jobs. You review and apply.' },
  { v: 'assist', t: 'Assist', h: 'Openwork finds jobs and prepares the application. You approve before anything is sent.' },
  { v: 'auto', t: 'Auto', h: 'Openwork can prepare and send applications that meet your rules: pay, location, work type, required needs, sharing.' },
] as const;

/**
 * Six steps, reference layout: STEP X OF 6 + progress bar, one question, option
 * cards, Skip / Back / Continue. Everything saves as you go. Ends on
 * "Your matches are ready."
 */
export function Onboarding() {
  useTitle('Set up');
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const p = state.candidate!;
  const patch = (x: Partial<typeof p>) => dispatch({ type: 'updateCandidate', patch: x });
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [roleDraft, setRoleDraft] = useState('');
  const [cats, setCats] = useState<AccessCategoryId[]>(() => ACCESS_CATEGORIES.filter((c) => Object.keys(p.accessNeeds).some((id) => id && state.jobs && true && c.id === (Object.keys(p.accessNeeds).length ? c.id : ''))).map((c) => c.id));
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    top.current?.focus();
    window.scrollTo({ top: 0 });
  }, [i, done]);

  const discover = p.goal === 'explore';
  const setPref = (id: DimensionId, next: CandidatePreference | undefined) => {
    const wp = { ...p.workPreferences };
    if (next) wp[id] = next;
    else delete wp[id];
    patch({ workPreferences: wp });
  };
  const currentVisibility = (Object.values(p.accessNeeds)[0]?.visibility ?? Object.values(p.workPreferences)[0]?.visibility ?? 'matching') as Visibility;
  const setAllVisibility = (visibility: Visibility) =>
    patch({
      workPreferences: Object.fromEntries(Object.entries(p.workPreferences).map(([k, v]) => [k, { ...v!, visibility }])) as typeof p.workPreferences,
      accessNeeds: Object.fromEntries(Object.entries(p.accessNeeds).map(([k, v]) => [k, { ...v, visibility }])),
    });
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const finish = () => {
    patch({ onboardingComplete: true });
    setDone(true);
  };
  const next = () => (i >= TOTAL - 1 ? finish() : setI(i + 1));

  if (done) {
    const strong = state.jobs.filter((j) => j.status === 'published').filter((j) => matchTier(matchJob(p, j, state.employers.find((e) => e.id === j.employerId)!)) !== 'new').length;
    return (
      <div className="ow-container ow-container--narrow">
        <div className="ow-sheet ow-onboard" ref={top} tabIndex={-1}>
          <BlockStack gap="500" inlineAlign="center">
            <span className="ow-done__icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" width="32" height="32"><path fill="#fff" d="M7.5 13.6 4.4 10.5l1.4-1.4 1.7 1.7 6.3-6.3 1.4 1.4z" /></svg>
            </span>
            <Text as="h1" variant="heading2xl" alignment="center">
              Your matches are ready.
            </Text>
            <Text as="p" variant="bodyLg" tone="subdued" alignment="center">
              {strong > 0 ? `${strong} job${strong === 1 ? '' : 's'} already line up with what you told us.` : 'Add more to your profile any time and the matches sharpen.'} Nothing you entered is shared until you apply.
            </Text>
            <InlineStack gap="300">
              <Button url={sp.get('next') ?? '/matches'} variant="primary" size="large">
                View my matches
              </Button>
              <Button url="/passport" size="large">
                View profile
              </Button>
            </InlineStack>
          </BlockStack>
        </div>
      </div>
    );
  }

  return (
    <div className="ow-container ow-container--narrow">
      <div className="ow-sheet ow-onboard" ref={top} tabIndex={-1}>
        <BlockStack gap="600">
          <BlockStack gap="200">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="p" variant="bodyXs" fontWeight="bold" tone="magic">
                STEP {i + 1} OF {TOTAL}
              </Text>
              <Text as="p" variant="bodyXs" tone="subdued">
                {TITLES[i]}
              </Text>
            </InlineStack>
            <div className="ow-progress" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={i + 1} aria-label="Setup progress">
              <div style={{ width: `${((i + 1) / TOTAL) * 100}%` }} />
            </div>
          </BlockStack>

          {i === 0 && (
            <BlockStack gap="500">
              <BlockStack gap="200" inlineAlign="center">
                <Text as="h1" variant="heading2xl" alignment="center">
                  Let’s find work that works for you.
                </Text>
                <Text as="p" tone="subdued" alignment="center">
                  Two ways in. Both end at the same matches.
                </Text>
              </BlockStack>
              <OptionCards>
                <OptionCard title="I know what work I want" help="Search by role, skills or industry." selected={p.goal !== null && p.goal !== 'explore'} onClick={() => patch({ goal: 'know' })} />
                <OptionCard title="Help me discover work" help="Use strengths, interests and work preferences to suggest directions. No résumé needed." selected={p.goal === 'explore'} onClick={() => patch({ goal: 'explore', firstJob: true })} />
              </OptionCards>
            </BlockStack>
          )}

          {i === 1 && !discover && (
            <BlockStack gap="500">
              <BlockStack gap="200" inlineAlign="center">
                <Text as="h1" variant="heading2xl" alignment="center">
                  What are you looking for?
                </Text>
                <Text as="p" tone="subdued" alignment="center">
                  This shapes your matches. Everything can change later.
                </Text>
              </BlockStack>
              <FormLayout>
                <TextField label="Roles you want" value={roleDraft} onChange={setRoleDraft} autoComplete="off" placeholder="Type a title and press Enter" onBlur={() => { const t = roleDraft.trim(); if (t && !p.desiredRoles.includes(t)) patch({ desiredRoles: [...p.desiredRoles, t] }); setRoleDraft(''); }} />
                {p.desiredRoles.length > 0 && (
                  <InlineStack gap="200" wrap>
                    {p.desiredRoles.map((r) => (
                      <Tag key={r} onRemove={() => patch({ desiredRoles: p.desiredRoles.filter((x) => x !== r) })}>
                        {r}
                      </Tag>
                    ))}
                  </InlineStack>
                )}
                <TextField label="Location" value={p.location} onChange={(v) => patch({ location: v })} autoComplete="address-level2" placeholder="City, state — or leave blank for anywhere" />
              </FormLayout>
              <BlockStack gap="200">
                <Text as="h2" variant="headingSm">
                  Where you want to work
                </Text>
                <OptionCards>
                  {Object.entries(WORK_LOCATION_LABEL).map(([v, l]) => (
                    <OptionCard key={v} multiple title={l} selected={(p.workPreferences.workLocation?.value ?? '') === v} onClick={() => setPref('workLocation', p.workPreferences.workLocation?.value === v ? undefined : { value: v, importance: 'preferred', visibility: 'matching' })} />
                  ))}
                </OptionCards>
              </BlockStack>
              <BlockStack gap="200">
                <Text as="h2" variant="headingSm">
                  Employment type
                </Text>
                <OptionCards>
                  {Object.entries(EMPLOYMENT_TYPE_LABEL).map(([v, l]) => (
                    <OptionCard key={v} multiple title={l} selected={p.employmentTypes.includes(v as EmploymentType)} onClick={() => patch({ employmentTypes: toggle(p.employmentTypes, v as EmploymentType) })} />
                  ))}
                </OptionCards>
              </BlockStack>
              <TextField label="Minimum pay per hour (optional)" type="number" prefix="$" value={p.desiredSalaryMin?.toString() ?? ''} onChange={(v) => patch({ desiredSalaryMin: v ? Number(v) : null })} autoComplete="off" helpText="Private to you. Used to rank matches." />
            </BlockStack>
          )}

          {i === 1 && discover && (
            <BlockStack gap="500">
              <BlockStack gap="200" inlineAlign="center">
                <Text as="h1" variant="heading2xl" alignment="center">
                  What are you good at?
                </Text>
                <Text as="p" tone="subdued" alignment="center">
                  Plain words, not job titles. Jobs list the strengths they use.
                </Text>
              </BlockStack>
              <StrengthsPicker value={p.strengths} onChange={(v) => patch({ strengths: v })} labelHidden />
              <BlockStack gap="200">
                <Text as="h2" variant="headingSm">
                  Kinds of work that interest you (optional)
                </Text>
                <OptionCards>
                  {JOB_FAMILIES.map((f) => (
                    <OptionCard key={f.id} multiple title={f.label} help={f.description} selected={p.interestedFamilies.includes(f.id)} onClick={() => patch({ interestedFamilies: toggle(p.interestedFamilies, f.id) })} />
                  ))}
                </OptionCards>
              </BlockStack>
            </BlockStack>
          )}

          {i === 2 && (
            <BlockStack gap="500">
              <BlockStack gap="200" inlineAlign="center">
                <Text as="h1" variant="heading2xl" alignment="center">
                  Tell us what you’ve done.
                </Text>
                <Text as="p" tone="subdued" alignment="center">
                  A résumé if you have one. School, volunteering, projects and training all count if you don’t.
                </Text>
              </BlockStack>
              {p.resumeFileName ? (
                <div className="ow-optcard" aria-pressed="true" style={{ cursor: 'default' }}>
                  <span className="ow-optcard__dot" aria-hidden="true" />
                  <span>
                    <Text as="span" variant="headingSm">
                      {p.resumeFileName}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Saved to your profile. <Button variant="plain" onClick={() => patch({ resumeFileName: null })}>Remove</Button>
                    </Text>
                  </span>
                </div>
              ) : (
                <div className="ow-drop">
                  <DropZone accept=".pdf,.doc,.docx,.txt" type="file" allowMultiple={false} onDrop={(_d, a) => a[0] && patch({ resumeFileName: a[0].name, firstJob: false })}>
                    <DropZone.FileUpload actionTitle="Upload résumé" actionHint="PDF, DOCX or TXT. We use it to fill your profile." />
                  </DropZone>
                </div>
              )}
              <OptionCards>
                <OptionCard title="I don’t have a résumé" help="No problem. Your strengths, school and any volunteering or projects become your profile." selected={p.firstJob && !p.resumeFileName} onClick={() => patch({ firstJob: true, resumeFileName: null })} />
              </OptionCards>
            </BlockStack>
          )}

          {i === 3 && (
            <BlockStack gap="500">
              <BlockStack gap="200" inlineAlign="center">
                <Text as="h1" variant="heading2xl" alignment="center">
                  How do you work best?
                </Text>
                <Text as="p" tone="subdued" alignment="center">
                  Not a test. We match you with employers whose work runs this way. Mark each as required, preferred or doesn’t matter.
                </Text>
              </BlockStack>
              {DIMS.map((id) => (
                <PreferenceControl key={id} dimension={DIMENSION_BY_ID[id]} value={p.workPreferences[id]} onChange={(v) => setPref(id, v)} showVisibility={false} />
              ))}
            </BlockStack>
          )}

          {i === 4 && (
            <BlockStack gap="500">
              <BlockStack gap="200" inlineAlign="center">
                <Text as="h1" variant="heading2xl" alignment="center">
                  Anything you need to make work more accessible?
                </Text>
                <Text as="p" tone="subdued" alignment="center">
                  Optional. You control what is used for matching and what employers can see. Pick areas, then what helps.
                </Text>
              </BlockStack>
              <OptionCards>
                {ACCESS_CATEGORIES.map((c) => (
                  <OptionCard key={c.id} multiple title={c.label} help={c.intro} selected={cats.includes(c.id)} onClick={() => setCats(toggle(cats, c.id))} />
                ))}
              </OptionCards>
              {cats.length > 0 && <AccessNeedsForm value={p.accessNeeds} onChange={(v) => patch({ accessNeeds: v })} showVisibility={false} only={cats} hero />}
            </BlockStack>
          )}

          {i === 5 && (
            <BlockStack gap="500">
              <BlockStack gap="200" inlineAlign="center">
                <Text as="h1" variant="heading2xl" alignment="center">
                  Who sees what, and how much Openwork does.
                </Text>
                <Text as="p" tone="subdued" alignment="center">
                  Sensible defaults. Change either any time.
                </Text>
              </BlockStack>
              <BlockStack gap="200">
                <Text as="h2" variant="headingSm">
                  Your work preferences and access needs are
                </Text>
                <OptionCards>
                  {(Object.keys(VISIBILITY_LABEL) as Visibility[]).map((k) => (
                    <OptionCard key={k} title={VISIBILITY_LABEL[k]} help={VISIBILITY_HELP[k]} selected={currentVisibility === k} onClick={() => setAllVisibility(k)} />
                  ))}
                </OptionCards>
              </BlockStack>
              <BlockStack gap="200">
                <Text as="h2" variant="headingSm">
                  How Openwork helps
                </Text>
                <OptionCards>
                  {MODES.map((m) => (
                    <OptionCard key={m.v} title={m.t} help={m.h} selected={p.assistMode === m.v} onClick={() => patch({ assistMode: m.v, plan: m.v === 'auto' ? 'pro' : m.v === 'assist' ? 'plus' : 'free' })} />
                  ))}
                </OptionCards>
              </BlockStack>
            </BlockStack>
          )}

          <div className="ow-onboard__foot">
            <Button variant="plain" onClick={next}>
              Skip this step
            </Button>
            <InlineStack gap="200">
              {i > 0 && (
                <Button size="large" onClick={() => setI(i - 1)}>
                  Back
                </Button>
              )}
              <Button variant="primary" size="large" onClick={next}>
                {i >= TOTAL - 1 ? 'See my matches' : 'Continue'}
              </Button>
            </InlineStack>
          </div>
        </BlockStack>
      </div>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button variant="plain" onClick={() => navigate('/matches')}>
          Save and continue later
        </Button>
      </div>
    </div>
  );
}
