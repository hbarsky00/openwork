import { BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { AlertCircleIcon, CheckCircleIcon, QuestionCircleIcon } from '@shopify/polaris-icons';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { jobCompleteness, reviewJob } from '../../lib/jobs';
import { matchJob, matchTier } from '../../lib/match';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const ICON = { ok: CheckCircleIcon, warn: AlertCircleIcon, unknown: QuestionCircleIcon };
const WAYS: { to: string; title: string; tag: string; body: string; cta: string }[] = [
  { to: '/import', title: 'Import from careers page', tag: 'Fastest', body: 'Already have jobs online? Enter your careers page and let Openwork bring your existing openings into the platform.', cta: 'Import jobs' },
  { to: '/connect', title: 'Connect your ATS', tag: 'Keeps jobs in step', body: 'Connect your recruiting system so your team does not have to maintain jobs twice.', cta: 'Connect ATS' },
  { to: '/post', title: 'Post manually', tag: 'One opening', body: 'Posting a single role? Create the job directly in Openwork in seven short steps.', cta: 'Post a job' },
];

/**
 * The employer front door. It shows the employer product rather than
 * describing it: a real job from the platform, its real readiness review, and
 * the real number of people on Openwork who match it today.
 */
export function Employers() {
  useTitle('For employers');
  const { state } = useStore();

  // A real published job with the most complete information, scored live.
  const demo = useMemo(() => {
    const published = state.jobs.filter((j) => j.status === 'published');
    const scored = published
      .map((j) => {
        const employer = state.employers.find((e) => e.id === j.employerId)!;
        const tiers = state.candidates.map((c) => matchTier(matchJob(c, j, employer)));
        return { job: j, employer, review: reviewJob(j, employer), completeness: jobCompleteness(j), potential: tiers.filter((t) => t !== 'new').length, strong: tiers.filter((t) => t === 'strong').length };
      })
      .sort((a, b) => b.potential - a.potential || b.completeness.done - a.completeness.done);
    return scored[0] ?? null;
  }, [state.jobs, state.employers, state.candidates]);

  return (
    <div className="ow-container">
      <BlockStack gap="800">
        <div className="ow-emphero">
          <BlockStack gap="300">
            <Text as="h1" variant="heading2xl">
              Reach qualified candidates other job boards overlook.
            </Text>
            <Text as="p" variant="bodyLg" tone="subdued">
              Import your existing jobs into Openwork and connect with candidates based on skills, work preferences and accessibility needs.
            </Text>
            <InlineStack gap="300" blockAlign="center" wrap>
              <Button url="/import" variant="primary" size="large">
                Import my jobs
              </Button>
              <Button url="/post" size="large">
                Post a job
              </Button>
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              Already use an ATS? <Link to="/connect">Connect it →</Link> · No account needed to start · Free while we are building.
            </Text>
          </BlockStack>

          {demo && (
            <div className="ow-sheet ow-demo" aria-label="Example of the employer view">
              <BlockStack gap="300">
                <BlockStack gap="050">
                  <Text as="p" variant="bodyXs" tone="subdued">
                    A live job on Openwork right now
                  </Text>
                  <Text as="h2" variant="headingLg">
                    {demo.job.title}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {demo.employer.name} · {demo.job.location}
                  </Text>
                </BlockStack>
                <InlineStack gap="500" wrap>
                  <BlockStack gap="050">
                    <Text as="p" variant="headingXl">
                      {demo.potential}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {demo.potential === 1 ? 'person on Openwork matches it' : 'people on Openwork match it'}
                    </Text>
                  </BlockStack>
                  <BlockStack gap="050">
                    <Text as="p" variant="headingXl">
                      {demo.strong}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {demo.strong === 1 ? 'strong match' : 'strong matches'}
                    </Text>
                  </BlockStack>
                </InlineStack>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Job readiness
                  </Text>
                  <ul className="ow-facts">
                    {demo.review.slice(0, 6).map((r, i) => {
                      const I = ICON[r.state];
                      return (
                        <li key={i} className={`ow-fact ow-fact--${r.state === 'ok' ? 'ok' : r.state === 'warn' ? 'warn' : 'info'}`}>
                          <I />
                          <Text as="p" variant="bodySm">
                            {r.text}
                          </Text>
                        </li>
                      );
                    })}
                  </ul>
                </BlockStack>
                <Text as="p" variant="bodyXs" tone="subdued">
                  Real numbers from the people and jobs on Openwork today. We are early, which is why founding employers get everything free.
                </Text>
              </BlockStack>
            </div>
          )}
        </div>

        <section aria-labelledby="ways">
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="heading2xl" id="ways">
                Bring your jobs to Openwork
              </Text>
              <Text as="p" tone="subdued">
                Three ways in. Nobody has to recreate a job that already exists somewhere else.
              </Text>
            </BlockStack>
            <div className="ow-ways">
              {WAYS.map((w) => (
                <div key={w.to} className="ow-way ow-way--static">
                  <span className="ow-way__tag">{w.tag}</span>
                  <Text as="h3" variant="headingMd">
                    {w.title}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {w.body}
                  </Text>
                  <InlineStack>
                    <Button url={w.to}>{w.cta}</Button>
                  </InlineStack>
                </div>
              ))}
            </div>
          </BlockStack>
        </section>

        <section className="ow-sheet" aria-labelledby="founding">
          <div className="ow-cols">
            <BlockStack gap="300">
              <Text as="h2" variant="heading2xl" id="founding">
                Become a Founding Employer
              </Text>
              <Text as="p" variant="bodyLg" tone="subdued">
                Help build a better way for candidates and employers to find each other. We are opening Openwork with a small group of employers who want to hire well, and we do most of the setup for you.
              </Text>
              <ul className="ow-factlist ow-factlist--ok">
                {['Free job imports', 'Free job postings', 'Company profile', 'Workplace Accessibility Profile', 'Candidate matching', 'Hiring accessibility tools', 'Early access to employer features', 'Founding Employer recognition'].map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </BlockStack>
            <div className="ow-aside">
              <div className="ow-sheet ow-aside__card">
                <BlockStack gap="300">
                  <Text as="p" fontWeight="semibold">
                    Tell us your careers page and we will do the rest.
                  </Text>
                  <Button url="/employers/founding" variant="primary" size="large" fullWidth>
                    Become a Founding Employer
                  </Button>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Seven short questions. No credit card, no contract, and you review everything before a single job goes live.
                  </Text>
                </BlockStack>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="why">
          <BlockStack gap="400">
            <Text as="h2" variant="heading2xl" id="why">
              Why candidates trust what your jobs say
            </Text>
            <div className="ow-ways">
              {[
                ['Jobs that say how they actually work', 'Schedule, meetings, communication, environment, physical requirements and the software used. Candidates compare this against how they work best, so the people who apply can genuinely do the job.'],
                ['Evidence, not a badge', 'Every accessibility fact carries who confirmed it and when. No “disability friendly” sticker, because that tells a candidate nothing.'],
                ['Hiring people can see before applying', 'Your steps, your timing, and the options you offer, from questions in advance to a work sample instead of an interview.'],
              ].map(([t, d]) => (
                <div key={t} className="ow-way ow-way--static">
                  <Text as="h3" variant="headingMd">
                    {t}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {d}
                  </Text>
                </div>
              ))}
            </div>
            <Text as="p" variant="bodySm" tone="subdued">
              You only ever see a candidate’s need — “needs step-free access”, “needs captions” — and only when they choose to share it on an application. Never a diagnosis. <Link to="/pricing">Pricing</Link> · <Link to="/claim">Claim your company page</Link> · <Link to="/signin?role=employer">Log in</Link>.
            </Text>
          </BlockStack>
        </section>
      </BlockStack>
    </div>
  );
}
