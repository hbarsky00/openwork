import { Badge, BlockStack, Button, InlineStack, Select, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { longDate } from '../../lib/format';
import type { LeadStage } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const STAGE_LABEL: Record<LeadStage, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  interested: 'Interested',
  founding: 'Founding employer',
  verification: 'Needs verification',
  jobsImported: 'Jobs imported',
  profileIncomplete: 'Profile incomplete',
  active: 'Active',
  inactive: 'Inactive',
};
const ORDER: LeadStage[] = ['verification', 'founding', 'lead', 'contacted', 'interested', 'jobsImported', 'profileIncomplete', 'active', 'inactive'];
const TONE: Partial<Record<LeadStage, 'attention' | 'info' | 'success'>> = { verification: 'attention', founding: 'info', active: 'success', jobsImported: 'success' };

/**
 * Openwork's own employer pipeline. Enough to onboard the first employers by
 * hand and see who is stuck; deliberately not a CRM.
 */
export function EmployerLeads() {
  useTitle('Employer onboarding');
  const { state, dispatch } = useStore();
  const [note, setNote] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | LeadStage>('all');
  const leads = state.leads.filter((l) => filter === 'all' || l.stage === filter);
  const counts = ORDER.map((s) => ({ s, n: state.leads.filter((l) => l.stage === s).length })).filter((x) => x.n > 0);

  return (
    <div className="ow-container">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <BlockStack gap="100">
            <Text as="h1" variant="heading2xl">
              Employer onboarding
            </Text>
            <Text as="p" tone="subdued">
              {state.leads.length} lead{state.leads.length === 1 ? '' : 's'} · {state.employers.filter((e) => e.claimedBy).length} claimed compan{state.employers.filter((e) => e.claimedBy).length === 1 ? 'y' : 'ies'} · <Link to="/admin">Trust and moderation</Link>
            </Text>
          </BlockStack>
          <Select
            label="Stage"
            labelInline
            options={[{ label: `All (${state.leads.length})`, value: 'all' }, ...counts.map((c) => ({ label: `${STAGE_LABEL[c.s]} (${c.n})`, value: c.s }))]}
            value={filter}
            onChange={(v) => setFilter(v as 'all' | LeadStage)}
          />
        </div>

        {leads.length === 0 ? (
          <div className="ow-sheet">
            <BlockStack gap="200">
              <Text as="h2" variant="headingLg">
                No leads yet
              </Text>
              <Text as="p" tone="subdued">
                Founding Employer applications and company claims that need review land here.
              </Text>
            </BlockStack>
          </div>
        ) : (
          <BlockStack gap="300">
            {leads.map((l) => {
              const employer = l.employerId ? state.employers.find((e) => e.id === l.employerId) : null;
              return (
                <div key={l.id} className="ow-sheet ow-aside__card">
                  <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="start" wrap gap="300">
                      <BlockStack gap="050">
                        <InlineStack gap="200" blockAlign="center" wrap>
                          <Text as="h2" variant="headingMd">
                            {l.company || 'Unnamed company'}
                          </Text>
                          <Badge tone={TONE[l.stage]}>{STAGE_LABEL[l.stage]}</Badge>
                          {employer && <Badge tone="success">Account created</Badge>}
                        </InlineStack>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {[l.email, l.openJobs ? `${l.openJobs} open jobs` : null, l.ats && l.ats !== 'Unknown' ? `ATS: ${l.ats}` : null, `added ${longDate(l.createdOn)}`].filter(Boolean).join(' · ')}
                        </Text>
                        {(l.website || l.careersUrl) && (
                          <Text as="p" variant="bodySm">
                            {l.website && <a href={l.website}>{l.website.replace(/^https?:\/\//, '')}</a>}
                            {l.website && l.careersUrl ? ' · ' : ''}
                            {l.careersUrl && <a href={l.careersUrl}>careers page</a>}
                          </Text>
                        )}
                        {l.message && (
                          <Text as="p" variant="bodySm">
                            “{l.message}”
                          </Text>
                        )}
                      </BlockStack>
                      <InlineStack gap="200" blockAlign="center">
                        <Select
                          label="Stage"
                          labelHidden
                          options={ORDER.map((s) => ({ label: STAGE_LABEL[s], value: s }))}
                          value={l.stage}
                          onChange={(v) => dispatch({ type: 'updateLead', leadId: l.id, patch: { stage: v as LeadStage } })}
                        />
                        {l.careersUrl && (
                          <Button url={`/import?url=${encodeURIComponent(l.careersUrl)}`}>Import their jobs</Button>
                        )}
                      </InlineStack>
                    </InlineStack>

                    {l.notes.length > 0 && (
                      <ul className="ow-facts" aria-label={`Notes on ${l.company}`}>
                        {l.notes.map((n, i) => (
                          <li key={i} className="ow-fact ow-fact--info">
                            <span className="ow-dot ow-dot--info" aria-hidden="true" />
                            <Text as="p" variant="bodySm">
                              {n.text} <Text as="span" tone="subdued" variant="bodyXs">{longDate(n.on)}</Text>
                            </Text>
                          </li>
                        ))}
                      </ul>
                    )}
                    <InlineStack gap="200" blockAlign="end">
                      <div style={{ flex: 1 }}>
                        <TextField label="Add a note" value={note[l.id] ?? ''} onChange={(v) => setNote((n) => ({ ...n, [l.id]: v }))} autoComplete="off" placeholder="Emailed them, waiting on the careers URL…" />
                      </div>
                      <Button disabled={!(note[l.id] ?? '').trim()} onClick={() => { dispatch({ type: 'addLeadNote', leadId: l.id, text: note[l.id].trim() }); setNote((n) => ({ ...n, [l.id]: '' })); }}>
                        Add note
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </div>
              );
            })}
          </BlockStack>
        )}
      </BlockStack>
    </div>
  );
}
