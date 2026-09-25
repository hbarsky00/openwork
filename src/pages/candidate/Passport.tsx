import { Badge, BlockStack, Button, DropZone, FormLayout, Icon, InlineStack, Select, Tag, Text, TextField } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChoiceChips } from '../../components/ChoiceChips';
import { EmployerLogo } from '../../components/EmployerLogo';
import { StrengthsPicker } from '../../components/StrengthsPicker';
import { ACCESS_CATEGORIES, HIRING_OPTION_BY_ID, featuresIn } from '../../lib/access';
import { DIMENSIONS, optionOf } from '../../lib/dimensions';
import { EMPLOYMENT_TYPE_LABEL, IMPORTANCE_LABEL } from '../../lib/format';
import type { EmploymentType, Experience } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const KIND_LABEL: Record<Experience['kind'], string> = { paid: 'Paid work', volunteer: 'Volunteering', school: 'School or program', project: 'Project' };

/**
 * Profile. What goes with an application, on one sheet: you, résumé,
 * strengths and skills, experience, how you work, what you need, how you
 * want to be hired. Employers see only what you mark shareable, only when
 * you apply.
 */
export function Passport() {
  useTitle('Profile');
  const { state, dispatch } = useStore();
  const p = state.candidate!;
  const patch = (x: Partial<typeof p>) => dispatch({ type: 'updateCandidate', patch: x });
  const [skillDraft, setSkillDraft] = useState('');
  const [newExp, setNewExp] = useState<Experience | null>(null);
  const [editBasics, setEditBasics] = useState(false);

  const needs = Object.entries(p.accessNeeds);
  const shared = needs.filter(([, n]) => n.visibility === 'shared').length + Object.values(p.workPreferences).filter((w) => w.visibility === 'shared').length;
  const answeredDims = DIMENSIONS.filter((d) => p.workPreferences[d.id]);
  const applied = state.applications.filter((a) => a.candidateId === p.id).length;

  const addSkill = () => {
    const v = skillDraft.trim();
    if (v && !p.skills.includes(v)) patch({ skills: [...p.skills, v] });
    setSkillDraft('');
  };

  const Section = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
    <BlockStack gap="300">
      <InlineStack align="space-between" blockAlign="center" wrap gap="200">
        <Text as="h2" variant="headingLg">
          {title}
        </Text>
        {action}
      </InlineStack>
      {children}
    </BlockStack>
  );

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <BlockStack gap="050">
            <Text as="h1" variant="heading2xl">
              {p.name}
            </Text>
            <Text as="p" tone="subdued">
              {p.headline || 'Add a one-line headline.'}
            </Text>
          </BlockStack>
          <Text as="p" variant="bodySm" tone="subdued">
            {applied} application{applied === 1 ? '' : 's'} · {shared} thing{shared === 1 ? '' : 's'} marked OK to share · <Link to="/passport/sharing">Sharing</Link>
          </Text>
        </div>

        <div className="ow-sheet">
          <BlockStack gap="800">
            <Section title="About you" action={<Button variant="plain" onClick={() => setEditBasics((e) => !e)}>{editBasics ? 'Done' : 'Edit'}</Button>}>
              {editBasics ? (
                <FormLayout>
                  <FormLayout.Group>
                    <TextField label="Name" value={p.name} onChange={(v) => patch({ name: v })} autoComplete="name" />
                    <TextField label="Email" type="email" value={p.email} onChange={(v) => patch({ email: v })} autoComplete="email" />
                  </FormLayout.Group>
                  <FormLayout.Group>
                    <TextField label="Phone (optional)" type="tel" value={p.phone} onChange={(v) => patch({ phone: v })} autoComplete="tel" />
                    <TextField label="Location" value={p.location} onChange={(v) => patch({ location: v })} autoComplete="address-level2" />
                  </FormLayout.Group>
                  <TextField label="Headline" value={p.headline} onChange={(v) => patch({ headline: v })} autoComplete="off" placeholder="e.g. Reliable, organized and good with my hands" />
                  <TextField label="About you" value={p.about} onChange={(v) => patch({ about: v })} multiline={3} autoComplete="off" placeholder="What you are good at and what you are looking for. Plain words." />
                  <TextField label="Availability" value={p.availability} onChange={(v) => patch({ availability: v })} autoComplete="off" placeholder="e.g. Immediately, weekday mornings" />
                  <ChoiceChips label="Kind of work" multiple size="slim" options={Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))} value={p.employmentTypes} onChange={(v) => patch({ employmentTypes: v as EmploymentType[] })} />
                </FormLayout>
              ) : (
                <BlockStack gap="100">
                  <Text as="p">{[p.email, p.phone, p.location].filter(Boolean).join(' · ')}</Text>
                  <Text as="p" tone="subdued">
                    {[p.availability, p.employmentTypes.map((t) => EMPLOYMENT_TYPE_LABEL[t]).join(', ')].filter(Boolean).join(' · ') || 'Add your availability and the kind of work you want.'}
                  </Text>
                  {p.about && <Text as="p">{p.about}</Text>}
                </BlockStack>
              )}
            </Section>

            <Section title="Résumé">
              {p.resumeFileName ? (
                <InlineStack gap="300" blockAlign="center" wrap>
                  <Icon source={CheckCircleIcon} tone="success" />
                  <Text as="p" fontWeight="semibold">
                    {p.resumeFileName}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Goes with every application. Quick apply uses it.
                  </Text>
                  <Button variant="plain" onClick={() => patch({ resumeFileName: null })}>
                    Remove
                  </Button>
                </InlineStack>
              ) : (
                <div className="ow-drop">
                  <DropZone accept=".pdf,.doc,.docx,.txt" type="file" allowMultiple={false} onDrop={(_d, accepted) => accepted[0] && patch({ resumeFileName: accepted[0].name })}>
                    <DropZone.FileUpload actionTitle="Upload your résumé" actionHint="PDF or Word. Optional. With one saved, jobs without questions become one-tap Quick apply." />
                  </DropZone>
                </div>
              )}
            </Section>

            <Section title="Strengths">
              <Text as="p" tone="subdued">
                Jobs list the strengths they use. Yours are matched against them.
              </Text>
              <StrengthsPicker value={p.strengths} onChange={(v) => patch({ strengths: v })} title="Strengths" labelHidden />
            </Section>

            <Section title="Skills and tools">
              <InlineStack gap="200" blockAlign="end" wrap>
                <div style={{ flex: '1 1 240px' }}>
                  <TextField label="Add a skill or tool" labelHidden value={skillDraft} onChange={setSkillDraft} autoComplete="off" onBlur={addSkill} placeholder="e.g. Excel, forklift, Spanish" />
                </div>
                <Button onClick={addSkill}>Add</Button>
              </InlineStack>
              {p.skills.length > 0 && (
                <InlineStack gap="200" wrap>
                  {p.skills.map((s) => (
                    <Tag key={s} onRemove={() => patch({ skills: p.skills.filter((x) => x !== s) })}>
                      {s}
                    </Tag>
                  ))}
                </InlineStack>
              )}
            </Section>

            <Section title="Experience" action={!newExp && <Button onClick={() => setNewExp({ id: `e-${Date.now()}`, kind: p.firstJob ? 'school' : 'paid', title: '', organization: '', startYear: new Date().getFullYear(), endYear: null, summary: '' })}>Add</Button>}>
              <Text as="p" tone="subdued">
                Paid work, volunteering, school placements and projects all count. A first job does not need a work history.
              </Text>
              {newExp && (
                <div className="ow-subsheet">
                  <FormLayout>
                    <Select label="What kind" options={(Object.keys(KIND_LABEL) as Experience['kind'][]).map((k) => ({ label: KIND_LABEL[k], value: k }))} value={newExp.kind} onChange={(v) => setNewExp({ ...newExp, kind: v as Experience['kind'] })} />
                    <FormLayout.Group>
                      <TextField label="What you did or your role" value={newExp.title} onChange={(v) => setNewExp({ ...newExp, title: v })} autoComplete="off" />
                      <TextField label="Where" value={newExp.organization} onChange={(v) => setNewExp({ ...newExp, organization: v })} autoComplete="organization" />
                    </FormLayout.Group>
                    <FormLayout.Group>
                      <TextField label="Start year" type="number" value={String(newExp.startYear)} onChange={(v) => setNewExp({ ...newExp, startYear: Number(v) })} autoComplete="off" />
                      <TextField label="End year (blank if current)" type="number" value={newExp.endYear?.toString() ?? ''} onChange={(v) => setNewExp({ ...newExp, endYear: v ? Number(v) : null })} autoComplete="off" />
                    </FormLayout.Group>
                    <TextField label="What you did, in a sentence or two" value={newExp.summary} onChange={(v) => setNewExp({ ...newExp, summary: v })} multiline={2} autoComplete="off" />
                    <InlineStack gap="200">
                      <Button
                        variant="primary"
                        disabled={!newExp.title.trim()}
                        onClick={() => {
                          patch({ experience: [newExp, ...p.experience] });
                          setNewExp(null);
                        }}
                      >
                        Save
                      </Button>
                      <Button onClick={() => setNewExp(null)}>Cancel</Button>
                    </InlineStack>
                  </FormLayout>
                </div>
              )}
              {p.experience.map((e) => (
                <div key={e.id} className="ow-row">
                  <BlockStack gap="050">
                    <InlineStack gap="200" blockAlign="center" wrap>
                      <Text as="h3" variant="headingSm">
                        {e.title} · {e.organization}
                      </Text>
                      <Badge>{KIND_LABEL[e.kind]}</Badge>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {e.startYear}–{e.endYear ?? 'present'}
                      </Text>
                    </InlineStack>
                    {e.summary && <Text as="p">{e.summary}</Text>}
                  </BlockStack>
                  <Button variant="plain" tone="critical" onClick={() => patch({ experience: p.experience.filter((x) => x.id !== e.id) })}>
                    Remove
                  </Button>
                </div>
              ))}
            </Section>

            <Section title="How you work best" action={<Button url="/passport/how-i-work">{answeredDims.length ? 'Edit' : 'Answer'}</Button>}>
              {answeredDims.length === 0 ? (
                <Text as="p" tone="subdued">
                  Eleven quick questions. Every job then shows how it compares.
                </Text>
              ) : (
                <dl className="ow-details">
                  {answeredDims.map((d) => (
                    <div key={d.id} className="ow-details__row">
                      <dt>{d.label}</dt>
                      <dd>{optionOf(d.id, p.workPreferences[d.id]!.value)?.candidateLabel}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Section>

            <Section title="What you need at work" action={<Button url="/passport/access-needs">{needs.length ? 'Edit' : 'Add'}</Button>}>
              {needs.length === 0 ? (
                <Text as="p" tone="subdued">
                  Captions, step-free access, written instructions, a job coach — anything. Jobs then show what matches.
                </Text>
              ) : (
                <dl className="ow-details">
                  {ACCESS_CATEGORIES.map((c) => {
                    const items = featuresIn(c.id).filter((f) => p.accessNeeds[f.id]);
                    if (!items.length) return null;
                    return (
                      <div key={c.id} className="ow-details__row">
                        <dt>{c.label}</dt>
                        <dd>
                          {items.map((f) => `${f.label}${p.accessNeeds[f.id].importance === 'required' ? '' : ` (${IMPORTANCE_LABEL[p.accessNeeds[f.id].importance].toLowerCase()})`}`).join(', ')}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </Section>

            <Section title="How Openwork helps" action={<Button url="/passport/assist">Change</Button>}>
              <Text as="p">
                {p.assistMode === 'auto' ? 'Pro · Auto. Openwork sends applications within your rules; jobs with employer questions wait for you.' : p.assistMode === 'assist' ? 'Plus · Assist. Openwork prepares applications for strong matches; you approve each one.' : 'Free · Review. Openwork finds jobs; you apply.'}
              </Text>
            </Section>

            <Section title="How you want to be hired" action={<Button url="/passport/how-i-work">Edit</Button>}>
              {p.hiringPreferences.length === 0 ? (
                <Text as="p" tone="subdued">
                  Questions in advance, a work sample instead of an interview, an interpreter — say it once here and it goes with every application.
                </Text>
              ) : (
                <Text as="p">{p.hiringPreferences.map((h) => HIRING_OPTION_BY_ID[h]?.label).join(', ')}.</Text>
              )}
              {p.supportNotes && (
                <Text as="p" tone="subdued">
                  Support: {p.supportNotes}
                </Text>
              )}
            </Section>
          </BlockStack>
        </div>

        <InlineStack gap="300" blockAlign="center" wrap>
          {state.applications.filter((a) => a.candidateId === p.id).slice(0, 3).map((a) => {
            const job = state.jobs.find((j) => j.id === a.jobId);
            const emp = job && state.employers.find((e) => e.id === job.employerId);
            return job && emp ? <EmployerLogo key={a.id} employer={emp} size={28} /> : null;
          })}
          <Text as="p" variant="bodySm" tone="subdued">
            There is no diagnosis field anywhere on Openwork. Employers see this profile only when you apply, and only what you mark shareable.
          </Text>
        </InlineStack>
      </BlockStack>
    </div>
  );
}
