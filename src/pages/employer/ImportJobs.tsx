import { Banner, BlockStack, Button, Checkbox, InlineStack, ProgressBar, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { importJobsFrom, type ImportedJob } from '../../lib/importJobs';
import { originKey } from '../../lib/jobs';
import { writeImportDraft } from '../../lib/postDraft';
import type { Job } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';
import { blankJob } from './JobBuilder';

const today = () => new Date().toISOString().slice(0, 10);

/** An imported posting is ready to publish when candidates can judge pay and the work. */
export function importedIsReady(j: ImportedJob): boolean {
  return !!j.salaryMax && (j.tasks?.length ?? 0) >= 3 && !!j.summary?.trim();
}

/**
 * Turn one posting into a draft job, carrying its origin so a later import of
 * the same posting updates it instead of creating a second copy.
 */
export function importedToJob(j: ImportedJob, employerId: string, accommodationRoute: string, sourceUrl: string, batchId: string, i: number, existing?: Job): Job {
  const base = existing ?? blankJob(employerId);
  return {
    ...base,
    id: existing?.id ?? `${base.id}-${i}`,
    title: j.title,
    location: j.location || '',
    employmentType: j.employmentType || 'fullTime',
    salaryMin: Number(j.salaryMin) || 0,
    salaryMax: Number(j.salaryMax) || 0,
    salaryUnit: j.salaryUnit === 'year' ? 'year' : 'hour',
    summary: j.summary || '',
    tasks: j.tasks ?? [],
    essentialRequirements: j.essentialRequirements ?? [],
    skills: j.skills ?? [],
    accommodationRoute: existing?.accommodationRoute || accommodationRoute,
    status: existing?.status ?? 'draft',
    origin: {
      kind: 'careersPage',
      externalId: j.externalId ?? j.title,
      url: sourceUrl,
      importedOn: existing?.origin?.importedOn ?? today(),
      lastSyncedOn: today(),
      sourceStatus: 'open',
      syncStatus: 'oneOff',
      batchId,
    },
  };
}

/**
 * Paste a careers page. Openwork reads the postings; you choose which to bring
 * in. Works before you have an account: the chosen jobs wait in this browser
 * and land in your account at sign-up.
 */
export function ImportJobs() {
  useTitle('Import jobs');
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const employer = state.employers.find((e) => e.id === state.employerId) ?? null;
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<ImportedJob[]>([]);
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const mine = employer ? state.jobs.filter((j) => j.employerId === employer.id) : [];
  const byKey = new Map(mine.filter((j) => j.origin?.externalId).map((j) => [originKey(j.employerId, j.origin!.externalId, j.title), j]));
  const existingFor = (j: ImportedJob) => (employer ? byKey.get(originKey(employer.id, j.externalId, j.title)) : undefined);

  const run = async () => {
    setBusy(true);
    setError(null);
    setFound([]);
    try {
      const jobs = await importJobsFrom(url.trim());
      setFound(jobs);
      setPicked(new Set(jobs.map((_, i) => i)));
      if (jobs.length === 0) setError('No job postings found on that page.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Importing is unavailable right now.');
    } finally {
      setBusy(false);
    }
  };

  const chosen = found.filter((_, i) => picked.has(i));
  const readyCount = chosen.filter(importedIsReady).length;
  const updates = chosen.filter((j) => existingFor(j)).length;

  const add = () => {
    if (!employer) {
      writeImportDraft({ url: url.trim(), jobs: chosen });
      navigate('/employers/signup?from=import');
      return;
    }
    const batchId = `b-${Date.now().toString(36)}`;
    chosen.forEach((j, i) => dispatch({ type: 'upsertJob', job: importedToJob(j, employer.id, employer.workplace.accommodationRoute, url.trim(), batchId, i, existingFor(j)) }));
    navigate(`/employer/jobs/import/review?batch=${batchId}`);
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <Link to={employer ? '/employer/jobs' : '/employers'} className="ow-backlink">
            {employer ? '← Jobs' : '← For employers'}
          </Link>
        </div>
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Import your existing jobs
          </Text>
          <Text as="p" tone="subdued">
            Paste your company careers page. Openwork identifies the openings that can be brought into your account, with title, location, pay, tasks and requirements. You add only what a careers page never says.
          </Text>
        </BlockStack>

        <div className="ow-sheet">
          <BlockStack gap="400">
            <TextField label="Careers page URL" type="url" value={url} onChange={setUrl} autoComplete="url" placeholder="https://company.com/careers" disabled={busy} />
            <InlineStack gap="300" blockAlign="center" wrap>
              <Button variant="primary" size="large" loading={busy} disabled={!url.trim()} onClick={run}>
                Find my jobs
              </Button>
              {!employer && (
                <Text as="span" variant="bodySm" tone="subdued">
                  No account yet. You create it after choosing the jobs.
                </Text>
              )}
            </InlineStack>
            {busy && (
              <BlockStack gap="100">
                <ProgressBar progress={70} size="small" tone="primary" />
                <Text as="p" variant="bodySm" tone="subdued">
                  Finding open positions…
                </Text>
              </BlockStack>
            )}
            {error && (
              <Banner tone={found.length ? 'info' : 'warning'}>
                <p>{error}</p>
              </Banner>
            )}
            <Text as="p" variant="bodyXs" tone="subdued">
              Openwork reads only the address you give it, identifies itself, and stops if the site asks automated readers not to fetch that page. For jobs that should stay in step automatically, <Link to={employer ? '/employer/connect' : '/connect'}>connect your hiring system</Link>.
            </Text>
          </BlockStack>
        </div>

        {found.length > 0 && (
          <div className="ow-sheet">
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                <BlockStack gap="050">
                  <Text as="h2" variant="headingLg">
                    We found {found.length} job{found.length === 1 ? '' : 's'}.
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {chosen.length} selected · {readyCount} ready to publish · {chosen.length - readyCount} need information
                    {updates > 0 ? ` · ${updates} already in your account and will be updated, not duplicated` : ''}
                  </Text>
                </BlockStack>
                <InlineStack gap="200">
                  <Checkbox label="Select all" checked={picked.size === found.length} onChange={(on) => setPicked(on ? new Set(found.map((_, i) => i)) : new Set())} />
                </InlineStack>
              </InlineStack>
              <ul className="ow-picked ow-picked--stack" aria-label="Postings found">
                {found.map((j, i) => {
                  const dupe = existingFor(j);
                  return (
                    <li key={`${j.externalId ?? j.title}-${i}`} className="ow-picked__row ow-picked__row--tall">
                      <Checkbox
                        label={
                          <span>
                            <strong>{j.title}</strong>
                            <br />
                            <Text as="span" variant="bodySm" tone="subdued">
                              {[j.location || 'Location not stated', j.salaryMax ? `$${j.salaryMin}–$${j.salaryMax}/${j.salaryUnit === 'year' ? 'yr' : 'hr'}` : 'Pay not stated', importedIsReady(j) ? 'Ready' : 'Needs information', dupe ? 'Already imported — will update' : null].filter(Boolean).join(' · ')}
                            </Text>
                          </span>
                        }
                        checked={picked.has(i)}
                        onChange={(on) => setPicked((s) => { const n = new Set(s); if (on) n.add(i); else n.delete(i); return n; })}
                      />
                    </li>
                  );
                })}
              </ul>
              <InlineStack gap="200">
                <Button variant="primary" size="large" disabled={picked.size === 0} onClick={add}>
                  {employer ? `Import ${picked.size} job${picked.size === 1 ? '' : 's'}` : `Continue with ${picked.size}`}
                </Button>
              </InlineStack>
            </BlockStack>
          </div>
        )}
      </BlockStack>
    </div>
  );
}
