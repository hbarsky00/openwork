import { initials } from '../lib/format';
import type { Employer } from '../lib/types';

/**
 * Employers in the seed have no logo files, so the tile is a monogram on the
 * employer's brand color. That color is employer data, not a design token.
 */
export function EmployerLogo({ employer, size = 40 }: { employer: Employer; size?: number }) {
  return (
    <span
      className="ow-logo"
      aria-hidden="true"
      style={{ width: size, height: size, background: employer.logoColor, fontSize: size * 0.38 }}
    >
      {initials(employer.name)}
    </span>
  );
}
