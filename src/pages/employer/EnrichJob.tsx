import { Banner, BlockStack, Button, InlineGrid, InlineStack, Text, TextField } from '@shopify/polaris';
import { AlertCircleIcon, CheckCircleIcon, QuestionCircleIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EvidencePicker } from '../../components/EvidencePicker';
import { OptionGrid } from '../../components/OptionGrid';
import { SuggestRewrite } from '../../components/SuggestRewrite';
import { HIRING_OPTIONS, JOB_EVIDENCE_FEATURES, PHYSICAL_REQUIREMENTS, TECH_A11Y, type Evidence, type EvidenceStatus, type HiringOptionId } from '../../lib/access';
import { DIMENSIONS, type DimensionId } from '../../lib/dimensions';
import { jobCompleteness, reviewJob } from '../../lib/jobs';
import type { Job } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';
import { NotFound } from '../public/NotFound';

const ENRICH_DIMS: DimensionId[] = ['schedulePredictability', 'meetingFrequency', 'instructions', 'collaboration', 'customerInteraction', 'noise', 'taskSwitching'];
const STATUS = [{ value: 'confirmed', label: 'Yes' }, { value: 'notAvailable', label: 'No' }, { value: 'contact', label: 'Contact us' }];
const today = () => new Date().toISOString().slice(0, 10);
const ICON = { ok: CheckCircleIcon, warn: AlertCircleIcon, unknown: QuestionCircleIcon };

/**
 * Turns "excellent communication skills" into the things the person will
 * actually do. The employer chooses; Openwork never guesses an essential
 * requirement, and the bar is not raised or lowered.
 */
