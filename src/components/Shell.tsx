import { ActionList, Button, InlineStack, Popover, Text } from '@shopify/polaris';
import { MenuIcon, PersonIcon, SearchIcon, SendIcon, StarIcon, MagicIcon } from '@shopify/polaris-icons';
import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { initials } from '../lib/format';
import { useSignOut } from '../auth/clerk';
import { useStore } from '../state/store';
import { DisplaySettings } from './DisplaySettings';

interface NavItem {
  label: string;
  to: string;
  end?: boolean;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  short?: string;
}

const PUBLIC_NAV: NavItem[] = [
  { label: 'Search jobs', to: '/jobs' },
  { label: 'For employers', to: '/for-employers' },
];

const CANDIDATE_NAV: NavItem[] = [
  { label: 'Matches', to: '/matches', icon: MagicIcon },
  { label: 'Search jobs', to: '/jobs', icon: SearchIcon, short: 'Search' },
  { label: 'Applications', to: '/applications', icon: SendIcon, short: 'Applied' },
  { label: 'Saved', to: '/saved', icon: StarIcon },
  { label: 'Profile', to: '/passport', icon: PersonIcon },
];

const EMPLOYER_NAV: NavItem[] = [
  { label: 'Overview', to: '/employer', end: true },
  { label: 'Jobs', to: '/employer/jobs' },
  { label: 'Candidates', to: '/employer/candidates' },
  { label: 'Interviews', to: '/employer/interviews' },
  { label: 'Workplace accessibility', to: '/employer/accessibility' },
  { label: 'Company', to: '/employer/company' },
  { label: 'Settings', to: '/employer/settings' },
];

const ADMIN_NAV: NavItem[] = [{ label: 'Moderation', to: '/admin', end: true }];

export function Shell({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const nav = state.role === 'candidate' ? CANDIDATE_NAV : state.role === 'employer' ? EMPLOYER_NAV : state.role === 'admin' ? ADMIN_NAV : PUBLIC_NAV;
  const home = state.role === 'candidate' ? '/matches' : state.role === 'employer' ? '/employer' : state.role === 'admin' ? '/admin' : '/';

  const signOutAll = useSignOut();
  const signOut = () => {
    signOutAll();
    navigate('/');
  };

  const accountName = state.role === 'candidate' ? state.candidate?.name ?? '' : state.role === 'employer' ? state.employers.find((e) => e.id === state.employerId)?.name ?? '' : state.role === 'admin' ? 'Trust team' : '';

  const menuItems = [
    ...nav.map((n) => ({ content: n.label, onAction: () => { setMenuOpen(false); navigate(n.to); } })),
    ...(state.role === 'visitor'
      ? [
          { content: 'Post a job', onAction: () => { setMenuOpen(false); navigate('/post'); } },
          { content: 'Log in', onAction: () => { setMenuOpen(false); navigate('/signin'); } },
          { content: 'Sign up', onAction: () => { setMenuOpen(false); navigate('/signup'); } },
        ]
      : [{ content: 'Sign out', onAction: () => { setMenuOpen(false); signOut(); } }]),
  ];
  const accountItems = [
    ...(state.role === 'candidate' ? [{ content: 'Profile', onAction: () => { setAccountOpen(false); navigate('/passport'); } }, { content: 'Privacy & sharing', onAction: () => { setAccountOpen(false); navigate('/passport/sharing'); } }, { content: 'Résumé builder', onAction: () => { setAccountOpen(false); navigate('/resume'); } }, { content: 'How Openwork helps', onAction: () => { setAccountOpen(false); navigate('/passport/assist'); } }] : []),
    ...(state.role === 'employer' ? [{ content: 'Settings', onAction: () => { setAccountOpen(false); navigate('/employer/settings'); } }] : []),
    { content: 'Support', onAction: () => { setAccountOpen(false); navigate('/support'); } },
    { content: 'Sign out', onAction: () => { setAccountOpen(false); signOut(); } },
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
                <InlineStack gap="200">
                  <Button url="/post" variant="tertiary">
                    Post a job
                  </Button>
                  <Button url={`/signin?next=${encodeURIComponent(location.pathname)}`} variant="tertiary">
                    Log in
                  </Button>
                  <Button url="/signup" variant="primary">
                    Sign up
                  </Button>
                </InlineStack>
              </span>
            ) : (
              <span className="ow-desktop-only">
                <Popover
                  active={accountOpen}
                  onClose={() => setAccountOpen(false)}
                  activator={
                    <button type="button" className="ow-avatar" onClick={() => setAccountOpen((o) => !o)} aria-expanded={accountOpen} aria-haspopup="menu" aria-label={`Account: ${accountName}`}>
                      {initials(accountName || 'O')}
                    </button>
                  }
                >
                  <div style={{ padding: '12px 16px 4px' }}>
                    <Text as="p" variant="bodySm" fontWeight="semibold">
                      {accountName}
                    </Text>
                  </div>
                  <ActionList items={accountItems} />
                </Popover>
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

      <main id="main" className={`ow-main${state.role === 'candidate' ? ' ow-main--bottomnav' : ''}`} tabIndex={-1}>
        {children}
      </main>

      {state.role === 'candidate' && (
        <nav className="ow-bottomnav" aria-label="Primary (mobile)">
          {CANDIDATE_NAV.map((n) => {
            const I = n.icon!;
            return (
              <NavLink key={n.to} to={n.to} end={n.end}>
                <I aria-hidden="true" />
                <span>{n.short ?? n.label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}

      <footer className="ow-footer">
        <div className="ow-container">
          <InlineStack align="space-between" blockAlign="center" wrap gap="400">
            <Text as="p" variant="bodySm" tone="subdued">
              Openwork · Find the right job. Apply with confidence.
            </Text>
            <InlineStack gap="400">
              <Link to="/about">About</Link>
              <Link to="/how-it-works">How it works</Link>
              <Link to="/support">Support</Link>
              <Link to="/for-employers">For employers</Link>
            </InlineStack>
          </InlineStack>
        </div>
      </footer>
    </>
  );
}
