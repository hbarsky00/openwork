import Anthropic from '@anthropic-ai/sdk';
import type { Config } from '@netlify/functions';

const SYSTEM = `You read the text of a company careers page and list its open job postings.
Reply with ONLY a JSON array (no prose) of up to 20 objects:
{"title": string, "location": string, "employmentType": "fullTime"|"partTime"|"contract"|"apprenticeship", "salaryMin": number, "salaryMax": number, "salaryUnit": "hour"|"year", "summary": string, "tasks": string[], "essentialRequirements": string[], "skills": string[]}
Rules: use only what the page says. Unknown pay → 0. Unknown type → "fullTime". summary is 2–3 plain sentences in US English. tasks are concrete things the person does (3–6). essentialRequirements are must-haves (1–6). skills are tools and named skills (0–10). Never invent. No duplicates.`;

const strip = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: 'Import is not set up on this server yet.' }, { status: 503 });
  let url = '';
  try {
    url = String((await req.json()).url ?? '');
  } catch {
    return Response.json({ error: 'Bad request.' }, { status: 400 });
  }
  let target: URL;
  try {
    target = new URL(url);
    if (!/^https?:$/.test(target.protocol)) throw new Error();
  } catch {
    return Response.json({ error: 'Enter a full web address, starting with https://' }, { status: 400 });
  }
  let text = '';
  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(12000), headers: { 'user-agent': 'OpenworkImport/1.0 (+https://openwork.example)' } });
    if (!res.ok) return Response.json({ error: `That page answered ${res.status}. Check the address is public.` }, { status: 502 });
    const body = await res.text();
    text = strip(body).slice(0, 60000);
  } catch {
    return Response.json({ error: 'Could not reach that page. Check the address is public.' }, { status: 502 });
  }
  if (text.length < 200) return Response.json({ error: 'That page has almost no readable text. Some careers sites load jobs with scripts we cannot run; try a single job’s page.' }, { status: 422 });

  const client = new Anthropic();
  const msg = await client.messages.create({ model: 'claude-opus-5', max_tokens: 6000, system: SYSTEM, messages: [{ role: 'user', content: `Source: ${target.href}\n\n${text}` }] });
  const raw = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    const arr = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));
    if (!Array.isArray(arr)) throw new Error();
    return Response.json({ jobs: arr.filter((j) => j && typeof j.title === 'string' && j.title.trim()).slice(0, 20), source: target.href });
  } catch {
    return Response.json({ error: 'Could not read the jobs on that page. Try again or paste a single job’s address.' }, { status: 502 });
  }
};

export const config: Config = { path: '/api/import-jobs' };
