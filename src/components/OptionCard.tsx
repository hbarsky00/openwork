import { Text } from '@shopify/polaris';

/**
 * Reference option card: a big tappable row with a radio/check dot, a title
 * and one line of help. Keyboard: it is a real button.
 */
export function OptionCard({ title, help, selected, onClick, multiple = false }: { title: string; help?: string; selected: boolean; onClick: () => void; multiple?: boolean }) {
  const aria = multiple ? { 'aria-checked': selected, role: 'checkbox' as const } : { 'aria-pressed': selected };
  return (
    <button type="button" className={`ow-optcard${multiple ? ' ow-optcard--check' : ''}`} onClick={onClick} {...aria}>
      <span className="ow-optcard__dot" aria-hidden="true" />
      <span>
        <Text as="span" variant="headingSm">
          {title}
        </Text>
        {help && (
          <Text as="p" variant="bodySm" tone="subdued">
            {help}
          </Text>
        )}
      </span>
    </button>
  );
}

export function OptionCards({ children }: { children: React.ReactNode }) {
  return <div className="ow-optcards">{children}</div>;
}
