import { Banner, BlockStack, Button, Checkbox, FormLayout, InlineGrid, InlineStack, Select, Text, TextField } from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OptionCard, OptionCards } from '../../components/OptionCard';
import { OptionGrid } from '../../components/OptionGrid';
import { CompletenessMeter } from '../../components/CompletenessMeter';
import { EvidencePicker } from '../../components/EvidencePicker';
import { COMMUNICATION_REQUIREMENTS, COMM_LEVEL_LABEL, HIRING_OPTIONS, JOB_EVIDENCE_FEATURES, JOB_FAMILIES, PHYSICAL_REQUIREMENTS, STRENGTHS, TECH_A11Y, type CommLevel, type Evidence, type EvidenceStatus, type HiringOptionId } from '../../lib/access';
import { DIMENSIONS } from '../../lib/dimensions';
import { EMPLOYMENT_TYPE_LABEL, EXPERIENCE_LEVEL_LABEL } from '../../lib/format';
import { findVaguePhrases } from '../../lib/search';
import type { EmploymentType, ExperienceLevel, HiringStage, Job } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const STEPS = ['Basics', 'What they’ll do', 'Skills and tools', 'How the job works', 'Accessibility and support', 'Hiring process', 'Preview and publish'] as const;
const STEP_TITLE: Record<number, [string, string]> = {
  0: ['Tell us about the job.', 'Title, where, how much. Candidates see pay on every job.'],
  1: ['What will they actually do?', 'A typical day as steps, and what the person must be able to do. Plain words beat corporate ones.'],
  2: ['What does the job really require?', 'Physical, communication, and the software they’ll use. “Not sure” is shown honestly as not provided.'],
  3: ['How does this job work day to day?', 'Schedule, meetings, instructions, feedback. Candidates compare this with how they work best.'],
  4: ['What does this job provide?', 'Job-specific accessibility and support. Workplace-wide answers come from your workplace profile.'],
  5: ['How does hiring work?', 'The steps, the options you offer, and any questions candidates must answer.'],
  6: ['Ready to publish?', 'See exactly what candidates will see.'],
};
const TECH_STATUS = [
  { value: 'confirmed', label: 'Yes' },
  { value: 'notAvailable', label: 'No' },
  { value: 'contact', label: 'Contact us' },
  { value: '', label: 'Not sure' },
];

function blankJob(employerId: string): Job {
  return { id: `j-${Date.now().toString(36)}`, employerId, title: '', department: '', family: 'records', location: '', employmentType: 'fullTime', experienceLevel: 'entry', salaryMin: 0, salaryMax: 0, salaryUnit: 'hour', postedOn: new Date().toISOString().slice(0, 10), status: 'draft', summary: '', tasks: [], essentialRequirements: [], preferredRequirements: [], skills: [], strengthsUsed: [], physical: {}, communication: {}, technology: [], environment: {}, environmentNotes: {}, accessibility: {}, hiringOptions: [], screeningQuestions: [], baseApplicants: 0, acceptsAutoApply: true, hiringStages: [{ id: 's1', name: 'Application review', description: 'We read every application.', duration: 'within 1 week' }, { id: 's2', name: 'Interview', description: '', duration: '' }, { id: 's3', name: 'Decision', description: 'Written decision.', duration: 'within 1 week' }], decisionTimeframe: '', accommodationRoute: '', supportAvailable: [] };
}
const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
const today = () => new Date().toISOString().slice(0, 10);

