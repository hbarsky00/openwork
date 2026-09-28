/**
 * Applicant tracking systems. Nothing is marked available, because nothing is
 * built yet. A provider only moves to `beta` or `available` when a real
 * connection exists, so the employer is never told a lie.
 */
export type AtsStatus = 'available' | 'beta' | 'comingSoon' | 'requestIntegration';

export interface AtsProvider {
  id: string;
  name: string;
  status: AtsStatus;
  /** What we can honestly say we do today. */
  note: string;
}

export const ATS_STATUS_LABEL: Record<AtsStatus, string> = {
  available: 'Available',
  beta: 'Beta',
  comingSoon: 'Coming soon',
  requestIntegration: 'Request integration',
};

export const ATS_PROVIDERS: AtsProvider[] = [
  { id: 'greenhouse', name: 'Greenhouse', status: 'comingSoon', note: 'Their job board API is the first one we are building against.' },
  { id: 'lever', name: 'Lever', status: 'comingSoon', note: 'Postings API. Second in the queue.' },
  { id: 'ashby', name: 'Ashby', status: 'comingSoon', note: 'Public job board API.' },
  { id: 'workday', name: 'Workday', status: 'requestIntegration', note: 'Every Workday tenant is configured differently. Tell us yours and we will scope it.' },
  { id: 'smartrecruiters', name: 'SmartRecruiters', status: 'requestIntegration', note: 'Posting API available; not started.' },
  { id: 'icims', name: 'iCIMS', status: 'requestIntegration', note: 'Usually needs a partner agreement. Tell us and we will start it.' },
  { id: 'other', name: 'Another system', status: 'requestIntegration', note: 'Name it and we will look at what it offers.' },
];
