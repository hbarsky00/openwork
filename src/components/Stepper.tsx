import { BlockStack, Button, InlineStack, Text } from '@shopify/polaris';
import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  step: number;
  total: number;
  title: string;
  /** Short label of the current step, read after "Step n of m". */
  stepLabel?: string;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  /** Escape hatch shown on every step: "Do this later". */
  onLater?: () => void;
  laterLabel?: string;
  children: ReactNode;
}

/**
 * One question per screen. Progress in text and in a bar; Back, Skip and
 * Continue in the same place every time; focus moves to the heading on each
 * step so keyboard and screen-reader users land on the question.
 */
export function Stepper({ step, total, title, stepLabel, onBack, onNext, onSkip, nextLabel = 'Continue', onLater, laterLabel = 'Do this later — show me jobs', children }: Props) {
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    top.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);
  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="600">
        <div ref={top} tabIndex={-1} style={{ outline: 'none' }}>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">
              {title} · Step {step + 1} of {total}
              {stepLabel ? ` · ${stepLabel}` : ''}
            </Text>
            <ol className="ow-steps" aria-label="Progress">
              {Array.from({ length: total }).map((_, i) => (
                <li key={i} className={`ow-steps__item ${i < step ? 'ow-steps__item--done' : i === step ? 'ow-steps__item--current' : ''}`} aria-current={i === step ? 'step' : undefined}>
                  <span className="ow-visually-hidden">Step {i + 1}</span>
                </li>
              ))}
            </ol>
          </BlockStack>
        </div>

        <div>{children}</div>

        <div className="ow-actionbar">
          <BlockStack gap="300">
            <div className="ow-actionbar__row">
              <Button onClick={onBack} disabled={!onBack} size="large">
                Back
              </Button>
              <div className="ow-actionbar__primary">
                <Button variant="primary" size="large" fullWidth onClick={onNext}>
                  {nextLabel}
                </Button>
              </div>
            </div>
            {(onSkip || onLater) && (
              <InlineStack gap="400" align="center" blockAlign="center" wrap>
                {onSkip && (
                  <Button variant="plain" onClick={onSkip}>
                    Skip this question
                  </Button>
                )}
                {onLater && (
                  <Button variant="plain" onClick={onLater}>
                    {laterLabel}
                  </Button>
                )}
              </InlineStack>
            )}
          </BlockStack>
        </div>
      </BlockStack>
    </div>
  );
}
