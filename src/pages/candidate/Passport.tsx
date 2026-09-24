import { Badge, Banner, BlockStack, Button, Card, FormLayout, InlineGrid, InlineStack, Select, Tag, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChoiceChips } from '../../components/ChoiceChips';
import { StrengthsPicker } from '../../components/StrengthsPicker';
import { ACCESS_CATEGORIES, ACCESS_FEATURE_BY_ID, HIRING_OPTION_BY_ID, featuresIn } from '../../lib/access';
import { DIMENSIONS, optionOf } from '../../lib/dimensions';
import { EMPLOYMENT_TYPE_LABEL, IMPORTANCE_LABEL, VISIBILITY_LABEL } from '../../lib/format';
import type { EmploymentType, Experience } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const KIND_LABEL: Record<Experience['kind'], string> = { paid: 'Paid work', volunteer: 'Volunteering', school: 'School or program', project: 'Project' };

/**
 * My Work Accessibility Passport. Not a medical record: strengths, skills,
 * how I work, what I need, how I want to be hired, who may see what. Owned and
 * controlled by the candidate. This is what an application sends — after the
 * sharing review.
 */
export function Passport() {
  useTitle('My passport');
  const { state, dispatch } = useStore();
  const p = state.candidate!;
  const patch = (x: Partial<typeof p>) => dispatch({ type: 'updateCandidate', patch: x });
  const [skillDraft, setSkillDraft] = useState('');
  const [newExp, setNewExp] = useState<Experience | null>(null);
  const [editBasics, setEditBasics] = useState(false);

  const needs = Object.entries(p.accessNeeds);
  const shared = needs.filter(([, n]) => n.visibility === 'shared').length + Object.values(p.workPreferences).filter((w) => w.visibility === 'shared').length;
  const answeredDims = DIMENSIONS.filter((d) => p.workPreferences[d.id]);

  const addSkill = () => {
    const v = skillDraft.trim();
    if (v && !p.skills.includes(v)) patch({ skills: [...p.skills, v] });
    setSkillDraft('');
  };

  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <InlineStack align="space-between" blockAlign="start" wrap gap="300">
          <BlockStack gap="100">
            <Text as="h1" variant="heading2xl">
              My Work Accessibility Passport
            </Text>
            <Text as="p" tone="subdued">
              How you work best and what you need — in your words, under your control. Not a medical record. Employers see only what you choose, and only when you apply.
            </Text>
          </BlockStack>
          <InlineStack gap="200">
            <Button url="/onboarding" variant="primary">
              Answer a few quick questions
            </Button>
            <Button url="/passport/sharing">Sharing controls</Button>
          </InlineStack>
        </InlineStack>

        <Banner tone="info">
          <p>
            {shared === 0 ? 'Nothing on your passport is marked as shareable yet. Everything is private or used only for matching.' : `${shared} item${shared === 1 ? ' is' : 's are'} marked “OK to share with employer”. Even those are sent only after you confirm on an application.`}{' '}
            <Link to="/passport/sharing">Review sharing</Link>.
          </p>
        </Banner>

        <InlineGrid columns={{ xs: 1, lg: ['twoThirds', 'oneThird'] }} gap="500">
          <BlockStack gap="500">
            {/* Basics */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">
                    About me
                  </Text>
                  <Button variant="plain" onClick={() => setEditBasics((e) => !e)}>
                    {editBasics ? 'Done' : 'Edit'}
                  </Button>
                </InlineStack>
                {editBasics ? (
                  <FormLayout>
                    <TextField label="Headline" value={p.headline} onChange={(v) => patch({ headline: v })} autoComplete="off" placeholder="e.g. Reliable, organized and good with my hands" helpText="One line. Does not have to be a job title." />
                    <TextField label="Location" value={p.location} onChange={(v) => patch({ location: v })} autoComplete="address-level2" />
                    <TextField label="About you" value={p.about} onChange={(v) => patch({ about: v })} multiline={4} autoComplete="off" helpText="What you are good at and what you are looking for. Plain words are fine." />
                    <TextField label="Availability" value={p.availability} onChange={(v) => patch({ availability: v })} autoComplete="off" placeholder="e.g. Immediately, weekday mornings" />
                    <ChoiceChips label="Kind of work" multiple size="slim" options={Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))} value={p.employmentTypes} onChange={(v) => patch({ employmentTypes: v as EmploymentType[] })} />
                    <TextField label="Minimum pay you would consider (per hour, optional)" type="number" value={p.desiredSalaryMin?.toString() ?? ''} onChange={(v) => patch({ desiredSalaryMin: v ? Number(v) : null })} autoComplete="off" prefix="$" helpText="Private to you." />
                  </FormLayout>
                ) : (
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyLg">
                      {p.headline || 'No headline yet.'}
                    </Text>
                    <Text as="p" tone="subdued">
                      {[p.location, p.availability, p.employmentTypes.map((t) => EMPLOYMENT_TYPE_LABEL[t]).join(', ')].filter(Boolean).join(' · ') || 'Add your location and availability.'}
                    </Text>
                    {p.about && <Text as="p">{p.about}</Text>}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>

            {/* Strengths */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  My strengths
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Jobs list the strengths they use. Yours are matched against them.
                </Text>
                <StrengthsPicker value={p.strengths} onChange={(v) => patch({ strengths: v })} title="Tick anything that is true for you" />
              </BlockStack>
            </Card>

            {/* Skills */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  My skills and tools
                </Text>
                <InlineStack gap="200" blockAlign="end">
                  <div style={{ flex: 1 }}>
                    <TextField label="Add a skill or tool" value={skillDraft} onChange={setSkillDraft} autoComplete="off" onBlur={addSkill} />
                  </div>
                  <Button onClick={addSkill}>Add</Button>
                </InlineStack>
                <InlineStack gap="200" wrap>
                  {p.skills.map((s) => (
                    <Tag key={s} onRemove={() => patch({ skills: p.skills.filter((x) => x !== s) })}>
                      {s}
                    </Tag>
                  ))}
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Experience & learning */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">
                    Experience and learning
                  </Text>
                  {!newExp && <Button onClick={() => setNewExp({ id: `e-${Date.now()}`, kind: p.firstJob ? 'school' : 'paid', title: '', organization: '', startYear: new Date().getFullYear(), endYear: null, summary: '' })}>Add</Button>}
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  {p.firstJob ? 'A first job does not need a work history. School placements, programs, volunteering and things you have made all count here.' : 'Paid work, volunteering, placements and projects all count.'}
                </Text>
                {newExp && (
                  <Card background="bg-surface-secondary">
                    <FormLayout>
                      <Select label="What kind" options={(Object.keys(KIND_LABEL) as Experience['kind'][]).map((k) => ({ label: KIND_LABEL[k], value: k }))} value={newExp.kind} onChange={(v) => setNewExp({ ...newExp, kind: v as Experience['kind'] })} />
                      <TextField label="What you did or your role" value={newExp.title} onChange={(v) => setNewExp({ ...newExp, title: v })} autoComplete="off" />
                      <TextField label="Where" value={newExp.organization} onChange={(v) => setNewExp({ ...newExp, organization: v })} autoComplete="organization" />
                      <FormLayout.Group>
                        <TextField label="Start year" type="number" value={String(newExp.startYear)} onChange={(v) => setNewExp({ ...newExp, startYear: Number(v) })} autoComplete="off" />
                        <TextField label="End year (blank if current)" type="number" value={newExp.endYear?.toString() ?? ''} onChange={(v) => setNewExp({ ...newExp, endYear: v ? Number(v) : null })} autoComplete="off" />
                      </FormLayout.Group>
                      <TextField label="What you did, in a sentence or two" value={newExp.summary} onChange={(v) => setNewExp({ ...newExp, summary: v })} multiline={2} autoComplete="off" />
                      <InlineStack gap="200">
                        <Button variant="primary" disabled={!newExp.title.trim()} onClick={() => { patch({ experience: [newExp, ...p.experience] }); setNewExp(null); }}>
                          Save
                        </Button>
                        <Button onClick={() => setNewExp(null)}>Cancel</Button>
                      </InlineStack>
                    </FormLayout>
                  </Card>
                )}
                {p.experience.length === 0 && !newExp && <Text as="p" tone="subdued">Nothing added yet — and that is fine.</Text>}
                {p.experience.map((e) => (
                  <BlockStack key={e.id} gap="050">
                    <InlineStack align="space-between" blockAlign="baseline" wrap>
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="h3" variant="headingSm">
                          {e.title} · {e.organization}
                        </Text>
                        <Badge>{KIND_LABEL[e.kind]}</Badge>
                      </InlineStack>
                      <Button variant="plain" tone="critical" onClick={() => patch({ experience: p.experience.filter((x) => x.id !== e.id) })}>
                        Remove
                      </Button>
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {e.startYear}–{e.endYear ?? 'present'}
                    </Text>
                    <Text as="p">{e.summary}</Text>
                  </BlockStack>
                ))}
                <InlineStack gap="300" blockAlign="center">
                  {p.resumeFileName ? (
                    <>
                      <Badge>{`Résumé: ${p.resumeFileName}`}</Badge>
                      <Button variant="plain" tone="critical" onClick={() => patch({ resumeFileName: null })}>
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Résumé: optional.
                      </Text>
                      <Button variant="plain" onClick={() => patch({ resumeFileName: `${p.name.replace(/\s+/g, '_')}_Resume.pdf` })}>
                        Attach a file
                      </Button>
                    </>
                  )}
                </InlineStack>
              </BlockStack>
            </Card>

            {/* How I work best */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">
                    How I work best
                  </Text>
                  <Button url="/passport/how-i-work">Edit</Button>
                </InlineStack>
                {answeredDims.length === 0 ? (
                  <Text as="p" tone="subdued">
                    Not answered yet. Eleven short questions.
                  </Text>
                ) : (
                  <dl className="ow-env" style={{ margin: 0 }}>
                    {answeredDims.map((d) => {
                      const pref = p.workPreferences[d.id]!;
                      return (
                        <div key={d.id} className="ow-env__item">
                          <Text as="dt" variant="bodySm" tone="subdued">
                            {d.label} · {IMPORTANCE_LABEL[pref.importance]} · {VISIBILITY_LABEL[pref.visibility]}
                          </Text>
                          <Text as="dd" variant="bodyMd" fontWeight="semibold">
                            {optionOf(d.id, pref.value)?.candidateLabel}
                          </Text>
                        </div>
                      );
                    })}
                  </dl>
                )}
              </BlockStack>
            </Card>

            {/* Access needs */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">
                    What makes work accessible for me
                  </Text>
                  <Button url="/passport/access-needs">Edit</Button>
                </InlineStack>
                {needs.length === 0 ? (
                  <Text as="p" tone="subdued">
                    Nothing added yet. Nine categories of need — pick any combination, or none.
                  </Text>
                ) : (
                  ACCESS_CATEGORIES.map((c) => {
                    const items = featuresIn(c.id).filter((f) => p.accessNeeds[f.id]);
                    if (!items.length) return null;
                    return (
                      <BlockStack key={c.id} gap="100">
                        <Text as="h3" variant="headingSm">
                          {c.label}
                        </Text>
                        <BlockStack gap="100">
                          {items.map((f) => (
                            <InlineStack key={f.id} gap="200" blockAlign="baseline" wrap>
                              <Text as="span" fontWeight="semibold">
                                {f.label}
                              </Text>
                              <Text as="span" variant="bodySm" tone="subdued">
                                {IMPORTANCE_LABEL[p.accessNeeds[f.id].importance]}
                                {p.accessNeeds[f.id].visibility === 'shared' ? ' · OK to share' : ''}
                              </Text>
                            </InlineStack>
                          ))}
                        </BlockStack>
                      </BlockStack>
                    );
                  })
                )}
              </BlockStack>
            </Card>
          </BlockStack>

          <BlockStack gap="500">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  How I want to be hired
                </Text>
                {p.hiringPreferences.length === 0 ? <Text as="p" tone="subdued">None chosen.</Text> : p.hiringPreferences.map((h) => <Text key={h} as="p">✓ {HIRING_OPTION_BY_ID[h]?.label}</Text>)}
                <InlineStack>
                  <Button url="/passport/how-i-work" size="slim">
                    Edit
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Support I may request
                </Text>
                <Text as="p" tone={p.supportNotes ? 'base' : 'subdued'}>
                  {p.supportNotes || 'Nothing written yet.'}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {VISIBILITY_LABEL[p.privacy.supportNotes]}
                </Text>
                <InlineStack>
                  <Button url="/passport/how-i-work" size="slim">
                    Edit
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Your passport is ready to use
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {p.strengths.length} strengths · {p.skills.length} skills · {answeredDims.length} of {DIMENSIONS.length} “how I work” answers · {needs.length} access needs
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  There is no diagnosis field on Openwork, and there never will be. {Object.keys(ACCESS_FEATURE_BY_ID).length} needs are available to choose from.
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </InlineGrid>
      </BlockStack>
    </div>
  );
}
