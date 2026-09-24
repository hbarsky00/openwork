import { Badge, BlockStack, Box, Button, EmptySearchResult, InlineStack, Select, Text, TextField } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { JobCard } from '../../components/JobCard';
import { JobDetailContent } from '../../components/JobDetailContent';
import { NeedsSearch } from '../../components/NeedsSearch';
import { EMPLOYMENT_TYPE_LABEL, WORK_LOCATION_LABEL } from '../../lib/format';
import { activeFilterCount, readSearch, searchJobs, writeSearch, type SearchParams } from '../../lib/search';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const ANY = '__any';

/**
 * The front door. Search bar, then jobs — on first paint, no account.
 * Filters are one row of plain dropdowns under the search, like every job
 * site people already know. The accessibility typeahead is one of them.
 */
export function Jobs() {
  useTitle('Jobs');
  const { state, dispatch } = useStore();
  const [sp, setSp] = useSearchParams();
  const params = useMemo(() => readSearch(sp), [sp]);
  const [draftQ, setDraftQ] = useState(params.q);
  const [draftWhere, setDraftWhere] = useState(params.where);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const profile = state.role === 'candidate' ? state.candidate : null;
  const results = useMemo(() => searchJobs(state.jobs, state.employers, params, profile), [state.jobs, state.employers, params, profile]);

  useEffect(() => {
    dispatch({ type: 'setLastSearch', value: sp.toString() });
  }, [sp, dispatch]);
  useEffect(() => {
    if (results.length === 0) setSelectedId(null);
    else if (!selectedId || !results.some((j) => j.id === selectedId)) setSelectedId(results[0].id);
  }, [results, selectedId]);

  const update = (patch: Partial<SearchParams>) => setSp(writeSearch({ ...params, ...patch }));
  const clearAll = () => {
    setDraftQ('');
    setDraftWhere('');
    setSp(new URLSearchParams());
  };
  const one = (list: string[]) => (list.length === 1 ? list[0] : ANY);
  const setOne = (key: 'arrangement' | 'type') => (v: string) => update({ [key]: v === ANY ? [] : [v] } as Partial<SearchParams>);

  const selected = results.find((j) => j.id === selectedId) ?? null;
  const hasPassport = !!profile && (Object.keys(profile.accessNeeds).length > 0 || Object.keys(profile.workPreferences).length > 0);

  return (
    <div className="ow-container">
      <BlockStack gap="500">
        <form onSubmit={(e) => { e.preventDefault(); update({ q: draftQ, where: draftWhere }); }} role="search" aria-label="Search jobs">
          <div className="ow-searchbar">
            <div className="ow-searchbar__what">
              <TextField label="What" labelHidden value={draftQ} onChange={setDraftQ} autoComplete="off" prefix={<SearchIcon width={16} />} placeholder="Job title, skill or company" clearButton onClearButtonClick={() => setDraftQ('')} />
            </div>
            <div className="ow-searchbar__where">
              <TextField label="Where" labelHidden value={draftWhere} onChange={setDraftWhere} autoComplete="off" placeholder="City, state or “remote”" />
            </div>
            <Button submit variant="primary" size="large">
              Find jobs
            </Button>
          </div>
        </form>

        <div className="ow-filterrow">
          <Select label="Where" labelHidden options={[{ label: 'Anywhere', value: ANY }, ...Object.entries(WORK_LOCATION_LABEL).map(([value, label]) => ({ value, label }))]} value={one(params.arrangement)} onChange={setOne('arrangement')} />
          <Select label="Job type" labelHidden options={[{ label: 'Job type', value: ANY }, ...Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))]} value={one(params.type)} onChange={setOne('type')} />
          <Select label="Pay" labelHidden options={[{ label: 'Pay', value: '' }, { label: '$20+/hr', value: '20' }, { label: '$25+/hr', value: '25' }, { label: '$30+/hr', value: '30' }, { label: '$40+/hr', value: '40' }]} value={params.minPay} onChange={(v) => update({ minPay: v })} />
          <Select label="Date posted" labelHidden options={[{ label: 'Date posted', value: '' }, { label: 'Past week', value: '7' }, { label: 'Past two weeks', value: '14' }, { label: 'Past month', value: '30' }]} value={params.posted} onChange={(v) => update({ posted: v })} />
          <div className="ow-filterrow__needs">
            <NeedsSearch compact jobs={state.jobs} employers={state.employers} needs={params.need} practices={params.practice} onChange={({ needs, practices }) => update({ need: needs, practice: practices })} />
          </div>
        </div>

        <InlineStack align="space-between" blockAlign="center" wrap gap="300">
          <InlineStack gap="300" blockAlign="baseline" wrap>
            <Text as="h1" variant="headingLg">
              <span role="status" aria-live="polite">
                {results.length} job{results.length === 1 ? '' : 's'}
              </span>
              {params.q ? ` for “${params.q}”` : ''}
              {params.where ? ` in ${params.where}` : ''}
            </Text>
            {activeFilterCount(params) + (params.q ? 1 : 0) + (params.where ? 1 : 0) > 0 && (
              <Button variant="plain" onClick={clearAll}>
                Clear
              </Button>
            )}
          </InlineStack>
          <InlineStack gap="300" blockAlign="center">
            {hasPassport && params.sort === 'recommended' && <Badge tone="info">Sorted for you</Badge>}
            <Box minWidth="200px">
              <Select label="Sort" labelInline options={[{ label: hasPassport ? 'Best for you' : 'Newest', value: 'recommended' }, { label: 'Newest', value: 'newest' }, { label: 'Highest pay', value: 'pay' }]} value={params.sort} onChange={(v) => update({ sort: v as SearchParams['sort'] })} />
            </Box>
          </InlineStack>
        </InlineStack>

        {results.length === 0 ? (
          <Box paddingBlock="1200">
            <EmptySearchResult title="No jobs match" description="Try fewer filters or a broader search. Not sure what to look for? Start from what you are good at." withIllustration />
            <Box paddingBlockStart="400">
              <InlineStack align="center" gap="300">
                <Button onClick={clearAll}>Clear filters</Button>
                <Button url="/discover" variant="plain">
                  Start from my strengths
                </Button>
              </InlineStack>
            </Box>
          </Box>
        ) : (
          <div className="ow-split">
            <div>
              <BlockStack gap="300">
                {results.map((job) => (
                  <JobCard key={job.id} job={job} onSelect={setSelectedId} selected={job.id === selectedId} />
                ))}
                <Text as="p" variant="bodySm" tone="subdued">
                  Not sure what to search for? <Link to="/discover">Start from what you are good at</Link>.
                </Text>
              </BlockStack>
            </div>
            <div className="ow-split__detail" aria-live="polite">
              {selected && <JobDetailContent job={selected} pane />}
            </div>
          </div>
        )}
      </BlockStack>
    </div>
  );
}