function MakeConcrete({ item, onApply }: { item: { phrase?: string; ask?: string; options?: string[] }; onApply: (phrase: string, chosen: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  if (!item.phrase || !item.options) return null;
  return (
    <BlockStack gap="200">
      {!open ? (
        <InlineStack>
          <Button size="slim" onClick={() => setOpen(true)}>
            Make it concrete
          </Button>
        </InlineStack>
      ) : (
        <BlockStack gap="200">
          <OptionGrid label={item.ask ?? 'What does this actually involve?'} multiple options={item.options.map((o) => ({ value: o, label: o }))} value={chosen} onChange={(v) => setChosen(v as string[])} />
          <InlineStack gap="200">
            <Button variant="primary" size="slim" disabled={chosen.length === 0} onClick={() => { onApply(item.phrase!, chosen); setOpen(false); setChosen([]); }}>
              Use these
            </Button>
            <Button variant="plain" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </InlineStack>
        </BlockStack>
      )}
    </BlockStack>
  );
}

/**
 * The three-minute pass for an imported job: only what an ATS feed never
 * carries. One page, no wizard. The review panel says what is still unclear
 * and can make vague requirements concrete without changing the bar.
 */
export function EnrichJob() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  const existing = state.jobs.find((j) => j.id === id && j.employerId === employer.id);
  const [job, setJob] = useState<Job | null>(existing ?? null);
  useTitle(existing ? `Add information · ${existing.title}` : 'Add information');
  if (!job) return <NotFound message="That job is not in your account." />;
  const set = (patch: Partial<Job>) => setJob((j) => (j ? { ...j, ...patch } : j));
  const setEvidence = (key: string, status: EvidenceStatus | '', note?: string) => {
    const next = { ...job.accessibility };
    if (!status) delete next[key];
    else next[key] = { status, source: 'employer', confirmedOn: today(), ...(note ?? next[key]?.note ? { note: note ?? next[key]?.note } : {}) } as Evidence;
    set({ accessibility: next });
  };
  const review = reviewJob(job, employer);
  const { done, total } = jobCompleteness(job);
  const save = (publish: boolean) => {
    dispatch({ type: 'upsertJob', job: { ...job, status: publish ? 'published' : job.status, postedOn: publish && job.status !== 'published' ? today() : job.postedOn } });
    navigate(publish ? `/employer/jobs/${job.id}/preview?published=1` : '/employer/jobs?tab=imported');
  };
  /** Swap the vague line for the concrete ones the employer picked. */
  const makeConcrete = (phrase: string, chosen: string[]) => {
    const hit = (r: string) => r.toLowerCase().includes(phrase.toLowerCase());
    const essential = job.essentialRequirements.filter((r) => !hit(r));
    const preferred = job.preferredRequirements.filter((r) => !hit(r));
    const changed = essential.length !== job.essentialRequirements.length || preferred.length !== job.preferredRequirements.length;
    set({ essentialRequirements: [...essential, ...chosen], preferredRequirements: preferred, summary: changed ? job.summary : job.summary });
  };
  const replaceReq = (from: string, to: string) => set({ essentialRequirements: job.essentialRequirements.map((r) => (r.includes(from) ? r.replace(from, to) : r)), preferredRequirements: job.preferredRequirements.map((r) => (r.includes(from) ? r.replace(from, to) : r)), summary: job.summary.includes(from) ? job.summary.replace(from, to) : job.summary });

  return (
    <div className="ow-container ow-container--tight">
      <div className="ow-wizard ow-wizard--wide">
        <div className="ow-pagehead">
          <Link to="/employer/jobs?tab=imported" className="ow-backlink">
            ← Jobs
          </Link>
          <InlineStack gap="200">
            <Button onClick={() => save(false)}>Save</Button>
            <Button variant="primary" onClick={() => save(true)}>
              {job.status === 'published' ? 'Save and publish changes' : 'Publish job'}
            </Button>
          </InlineStack>
        </div>
        <div className="ow-cols">
        <div className="ow-sheet ow-onboard ow-onboard--form">
          <BlockStack gap="500">
            <div className="ow-onboard__head">
              <p className="ow-onboard__step">
                <span>{job.title} · {done} of {total} answered</span>
                <span>About 3 minutes</span>
              </p>
              <div className="ow-progress ow-progress--thin" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Information completeness">
                <div style={{ width: `${(done / total) * 100}%` }} />
              </div>
              <Text as="h1" variant="heading2xl">
                Help candidates understand how this job actually works.
              </Text>
            </div>

            <section aria-labelledby="sch">
              <BlockStack gap="400">
                <h2 id="sch" className="ow-sr-only">
                  Schedule, communication and environment
                </h2>
                {ENRICH_DIMS.map((did) => {
                  const d = DIMENSIONS.find((x) => x.id === did)!;
                  return <OptionGrid key={d.id} label={d.employerQuestion} options={d.options.map((o) => ({ value: o.value, label: o.employerLabel }))} value={job.environment[d.id] ?? null} onChange={(v) => set({ environment: { ...job.environment, [d.id]: (v as string | null) ?? null } })} />;
                })}
              </BlockStack>
            </section>

            <section aria-labelledby="phy">
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg" id="phy">
                  Physical requirements
                </Text>
                {PHYSICAL_REQUIREMENTS.map((p) => (
                  <OptionGrid key={p.id} label={p.employerQuestion} options={p.options.map((o) => ({ value: o.value, label: o.label }))} value={job.physical[p.id] ?? null} onChange={(v) => set({ physical: { ...job.physical, [p.id]: (v as string | null) ?? null } })} />
                ))}
              </BlockStack>
            </section>

            {job.technology.length > 0 && (
              <section aria-labelledby="tech">
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg" id="tech">
                    Digital accessibility of the tools
                  </Text>
                  {job.technology.map((t, i) => (
                    <BlockStack key={t.name} gap="200">
                      <Text as="h3" variant="headingSm">
                        {t.name}
                      </Text>
                      <InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
                        {TECH_A11Y.slice(0, 2).map((a) => (
                          <OptionGrid key={a.id} label={a.employerQuestion} options={STATUS} value={t.accessibility?.[a.id]?.status ?? null} onChange={(v) => set({ technology: job.technology.map((x, idx) => (idx !== i ? x : { ...x, accessibility: { ...x.accessibility, ...(v ? { [a.id]: { status: v as EvidenceStatus, source: 'employer', confirmedOn: today() } } : {}) } })) })} />
                        ))}
                      </InlineGrid>
                    </BlockStack>
                  ))}
                </BlockStack>
              </section>
            )}

            <section aria-labelledby="acc">
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg" id="acc">
                  Accessibility for this job
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Workplace-wide answers come from your <Link to="/employer/accessibility">Workplace Accessibility Profile</Link>. These are specific to this role.
                </Text>
                <InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
                  {JOB_EVIDENCE_FEATURES.map((f) => (
                    <EvidencePicker key={f.id} question={f.employerQuestion ?? f.label} evidence={job.accessibility[f.id]} onChange={(s, n) => setEvidence(f.id, s, n)} />
                  ))}
                </InlineGrid>
              </BlockStack>
            </section>

            <section aria-labelledby="hir">
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg" id="hir">
                  Hiring
                </Text>
                {(['demonstrate', 'interview', 'workplace'] as const).map((g) => (
                  <OptionGrid key={g} label={g === 'demonstrate' ? 'Ways to demonstrate skills' : g === 'interview' ? 'Interview accessibility' : 'Workplace flexibility'} multiple options={HIRING_OPTIONS.filter((h) => h.group === g).map((h) => ({ value: h.id, label: h.label, helpText: h.description }))} value={job.hiringOptions.filter((h) => HIRING_OPTIONS.find((x) => x.id === h)?.group === g)} onChange={(v) => set({ hiringOptions: [...job.hiringOptions.filter((h) => HIRING_OPTIONS.find((x) => x.id === h)?.group !== g), ...(v as HiringOptionId[])] })} />
                ))}
                <TextField label="How a candidate asks for an adjustment" value={job.accommodationRoute} onChange={(v) => set({ accommodationRoute: v })} autoComplete="off" helpText="Prefilled from your workplace profile." />
                {!job.hiringStages.some((s) => s.description.trim()) && (
                  <Banner tone="info">
                    <p>Describe your hiring steps in the <Link to={`/employer/jobs/${job.id}/edit`}>full editor</Link>, step 6. Candidates see them before they apply.</p>
                  </Banner>
                )}
              </BlockStack>
            </section>

            <div className="ow-onboard__foot">
              <Button url={`/employer/jobs/${job.id}/edit`} variant="plain">
                Open the full editor
              </Button>
              <InlineStack gap="200">
                <Button onClick={() => save(false)}>Save</Button>
                <Button variant="primary" size="large" onClick={() => save(true)}>
                  {job.status === 'published' ? 'Save and publish changes' : 'Publish job'}
                </Button>
              </InlineStack>
            </div>
          </BlockStack>
        </div>
        <aside className="ow-aside">
          <div className="ow-sheet ow-aside__card">
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Accessibility and clarity review
              </Text>
              <ul className="ow-facts" aria-label="Review">
                {review.map((r, i) => {
                  const I = ICON[r.state];
                  return (
                    <li key={i} className={`ow-fact ow-fact--${r.state === 'ok' ? 'ok' : r.state === 'warn' ? 'warn' : 'info'}`}>
                      <I />
                      <Text as="p" variant="bodySm">
                        {r.text}
                      </Text>
                    </li>
                  );
                })}
              </ul>
              {review.filter((r) => r.phrase).map((r) => (
                <BlockStack key={r.phrase} gap="200">
                  <Text as="h3" variant="headingSm">
                    “{r.phrase}”
                  </Text>
                  <MakeConcrete item={r} onApply={makeConcrete} />
                  <SuggestRewrite kind="requirement" label="Or let Openwork draft it" text={r.phrase!} context={{ jobTitle: job.title, tasks: job.tasks }} onUse={(v) => replaceReq(r.phrase!, v)} />
                </BlockStack>
              ))}
              <Text as="p" variant="bodySm" tone="subdued">
                Updates as you answer. Skip anything you are not sure about; it shows candidates as “Not provided”, never as a guess. Nothing here changes what the job requires.
              </Text>
            </BlockStack>
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
}