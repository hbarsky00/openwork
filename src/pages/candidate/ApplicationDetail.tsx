import { Badge, BlockStack, Button, Card, InlineGrid, InlineStack, List, Modal, Text } from '@shopify/polaris';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApplicationStatusTimeline } from '../../components/ApplicationStatusTimeline';
import { HiringProcess } from '../../components/HiringProcess';
import { ACCESS_FEATURE_BY_ID, HIRING_OPTION_BY_ID } from '../../lib/access';
import { DIMENSION_BY_ID, optionOf } from '../../lib/dimensions';
import { APPLICATION_STATUS_LABEL } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';
import { NotFound } from '../public/NotFound';

export function ApplicationDetail() {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const [confirm, setConfirm] = useState(false);
  const app = state.applications.find((a) => a.id === id && a.candidateId === state.candidate!.id);
  const job = app ? state.jobs.find((j) => j.id === app.jobId) : null;
  const employer = job ? state.employers.find((e) => e.id === job.employerId) : null;
  useTitle(job ? `Application · ${job.title}` : 'Application');
  if (!app || !job || !employer) return <NotFound message="We could not find that application." />;

  const open = !['hired', 'notSelected', 'withdrawn'].includes(app.status);
  const p = state.candidate!;

  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Button url="/applications" variant="plain">
            ← All applications
          </Button>
          <InlineStack gap="300" blockAlign="center" wrap>
            <Text as="h1" variant="heading2xl">
              {job.title}
            </Text>
            <Badge tone={open ? 'info' : undefined}>{APPLICATION_STATUS_LABEL[app.status]}</Badge>
          </InlineStack>
          <Text as="p" tone="subdued">
            {employer.name} · <Button url={`/jobs/${job.id}`} variant="plain">View the job</Button>
          </Text>
        </BlockStack>

        <InlineGrid columns={{ xs: 1, lg: ['twoThirds', 'oneThird'] }} gap="500">
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  What has happened
                </Text>
                <ApplicationStatusTimeline application={app} />
                {open && (
                  <Text as="p" variant="bodySm" tone="subdued">
                    {employer.name} says decisions take {job.decisionTimeframe ? job.decisionTimeframe.toLowerCase() : 'a few weeks'}. You will see any change here and by email.
                  </Text>
                )}
              </BlockStack>
            </Card>
            <HiringProcess job={job} />
          </BlockStack>

          <BlockStack gap="500">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  What this employer received
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Exactly what you confirmed when you applied. Nothing else.
                </Text>
                <List type="bullet">
                  {app.shared.profile && <List.Item>Your passport: strengths, skills, experience</List.Item>}
                  {app.shared.resume && p.resumeFileName && <List.Item>Résumé: {p.resumeFileName}</List.Item>}
                  {app.shared.workExamples && p.workExamples.length > 0 && <List.Item>Work examples ({p.workExamples.length})</List.Item>}
                  {app.shared.sharedAccessNeeds.map((n) => <List.Item key={n}>Needs: {ACCESS_FEATURE_BY_ID[n]?.label ?? n}</List.Item>)}
                  {app.shared.sharedPreferences.map((d) => {
                    const pref = p.workPreferences[d];
                    return <List.Item key={d}>{DIMENSION_BY_ID[d].label}: {pref ? optionOf(d, pref.value)?.candidateLabel : '—'}</List.Item>;
                  })}
                  {app.shared.hiringPreferences.map((h) => <List.Item key={h}>Would like: {HIRING_OPTION_BY_ID[h]?.label}</List.Item>)}
                  {app.shared.accommodationRequest && (
                    <List.Item>
                      Accommodation request: {app.shared.accommodationRequest.options.map((o) => HIRING_OPTION_BY_ID[o]?.label).join(', ')}
                      {app.shared.accommodationRequest.custom ? ` — “${app.shared.accommodationRequest.custom}”` : ''}
                    </List.Item>
                  )}
                  {app.answers.note && <List.Item>Your message</List.Item>}
                </List>
              </BlockStack>
            </Card>

            {open && (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Withdraw
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Tells the employer you are no longer interested. You can apply to other jobs at {employer.name} later.
                  </Text>
                  <Button tone="critical" onClick={() => setConfirm(true)}>
                    Withdraw application
                  </Button>
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </InlineGrid>
      </BlockStack>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Withdraw this application?" primaryAction={{ content: 'Yes, withdraw', destructive: true, onAction: () => { dispatch({ type: 'withdrawApplication', applicationId: app.id }); setConfirm(false); } }} secondaryActions={[{ content: 'Keep it', onAction: () => setConfirm(false) }]}>
        <Modal.Section>
          <Text as="p">{employer.name} will see that you withdrew and will not contact you about this job again.</Text>
        </Modal.Section>
      </Modal>
    </div>
  );
}
