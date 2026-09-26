import { Banner, BlockStack, Button, Checkbox, InlineStack, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { importJobsFrom, type ImportedJob } from '../../lib/importJobs';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';
import { blankJob } from './JobBuilder';

/** Paste a careers page. Openwork reads the postings and adds the ones you tick as drafts, so you only answer the accessibility questions. */
export function ImportJobs() {
  useTitle('Import jobs');
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
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

  const add = () => {
    let n = 0;
    found.forEach((j, i) => {
      if (!picked.has(i)) return;
      const base = blankJob(employer.id);
      dispatch({ type: 'upsertJob', job: { ...base, id: `${base.id}-${i}`, title: j.title, location: j.location || '', employmentType: j.employmentType || 'fullTime', salaryMin: Number(j.salaryMin) || 0, salaryMax: Number(j.salaryMax) || 0, salaryUnit: j.salaryUnit === 'year' ? 'year' : 'hour', summary: j.summary || '', tasks: j.tasks ?? [], essentialRequirements: j.essentialRequirements ?? [], skills: j.skills ?? [], accommodationRoute: employer.workplace.accommodationRoute, status: 'draft' } });
      n += 1;
    });
    navigate(`/employer/jobs?imported=${n}`);
  };

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <div className="ow-pagehead">
          <Button variant="plain" url="/employer/jobs">
            ← Jobs
          </Button>
        </div>
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Import from your careers page
          </Text>
          <Text as="p" tone="subdued">
            Paste the address of your careers page or a single posting. Openwork reads the title, location, pay, tasks and requirements. Each job lands as a draft, and you finish the accessibility questions before it goes live.
          </Text>
        </BlockStack>
        <div className="ow-sheet">
          <BlockStack gap="400">
            <TextField label="Careers page address" type="url" value={url} onChange={setUrl} autoComplete="url" placeholder="https://yourcompany.com/careers" />
            <InlineStack gap="200">
              <Button variant="primary" size="large" loading={busy} disabled={!url.trim()} onClick={run}>
                Find jobs
              </Button>
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
              <Text as="h2" variant="headingLg">
                {found.length} posting{found.length === 1 ? '' : 's'} found
              </Text>
              <ul className="ow-picked ow-picked--stack" aria-label="Postings found">
                {found.map((j, i) => (
                  <li key={i} className="ow-picked__row ow-picked__row--tall">
                    <Checkbox
                      label={
                        <span>
                          <strong>{j.title}</strong>
                          <br />
                          <Text as="span" variant="bodySm" tone="subdued">
                            {[j.location, j.salaryMax ? `$${j.salaryMin}–$${j.salaryMax}/${j.salaryUnit === 'year' ? 'yr' : 'hr'}` : 'Pay not stated', `${(j.tasks ?? []).length} tasks`].filter(Boolean).join(' · ')}
                          </Text>
                        </span>
                      }
                      checked={picked.has(i)}
                      onChange={(on) => setPicked((s) => { const n = new Set(s); if (on) n.add(i); else n.delete(i); return n; })}
                    />
                  </li>
                ))}
              </ul>
              <InlineStack gap="200">
                <Button variant="primary" size="large" disabled={picked.size === 0} onClick={add}>
                  {`Add ${picked.size} as draft${picked.size === 1 ? '' : 's'}`}
                </Button>
              </InlineStack>
            </BlockStack>
          </div>
        )}
      </BlockStack>
    </div>
  );
}
