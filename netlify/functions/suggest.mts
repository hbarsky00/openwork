import Anthropic from '@anthropic-ai/sdk';
import type { Config } from '@netlify/functions';

const KINDS = new Set(['summary', 'experience']);

const SYSTEM = `You rewrite one piece of a job seeker's résumé. Reply with ONLY a JSON array of exactly 3 strings, no prose.
Each string is a rewrite of the input text: active voice, concrete, plain US English, no buzzwords, same facts.
Never invent employers, dates, numbers, tools, results or achievements that are not in the input or the candidate's listed skills and strengths. Keep every number that is in the input.
A summary is at most 3 sentences. An experience line is at most 2 sentences.
If a target job is given, prefer its words for skills the candidate already has. Do not claim skills they do not list.
Never mention disability, health, or a diagnosis.`;

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: 'Suggestions are not set up on this server yet.' }, { status: 503 });

  let body: { kind?: string; text?: string; context?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Bad request.' }, { status: 400 });
  }
  const { kind, text, context } = body;
  if (!kind || !KINDS.has(kind) || typeof text !== 'string' || !text.trim() || text.length > 2000) return Response.json({ error: 'Bad request.' }, { status: 400 });

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 1500,
    system: SYSTEM,
    messages: [{ role: 'user', content: JSON.stringify({ kind, text, context: context ?? {} }).slice(0, 8000) }],
  });
  const raw = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  let suggestions: unknown;
  try {
    suggestions = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return Response.json({ error: 'Could not read the suggestions. Try again.' }, { status: 502 });
  }
  if (!Array.isArray(suggestions)) return Response.json({ error: 'Could not read the suggestions. Try again.' }, { status: 502 });
  return Response.json({ suggestions: suggestions.filter((s) => typeof s === 'string' && s.trim()).slice(0, 3) });
};

export const config: Config = { path: '/api/suggest' };
