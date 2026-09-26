import { Banner, BlockStack, Button, Card, InlineGrid, InlineStack, Layout, Page, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { CompletenessMeter } from '../../components/CompletenessMeter';
import { EvidenceLine } from '../../components/EvidenceLine';
import { EvidencePicker } from '../../components/EvidencePicker';
import { VerificationBadge } from '../../components/VerificationBadge';
import { ACCESS_CATEGORIES, WORKPLACE_EVIDENCE_FEATURES, type Evidence, type EvidenceStatus } from '../../lib/access';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/**
 * Workplace Accessibility Profile. Four taps per question, all on one screen,
 * grouped by area. Answered once, dated, shown on every job.
 */
export function EmployerAccessibility() {
  useTitle('Workplace accessibility');
  const { state, dispatch } = useStore();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  const [draft, setDraft] = useState(employer.accessibility);
  const [contact, setContact] = useState(employer.accessibilityContact);
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const set = (id: string, status: EvidenceStatus | '', note?: string) => {
    setSaved(false);
    setDraft((d) => {
      const next = { ...d };
      if (!status) delete next[id];
      else next[id] = { status, source: 'employer', confirmedOn: today, ...((note ?? d[id]?.note) ? { note: note ?? d[id]?.note } : {}) } as Evidence;
      return next;
    });
  };
  const save = () => {
    dispatch({ type: 'updateEmployer', employerId: employer.id, patch: { accessibility: draft, accessibilityContact: contact } });
    setSaved(true);
    window.scrollTo({ top: 0 });
  };
  const done = WORKPLACE_EVIDENCE_FEATURES.filter((f) => draft[f.id]).length;
  const areas = ACCESS_CATEGORIES.map((c) => ({ c, items: WORKPLACE_EVIDENCE_FEATURES.filter((f) => f.category === c.id) })).filter((a) => a.items.length);
  // Areas with something unanswered start open; finished ones show a one-line summary until you press Edit.
  const [editing, setEditing] = useState<Set<string>>(() => new Set(areas.filter((a) => a.items.some((f) => !employer.accessibility[f.id])).map((a) => a.c.id)));
  const toggleEdit = (id: string) => setEditing((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const summary = (items: typeof WORKPLACE_EVIDENCE_FEATURES) => {
    const by = (st: EvidenceStatus) => items.filter((f) => draft[f.id]?.status === st).map((f) => f.label.toLowerCase());
    const parts = [['Yes', by('confirmed')], ['Contact us', by('contact')], ['No', by('notAvailable')]] as const;
    return parts.filter(([, l]) => l.length).map(([k, l]) => `${k}: ${l.join(', ')}`).join(' · ');
  };

  return (
    <Page fullWidth title="Workplace accessibility" subtitle={`${done} of ${WORKPLACE_EVIDENCE_FEATURES.length} answered · shown on every job with today’s date`} titleMetadata={<VerificationBadge level={employer.verification} />} primaryAction={{ content: 'Save', onAction: save }} secondaryActions={[{ content: 'View as candidates see it', url: `/companies/${employer.id}` }]}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {saved && <Banner tone="success" title="Saved" onDismiss={() => setSaved(false)}><p>Changed answers are dated {today} and marked “Employer reported”.</p></Banner>}
            <Card>
              <TextField label="Accessibility contact — who handles accommodation requests and candidate questions?" value={contact} onChange={(v) => { setContact(v); setSaved(false); }} autoComplete="off" helpText="A named person or address. Candidates are told requests go here and that no reason is needed." />
            </Card>
            <nav className="ow-areanav" aria-label="Areas">
              {areas.map(({ c, items }) => {
                const n = items.filter((f) => draft[f.id]).length;
                return (
                  <a key={c.id} href={`#area-${c.id}`} className={n === items.length ? 'ow-areanav__link ow-areanav__link--done' : 'ow-areanav__link'}>
                    {c.label} <span aria-label={`${n} of ${items.length} answered`}>{n}/{items.length}</span>
                  </a>
                );
              })}
            </nav>
            {areas.map(({ c, items }) => {
              const n = items.filter((f) => draft[f.id]).length;
              const isEditing = editing.has(c.id);
              return (
                <section key={c.id} id={`area-${c.id}`} className="ow-sheet ow-areacard" aria-labelledby={`area-${c.id}-h`}>
                  <BlockStack gap="400">
                    <div className="ow-areacard__head">
                      <BlockStack gap="050">
                        <Text as="h2" variant="headingLg" id={`area-${c.id}-h`}>
                          {c.label}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {n} of {items.length} answered
                        </Text>
                      </BlockStack>
                      <Button onClick={() => toggleEdit(c.id)} pressed={isEditing} accessibilityLabel={`${isEditing ? 'Finish editing' : 'Edit'} ${c.label}`}>
                        {isEditing ? 'Done' : 'Edit'}
                      </Button>
                    </div>
                    {isEditing ? (
                      <InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
                        {items.map((f) => (
                          <EvidencePicker key={f.id} question={f.employerQuestion ?? f.label} evidence={draft[f.id]} onChange={(s, nt) => set(f.id, s, nt)} />
                        ))}
                      </InlineGrid>
                    ) : (
                      <Text as="p" tone="subdued">
                        {summary(items) || 'Nothing answered yet.'}
                      </Text>
                    )}
                  </BlockStack>
                </section>
              );
            })}
            <div className="ow-actionbar">
              <InlineStack align="end">
                <Button variant="primary" size="large" onClick={save}>
                  Save workplace accessibility
                </Button>
              </InlineStack>
            </div>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            <Card>
              <CompletenessMeter id="cm-wa" done={done} total={WORKPLACE_EVIDENCE_FEATURES.length} label="Workplace questions answered" why="“No” is as useful to candidates as “Yes” — it saves them a wasted application." />
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  How candidates see it
                </Text>
                <ul className="ow-evidence">
                  <EvidenceLine label="Step-free entrance" evidence={draft.stepFreeEntrance} />
                  <EvidenceLine label="Sign-language interpreter at work" evidence={draft.interpreter} />
                </ul>
                <Text as="p" variant="bodySm" tone="subdued">
                  ✓ confirmed · △ contact employer · ✗ not available · ? not provided
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <VerificationBadge level={employer.verification} detailed />
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
