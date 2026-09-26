import type { EmploymentType } from './types';

export interface ImportedJob {
  title: string;
  location: string;
  employmentType: EmploymentType;
  salaryMin: number;
  salaryMax: number;
  salaryUnit: 'hour' | 'year';
  summary: string;
  tasks: string[];
  essentialRequirements: string[];
  skills: string[];
}

export const IMPORT_OFFLINE = 'Importing needs the Openwork server. It is off in this preview.';

/** Reads a public careers page through /api/import-jobs. Throws a plain-English message when the server is absent or declines. */
export async function importJobsFrom(url: string): Promise<ImportedJob[]> {
  let res: Response;
  try {
    res = await fetch('/api/import-jobs', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ url }) });
  } catch {
    throw new Error(IMPORT_OFFLINE);
  }
  if (!res.headers.get('content-type')?.includes('application/json')) throw new Error(IMPORT_OFFLINE);
  const data = (await res.json()) as { jobs?: ImportedJob[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Import is unavailable right now.');
  return data.jobs ?? [];
}
