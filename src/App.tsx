import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { Shell } from './components/Shell';
import type { Role } from './lib/types';
import { useStore } from './state/store';

import { Landing } from './pages/public/Landing';
import { Jobs } from './pages/public/Jobs';
import { JobDetailPage } from './pages/public/JobDetailPage';
import { Company } from './pages/public/Company';
import { HowItWorks } from './pages/public/HowItWorks';
import { ForEmployers } from './pages/public/ForEmployers';
import { Support } from './pages/public/Support';
import { SignIn } from './pages/public/SignIn';
import { SignUp } from './pages/public/SignUp';
import { NotFound } from './pages/public/NotFound';

import { Onboarding } from './pages/candidate/Onboarding';
import { Discover } from './pages/candidate/Discover';
import { Matches } from './pages/candidate/Matches';
import { AssistSettings } from './pages/candidate/AssistSettings';
import { ResumeBuilder } from './pages/candidate/ResumeBuilder';
import { Saved } from './pages/candidate/Saved';
import { Applications } from './pages/candidate/Applications';
import { ApplicationDetail } from './pages/candidate/ApplicationDetail';
import { Passport } from './pages/candidate/Passport';
import { WorkPreferences } from './pages/candidate/WorkPreferences';
import { AccessNeedsPage } from './pages/candidate/AccessNeedsPage';
import { Privacy } from './pages/candidate/Privacy';
import { Apply } from './pages/candidate/Apply';

import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { EmployerJobs } from './pages/employer/EmployerJobs';
import { JobBuilder } from './pages/employer/JobBuilder';
import { JobPreview } from './pages/employer/JobPreview';
import { EmployerCandidates } from './pages/employer/EmployerCandidates';
import { CandidateDetail } from './pages/employer/CandidateDetail';
import { EmployerCompany } from './pages/employer/EmployerCompany';
import { EmployerAccessibility } from './pages/employer/EmployerAccessibility';
import { EmployerSignUp } from './pages/employer/EmployerSignUp';
import { EmployerInterviews } from './pages/employer/EmployerInterviews';
import { EmployerSettings } from './pages/employer/EmployerSettings';
import { ImportJobs } from './pages/employer/ImportJobs';
import { WhyThisMatches } from './pages/candidate/WhyThisMatches';
import { Pricing } from './pages/public/Pricing';
import { ClaimCompany } from './pages/public/ClaimCompany';

import { Admin } from './pages/admin/Admin';
import { ClerkBridge, useAuthPending } from './auth/clerk';

function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { state } = useStore();
  const location = useLocation();
  const pending = useAuthPending();
  if (pending) return null;
  if (state.role !== role) return <Navigate to={`/signin?next=${encodeURIComponent(location.pathname)}&role=${role}`} replace />;
  return <>{children}</>;
}

/** Every route change starts at the top. Hash links and query-only changes (filters) keep their position. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo({ top: 0 });
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, hash]);
  return null;
}

const C = ({ children }: { children: ReactNode }) => <RequireRole role="candidate">{children}</RequireRole>;
const E = ({ children }: { children: ReactNode }) => <RequireRole role="employer">{children}</RequireRole>;

/** Signed-in candidates land on Matches; everyone else sees the landing page. */
function Front() {
  const { state } = useStore();
  return state.role === 'candidate' ? <Navigate to="/matches" replace /> : <Landing />;
}

export function App() {
  return (
    <Shell>
      <ScrollToTop />
      <ClerkBridge />
      <Routes>
        <Route path="/" element={<Front />} />
        <Route path="/about" element={<Landing />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/companies/:id" element={<Company />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-employers" element={<ForEmployers />} />
        <Route path="/support" element={<Support />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/signin/*" element={<SignIn />} />
        <Route path="/signup/*" element={<SignUp />} />
        <Route path="/employers/signup" element={<EmployerSignUp />} />
        <Route path="/post" element={<JobBuilder />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/claim" element={<ClaimCompany />} />

        <Route path="/onboarding" element={<C><Onboarding /></C>} />
        <Route path="/matches" element={<C><Matches /></C>} />
        <Route path="/jobs/:id/match" element={<C><WhyThisMatches /></C>} />
        <Route path="/home" element={<Navigate to="/matches" replace />} />
        <Route path="/saved" element={<C><Saved /></C>} />
        <Route path="/applications" element={<C><Applications /></C>} />
        <Route path="/applications/:id" element={<C><ApplicationDetail /></C>} />
        <Route path="/passport" element={<C><Passport /></C>} />
        <Route path="/passport/how-i-work" element={<C><WorkPreferences /></C>} />
        <Route path="/passport/access-needs" element={<C><AccessNeedsPage /></C>} />
        <Route path="/passport/sharing" element={<C><Privacy /></C>} />
        <Route path="/passport/assist" element={<C><AssistSettings /></C>} />
        <Route path="/resume" element={<C><ResumeBuilder /></C>} />
        <Route path="/profile" element={<Navigate to="/passport" replace />} />
        <Route path="/profile/work-preferences" element={<Navigate to="/passport/how-i-work" replace />} />
        <Route path="/profile/privacy" element={<Navigate to="/passport/sharing" replace />} />
        <Route path="/jobs/:id/apply" element={<Apply />} />

        <Route path="/employer" element={<E><EmployerDashboard /></E>} />
        <Route path="/employer/jobs" element={<E><EmployerJobs /></E>} />
        <Route path="/employer/jobs/new" element={<E><JobBuilder /></E>} />
        <Route path="/employer/jobs/import" element={<E><ImportJobs /></E>} />
        <Route path="/employer/jobs/:id/edit" element={<E><JobBuilder /></E>} />
        <Route path="/employer/jobs/:id/preview" element={<E><JobPreview /></E>} />
        <Route path="/employer/candidates" element={<E><EmployerCandidates /></E>} />
        <Route path="/employer/interviews" element={<E><EmployerInterviews /></E>} />
        <Route path="/employer/settings" element={<E><EmployerSettings /></E>} />
        <Route path="/employer/candidates/:id" element={<E><CandidateDetail /></E>} />
        <Route path="/employer/accessibility" element={<E><EmployerAccessibility /></E>} />
        <Route path="/employer/company" element={<E><EmployerCompany /></E>} />

        <Route path="/admin" element={<RequireRole role="admin"><Admin /></RequireRole>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}
