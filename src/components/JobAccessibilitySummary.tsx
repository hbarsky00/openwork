import { BlockStack, Button, Card, InlineStack, Text } from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { ACCESS_CATEGORIES, ACCESS_FEATURES, HIRING_OPTION_BY_ID, TECH_A11Y, type Evidence } from '../lib/access';
import type { Employer, Job } from '../lib/types';
import { EvidenceLine } from './EvidenceLine';
import { AskEmployerButton } from './AskEmployerModal';

/** Job-scope evidence overrides workplace-scope. */
export function evidenceFor(featureId: string, job: Job, employer: Employer): Evidence | undefined {
  return job.accessibility[featureId] ?? employer.accessibility[featureId];
}

/** The workplace facts a wheelchair user, a Deaf person or a screen-reader user asks about first. */
const HEADLINE_FEATURES = ['stepFreeEntrance', 'accessibleRestroom', 'accessibleParking', 'elevator', 'accessibleWorkstation', 'interpreter', 'liveTranscription', 'visualAlerts', 'accessibleDocuments', 'keyboardAlternatives', 'jobCoach', 'advanceNotice', 'breakFlexibility'];

/**
 * Everything known — and not known — about a job's accessibility, with
 * sources. Shown to everyone, signed in or not. Not a match: facts.
 */
export function JobAccessibilitySummary({ job, employer, compact = false }: { job: Job; employer: Employer; compact?: boolean }) {
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    const evidenceFeatures = ACCESS_FEATURES.filter((f) => f.resolve.kind === 'evidence');
    const withEvidence = evidenceFeatures.filter((f) => evidenceFor(f.id, job, employer));
    const headlineMissing = evidenceFeatures.filter((f) => HEADLINE_FEATURES.includes(f.id) && !evidenceFor(f.id, job, employer));
    return { withEvidence, headlineMissing };
  }, [job, employer]);

  const techConfirmed = TECH_A11Y.filter((a) => job.technology.length > 0 && job.technology.every((t) => t.accessibility[a.id]?.status === 'confirmed'));
  const techUnknown = TECH_A11Y.filter((a) => job.technology.some((t) => !t.accessibility[a.id]));

  const visible = compact && !showAll ? rows.withEvidence.slice(0, 6) : rows.withEvidence;
  const byCategory = ACCESS_CATEGORIES.map((c) => ({ c, items: visible.filter((f) => f.category === c.id) })).filter((g) => g.items.length);

  return (
    <Card>
      <BlockStack gap="500">
        <BlockStack gap="100">
          <Text as="h2" variant="headingLg" id="accessibility">
            Accessibility information
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Each line says who confirmed it and when. Where nothing is listed, the employer has not said — you can ask.
          </Text>
        </BlockStack>

        {job.technology.length > 0 && (
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">
              Software and tools
            </Text>
            <ul className="ow-evidence">
              {TECH_A11Y.map((a) => {
                const confirmedTools = job.technology.filter((t) => t.accessibility[a.id]?.status === 'confirmed');
                const unknownTools = job.technology.filter((t) => !t.accessibility[a.id]);
                const notTools = job.technology.filter((t) => t.accessibility[a.id]?.status === 'notAvailable');
                const status: Evidence | undefined = notTools.length
                  ? notTools[0].accessibility[a.id]
                  : unknownTools.length
                    ? undefined
                    : confirmedTools[0]?.accessibility[a.id];
                const detail = notTools.length
                  ? `Not ${a.label.toLowerCase()}: ${notTools.map((t) => t.name).join(', ')}`
                  : unknownTools.length
                    ? `Not verified for ${unknownTools.map((t) => t.name).join(', ')}${confirmedTools.length ? `; confirmed for ${confirmedTools.map((t) => t.name).join(', ')}` : ''}`
                    : `All tools: ${confirmedTools.map((t) => t.name).join(', ')}`;
                return (
                  <EvidenceLine
                    key={a.id}
                    label={`${a.label} — ${detail}`}
                    evidence={status}
                    action={!status ? <AskEmployerButton job={job} featureId={a.id === 'screenReader' ? 'screenReaderCompatible' : a.id === 'keyboard' ? 'keyboardNavigation' : a.id === 'captions' ? 'captions' : 'magnification'} /> : undefined}
                  />
                );
              })}
            </ul>
            <span hidden>{techConfirmed.length + techUnknown.length}</span>
          </BlockStack>
        )}

        {byCategory.map(({ c, items }) => (
          <BlockStack key={c.id} gap="200">
            <Text as="h3" variant="headingSm">
              {c.label}
            </Text>
            <ul className="ow-evidence">
              {items.map((f) => {
                const ev = evidenceFor(f.id, job, employer)!;
                return <EvidenceLine key={f.id} label={f.label} evidence={ev} action={ev.status === 'contact' ? <AskEmployerButton job={job} featureId={f.id} /> : undefined} />;
              })}
            </ul>
          </BlockStack>
        ))}

        {rows.headlineMissing.length > 0 && (
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">
              Not provided by this employer
            </Text>
            <ul className="ow-evidence">
              {(compact && !showAll ? rows.headlineMissing.slice(0, 3) : rows.headlineMissing).map((f) => (
                <EvidenceLine key={f.id} label={f.label} evidence={undefined} action={<AskEmployerButton job={job} featureId={f.id} />} />
              ))}
            </ul>
          </BlockStack>
        )}

        {compact && !showAll && (rows.withEvidence.length > 6 || rows.headlineMissing.length > 3) && (
          <InlineStack>
            <Button variant="plain" onClick={() => setShowAll(true)}>
              Show all accessibility information
            </Button>
          </InlineStack>
        )}

        <Text as="p" variant="bodySm" tone="subdued">
          Hiring options this employer offers: {job.hiringOptions.map((h) => HIRING_OPTION_BY_ID[h].label.toLowerCase()).join(' · ') || 'none listed'}.
        </Text>
      </BlockStack>
    </Card>
  );
}
