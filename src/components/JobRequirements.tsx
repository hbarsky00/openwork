import { BlockStack, Card, InlineStack, Text } from '@shopify/polaris';
import { COMMUNICATION_REQUIREMENTS, COMM_LEVEL_LABEL, PHYSICAL_REQUIREMENTS, TECH_A11Y, type Evidence } from '../lib/access';
import type { Job } from '../lib/types';
import { evidenceState } from './EvidenceLine';
import { StateSymbol } from './Signal';

/** Employer-stated physical requirements. Nothing inferred; gaps shown as gaps. */
export function PhysicalRequirements({ job }: { job: Job }) {
  const answered = PHYSICAL_REQUIREMENTS.filter((p) => job.physical[p.id]).length;
  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <InlineStack align="space-between" blockAlign="baseline" wrap>
            <Text as="h2" variant="headingLg" id="physical">
              Physical requirements
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              {answered} of {PHYSICAL_REQUIREMENTS.length} stated by the employer
            </Text>
          </InlineStack>
          <Text as="p" variant="bodyMd" tone="subdued">
            What the job genuinely requires, as stated by the employer. Adjustments can often be made — ask.
          </Text>
        </BlockStack>
        <dl className="ow-env" style={{ margin: 0 }}>
          {PHYSICAL_REQUIREMENTS.map((p) => {
            const v = job.physical[p.id];
            const opt = p.options.find((o) => o.value === v);
            return (
              <div key={p.id} className={`ow-env__item${opt ? '' : ' ow-env__item--unknown'}`}>
                <Text as="dt" variant="bodySm" tone="subdued">
                  {p.label}
                </Text>
                <Text as="dd" variant="bodyMd" fontWeight={opt ? 'semibold' : 'regular'} tone={opt ? 'base' : 'subdued'}>
                  {opt ? opt.label : 'Not provided by this employer'}
                </Text>
              </div>
            );
          })}
        </dl>
      </BlockStack>
    </Card>
  );
}

export function CommunicationRequirements({ job }: { job: Job }) {
  const answered = COMMUNICATION_REQUIREMENTS.filter((c) => job.communication[c.id]).length;
  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <InlineStack align="space-between" blockAlign="baseline" wrap>
            <Text as="h2" variant="headingLg" id="communication">
              How work is communicated
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              {answered} of {COMMUNICATION_REQUIREMENTS.length} stated by the employer
            </Text>
          </InlineStack>
        </BlockStack>
        <dl className="ow-env" style={{ margin: 0 }}>
          {COMMUNICATION_REQUIREMENTS.map((c) => {
            const v = job.communication[c.id];
            return (
              <div key={c.id} className={`ow-env__item${v ? '' : ' ow-env__item--unknown'}`}>
                <Text as="dt" variant="bodySm" tone="subdued">
                  {c.label}
                </Text>
                <Text as="dd" variant="bodyMd" fontWeight={v ? 'semibold' : 'regular'} tone={v ? 'base' : 'subdued'}>
                  {v ? COMM_LEVEL_LABEL[v] : 'Not provided by this employer'}
                </Text>
              </div>
            );
          })}
        </dl>
      </BlockStack>
    </Card>
  );
}

/** Named tools with per-attribute accessibility evidence. */
export function TechnologyAccessibility({ job }: { job: Job }) {
  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text as="h2" variant="headingLg" id="technology">
            Software and tools
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            The actual tools used in this job and what the employer has confirmed about each one.
          </Text>
        </BlockStack>
        {job.technology.length === 0 ? (
          <Text as="p" tone="subdued">
            This employer has not listed the software used in this job.
          </Text>
        ) : (
          <BlockStack gap="300">
            {job.technology.map((t) => (
              <div key={t.name} className="ow-env__item">
                <Text as="h3" variant="headingSm">
                  {t.name}
                </Text>
                <ul className="ow-chips" aria-label={`Accessibility of ${t.name}`}>
                  {TECH_A11Y.map((a) => {
                    const ev: Evidence | undefined = t.accessibility[a.id];
                    const st = evidenceState(ev);
                    return (
                      <li key={a.id}>
                        <InlineStack gap="100" blockAlign="center">
                          <StateSymbol state={st} />
                          <Text as="span" variant="bodySm">
                            {a.label}
                            {ev?.note ? ` — ${ev.note}` : ''}
                          </Text>
                        </InlineStack>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <Text as="p" variant="bodySm" tone="subdued">
              ✓ confirmed by the employer · △ contact employer · ✗ not available · ? not verified
            </Text>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
