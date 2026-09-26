/* eslint-disable react-hooks/rules-of-hooks -- `enabled` is a build-time constant, so hook order never changes. */
import { ClerkProvider, useClerk, useUser } from '@clerk/clerk-react';
import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../state/store';

const KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

/** Real email accounts run through Clerk when a key is present. Without one, /signin shows demo accounts. */
export const clerkEnabled = !!KEY;

const appearance = {
  variables: { colorPrimary: '#0f172a', colorText: '#0f172a', colorTextSecondary: '#475569', colorBackground: '#ffffff', borderRadius: '6px', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px' },
  elements: { card: { boxShadow: 'none', border: '1px solid #e2e8f0' }, formButtonPrimary: { fontSize: '16px', height: '44px' }, formFieldInput: { height: '44px' } },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!clerkEnabled) return <>{children}</>;
  return (
    <ClerkProvider publishableKey={KEY!} appearance={appearance} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  );
}

/** Mirrors the Clerk session into the local store: known email → that candidate, new email → new candidate → onboarding. */
export function ClerkBridge() {
  if (!clerkEnabled) return null;
  const { isLoaded, isSignedIn, user } = useUser();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !email || state.role !== 'visitor') return;
    const existing = state.candidates.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      dispatch({ type: 'signInCandidate', profile: existing });
      return;
    }
    dispatch({ type: 'signUpCandidate', name: user?.fullName || user?.firstName || email.split('@')[0], email });
    navigate('/onboarding');
  }, [isLoaded, isSignedIn, email, state.role, state.candidates, user, dispatch, navigate]);
  return null;
}

/** True while Clerk is still loading or has a session the store has not mirrored yet. Guards keep quiet instead of bouncing to /signin. */
export function useAuthPending(): boolean {
  const { state } = useStore();
  if (!clerkEnabled) return false;
  const { isLoaded, isSignedIn } = useUser();
  return !isLoaded || (!!isSignedIn && state.role === 'visitor');
}

/** Store sign-out plus Clerk sign-out, so the bridge does not log the person straight back in. */
export function useSignOut() {
  const { dispatch } = useStore();
  const clerk = clerkEnabled ? useClerk() : null;
  return () => {
    dispatch({ type: 'signOut' });
    void clerk?.signOut();
  };
}
