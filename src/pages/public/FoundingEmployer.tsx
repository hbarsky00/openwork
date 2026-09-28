import { Banner, BlockStack, Button, Form, FormLayout, InlineStack, Select, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { validEmail } from '../../lib/auth';
import type { EmployerLead } from '../../lib/types';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const SIZES = [
  { label: '1 open job', value: '1' },
  { label: '2–10 open jobs', value: '2-10' },
  { label: '11–50 open jobs', value: '11-50' },
  { label: 'More than 50', value: '51+' },
];
const ATS = ['Not sure', 'None', 'Greenhouse', 'Lever', 'Ashby', 'Workday', 'SmartRecruiters', 'iCIMS', 'Other'].map((v) => ({ label: v, value: v }));

/** Seven questions. Everything else can wait until there is a reason to ask. */
export function FoundingEmployer() {
  useTitle('Founding Employers');
  const { dispatch } = useStore();
  const [f, setF] = useState({ company: '', website: '', careersUrl: '', email: '', openJobs: '2-10', ats: 'Not sure', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => { setF((x) => ({ ...x, [k]: v })); setErrors({}); };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!f.company.trim()) e.company = 'Enter your company name.';
    if (!validEmail(f.email)) e.email = 'Enter your work email address.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const lead: EmployerLead = { id: `lead-${Date.now().toString(36)}`, company: f.company.trim(), website: f.website.trim(), careersUrl: f.careersUrl.trim(), email: f.email.trim(), openJobs: f.openJobs, ats: f.ats, message: f.message.trim(), stage: 'founding', createdOn: new Date().toISOString().slice(0, 10), notes: [], employerId: null };
    dispatch({ type: 'addLead', lead });
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  if (done) {
    return (
      <div className="ow-container ow-container--narrow">
        <BlockStack gap="500">
          <BlockStack gap="200">
            <Text as="h1" variant="heading2xl">
              Welcome to Openwork.
            </Text>
            <Text as="p" variant="bodyLg" tone="subdued">
              We have your details{f.careersUrl ? ` and your careers page` : ''}. Next: let’s bring in your jobs.
            </Text>
          </BlockStack>
          <div className="ow-sheet">
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                You can start now, or wait for us
              </Text>
              <Text as="p">
                Importing takes about a minute and you see every job before anything is published. If you would rather we prepared it, we will read your careers page, set up your company profile and send you a review link.
              </Text>
              <InlineStack gap="300" wrap>
                <Button url={f.careersUrl ? `/import?url=${encodeURIComponent(f.careersUrl)}` : '/import'} variant="primary" size="large">
                  Import my jobs now
                </Button>
                <Button url="/employers" size="large">
                  Back to For employers
                </Button>
              </InlineStack>
            </BlockStack>
          </div>
        </BlockStack>
      </div>
    );
  }

  return (
    <div className="ow-container ow-container--narrow">
      <BlockStack gap="500">
        <div className="ow-pagehead">
          <Link to="/employers" className="ow-backlink">
            ← For employers
          </Link>
        </div>
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl">
            Join Openwork Founding Employers
          </Text>
          <Text as="p" tone="subdued">
            Seven questions, most of them optional. We use them to bring your existing jobs in for you rather than asking you to retype anything.
          </Text>
        </BlockStack>
        <div className="ow-sheet">
          <Form onSubmit={submit}>
            <FormLayout>
              <FormLayout.Group>
                <TextField label="Company name" value={f.company} onChange={set('company')} autoComplete="organization" error={errors.company} requiredIndicator />
                <TextField label="Work email" type="email" value={f.email} onChange={set('email')} autoComplete="email" error={errors.email} requiredIndicator helpText="An address at your company’s domain." />
              </FormLayout.Group>
              <FormLayout.Group>
                <TextField label="Company website (optional)" type="url" value={f.website} onChange={set('website')} autoComplete="url" placeholder="company.com" />
                <TextField label="Careers page (optional)" type="url" value={f.careersUrl} onChange={set('careersUrl')} autoComplete="url" placeholder="company.com/careers" helpText="This is what lets us import your jobs for you." />
              </FormLayout.Group>
              <FormLayout.Group>
                <Select label="Roughly how many open jobs?" options={SIZES} value={f.openJobs} onChange={set('openJobs')} />
                <Select label="Which hiring system do you use?" options={ATS} value={f.ats} onChange={set('ats')} />
              </FormLayout.Group>
              <TextField label="Anything we should know? (optional)" value={f.message} onChange={set('message')} multiline={3} autoComplete="off" placeholder="Roles you struggle to fill, accessibility you already offer, timing." />
              <Button submit variant="primary" size="large">
                Join Founding Employers
              </Button>
            </FormLayout>
          </Form>
        </div>
        <Banner tone="info" title="What happens next">
          <p>We read your careers page, prepare your company profile and flag what is missing, then send you a review link. Nothing is published until you say so. Founding Employer benefits are free while we are building; we will tell you well before that changes.</p>
        </Banner>
      </BlockStack>
    </div>
  );
}
