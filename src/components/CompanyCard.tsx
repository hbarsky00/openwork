import { BlockStack, InlineStack, Text } from '@shopify/polaris';
import { Link } from 'react-router-dom';
import type { Employer } from '../lib/types';
import { EmployerLogo } from './EmployerLogo';
import { VerificationBadge } from './VerificationBadge';

export function CompanyCard({ employer, openJobs }: { employer: Employer; openJobs: number }) {
  return (
    <article className="ow-jobcard">
      <InlineStack gap="300" blockAlign="start" wrap={false}>
        <EmployerLogo employer={employer} size={48} />
        <BlockStack gap="200">
          <BlockStack gap="050">
            <h3 className="ow-jobcard__title">
              <Link to={`/companies/${employer.id}`}>{employer.name}</Link>
            </h3>
            <Text as="p" variant="bodySm" tone="subdued">
              {employer.industry} · {employer.size} · {employer.headquarters}
            </Text>
          </BlockStack>
          <InlineStack gap="200" blockAlign="center" wrap>
            <VerificationBadge level={employer.verification} />
            <Text as="span" variant="bodySm" tone="subdued">
              {openJobs} open job{openJobs === 1 ? '' : 's'}
            </Text>
          </InlineStack>
        </BlockStack>
      </InlineStack>
    </article>
  );
}
