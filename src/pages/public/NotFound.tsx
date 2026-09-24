import { BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { useTitle } from '../../lib/useTitle';

export function NotFound({ message = 'The page you asked for does not exist.' }: { message?: string }) {
  useTitle('Page not found');
  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="400">
        <Text as="h1" variant="heading2xl">
          We can’t find that page
        </Text>
        <Text as="p" variant="bodyLg" tone="subdued">
          {message}
        </Text>
        <InlineStack gap="300">
          <Button url="/jobs" variant="primary">
            Find jobs
          </Button>
          <Button url="/">Go to the home page</Button>
        </InlineStack>
      </BlockStack>
    </div>
  );
}
