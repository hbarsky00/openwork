import { useEffect } from 'react';

/** Predictable page titles help screen-reader users and tab-switchers alike. */
export function useTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Openwork` : 'Openwork';
  }, [title]);
}
