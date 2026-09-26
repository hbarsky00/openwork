import { BlockStack, Button, InlineGrid, List, Text } from '@shopify/polaris';
import { useTitle } from '../../lib/useTitle';

const PLANS = [
  { id: 'free', name: 'Free', price: '$0', note: 'For a first hire.', cta: 'Post a job', url: '/post', primary: false, items: ['2 live jobs at a time', 'Full workplace accessibility profile', 'Candidate questions, answered once for everyone', 'Applications inbox with access needs shared only when candidates choose'] },
  { id: 'growth', name: 'Growth', price: '$149', per: 'per month', note: 'For teams hiring all year.', cta: 'Start with Growth', url: '/post?plan=growth', primary: true, items: ['Unlimited live jobs', 'Jobs can accept applications Openwork sends for candidates', 'Featured in Matches for people who fit', 'Import jobs from your careers page', 'Up to 5 team members'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Talk to us', note: 'For 50+ hires a year or federal contractors.', cta: 'Email us', url: 'mailto:employers@openwork.example', primary: false, items: ['ATS sync (Greenhouse, Lever, Workday)', 'Outreach record per job for Section 503 files', 'On-site verification of accessibility practices', 'Named contact and quarterly review'] },
] as const;

/** Three plans, one page. Verification is free on every plan and takes one call. */
export function Pricing() {
  useTitle('Pricing');
  return (
    <div className="ow-container">
      <BlockStack gap="600">
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Pricing for employers
          </Text>
          <Text as="p" variant="bodyLg" tone="subdued">
            Job seekers never pay. Employers pay for volume, not for accessibility features. Verification is free on every plan.
          </Text>
        </BlockStack>
        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          {PLANS.map((pl) => (
            <div key={pl.id} className={`ow-sheet ow-pricecard${pl.primary ? ' ow-pricecard--featured' : ''}`}>
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingLg">
                    {pl.name}
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {pl.price}
                    {'per' in pl ? (
                      <Text as="span" variant="bodyMd" tone="subdued">
                        {' '}
                        {pl.per}
                      </Text>
                    ) : null}
                  </Text>
                  <Text as="p" tone="subdued">
                    {pl.note}
                  </Text>
                </BlockStack>
                <List type="bullet">
                  {pl.items.map((it) => (
                    <List.Item key={it}>{it}</List.Item>
                  ))}
                </List>
                <Button url={pl.url} variant={pl.primary ? 'primary' : 'secondary'} size="large" fullWidth>
                  {pl.cta}
                </Button>
              </BlockStack>
            </div>
          ))}
        </InlineGrid>
        <div className="ow-why">
          <Text as="p">
            <strong>Verified practices</strong> is free. A 30-minute call with our trust team confirms what your workplace provides, and every job you post carries the badge with the date. Prices are a proposal until launch.
          </Text>
        </div>
      </BlockStack>
    </div>
  );
}