export function JobBuilder() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  const existing = id ? state.jobs.find((j) => j.id === id && j.employerId === employer.id) : null;
  useTitle(existing ? `Edit · ${existing.title}` : 'Create job');

  const [job, setJob] = useState<Job>(() => existing ?? { ...blankJob(employer.id), accommodationRoute: employer.workplace.accommodationRoute });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTool, setNewTool] = useState('');
  const set = (patch: Partial<Job>) => setJob((j) => ({ ...j, ...patch }));

  const vague = useMemo(() => findVaguePhrases([...job.essentialRequirements, ...job.preferredRequirements, job.summary].join('\n')), [job.essentialRequirements, job.preferredRequirements, job.summary]);
  const envDone = DIMENSIONS.filter((d) => job.environment[d.id]).length;
  const physDone = PHYSICAL_REQUIREMENTS.filter((p) => job.physical[p.id]).length;
  const commDone = COMMUNICATION_REQUIREMENTS.filter((c) => job.communication[c.id]).length;
  const accDone = JOB_EVIDENCE_FEATURES.filter((f) => job.accessibility[f.id]).length;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!job.title.trim()) e.title = 'Enter the job title as it will appear to candidates.';
      if (!job.location.trim()) e.location = 'Enter a city and state, or “Remote (United States)”.';
      if (!job.salaryMin || !job.salaryMax) e.salary = 'Enter a pay range. Openwork shows pay on every job.';
      else if (job.salaryMax < job.salaryMin) e.salary = 'The top of the range must be at least the bottom.';
      if (!job.summary.trim()) e.summary = 'Describe the job in two or three plain sentences.';
    }
    if (step === 1) {
      if (job.tasks.length < 3) e.tasks = 'List at least three things the person does in a typical day.';
      if (job.essentialRequirements.length === 0) e.essential = 'List at least one thing someone needs to do this job.';
    }
    if (step === 5) {
      if (job.hiringStages.some((s) => !s.name.trim())) e.stages = 'Every step needs a name.';
      if (!job.accommodationRoute.trim()) e.accommodation = 'Say how a candidate asks for an adjustment.';
    }
    setErrors(e);
    if (Object.keys(e).length) window.scrollTo({ top: 0 });
    return Object.keys(e).length === 0;
  };
  const saveDraft = () => { dispatch({ type: 'upsertJob', job: { ...job, status: job.status === 'published' ? 'published' : 'draft' } }); navigate('/employer/jobs'); };
  const publish = () => { dispatch({ type: 'upsertJob', job: { ...job, status: 'published', postedOn: job.status === 'published' ? job.postedOn : today() } }); navigate(`/employer/jobs/${job.id}/preview?published=1`); };
  const next = () => { if (validate()) { setStep((s) => s + 1); window.scrollTo({ top: 0 }); } };
  const updateStage = (i: number, patch: Partial<HiringStage>) => set({ hiringStages: job.hiringStages.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const setEvidence = (key: string, status: EvidenceStatus | '', note?: string) => {
    const nextMap = { ...job.accessibility };
    if (!status) delete nextMap[key];
    else nextMap[key] = { status, source: 'employer', confirmedOn: today(), ...((note ?? nextMap[key]?.note) ? { note: note ?? nextMap[key]?.note } : {}) } as Evidence;
    set({ accessibility: nextMap });
  };
  const setToolEvidence = (i: number, attr: (typeof TECH_A11Y)[number]['id'], status: EvidenceStatus | '') =>
    set({ technology: job.technology.map((t, idx) => { if (idx !== i) return t; const acc = { ...t.accessibility }; if (!status) delete acc[attr]; else acc[attr] = { status, source: 'employer', confirmedOn: today() }; return { ...t, accessibility: acc }; }) });

  return (
    <div className="ow-container">
      <div className="ow-pagehead">
        <Button variant="plain" url="/employer/jobs">
          ← Jobs
        </Button>
        <InlineStack gap="200">
          <Button onClick={saveDraft}>Save and exit</Button>
        </InlineStack>
      </div>
      <div className="ow-sheet ow-onboard">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="p" variant="bodyXs" fontWeight="bold" tone="magic">
              STEP {step + 1} OF {STEPS.length}
            </Text>
            <Text as="p" variant="bodyXs" tone="subdued">
              {STEPS[step]}
            </Text>
          </InlineStack>
          <div className="ow-progress" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Job progress">
            <div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </BlockStack>
        <BlockStack gap="200" inlineAlign="center">
          <Text as="h1" variant="heading2xl" alignment="center">
            {existing && step === 0 ? `Edit ${existing.title}` : STEP_TITLE[step][0]}
          </Text>
          <Text as="p" tone="subdued" alignment="center">
            {STEP_TITLE[step][1]}
          </Text>
        </BlockStack>

        {step === 0 && (
          <div>
            <FormLayout>
              <FormLayout.Group>
                <TextField label="Job title" value={job.title} onChange={(v) => set({ title: v })} autoComplete="off" error={errors.title} requiredIndicator />
                <TextField label="Department or team" value={job.department} onChange={(v) => set({ department: v })} autoComplete="off" />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField label="Location" value={job.location} onChange={(v) => set({ location: v })} autoComplete="off" error={errors.location} requiredIndicator placeholder="City, ST or Remote (United States)" />
                <Select label="Kind of work" options={JOB_FAMILIES.map((f) => ({ label: f.label, value: f.id }))} value={job.family} onChange={(v) => set({ family: v })} />
              </FormLayout.Group>
              <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingSm">
                    Employment type
                  </Text>
                  <OptionCards>
                    {Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => (
                      <OptionCard key={value} title={label} selected={job.employmentType === value} onClick={() => set({ employmentType: value as EmploymentType })} />
                    ))}
                  </OptionCards>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingSm">
                    Experience level
                  </Text>
                  <OptionCards>
                    {Object.entries(EXPERIENCE_LEVEL_LABEL).map(([value, label]) => (
                      <OptionCard key={value} title={label} selected={job.experienceLevel === value} onClick={() => set({ experienceLevel: value as ExperienceLevel })} />
                    ))}
                  </OptionCards>
                </BlockStack>
              </InlineGrid>
              <FormLayout.Group condensed>
                <Select label="Pay is" options={[{ label: 'Per hour', value: 'hour' }, { label: 'Per year', value: 'year' }]} value={job.salaryUnit} onChange={(v) => set({ salaryUnit: v as 'hour' | 'year' })} />
                <TextField label="From" type="number" prefix="$" value={job.salaryMin ? String(job.salaryMin) : ''} onChange={(v) => set({ salaryMin: Number(v) })} autoComplete="off" error={!!errors.salary} requiredIndicator />
                <TextField label="To" type="number" prefix="$" value={job.salaryMax ? String(job.salaryMax) : ''} onChange={(v) => set({ salaryMax: Number(v) })} autoComplete="off" error={errors.salary} requiredIndicator />
              </FormLayout.Group>
              <TextField label="Summary" value={job.summary} onChange={(v) => set({ summary: v })} multiline={3} autoComplete="off" error={errors.summary} requiredIndicator helpText="Two or three sentences a candidate can picture." />
            </FormLayout>
          </div>
        )}

        {step === 1 && (
          <BlockStack gap="400">
            <InlineGrid columns={{ xs: 1, lg: 2 }} gap="400">
              <div>
                <FormLayout>
                  <TextField label="A typical day, as steps" value={job.tasks.join('\n')} onChange={(v) => set({ tasks: v.split('\n') })} onBlur={() => set({ tasks: lines(job.tasks.join('\n')) })} multiline={8} autoComplete="off" error={errors.tasks} requiredIndicator helpText="One step per line, in order. “Open the next request in the queue”, not “Support the team”." />
                </FormLayout>
              </div>
              <div>
                <FormLayout>
                  <TextField label="Essential — needed to do the job" value={job.essentialRequirements.join('\n')} onChange={(v) => set({ essentialRequirements: v.split('\n') })} onBlur={() => set({ essentialRequirements: lines(job.essentialRequirements.join('\n')) })} multiline={4} autoComplete="off" error={errors.essential} requiredIndicator helpText="One per line. What the person must be able to do — not who they must be." />
                  <TextField label="Helpful but not required" value={job.preferredRequirements.join('\n')} onChange={(v) => set({ preferredRequirements: v.split('\n') })} onBlur={() => set({ preferredRequirements: lines(job.preferredRequirements.join('\n')) })} multiline={2} autoComplete="off" />
                  <TextField label="Skills and tools (comma separated)" value={job.skills.join(', ')} onChange={(v) => set({ skills: v.split(',').map((s) => s.trimStart()) })} onBlur={() => set({ skills: job.skills.map((s) => s.trim()).filter(Boolean) })} autoComplete="off" />
                </FormLayout>
              </div>
            </InlineGrid>
            <div>
              <OptionGrid label="Strengths this job uses" multiple options={STRENGTHS.map((s) => ({ value: s, label: s }))} value={job.strengthsUsed} onChange={(v) => set({ strengthsUsed: v as string[] })} helpText="Candidates without a work history are matched on these. Pick the ones that genuinely matter." />
            </div>
            {vague.length > 0 && (
              <Banner tone="warning" title="Some phrases are hard for candidates to act on">
                <BlockStack gap="200">
                  {vague.map((v) => (
                    <Text key={v.ask} as="p">
                      <strong>{v.ask}</strong> — for example: {v.options.join(' · ')}
                    </Text>
                  ))}
                </BlockStack>
              </Banner>
            )}
          </BlockStack>
        )}

        {step === 2 && (
          <BlockStack gap="400">
            <Banner tone="info">
              <p>What the job genuinely requires — not how it has usually been done. “Not stated” is shown to candidates as a gap. Physical {physDone}/{PHYSICAL_REQUIREMENTS.length} · Communication {commDone}/{COMMUNICATION_REQUIREMENTS.length} · Tools {job.technology.length}</p>
            </Banner>
            <BlockStack gap="600">
              <div>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">
                    Physical
                  </Text>
                  {PHYSICAL_REQUIREMENTS.map((p) => (
                    <OptionGrid key={p.id} label={p.employerQuestion} options={p.options} value={job.physical[p.id] ?? null} onChange={(v) => set({ physical: { ...job.physical, [p.id]: (v as string | null) ?? null } })} />
                  ))}
                </BlockStack>
              </div>
              <div>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">
                    Communication
                  </Text>
                  {COMMUNICATION_REQUIREMENTS.map((c) => (
                    <OptionGrid key={c.id} label={c.label} options={(Object.keys(COMM_LEVEL_LABEL) as CommLevel[]).map((k) => ({ value: k, label: COMM_LEVEL_LABEL[k] }))} value={job.communication[c.id] ?? null} onChange={(v) => set({ communication: { ...job.communication, [c.id]: (v as CommLevel | null) ?? null } })} />
                  ))}
                </BlockStack>
              </div>
            </BlockStack>
            <div>
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingLg">
                    Software and tools
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    A screen-reader user needs to know before applying, not on day one. “Not sure” is shown as not verified — which is honest.
                  </Text>
                </BlockStack>
                <InlineStack gap="200" blockAlign="end">
                  <div style={{ flex: 1 }}>
                    <TextField label="Add a tool" value={newTool} onChange={setNewTool} autoComplete="off" placeholder="e.g. Epic, Microsoft Teams, Zebra scanner" />
                  </div>
                  <Button onClick={() => { if (newTool.trim()) { set({ technology: [...job.technology, { name: newTool.trim(), accessibility: {} }] }); setNewTool(''); } }}>Add</Button>
                </InlineStack>
                <InlineGrid columns={{ xs: 1, lg: 2 }} gap="300">
                  {job.technology.map((t, i) => (
                    <div key={`${t.name}-${i}`} className="ow-env__item">
                      <BlockStack gap="300">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text as="h3" variant="headingSm">
                            {t.name}
                          </Text>
                          <Button variant="plain" tone="critical" onClick={() => set({ technology: job.technology.filter((_, idx) => idx !== i) })}>
                            Remove
                          </Button>
                        </InlineStack>
                        {TECH_A11Y.map((a) => (
                          <OptionGrid key={a.id} label={a.employerQuestion} allowNone={false} options={TECH_STATUS} value={t.accessibility[a.id]?.status ?? ''} onChange={(v) => setToolEvidence(i, a.id, (v as EvidenceStatus | '') ?? '')} />
                        ))}
                      </BlockStack>
                    </div>
                  ))}
                </InlineGrid>
              </BlockStack>
            </div>
          </BlockStack>
        )}

        {step === 3 && (
          <BlockStack gap="400">
            <CompletenessMeter id="cm-env" done={envDone} total={DIMENSIONS.length} label="Work environment" why="Describe the real job, including the hard parts. “Not sure” is shown as not provided — better than a guess that turns out wrong." />
            <div>
              {DIMENSIONS.map((d) => (
                <div key={d.id} className="ow-qblock">
                  <BlockStack gap="300">
                    <OptionGrid label={d.employerQuestion} helpText={d.employerHelp} options={[...d.options.map((o) => ({ value: o.value, label: o.employerLabel })), { value: '__none', label: 'Not sure' }]} value={job.environment[d.id] ?? '__none'} allowNone={false} onChange={(v) => set({ environment: { ...job.environment, [d.id]: v === '__none' ? null : (v as string) } })} />
                    <TextField label="Detail in your words (optional)" labelHidden value={job.environmentNotes[d.id] ?? ''} onChange={(v) => set({ environmentNotes: { ...job.environmentNotes, [d.id]: v } })} autoComplete="off" placeholder="Detail in your words (optional)" />
                  </BlockStack>
                </div>
              ))}
            </div>
          </BlockStack>
        )}

        {step === 4 && (
          <BlockStack gap="400">
            <Banner tone="info">
              <p>Job-specific answers ({accDone}/{JOB_EVIDENCE_FEATURES.length}). Workplace-wide answers — entrance, restrooms, alarms, interpreters, job coaching — come from your <Button variant="plain" url="/employer/accessibility">workplace accessibility profile</Button> and appear on every job.</p>
            </Banner>
            <div>
              <InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
                {JOB_EVIDENCE_FEATURES.map((f) => (
                  <EvidencePicker key={f.id} question={f.employerQuestion ?? f.label} evidence={job.accessibility[f.id]} onChange={(s, n) => setEvidence(f.id, s, n)} />
                ))}
              </InlineGrid>
            </div>
            <div>
              <TextField label="Support available in this job" value={job.supportAvailable.join('\n')} onChange={(v) => set({ supportAvailable: v.split('\n') })} onBlur={() => set({ supportAvailable: lines(job.supportAvailable.join('\n')) })} multiline={3} autoComplete="off" helpText="One per line. Written onboarding plan, named buddy, written procedures, equipment provided, job coach welcome." />
            </div>
          </BlockStack>
        )}

        {step === 5 && (
          <BlockStack gap="600">
            <div>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Steps candidates see before applying
                </Text>
                {errors.stages && <Banner tone="critical"><p>{errors.stages}</p></Banner>}
                {job.hiringStages.map((s, i) => (
                  <div key={s.id} className="ow-env__item">
                    <FormLayout>
                      <FormLayout.Group>
                        <TextField label={`Step ${i + 1}`} value={s.name} onChange={(v) => updateStage(i, { name: v })} autoComplete="off" />
                        <TextField label="How long" value={s.duration} onChange={(v) => updateStage(i, { duration: v })} autoComplete="off" placeholder="about 45 minutes" />
                      </FormLayout.Group>
                      <TextField label="What happens" value={s.description} onChange={(v) => updateStage(i, { description: v })} autoComplete="off" />
                      <Button variant="plain" tone="critical" onClick={() => set({ hiringStages: job.hiringStages.filter((_, idx) => idx !== i) })} disabled={job.hiringStages.length <= 1}>
                        Remove step
                      </Button>
                    </FormLayout>
                  </div>
                ))}
                <InlineStack>
                  <Button onClick={() => set({ hiringStages: [...job.hiringStages, { id: `s${Date.now()}`, name: '', description: '', duration: '' }] })}>Add a step</Button>
                </InlineStack>
                <TextField label="Questions candidates must answer to apply (optional, one per line, up to 3)" value={job.screeningQuestions.join('\n')} onChange={(v) => set({ screeningQuestions: v.split('\n').slice(0, 3) })} onBlur={() => set({ screeningQuestions: lines(job.screeningQuestions.join('\n')).slice(0, 3) })} multiline={3} autoComplete="off" helpText="Leave empty and people apply with just a résumé. If you add questions, nobody can send without answering them — so keep them friendly: why they want to work with you, what they would enjoy." />
                <Checkbox label="Accept applications Openwork sends on a candidate’s behalf" helpText="Candidates on Pro can let Openwork apply for them within rules they set. Their profile and résumé arrive exactly as a manual application would, marked “sent by Openwork”. Turn off to receive only applications the person sent themselves." checked={job.acceptsAutoApply} onChange={(v) => set({ acceptsAutoApply: v })} />
                <TextField label="Overall timeframe" value={job.decisionTimeframe} onChange={(v) => set({ decisionTimeframe: v })} autoComplete="off" placeholder="About three weeks from application to decision." />
              </BlockStack>
            </div>
            <div>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Accessible hiring options
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Tap only what you will actually offer. Candidates filter on these and request them when they apply.
                </Text>
                {(['demonstrate', 'interview', 'workplace'] as const).map((g) => (
                  <OptionGrid key={g} label={g === 'demonstrate' ? 'Ways to demonstrate skills' : g === 'interview' ? 'Interview accessibility' : 'Workplace flexibility'} multiple options={HIRING_OPTIONS.filter((h) => h.group === g).map((h) => ({ value: h.id, label: h.label, helpText: h.description }))} value={job.hiringOptions.filter((h) => HIRING_OPTIONS.find((x) => x.id === h)?.group === g)} onChange={(v) => set({ hiringOptions: [...job.hiringOptions.filter((h) => HIRING_OPTIONS.find((x) => x.id === h)?.group !== g), ...(v as HiringOptionId[])] })} />
                ))}
                <TextField label="How a candidate asks for an adjustment" value={job.accommodationRoute} onChange={(v) => set({ accommodationRoute: v })} autoComplete="off" error={errors.accommodation} requiredIndicator helpText="Prefilled from your workplace profile. Say whether a reason is needed — it should not be." />
              </BlockStack>
            </div>
          </BlockStack>
        )}

        {step === 6 && (
          <BlockStack gap="400">
            <Banner tone={vague.length ? 'warning' : 'info'} title="Before publishing">
              <p>Tasks {job.tasks.length} · Physical {physDone}/{PHYSICAL_REQUIREMENTS.length} · Communication {commDone}/{COMMUNICATION_REQUIREMENTS.length} · Tools {job.technology.length} · Environment {envDone}/{DIMENSIONS.length} · Job accessibility {accDone}/{JOB_EVIDENCE_FEATURES.length} · Hiring options {job.hiringOptions.length}. Anything not stated shows as “Not provided” with a button to ask you.{vague.length ? ` ${vague.length} vague phrase${vague.length === 1 ? '' : 's'} remain.` : ''}</p>
            </Banner>
            <div className="ow-why">
              <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                <Text as="p">See exactly what candidates will see before you publish.</Text>
                <Button onClick={() => { dispatch({ type: 'upsertJob', job }); navigate(`/employer/jobs/${job.id}/preview`); }}>Save and preview</Button>
              </InlineStack>
            </div>
          </BlockStack>
        )}

        <div className="ow-onboard__foot">
          <Button onClick={() => { setStep((s) => Math.max(0, s - 1)); window.scrollTo({ top: 0 }); }} disabled={step === 0}>
            Back
          </Button>
          <InlineStack gap="200">
            <Button variant="plain" onClick={saveDraft}>
              Save draft
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" size="large" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button variant="primary" size="large" onClick={publish}>
                {job.status === 'published' ? 'Save changes' : 'Publish job'}
              </Button>
            )}
          </InlineStack>
        </div>
      </BlockStack>
      </div>
    </div>
  );
}
