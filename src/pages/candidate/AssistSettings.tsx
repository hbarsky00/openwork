import { Badge, BlockStack, Button, FormLayout, InlineGrid, InlineStack, Select, Text, TextField } from '@shopify/polaris';
import { OptionCard, OptionCards } from '../../components/OptionCard';
import { OptionGrid } from '../../components/OptionGrid';
import { autoApplyBlocker } from '../../lib/apply';
import { EMPLOYMENT_TYPE_LABEL, WORK_LOCATION_LABEL } from '../../lib/format';
import type { CandidateProfile, EmploymentType } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const PLANS: { plan: CandidateProfile['plan']; mode: CandidateProfile['assistMode']; name: string; price: string; title: string; help: string }[] = [
  { plan: 'free', mode: 'review', name: 'Free', price: '$0', title: 'Review', help: 'Openwork finds jobs. You review and apply, one tap when there are no employer questions.' },
  { plan: 'plus', mode: 'assist', name: 'Plus', price: '$19 / month', title: 'Assist', help: 'Openwork prepares applications for strong matches every day. You approve each one before it goes.' },
  { plan: 'pro', mode: 'auto', name: 'Pro', price: '$39 / month', title: 'Auto', help: 'Openwork sends applications within your rules. Jobs with employer questions still wait for you.' },
];

/**
 * How Openwork helps: plan, mode and the rules Openwork must obey. The rules
 * are the product — a person in a wheelchair never gets auto-applied to a
 * job with steps, because "required needs must be confirmed" is on by default.
 */
export function AssistSettings() {
  useTitle('How Openwork helps');
  const { state, dispatch } = useStore();
  const p = state.candidate!;
  const patch = (x: Partial<CandidateProfile>) => dispatch({ type: 'updateCandidate', patch: x });
  const rules = p.autoRules;
  const setRule = (x: Partial<typeof rules>) => patch({ autoRules: { ...rules, ...x } });

  const published = state.jobs.filter((j) => j.status === 'published');
  const eligible = published.filter((j) => {
    const e = state.employers.find((x) => x.id === j.employerId);
    return e && !autoApplyBlocker(j, e, p) && !state.applications.some((a) => a.candidateId === p.id && a.jobId === j.id);
  });
  const required = Object.values(p.accessNeeds).filter((n) => n.importance === 'required').length;

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <BlockStack gap="100">
            <Text as="h1" variant="heading2xl">
              How Openwork helps
            </Text>
            <Text as="p" tone="subdued">
              Pick how much Openwork does for you, and the rules it must follow. Change either any time.
            </Text>
          </BlockStack>
        </div>

        <div className="ow-sheet">
          <BlockStack gap="600">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                Plan
              </Text>
              <InlineGrid columns={{ xs: 1, md: 3 }} gap="300">
                {PLANS.map((pl) => (
                  <button key={pl.plan} type="button" className="ow-optcard ow-plancard" aria-pressed={p.plan === pl.plan} onClick={() => patch({ plan: pl.plan, assistMode: pl.mode })}>
                    <span className="ow-optcard__dot" aria-hidden="true" />
                    <span>
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="span" variant="headingSm">
                          {pl.name} · {pl.title}
                        </Text>
                        {pl.plan === 'plus' && <Badge tone="info">Most popular</Badge>}
                      </InlineStack>
                      <Text as="p" variant="bodySm" fontWeight="semibold">
                        {pl.price}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {pl.help}
                      </Text>
                    </span>
                  </button>
                ))}
              </InlineGrid>
              <Text as="p" variant="bodySm" tone="subdued">
                Prototype: choosing a plan switches it on. No card is charged.
              </Text>
            </BlockStack>

            {p.assistMode !== 'review' && (
              <>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingLg">
                    Rules Openwork must follow
                  </Text>
                  <OptionCards>
                    <OptionCard multiple title="Only Strong and Good matches" help="Never a job that is merely worth reviewing." selected={rules.onlyStrongMatches} onClick={() => setRule({ onlyStrongMatches: !rules.onlyStrongMatches })} />
                    <OptionCard multiple title="Every required access need must be confirmed by the employer" help={required ? `You have ${required} required need${required === 1 ? '' : 's'}. Not provided never counts as confirmed.` : 'You have no required needs yet. Add them on your profile and this rule protects you automatically.'} selected={rules.requireNeedsConfirmed} onClick={() => setRule({ requireNeedsConfirmed: !rules.requireNeedsConfirmed })} />
                  </OptionCards>
                  <FormLayout>
                    <FormLayout.Group>
                      <TextField label="Minimum pay per hour" type="number" prefix="$" value={rules.minPay?.toString() ?? ''} onChange={(v) => setRule({ minPay: v ? Number(v) : null })} autoComplete="off" helpText="Blank = no floor." />
                      <Select label="Applications per day, at most" options={['1', '2', '3', '5', '10'].map((v) => ({ label: v, value: v }))} value={String(rules.dailyCap)} onChange={(v) => setRule({ dailyCap: Number(v) })} />
                    </FormLayout.Group>
                  </FormLayout>
                  <OptionGrid label="Work arrangement" helpText="Leave all off for any." multiple options={Object.entries(WORK_LOCATION_LABEL).map(([value, label]) => ({ value, label }))} value={rules.arrangements} onChange={(v) => setRule({ arrangements: v as string[] })} />
                  <OptionGrid label="Employment type" helpText="Leave all off for any." multiple options={Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))} value={rules.types} onChange={(v) => setRule({ types: v as EmploymentType[] })} />
                </BlockStack>

                <div className="ow-why" role="status">
                  <Text as="p" variant="bodySm">
                    <strong>Right now:</strong> {eligible.length} open job{eligible.length === 1 ? '' : 's'} pass{eligible.length === 1 ? 'es' : ''} these rules. {p.assistMode === 'auto' ? `Openwork would send up to ${rules.dailyCap} a day, and prepare the ones with employer questions for you.` : `Openwork would prepare up to ${rules.dailyCap} a day for your approval.`} Sharing rules on your profile always apply: nothing marked private or matching-only is ever sent.
                  </Text>
                </div>
              </>
            )}

            <InlineStack gap="300">
              <Button url="/matches" variant="primary">
                Back to matches
              </Button>
              <Button url="/passport/sharing">Sharing rules</Button>
            </InlineStack>
          </BlockStack>
        </div>
      </BlockStack>
    </div>
  );
}
