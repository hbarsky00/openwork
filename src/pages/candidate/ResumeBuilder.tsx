import { BlockStack, Button, Checkbox, FormLayout, InlineStack, Select, Text, TextField } from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { OptionCard, OptionCards } from '../../components/OptionCard';
import type { CandidateProfile, Experience } from '../../lib/types';
import { SuggestRewrite } from '../../components/SuggestRewrite';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

type Template = 'classic' | 'modern';
const KIND: Record<Experience['kind'], string> = { paid: '', volunteer: 'Volunteer', school: 'School placement', project: 'Project' };

/**
 * Résumé builder. Left: the profile fields that make a résumé, editable in
 * place (they ARE the profile — one source of truth). Right: the résumé,
 * live, in one of two templates. Tailor to a job to lead with the skills and
 * strengths that job lists. Download = print to PDF; no library, no upload.
 */
export function ResumeBuilder() {
  useTitle('Résumé');
  const { state, dispatch } = useStore();
  const p = state.candidate!;
  const patch = (x: Partial<CandidateProfile>) => dispatch({ type: 'updateCandidate', patch: x });
  const [template, setTemplate] = useState<Template>('modern');
  const [jobId, setJobId] = useState('');
  const [show, setShow] = useState({ summary: true, strengths: true, skills: true, experience: true, education: true, phone: !!p.phone });
  const [newExp, setNewExp] = useState<Experience | null>(null);

  const job = state.jobs.find((j) => j.id === jobId) ?? null;
  const employer = job ? state.employers.find((e) => e.id === job.employerId) : null;

  // Tailoring: skills and strengths the job lists come first; nothing is invented.
  const ordered = useMemo(() => {
    const lower = (s: string) => s.toLowerCase();
    const wants = new Set([...(job?.skills ?? []), ...(job?.strengthsUsed ?? [])].map(lower));
    const rank = (list: string[]) => [...list].sort((a, b) => Number(wants.has(lower(b))) - Number(wants.has(lower(a))));
    return { skills: rank(p.skills), strengths: rank(p.strengths), matched: [...p.skills, ...p.strengths].filter((s) => wants.has(lower(s))).length };
  }, [p.skills, p.strengths, job]);

  const ctx = { headline: p.headline, skills: p.skills, strengths: p.strengths, jobTitle: job?.title, jobSkills: job ? [...job.skills, ...job.strengthsUsed] : undefined };
  const fileName = `${p.name.replace(/\s+/g, '_')}_Resume${job ? `_${job.title.replace(/[^A-Za-z0-9]+/g, '_')}` : ''}.pdf`;
  const download = () => {
    patch({ resumeFileName: fileName });
    window.print();
  };

  return (
    <div className="ow-container ow-container--fluid ow-resume">
      <div className="ow-pagehead ow-resume__head">
        <BlockStack gap="050">
          <Text as="h1" variant="heading2xl">
            Résumé
          </Text>
          <Text as="p" tone="subdued">
            Edits here update your profile too. Download saves it as the résumé that goes with your applications.
          </Text>
        </BlockStack>
        <div className="ow-resume__tools">
          <Select label="Tailor to a job" labelInline options={[{ label: 'No job — general', value: '' }, ...state.jobs.filter((j) => j.status === 'published').map((j) => ({ label: `${j.title} · ${state.employers.find((e) => e.id === j.employerId)?.name ?? ''}`, value: j.id }))]} value={jobId} onChange={setJobId} />
          <Button variant="primary" onClick={download}>
            Download PDF
          </Button>
        </div>
      </div>

      <div className="ow-resume__cols">
        <aside className="ow-resume__editor" aria-label="Résumé content">
          <div className="ow-sheet ow-aside__card">
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text as="h2" variant="headingSm">
                  Template
                </Text>
                <OptionCards>
                  <OptionCard title="Modern" help="Name block, two columns, strengths up front." selected={template === 'modern'} onClick={() => setTemplate('modern')} />
                  <OptionCard title="Classic" help="One column, plain headings. Safest for automated screening." selected={template === 'classic'} onClick={() => setTemplate('classic')} />
                </OptionCards>
              </BlockStack>

              {job && (
                <div className="ow-why" role="status">
                  <Text as="p" variant="bodySm">
                    <strong>Tailored to {job.title}</strong> at {employer?.name}. {ordered.matched} of your skills and strengths match what this job lists; they lead each section. Nothing is added that you did not enter.
                  </Text>
                </div>
              )}

              <BlockStack gap="300">
                <Text as="h2" variant="headingSm">
                  Header
                </Text>
                <FormLayout>
                  <TextField label="Name" value={p.name} onChange={(v) => patch({ name: v })} autoComplete="name" />
                  <TextField label="Headline" value={p.headline} onChange={(v) => patch({ headline: v })} autoComplete="off" placeholder="e.g. Records and data entry specialist" />
                  <FormLayout.Group>
                    <TextField label="Email" type="email" value={p.email} onChange={(v) => patch({ email: v })} autoComplete="email" />
                    <TextField label="Phone" type="tel" value={p.phone} onChange={(v) => patch({ phone: v })} autoComplete="tel" />
                  </FormLayout.Group>
                  <TextField label="Location" value={p.location} onChange={(v) => patch({ location: v })} autoComplete="address-level2" />
                  <Checkbox label="Show phone on résumé" checked={show.phone} onChange={(v) => setShow({ ...show, phone: v })} />
                </FormLayout>
              </BlockStack>

              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingSm">
                    Summary
                  </Text>
                  <Checkbox label="Show" checked={show.summary} onChange={(v) => setShow({ ...show, summary: v })} />
                </InlineStack>
                <TextField label="Summary" labelHidden value={p.about} onChange={(v) => patch({ about: v })} multiline={4} autoComplete="off" placeholder="Two or three sentences: what you do well and what you are looking for." />
                <SuggestRewrite kind="summary" text={p.about} context={ctx} onUse={(v) => patch({ about: v })} />
              </BlockStack>

              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingSm">
                    Experience
                  </Text>
                  <InlineStack gap="200">
                    <Checkbox label="Show" checked={show.experience} onChange={(v) => setShow({ ...show, experience: v })} />
                    {!newExp && <Button size="slim" onClick={() => setNewExp({ id: `e-${Date.now()}`, kind: p.firstJob ? 'school' : 'paid', title: '', organization: '', startYear: new Date().getFullYear(), endYear: null, summary: '' })}>Add</Button>}
                  </InlineStack>
                </InlineStack>
                {newExp && (
                  <div className="ow-subsheet">
                    <FormLayout>
                      <Select label="Kind" options={[{ label: 'Paid work', value: 'paid' }, { label: 'Volunteering', value: 'volunteer' }, { label: 'School or program', value: 'school' }, { label: 'Project', value: 'project' }]} value={newExp.kind} onChange={(v) => setNewExp({ ...newExp, kind: v as Experience['kind'] })} />
                      <TextField label="Role or what you did" value={newExp.title} onChange={(v) => setNewExp({ ...newExp, title: v })} autoComplete="off" />
                      <TextField label="Where" value={newExp.organization} onChange={(v) => setNewExp({ ...newExp, organization: v })} autoComplete="organization" />
                      <FormLayout.Group>
                        <TextField label="Start year" type="number" value={String(newExp.startYear)} onChange={(v) => setNewExp({ ...newExp, startYear: Number(v) })} autoComplete="off" />
                        <TextField label="End year (blank if current)" type="number" value={newExp.endYear?.toString() ?? ''} onChange={(v) => setNewExp({ ...newExp, endYear: v ? Number(v) : null })} autoComplete="off" />
                      </FormLayout.Group>
                      <TextField label="What you did, one or two sentences" value={newExp.summary} onChange={(v) => setNewExp({ ...newExp, summary: v })} multiline={2} autoComplete="off" />
                      <InlineStack gap="200">
                        <Button variant="primary" disabled={!newExp.title.trim()} onClick={() => { patch({ experience: [newExp, ...p.experience] }); setNewExp(null); }}>
                          Add to résumé
                        </Button>
                        <Button onClick={() => setNewExp(null)}>Cancel</Button>
                      </InlineStack>
                    </FormLayout>
                  </div>
                )}
                {p.experience.map((e, i) => (
                  <div key={e.id} className="ow-subsheet">
                    <FormLayout>
                      <TextField label="Role" value={e.title} onChange={(v) => patch({ experience: p.experience.map((x) => (x.id === e.id ? { ...x, title: v } : x)) })} autoComplete="off" />
                      <FormLayout.Group>
                        <TextField label="Where" value={e.organization} onChange={(v) => patch({ experience: p.experience.map((x) => (x.id === e.id ? { ...x, organization: v } : x)) })} autoComplete="off" />
                        <TextField label="Years" value={`${e.startYear}–${e.endYear ?? 'present'}`} disabled autoComplete="off" />
                      </FormLayout.Group>
                      <TextField label="What you did" value={e.summary} onChange={(v) => patch({ experience: p.experience.map((x) => (x.id === e.id ? { ...x, summary: v } : x)) })} multiline={2} autoComplete="off" />
                      <SuggestRewrite kind="experience" text={e.summary} context={{ ...ctx, jobTitle: ctx.jobTitle ?? e.title }} onUse={(v) => patch({ experience: p.experience.map((x) => (x.id === e.id ? { ...x, summary: v } : x)) })} />
                      <InlineStack gap="200">
                        {i > 0 && (
                          <Button size="slim" onClick={() => { const arr = [...p.experience]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; patch({ experience: arr }); }}>
                            Move up
                          </Button>
                        )}
                        <Button size="slim" variant="plain" tone="critical" onClick={() => patch({ experience: p.experience.filter((x) => x.id !== e.id) })}>
                          Remove
                        </Button>
                      </InlineStack>
                    </FormLayout>
                  </div>
                ))}
              </BlockStack>

              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingSm">
                    Skills
                  </Text>
                  <Checkbox label="Show" checked={show.skills} onChange={(v) => setShow({ ...show, skills: v })} />
                </InlineStack>
                <TextField label="Skills" labelHidden value={p.skills.join(', ')} onChange={(v) => patch({ skills: v.split(',').map((s) => s.trimStart()) })} onBlur={() => patch({ skills: p.skills.map((s) => s.trim()).filter(Boolean) })} autoComplete="off" helpText="Comma separated." />
              </BlockStack>

              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingSm">
                    Strengths
                  </Text>
                  <Checkbox label="Show" checked={show.strengths} onChange={(v) => setShow({ ...show, strengths: v })} />
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  From your profile. <Button variant="plain" url="/passport">Edit strengths</Button>
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingSm">
                    Education and training
                  </Text>
                  <Checkbox label="Show" checked={show.education} onChange={(v) => setShow({ ...show, education: v })} />
                </InlineStack>
                {p.education.map((ed) => (
                  <FormLayout key={ed.id}>
                    <FormLayout.Group>
                      <TextField label="Credential" value={ed.credential} onChange={(v) => patch({ education: p.education.map((x) => (x.id === ed.id ? { ...x, credential: v } : x)) })} autoComplete="off" />
                      <TextField label="Where" value={ed.institution} onChange={(v) => patch({ education: p.education.map((x) => (x.id === ed.id ? { ...x, institution: v } : x)) })} autoComplete="off" />
                    </FormLayout.Group>
                  </FormLayout>
                ))}
                <InlineStack>
                  <Button size="slim" onClick={() => patch({ education: [...p.education, { id: `ed-${Date.now()}`, credential: '', institution: '', year: null }] })}>
                    Add
                  </Button>
                </InlineStack>
              </BlockStack>
            </BlockStack>
          </div>
        </aside>

        <section className="ow-resume__preview" aria-label="Résumé preview">
          <article className={`ow-cv ow-cv--${template}`} id="cv">
            <header className="ow-cv__head">
              <h1>{p.name || 'Your name'}</h1>
              {p.headline && <p className="ow-cv__headline">{p.headline}</p>}
              <p className="ow-cv__contact">{[p.email, show.phone && p.phone, p.location].filter(Boolean).join(' · ')}</p>
            </header>
            <div className="ow-cv__body">
              <div className="ow-cv__main">
                {show.summary && p.about && (
                  <section>
                    <h2>Summary</h2>
                    <p>{p.about}</p>
                  </section>
                )}
                {show.experience && p.experience.length > 0 && (
                  <section>
                    <h2>Experience</h2>
                    {p.experience.map((e) => (
                      <div key={e.id} className="ow-cv__item">
                        <div className="ow-cv__row">
                          <strong>{e.title}</strong>
                          <span>
                            {e.startYear}–{e.endYear ?? 'present'}
                          </span>
                        </div>
                        <div className="ow-cv__sub">
                          {e.organization}
                          {KIND[e.kind] ? ` · ${KIND[e.kind]}` : ''}
                        </div>
                        {e.summary && <p>{e.summary}</p>}
                      </div>
                    ))}
                  </section>
                )}
                {show.education && p.education.length > 0 && (
                  <section>
                    <h2>Education and training</h2>
                    {p.education.map((ed) => (
                      <div key={ed.id} className="ow-cv__item">
                        <div className="ow-cv__row">
                          <strong>{ed.credential}</strong>
                          {ed.year && <span>{ed.year}</span>}
                        </div>
                        <div className="ow-cv__sub">{ed.institution}</div>
                      </div>
                    ))}
                  </section>
                )}
              </div>
              <div className="ow-cv__side">
                {show.skills && ordered.skills.length > 0 && (
                  <section>
                    <h2>Skills</h2>
                    <ul>
                      {ordered.skills.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {show.strengths && ordered.strengths.length > 0 && (
                  <section>
                    <h2>Strengths</h2>
                    <ul>
                      {ordered.strengths.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
