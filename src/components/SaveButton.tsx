import { Button } from '@shopify/polaris';
import { StarFilledIcon, StarIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { useIsSaved, useStore } from '../state/store';

export function SaveButton({ jobId, size = 'medium', fullWidth = false }: { jobId: string; size?: 'slim' | 'medium' | 'large'; fullWidth?: boolean }) {
  const { state, dispatch } = useStore();
  const saved = useIsSaved(jobId);
  const navigate = useNavigate();

  const onClick = () => {
    if (state.role !== 'candidate') {
      navigate(`/signin?next=${encodeURIComponent(`/jobs/${jobId}`)}&reason=save`);
      return;
    }
    dispatch({ type: 'toggleSave', jobId });
  };

  return (
    <Button
      icon={saved ? StarFilledIcon : StarIcon}
      pressed={saved}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      accessibilityLabel={saved ? 'Saved. Remove from saved jobs' : 'Save this job'}
    >
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
}
