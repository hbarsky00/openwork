import { Badge, Banner, BlockStack, Box, Button, EmptySearchResult, InlineGrid, InlineStack, Select, Text, TextField } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobCard } from '../../components/JobCard';
import { JobDetailContent } from '../../components/JobDetailContent';
import { NeedsSearch } from '../../components/NeedsSearch';
import { EMPLOYMENT_TYPE_LABEL, EXPERIENCE_LEVEL_LABEL, WORK_LOCATION_LABEL } from '../../lib/format';
import { activeFilterCount, readSearch, searchJobs, writeSearch, type SearchParams } from '../../lib/search';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const ANY = '__any';

export function Jobs() {
  useTitle('Find work');
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

  const selected = results.find((j) => j.id === selectedId) ?? null;
  const filterCount = activeFilterCount(params);
  const hasPassport = !!profile && (Object.keys(profile.accessNeeds).length > 0 || Object.keys(profile.workPreferences).length > 0);
  const requiredNeeds = profile ? Object.entries(profile.accessNeeds).filter(([, n]) => n.importance === 'required').map(([id]) => id) : [];

  // Single-value selects for the commodity facets. Multi-select lives in the URL for shareability, but one pick each is what people actually do.
  const one = (list: string[]) => (list.length === 1 ? list[0] : ANY);
  const setOne = (key: 'arrangement' | 'type' | 'level') => (v: string) => update({ [key]: v === ANY ? [] : [v] } as Partial<SearchParams>);

  return (
    <div className="ow-container">
      <BlockStack gap="500">
        <BlockStack gap="100">
          <Text as="h1" variant="heading2xl">
            {hasPassport ? 'Jobs that work for you' : 'Find work'}
          </Text>
          <Text as="p" tone="subdued">
            {hasPassport ? 'Every job compared with your passport. Differences and unknowns are shown, nothing is hidden, and you decide.' : 'Search by title or place, then say what you need. Every need matches only what an employer has confirmed.'}
          </Text>
        </BlockStack>

        {profile && requiredNeeds.length > 0 && params.need.length === 0 && (
          <Banner tone="info">
            <InlineStack align="space-between" blockAlign="center" wrap gap="300">
              <p>You have {requiredNeeds.length} required need{requiredNeeds.length === 1 ? '' : 's'} on your passport. Filter to jobs where all of them are confirmed?</p>
              <Button onClick={() => update({ need: requiredNeeds })}>Show only confirmed</Button>
            </InlineStack>
          </Banner>
        )}

        <Box padding="500" background="bg-surface" borderRadius="300" borderColor="border-secondary" borderWidth="025">
          <BlockStack gap="400">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update({ q: draftQ, where: draftWhere });
              }}
              role="search"
              aria-label="Search jobs"
            >
              <InlineGrid columns={{ xs: 1, md: ['twoThirds', 'oneThird'] }} gap="300" alignItems="end">
                <TextField label="Job title, skill or company" value={draftQ} onChange={setDraftQ} autoComplete="off" prefix={<SearchIcon width={16} />} clearButton onClearButtonClick={() => setDraftQ('')} />
                <InlineStack gap="200" blockAlign="end" wrap>
                  <div style={{ flex: '1 1 180px' }}>
                    <TextField label="City, state or “remote”" value={draftWhere} onChange={setDraftWhere} autoComplete="off" />
                  </div>
                  <Button submit variant="primary">
                    Search
                  </Button>
                </InlineStack>
              </InlineGrid>
            </form>

            <NeedsSearch jobs={state.jobs} employers={state.employers} needs={params.need} practices={params.practice} onChange={({ needs, practices }) => update({ need: needs, practice: practices })} />

            <InlineGrid columns={{ xs: 2, md: 5 }} gap="300">
              <Select label="Where" options={[{ label: 'Anywhere', value: ANY }, ...Object.entries(WORK_LOCATION_LABEL).map(([value, label]) => ({ value, label }))]} value={one(params.arrangement)} onChange={setOne('arrangement')} />
              <Select label="Job type" options={[{ label: 'Any type', value: ANY }, ...Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))]} value={one(params.type)} onChange={setOne('type')} />
              <Select label="Experience" options={[{ label: 'Any level', value: ANY }, ...Object.entries(EXPERIENCE_LEVEL_LABEL).map(([value, label]) => ({ value, label }))]} value={one(params.level)} onChange={setOne('level')} />
              <Select label="Minimum pay" options={[{ label: 'Any', value: '' }, { label: '$20+/hr', value: '20' }, { label: '$25+/hr', value: '25' }, { label: '$30+/hr (~$62k)', value: '30' }, { label: '$40+/hr (~$83k)', value: '40' }]} value={params.minPay} onChange={(v) => update({ minPay: v })} />
              <Select label="Posted" options={[{ label: 'Any time', value: '' }, { label: 'Past week', value: '7' }, { label: 'Past two weeks', value: '14' }, { label: 'Past month', value: '30' }]} value={params.posted} onChange={(v) => update({ posted: v })} />
            </InlineGrid>
          </BlockStack>
        </Box>

        <InlineStack align="space-between" blockAlign="center" wrap gap="300">
          <InlineStack gap="300" blockAlign="baseline" wrap>
            <Text as="h2" variant="headingLg">
              <span role="status" aria-live="polite">
                {results.length} job{results.length === 1 ? '' : 's'}
              </span>
              {params.q ? ` for “${params.q}”` : ''}
              {params.where ? ` in ${params.where}` : ''}
            </Text>
            {filterCount > 0 && (
              <Button variant="plain" onClick={clearAll}>
                Clear all filters
              </Button>
            )}
          </InlineStack>
          <InlineStack gap="300" blockAlign="center">
            {hasPassport && params.sort === 'recommended' && <Badge tone="info">Ordered by your passport</Badge>}
            <Box minWidth="220px">
              <Select label="Sort by" labelInline options={[{ label: hasPassport ? 'Best for you' : 'Newest', value: 'recommended' }, { label: 'Newest', value: 'newest' }, { label: 'Highest pay', value: 'pay' }]} value={params.sort} onChange={(v) => update({ sort: v as SearchParams['sort'] })} />
            </Box>
          </InlineStack>
        </InlineStack>

        {results.length === 0 ? (
          <Box paddingBlock="1200">
            <EmptySearchResult title="No jobs have confirmed everything you asked for" description="That does not mean none exist — employers have not answered every question. Remove a need, or open a job that looks right and use “Ask employer”." withIllustration />
            <Box paddingBlockStart="400">
              <InlineStack align="center">
                <Button onClick={clearAll}>Clear all filters</Button>
              </InlineStack>
            </Box>
          </Box>
        ) : (
          <div className="ow-split">
            <div>
              <h2 className="ow-visually-hidden">Results</h2>
              <BlockStack gap="300">
                {results.map((job) => (
                  <JobCard key={job.id} job={job} onSelect={setSelectedId} selected={job.id === selectedId} />
                ))}
              </BlockStack>
            </div>
            <div className="ow-split__detail" aria-live="polite">
              {selected && (
                <BlockStack gap="0">
                  <Box padding="300" borderBlockEndWidth="025" borderColor="border-secondary" background="bg-surface-secondary">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodySm" tone="subdued">
                        Job details
                      </Text>
                      <Button variant="plain" url={`/jobs/${selected.id}`}>
                        Open full page
                      </Button>
                    </InlineStack>
                  </Box>
                  <JobDetailContent job={selected} pane />
                </BlockStack>
              )}
            </div>
          </div>
        )}
      </BlockStack>
    </div>
  );
}
