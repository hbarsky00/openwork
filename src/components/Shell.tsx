import { ActionList, Button, InlineStack, Popover, Text } from '@shopify/polaris';
import { MenuIcon } from '@shopify/polaris-icons';
import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../state/store';
import { DisplaySettings } from './DisplaySettings';

interface NavItem {
  label: string;
  to: string;
  end?: boolean;
}

const PUBLIC_NAV: NavItem[] = [
  { label: 'Jobs', to: '/jobs' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'For employers', to: '/for-employers' },
];

const CANDIDATE_NAV: NavItem[] = [
  { label: 'Jobs', to: '/jobs' },
  { label: 'Saved', to: '/saved' },
  { label: 'Applications', to: '/applications' },
  { label: 'Profile', to: '/passport' },
];

const EMPLOYER_NAV: NavItem[] = [
  { label: 'Overview', to: '/employer', end: true },
  { label: 'Jobs', to: '/employer/jobs' },
  { label: 'Candidates', to: '/employer/candidates' },
  { label: 'Workplace accessibility', to: '/employer/accessibility' },
  { label: 'Company', to: '/employer/company' },
];

const ADMIN_NAV: NavItem[] = [{ label: 'Moderation', to: '/admin', end: true }];

export function Shell({ children }: { children: ReactNode }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = state.role === 'candidate' ? CANDIDATE_NAV : state.role === 'employer' ? EMPLOYER_NAV : state.role === 'admin' ? ADMIN_NAV : PUBLIC_NAV;
  const home = state.role === 'employer' ? '/employer' : state.role === 'admin' ? '/admin' : '/jobs';

  const signOut = () => {
    dispatch({ type: 'signOut' });
    navigate('/');
  };

  const accountName =
    state.role === 'candidate' ? state.candidate?.name : state.role === 'employer' ? state.employers.find((e) => e.id === state.employerId)?.name : state.role === 'admin' ? 'Trust team' : null;

  const menuItems = [
    ...nav.map((n) => ({ content: n.label, onAction: () => { setMenuOpen(false); navigate(n.to); } })),
    ...(state.role === 'visitor'
      ? [
          { content: 'Sign in', onAction: () => { setMenuOpen(false); navigate('/signin'); } },
          { content: 'Create account', onAction: () => { setMenuOpen(false); navigate('/signup'); } },
        ]
      : [{ content: 'Sign out', onAction: () => { setMenuOpen(false); signOut(); } }]),
  ];

  return (
    <>
      <a href="#main" className="ow-skip">
        Skip to main content
      </a>
      <header className="ow-header">
        <div className="ow-header__inner">
          <Link to={home} className="ow-brand" aria-label="Openwork home">
            <span className="ow-brand__mark" />
            Openwork
          </Link>

          <nav className="ow-nav" aria-label="Primary">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className="ow-nav__link">
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ow-header__actions">
            <DisplaySettings />
            {state.role === 'visitor' ? (
              <span className="ow-desktop-only">
                <Button url={`/signin?next=${encodeURIComponent(location.pathname)}`}>Sign in</Button>
              </span>
            ) : (
              <span className="ow-desktop-only">
                <InlineStack gap="300" blockAlign="center">
                  <span className="ow-header__name">
                    <Text as="span" variant="bodySm" tone="subdued">
                      {accountName}
                    </Text>
                  </span>
                  <Button onClick={signOut} variant="tertiary">
                    Sign out
                  </Button>
                </InlineStack>
              </span>
            )}
            <span className="ow-header__menu">
              <Popover active={menuOpen} onClose={() => setMenuOpen(false)} activator={<Button icon={MenuIcon} accessibilityLabel="Open menu" onClick={() => setMenuOpen((o) => !o)} ariaExpanded={menuOpen} />}>
                <ActionList items={menuItems} />
              </Popover>
            </span>
          </div>
        </div>
      </header>

      <main id="main" className="ow-main" tabIndex={-1}>
        {children}
      </main>

      <footer className="ow-footer">
        <div className="ow-container">
          <InlineStack align="space-between" blockAlign="center" wrap gap="400">
            <Text as="p" variant="bodySm" tone="subdued">
              Openwork · Jobs that tell you how they actually work.
            </Text>
            <InlineStack gap="400">
              <Link to="/about">About</Link>
              <Link to="/how-it-works">How it works</Link>
              <Link to="/discover">Start from your strengths</Link>
              <Link to="/support">Support</Link>
              <Link to="/for-employers">For employers</Link>
            </InlineStack>
          </InlineStack>
        </div>
      </footer>
    </>
  );
}
