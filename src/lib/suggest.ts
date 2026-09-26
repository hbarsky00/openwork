export type SuggestKind = 'summary' | 'experience' | 'answer';

export interface SuggestContext {
  headline?: string;
  skills?: string[];
  strengths?: string[];
  jobTitle?: string;
  jobSkills?: string[];
  /** For kind 'answer': everything the model may use. */
  facts?: string[];
}

export const SUGGEST_OFFLINE = 'Suggestions need the Openwork server. They are off in this preview.';

/** Three rewrites from /api/suggest. Throws a plain-English message when the backend is absent or declines. */
export async function suggestRewrites(kind: SuggestKind, text: string, context: SuggestContext): Promise<string[]> {
  let res: Response;
  try {
    res = await fetch('/api/suggest', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ kind, text, context }) });
  } catch {
    throw new Error(SUGGEST_OFFLINE);
  }
  const json = res.headers.get('content-type')?.includes('application/json');
  if (!json) throw new Error(SUGGEST_OFFLINE);
  const data = (await res.json()) as { suggestions?: string[]; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Suggestions are unavailable right now.');
  return data.suggestions ?? [];
}
