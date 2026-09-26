import { Banner, BlockStack, Button, Checkbox, InlineStack, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { importJobsFrom, type ImportedJob } from '../../lib/importJobs';
import { writeImportDraft } from '../../lib/postDraft';
import { useTitle } from '../../lib/useTitle';
import type { Job } from '../../lib/types';
import { useStore } from '../../state/store';
import { blankJob } from './JobBuilder';

/** Turn one imported posting into a draft job. Everything an ATS never carries stays empty until Enrich. */
export function importedToJob(j: ImportedJob, employerId: string, accommodationRoute: string, source: string, i: number): Job {
  const base = blankJob(employerId);
  return { ...base, id: `${base.id}-${i}`, title: j.title, location: j.location || '', employmentType: j.employmentType || 'fullTime', salaryMin: Number(j.salaryMin) || 0, salaryMax: Number(j.salaryMax) || 0, salaryUnit: j.salaryUnit === 'year' ? 'year' : 'hour', summary: j.summary || '', tasks: j.tasks ?? [], essentialRequirements: j.essentialRequirements ?? [], skills: j.skills ?? [], accommodationRoute, status: 'draft', source: 'imported', importedFrom: source };
}

/**
 * Paste a careers page. Openwork reads the postings; you choose which to
 * import. Works before you have an account: the chosen jobs wait in this
 * browser and land in your account at sign-up.
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
      setError(e instanceof Error ? e.message : 'Import is unavailable right now.');
    } finally {
      setBusy(false);
    }
  };

  const chosen = found.filter((_, i) => picked.has(i));
  const readyCount = chosen.filter((j) => j.salaryMax && (j.tasks?.length ?? 0) >= 3).length;

  const add = () => {
    if (!employer) {
      writeImportDraft({ url: url.trim(), jobs: chosen });
      navigate('/employers/signup?from=import');
      return;
    }
    chosen.forEach((j, i) => dispatch({ type: 'upsertJob', job: importedToJob(j, employer.id, employer.workplace.accommodationRoute, url.trim(), i) }));
    navigate(`/employer/jobs?tab=imported&imported=${chosen.length}`);
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <Link to={employer ? '/employer/jobs' : '/for-employers'} className="ow-backlink">
            {employer ? '← Jobs' : '← For employers'}
          </Link>
        </div>
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Import your jobs
          </Text>
          <Text as="p" tone="subdued">
            Paste your careers page. Openwork reads every open role and brings in title, location, pay, tasks and requirements. Then you add only what an ATS never says.
          </Text>
        </BlockStack>
        <div className="ow-sheet">
          <BlockStack gap="400">
            <TextField label="Company careers URL" type="url" value={url} onChange={setUrl} autoComplete="url" placeholder="careers.yourcompany.com" />
            <InlineStack gap="200" blockAlign="center" wrap>
              <Button variant="primary" size="large" loading={busy} disabled={!url.trim()} onClick={run}>
                Find my jobs
              </Button>
              {!employer && (
                <Text as="span" variant="bodySm" tone="subdued">
                  No account yet. You create it after choosing the jobs.
                </Text>
              )}
            </InlineStack>
            {error && (
              <Banner tone={found.length ? 'info' : 'warning'}>
                <p>{error}</p>
              </Banner>
            )}
          </BlockStack>
        </div>

        {found.length > 0 && (
          <div className="ow-sheet">
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center" wrap gap="300">
                <BlockStack gap="050">
                  <Text as="h2" variant="headingLg">
                    We found {found.length} open position{found.length === 1 ? '' : 's'}.
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {chosen.length} selected · {readyCount} ready to publish · {chosen.length - readyCount} need information
                  </Text>
                </BlockStack>
                <InlineStack gap="200">
                  <Button onClick={() => setPicked(new Set(found.map((_, i) => i)))} disabled={picked.size === found.length}>
                    Select all
                  </Button>
                  <Button variant="plain" onClick={() => setPicked(new Set())} disabled={picked.size === 0}>
                    Clear
                  </Button>
                </InlineStack>
              </InlineStack>
              <ul className="ow-picked ow-picked--stack" aria-label="Postings found">
                {found.map((j, i) => {
                  const ready = !!j.salaryMax && (j.tasks?.length ?? 0) >= 3;
                  return (
                    <li key={i} className="ow-picked__row ow-picked__row--tall">
                      <Checkbox
                        label={
                          <span>
                            <strong>{j.title}</strong>
                            <br />
                            <Text as="span" variant="bodySm" tone="subdued">
                              {[j.location, j.salaryMax ? `$${j.salaryMin}–$${j.salaryMax}/${j.salaryUnit === 'year' ? 'yr' : 'hr'}` : 'Pay not stated', ready ? 'Ready' : 'Needs information'].filter(Boolean).join(' · ')}
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
                  {employer ? `Import ${picked.size}` : `Continue with ${picked.size}`}
                </Button>
              </InlineStack>
            </BlockStack>
          </div>
        )}
        <Text as="p" variant="bodySm" tone="subdued">
          Prefer a live connection? <Link to={employer ? '/employer/connect' : '/connect'}>Connect your ATS</Link>.
        </Text>
      </BlockStack>
    </div>
  );
}
