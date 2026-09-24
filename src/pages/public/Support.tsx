import { BlockStack, Button, Card, InlineGrid, InlineStack, Text } from '@shopify/polaris';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

/**
 * "Help me apply." In the same place on every page (WCAG 3.2.6). Practical
 * help, in plain words. Text-first: no phone call is ever required.
 */
export function Support() {
  useTitle('Support');
  const { state } = useStore();
  const signedIn = state.role === 'candidate';
  const items = [
    { h: 'Understand a job', p: 'Every job page has “What you’ll actually do” — a typical day as a list — plus the physical, communication and software requirements the employer has stated. Nothing is hidden in a description.', cta: { label: 'Find work', to: '/jobs' } },
    { h: 'Ask an employer something the job page does not say', p: 'Every “?” on a job has an Ask employer button. Your question goes to their accessibility contact and shares nothing else from your passport.', cta: { label: 'See how it works', to: '/how-it-works' } },
    { h: 'Request an accommodation for hiring', p: 'When you apply, tick the options the employer already offers — interpreter, captions, questions in advance, extra time, a support person — and add anything else in plain words. No reason needed.', cta: signedIn ? { label: 'My applications', to: '/applications' } : { label: 'Create an account', to: '/signup' } },
    { h: 'Build a profile without a résumé', p: 'Your passport starts with strengths and what you enjoy. School placements, volunteering and projects all count as experience. A résumé is optional.', cta: signedIn ? { label: 'My passport', to: '/passport' } : { label: 'Start with my strengths', to: '/discover' } },
    { h: 'Control what employers see', p: 'Every answer on your passport is private or used for matching until you choose to share it. Before any application is sent you see the exact list.', cta: signedIn ? { label: 'Sharing controls', to: '/passport/sharing' } : { label: 'How privacy works', to: '/how-it-works' } },
    { h: 'Bring a job coach or support person', p: 'Many employers here welcome a job coach at interviews and during onboarding — it is listed on each job. You can name your coach in your support notes and share it when you apply. Coach accounts with their own permissions are coming next.', cta: { label: 'Jobs that welcome a job coach', to: '/jobs?need=jobCoach' } },
    { h: 'Report something that was not accessible', p: 'If an entrance had steps, software did not work with your screen reader, or an interpreter was promised and not provided, use “Report incorrect information” on the job. The trust team reviews every report; the employer is not told who reported.', cta: { label: 'Find work', to: '/jobs' } },
    { h: 'Change how this site looks', p: 'Use the Display button at the top of every page for Simplified or Large text. Your browser’s zoom, contrast and reduced-motion settings are always respected too.', cta: null },
  ];
  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Support
          </Text>
          <Text as="p" variant="bodyLg" tone="subdued">
            Practical help, in writing. You never have to phone anyone to use Openwork. Email us any time: support@openwork.example.
          </Text>
        </BlockStack>
        <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
          {items.map((i) => (
            <Card key={i.h}>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  {i.h}
                </Text>
                <Text as="p">{i.p}</Text>
                {i.cta && (
                  <InlineStack>
                    <Button url={i.cta.to}>{i.cta.label}</Button>
                  </InlineStack>
                )}
              </BlockStack>
            </Card>
          ))}
        </InlineGrid>
      </BlockStack>
    </div>
  );
}
