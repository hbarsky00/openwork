import { Badge, BlockStack, Button, EmptyState, InlineStack, Text } from '@shopify/polaris';
import { HIRING_OPTION_BY_ID } from '../../lib/access';
import { APPLICATION_STATUS_LABEL, longDate } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';
import { employerVisible, useStore } from '../../state/store';

/**
 * Interviews: every candidate at the assessment or interview stage, with the
 * accommodation requests they made, so nothing is forgotten on the day.
 */
export function EmployerInterviews() {
  useTitle('Interviews');
  const { state } = useStore();
  const jobIds = new Set(state.jobs.filter((j) => j.employerId === state.employerId).map((j) => j.id));
  const rows = state.applications
    .filter(employerVisible)
    .filter((a) => jobIds.has(a.jobId) && (a.status === 'interview' || a.status === 'assessment'))
    .sort((a, b) => b.history[b.history.length - 1].on.localeCompare(a.history[a.history.length - 1].on));

  return (
    <div className="ow-container">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <BlockStack gap="100">
            <Text as="h1" variant="heading2xl">
              Interviews
            </Text>
            <Text as="p" tone="subdued">
              Candidates in an interview or work-sample stage, and what they asked for.
            </Text>
          </BlockStack>
        </div>
        {rows.length === 0 ? (
          <div className="ow-sheet">
            <EmptyState heading="No interviews scheduled" image="" action={{ content: 'Review candidates', url: '/employer/candidates' }}>
              <p>Move a candidate to Interview or Work sample from their application and they appear here.</p>
            </EmptyState>
          </div>
        ) : (
          <BlockStack gap="300">
            {rows.map((a) => {
              const job = state.jobs.find((j) => j.id === a.jobId)!;
              const cand = state.candidates.find((c) => c.id === a.candidateId);
              const last = a.history[a.history.length - 1];
              const req = a.shared.accommodationRequest;
              return (
                <div key={a.id} className="ow-sheet ow-aside__card">
                  <InlineStack align="space-between" blockAlign="start" wrap gap="300">
                    <BlockStack gap="100">
                      <InlineStack gap="200" blockAlign="center" wrap>
                        <Text as="h2" variant="headingMd">
                          {cand?.name ?? 'Candidate'}
                        </Text>
                        <Badge tone="attention" toneAndProgressLabelOverride={APPLICATION_STATUS_LABEL[a.status]}>
                          {APPLICATION_STATUS_LABEL[a.status]}
                        </Badge>
                      </InlineStack>
                      <Text as="p" tone="subdued">
                        {job.title} · moved {longDate(last.on)}
                      </Text>
                      {req ? (
                        <Text as="p">
                          <strong>Requested:</strong> {[...req.options.map((o) => HIRING_OPTION_BY_ID[o]?.label), req.custom].filter(Boolean).join(' · ')}
                        </Text>
                      ) : a.shared.hiringPreferences.length > 0 ? (
                        <Text as="p">
                          <strong>Prefers:</strong> {a.shared.hiringPreferences.map((h) => HIRING_OPTION_BY_ID[h]?.label).join(' · ')}
                        </Text>
                      ) : (
                        <Text as="p" variant="bodySm" tone="subdued">
                          No interview requests. Offer the options in your hiring process anyway.
                        </Text>
                      )}
                    </BlockStack>
                    <Button url={`/employer/candidates/${a.id}`}>Open application</Button>
                  </InlineStack>
                </div>
              );
            })}
          </BlockStack>
        )}
      </BlockStack>
    </div>
  );
}
