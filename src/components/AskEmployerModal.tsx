import { Banner, BlockStack, Button, Modal, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACCESS_FEATURE_BY_ID } from '../lib/access';
import { longDate } from '../lib/format';
import type { Job } from '../lib/types';
import { useStore } from '../state/store';

/**
 * "Ask employer" — the action attached to every unknown. Turns a gap in the
 * listing into a question the employer sees on their dashboard, and the
 * answer comes back to the job page. Nothing about the candidate's other needs
 * travels with it.
 */
export function AskEmployerButton({ job, featureId, size = 'slim' }: { job: Job; featureId: string | null; size?: 'slim' | 'medium' }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const feature = featureId ? ACCESS_FEATURE_BY_ID[featureId] : null;
  const [text, setText] = useState(feature ? `Could you confirm whether this job offers: ${feature.label.toLowerCase()}?` : '');
  const [sent, setSent] = useState(false);

  const existing = state.candidate ? state.questions.find((q) => q.jobId === job.id && q.candidateId === state.candidate!.id && q.featureId === featureId) : null;

  const start = () => {
    if (state.role !== 'candidate') {
      navigate(`/signin?next=${encodeURIComponent(`/jobs/${job.id}`)}&reason=ask`);
      return;
    }
    setOpen(true);
  };

  const send = () => {
    dispatch({
      type: 'askQuestion',
      question: {
        id: `q-${Date.now().toString(36)}`,
        jobId: job.id,
        candidateId: state.candidate!.id,
        featureId,
        text: text.trim(),
        askedOn: new Date().toISOString().slice(0, 10),
        answer: null,
        answeredOn: null,
      },
    });
    setSent(true);
  };

  if (existing) {
    return (
      <div>
        <Text as="p" variant="bodySm" tone={existing.answer ? 'success' : 'subdued'}>
          {existing.answer ? `Employer answered ${longDate(existing.answeredOn!)}: “${existing.answer}”` : `You asked on ${longDate(existing.askedOn)}. Waiting for a reply.`}
        </Text>
      </div>
    );
  }

  return (
    <>
      <div>
        <Button size={size} onClick={start}>
          Ask employer
        </Button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Ask ${state.employers.find((e) => e.id === job.employerId)?.name ?? 'the employer'}`}
        primaryAction={sent ? { content: 'Done', onAction: () => setOpen(false) } : { content: 'Send question', onAction: send, disabled: !text.trim() }}
        secondaryActions={sent ? [] : [{ content: 'Cancel', onAction: () => setOpen(false) }]}
      >
        <Modal.Section>
          {sent ? (
            <Banner tone="success" title="Sent">
              <p>The employer’s accessibility contact will see this. You will see the answer on this job page and on your home page.</p>
            </Banner>
          ) : (
            <BlockStack gap="400">
              <Text as="p">
                Your question goes only to this employer’s accessibility contact. It does not include anything else from your passport, and asking is not an application.
              </Text>
              <TextField label="Your question" value={text} onChange={setText} multiline={3} autoComplete="off" />
            </BlockStack>
          )}
        </Modal.Section>
      </Modal>
    </>
  );
}
