import { BlockStack, Text } from '@shopify/polaris';
import { Link } from 'react-router-dom';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const WAYS: { to: string; title: string; tag: string; body: string }[] = [
  { to: '/employer/jobs/import', title: 'Import from careers page', tag: 'Fastest', body: 'Paste your careers page. Openwork brings in the openings it finds, with pay, location and what the work involves.' },
  { to: '/employer/connect', title: 'Connect your ATS', tag: 'Best for ongoing hiring', body: 'Keep Openwork in step with the system your recruiting team already uses, so nobody maintains jobs twice.' },
  { to: '/employer/jobs/new', title: 'Post manually', tag: 'Best for one opening', body: 'Write the job here in seven short steps. Save a draft at any point.' },
];

/** First screen after an employer account exists. One decision, three doors. */
export function EmployerStart() {
  useTitle('Bring your jobs');
  const { state } = useStore();
  const employer = state.employers.find((e) => e.id === state.employerId)!;
  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Let’s bring your jobs to Openwork.
          </Text>
          <Text as="p" tone="subdued">
            {employer.name} is set up. Choose how your openings get here. You can use more than one, and change your mind later.
          </Text>
        </BlockStack>
        <div className="ow-ways">
          {WAYS.map((w) => (
            <Link key={w.to} to={w.to} className="ow-way">
              <span className="ow-way__tag">{w.tag}</span>
              <Text as="h2" variant="headingMd">
                {w.title}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {w.body}
              </Text>
            </Link>
          ))}
        </div>
        <Text as="p" variant="bodySm" tone="subdued">
          Rather look around first? <Link to="/employer">Go to your overview</Link>.
        </Text>
      </BlockStack>
    </div>
  );
}
