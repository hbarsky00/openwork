import Anthropic from '@anthropic-ai/sdk';
import type { Config } from '@netlify/functions';

const SYSTEM = `You read the text of a company careers page and list its open job postings.
Reply with ONLY a JSON array (no prose) of up to 40 objects:
{"title": string, "location": string, "employmentType": "fullTime"|"partTime"|"contract"|"apprenticeship", "salaryMin": number, "salaryMax": number, "salaryUnit": "hour"|"year", "summary": string, "tasks": string[], "essentialRequirements": string[], "skills": string[], "externalId": string}
Rules: use only what the page says. Unknown pay -> 0. Unknown type -> "fullTime". summary is 2-3 plain sentences in US English. tasks are concrete things the person does (3-6). essentialRequirements are must-haves (1-6). skills are tools and named skills (0-10). externalId is the posting's own link or id from the page when present, otherwise a lowercase hyphenated slug of the title. Never invent. No duplicates.`;

const strip = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const UA = 'OpenworkImport/1.0 (+https://open-work.tech/import; employer-authorized)';

/**
 * Honour robots.txt for our own user agent and for `*`. An employer asking us
 * to read their own page is authorised, but we still do not fetch a path the
 * site tells crawlers to leave alone.
 */
async function robotsAllows(target: URL): Promise<boolean> {
  try {
    const res = await fetch(new URL('/robots.txt', target.origin), { signal: AbortSignal.timeout(5000), headers: { 'user-agent': UA } });
    if (!res.ok) return true;
    const text = (await res.text()).slice(0, 100000);
    let applies = false;
    const disallowed: string[] = [];
    for (const raw of text.split('\n')) {
      const line = raw.split('#')[0].trim();
      if (!line) continue;
      const [key, ...rest] = line.split(':');
      const value = rest.join(':').trim();
      const k = key.trim().toLowerCase();
      if (k === 'user-agent') applies = value === '*' || value.toLowerCase().startsWith('openwork');
      else if (k === 'disallow' && applies && value) disallowed.push(value);
      else if (k === 'allow' && applies && value === target.pathname) return true;
    }
    return !disallowed.some((d) => d === '/' || target.pathname.startsWith(d));
  } catch {
    return true;
  }
}

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: 'Importing is not set up on this server yet.' }, { status: 503 });
  let url = '';
  try {
    url = String((await req.json()).url ?? '');
  } catch {
    return Response.json({ error: 'Bad request.' }, { status: 400 });
  }
  let target: URL;
  try {
    target = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (!/^https?:$/.test(target.protocol)) throw new Error();
  } catch {
    return Response.json({ error: 'Enter a full web address, for example careers.yourcompany.com.' }, { status: 400 });
  }
  if (!(await robotsAllows(target))) return Response.json({ error: 'That site asks automated readers not to fetch this page. Ask us to set up an ATS connection or a job feed instead.' }, { status: 403 });

  let text = '';
  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(12000), headers: { 'user-agent': UA } });
    if (!res.ok) return Response.json({ error: `That page answered ${res.status}. Check the address is public.` }, { status: 502 });
    text = strip(await res.text()).slice(0, 60000);
  } catch {
    return Response.json({ error: 'Could not reach that page. Check the address is public.' }, { status: 502 });
  }
  if (text.length < 200) return Response.json({ error: 'That page has almost no readable text. Some careers sites build their list with scripts we do not run; try a single posting, or connect your ATS.' }, { status: 422 });

  const client = new Anthropic();
  const msg = await client.messages.create({ model: 'claude-opus-5', max_tokens: 8000, system: SYSTEM, messages: [{ role: 'user', content: `Source: ${target.href}\n\n${text}` }] });
  const raw = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const arr = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));
    if (!Array.isArray(arr)) throw new Error();
    return Response.json({ jobs: arr.filter((j) => j && typeof j.title === 'string' && j.title.trim()).slice(0, 40), source: target.href });
  } catch {
    return Response.json({ error: 'Could not read the jobs on that page. Try a single posting, or connect your ATS.' }, { status: 502 });
  }
};

export const config: Config = { path: '/api/import-jobs' };
