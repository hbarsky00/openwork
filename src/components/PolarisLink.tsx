import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { LinkLikeComponentProps } from '@shopify/polaris/build/ts/src/utilities/link';

/** Routes Polaris `Link`/`Button url` through react-router. */
export const PolarisLink = forwardRef<HTMLAnchorElement, LinkLikeComponentProps>(
  function PolarisLink({ url, external, children, ...rest }, ref) {
    const isExternal = external || /^(https?:)?\/\//.test(url);
    if (isExternal) {
      return (
        <a ref={ref} href={url} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    }
    return (
      <RouterLink ref={ref} to={url} {...rest}>
        {children}
      </RouterLink>
    );
  },
);
