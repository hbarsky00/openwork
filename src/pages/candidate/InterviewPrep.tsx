import { BlockStack, Button, InlineStack, List, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SuggestRewrite } from '../../components/SuggestRewrite';
import { HIRING_OPTION_BY_ID } from '../../lib/access';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';
import { NotFound } from '../public/NotFound';

const DRAFTS_KEY = 'openwork.interviewDrafts';
const readDrafts = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? '{}'); } catch { return {}; } };

/**
 * Everything the candidate needs before an interview or work sample, on one
 * page: what, when, how long, who, what is arranged, what to expect, the
 * questions, and their own notes. Talking points come from their profile, not
 * invented. AI drafts answers only from those same facts.
 */
export function InterviewPrep() {
  const { id } = useParams();
  const { state } = useStore();
  const p = state.candidate!;
  const app = state.applications.find((a) => a.id === id && a.candidateId === p.id);
  const job = app ? state.jobs.find((j) => j.id === app.jobId) : null;
  const employer = job ? state.employers.find((e) => e.id === job.employerId) : null;
  const [drafts, setDrafts] = useState<Record<string, string>>(readDrafts);
  useTitle(job ? `Prepare · ${job.title}` : 'Prepare');
  if (!app || !job || !employer) return <NotFound message="We could not find that application." />;
  const iv = app.interview;
  const stage = job.hiringStages.find((s) => (iv?.kind === 'assessment' ? /sample|assess|test/i.test(s.name) : /interview/i.test(s.name)));
  const lower = (x: string) => x.toLowerCase();
  const wanted = new Set([...job.skills, ...job.strengthsUsed].map(lower));
  const relevantExp = p.experience.filter((e) => [e.title, e.summary].some((t) => [...wanted].some((w) => lower(t).includes(w.split(' ')[0]))));
  const matchedSkills = [...p.skills, ...p.strengths].filter((s) => wanted.has(lower(s)));
  const talking = [
    ...matchedSkills.slice(0, 4).map((s) => `${s}: the job lists it, and it is on your profile. Have one concrete example ready.`),
    ...relevantExp.slice(0, 2).map((e) => `${e.title} at ${e.organization}: ${e.summary || 'say what you did and what changed because of it.'}`),
    ...(app.shared.accommodationRequest?.options.length ? [`You asked for ${app.shared.accommodationRequest.options.map((o) => HIRING_OPTION_BY_ID[o]?.label.toLowerCase()).join(' and ')}. ${employer.name} has that on file; you do not need to explain it again.`] : []),
  ];
  const facts = [p.headline, p.about, ...p.experience.map((e) => `${e.title} at ${e.organization} (${e.startYear}–${e.endYear ?? 'present'}): ${e.summary}`), `Skills: ${p.skills.join(', ')}`, `Strengths: ${p.strengths.join(', ')}`].filter(Boolean);
  const saveDraft = (q: string, v: string) => { const next = { ...drafts, [`${app.id}|${q}`]: v }; setDrafts(next); localStorage.setItem(DRAFTS_KEY, JSON.stringify(next)); };
  const questions = iv?.questions ?? [];

  return (
    <div className="ow-container ow-container--narrow">
      <div className="ow-pagehead">
        <Link to="/applications" className="ow-backlink">
          ← Applications
        </Link>
      </div>
      <BlockStack gap="500">
        <BlockStack gap="100">
          <Text as="h1" variant="heading2xl">
            {iv?.kind === 'assessment' ? 'Prepare for the work sample' : 'Prepare for the interview'}
          </Text>
          <Text as="p" tone="subdued">
            {job.title} at {employer.name}{iv ? ` · ${iv.when}` : ''}
          </Text>
        </BlockStack>

        {iv ? (
          <div className="ow-sheet">
            <BlockStack gap="400">
              <dl className="ow-details">
                <div className="ow-details__row"><dt>Format</dt><dd>{iv.format}</dd></div>
                <div className="ow-details__row"><dt>Length</dt><dd>{iv.length}</dd></div>
                {iv.interviewers && <div className="ow-details__row"><dt>Who</dt><dd>{iv.interviewers}</dd></div>}
                <div className="ow-details__row"><dt>What to expect</dt><dd>{iv.whatToExpect}</dd></div>
              </dl>
              {iv.arrangements.length > 0 && (
                <BlockStack gap="200">
                  <Text as="h2" variant="headingSm">
                    Arranged for you
                  </Text>
                  <ul className="ow-factlist ow-factlist--ok">
                    {iv.arrangements.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </BlockStack>
              )}
            </BlockStack>
          </div>
        ) : (
          <div className="ow-sheet">
            <Text as="p">
              {employer.name} has not shared the details yet. {stage ? `Their process says: ${stage.description}` : ''} You will see them here and by email.
            </Text>
          </div>
        )}

        <div className="ow-sheet">
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              What they are looking for
            </Text>
            <List type="bullet">
              {job.essentialRequirements.map((r) => (
                <List.Item key={r}>{r}</List.Item>
              ))}
            </List>
            {talking.length > 0 && (
              <BlockStack gap="200">
                <Text as="h2" variant="headingSm">
                  Your talking points
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Built from your profile. Nothing here is invented.
                </Text>
                <ul className="ow-factlist ow-factlist--ok">
                  {talking.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </BlockStack>
            )}
          </BlockStack>
        </div>

        {questions.length > 0 && (
          <div className="ow-sheet">
            <BlockStack gap="500">
              <BlockStack gap="100">
                <Text as="h2" variant="headingLg">
                  Their questions
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Shared in advance by {employer.name}. Draft your answers here; they stay on this device. Suggestions use only what is on your profile.
                </Text>
              </BlockStack>
              {questions.map((q, i) => (
                <BlockStack key={q} gap="200">
                  <Text as="h3" variant="headingSm">
                    {i + 1}. {q}
                  </Text>
                  <TextField label={`Your answer to question ${i + 1}`} labelHidden multiline={3} value={drafts[`${app.id}|${q}`] ?? ''} onChange={(v) => saveDraft(q, v)} autoComplete="off" placeholder="Notes or a full answer. Keep to one example." />
                  <SuggestRewrite kind="answer" label="Help me answer" text={q} context={{ headline: p.headline, skills: p.skills, strengths: p.strengths, jobTitle: job.title, jobSkills: [...job.skills, ...job.strengthsUsed], facts }} onUse={(v) => saveDraft(q, v)} />
                </BlockStack>
              ))}
            </BlockStack>
          </div>
        )}

        <InlineStack gap="200">
          <Button url={`/applications/${app.id}`}>Application details</Button>
          <Button url={`/jobs/${job.id}`} variant="plain">
            Open the job
          </Button>
        </InlineStack>
      </BlockStack>
    </div>
  );
}
