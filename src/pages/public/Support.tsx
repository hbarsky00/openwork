import { BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { Link } from 'react-router-dom';
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
            Practical help, in writing. You never have to phone anyone to use Openwork.
          </Text>
        </BlockStack>
        <nav className="ow-areanav" aria-label="Questions">
          {items.map((i, n) => (
            <a key={i.h} href={`#q-${n}`} className="ow-areanav__link">
              {i.h}
            </a>
          ))}
        </nav>
        <div className="ow-sheet">
          <ol className="ow-faq">
            {items.map((i, n) => (
              <li key={i.h} id={`q-${n}`} className="ow-faq__item">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingLg">
                    {i.h}
                  </Text>
                  <Text as="p">
                    <span className="ow-prose">{i.p}</span>
                    {i.cta && (
                      <>
                        {' '}
                        <Link to={i.cta.to}>{i.cta.label}</Link>.
                      </>
                    )}
                  </Text>
                </BlockStack>
              </li>
            ))}
          </ol>
        </div>
        <div className="ow-why">
          <InlineStack align="space-between" blockAlign="center" wrap gap="300">
            <Text as="p">
              <strong>Still stuck?</strong> Email <a href="mailto:support@openwork.example">support@openwork.example</a>. A person replies within one business day, in writing.
            </Text>
            <Button url="mailto:support@openwork.example">Email support</Button>
          </InlineStack>
        </div>
      </BlockStack>
    </div>
  );
}
