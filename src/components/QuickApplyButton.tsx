import { Button } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { buildApplication, canQuickApply } from '../lib/apply';
import type { Job } from '../lib/types';
import { useMyApplication, useStore } from '../state/store';

/**
 * The apply control, wherever it appears. Signed in + no employer questions
 * → sends in one tap. Otherwise → the apply page. Already applied → the
 * application. Same button, so people learn it once.
 */
export function QuickApplyButton({ job, size = 'large', fullWidth = false }: { job: Job; size?: 'medium' | 'large'; fullWidth?: boolean }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const profile = state.role === 'candidate' ? state.candidate : null;
  const mine = useMyApplication(job.id);

  if (mine)
    return (
      <Button url={`/applications/${mine.id}`} size={size} fullWidth={fullWidth}>
        Applied · view
      </Button>
    );
  if (job.status !== 'published')
    return (
      <Button disabled size={size} fullWidth={fullWidth}>
        Closed
      </Button>
    );
  if (canQuickApply(job, profile))
    return (
      <Button
        variant="primary"
        size={size}
        fullWidth={fullWidth}
        onClick={() => dispatch({ type: 'submitApplication', application: buildApplication(job, profile, {}, '') })}
        accessibilityLabel={`Quick apply to ${job.title}`}
      >
        Quick apply
      </Button>
    );
  return (
    <Button variant="primary" size={size} fullWidth={fullWidth} onClick={() => navigate(`/jobs/${job.id}/apply`)}>
      Apply now
    </Button>
  );
}

/** One line under the button saying what the tap does. */
export function applyHint(job: Job, signedIn: boolean): string {
  const q = job.screeningQuestions.length;
  if (q === 0) return signedIn ? 'One tap. Your profile and résumé go as they are.' : 'Résumé only. A minute.';
  return `Résumé + ${q} required question${q === 1 ? '' : 's'}. A few minutes.`;
}
