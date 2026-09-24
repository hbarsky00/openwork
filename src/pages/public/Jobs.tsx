import { Badge, Banner, BlockStack, Box, Button, Checkbox, ChoiceList, EmptySearchResult, InlineStack, Modal, Popover, Select, Tag, Text, TextField } from '@shopify/polaris';
import { FilterIcon, SearchIcon } from '@shopify/polaris-icons';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobCard } from '../../components/JobCard';
import { JobDetailContent } from '../../components/JobDetailContent';
import { ACCESS_CATEGORIES, ACCESS_FEATURES, ACCESS_FEATURE_BY_ID, HIRING_OPTIONS, HIRING_OPTION_BY_ID, type HiringOptionId } from '../../lib/access';
import { EMPLOYMENT_TYPE_LABEL, EXPERIENCE_LEVEL_LABEL, WORK_LOCATION_LABEL } from '../../lib/format';
import { activeFilterCount, readSearch, searchJobs, writeSearch, type SearchParams } from '../../lib/search';
import { useTitle } from '../../lib/useTitle';
import { useStore } from '../../state/store';

const FILTER_FEATURES = ACCESS_FEATURES.filter((f) => f.filter);

export function Jobs() {
  useTitle('Find work');
  const { state, dispatch } = useStore();
  const [sp, setSp] = useSearchParams();
  const params = useMemo(() => readSearch(sp), [sp]);
  const [draftQ, setDraftQ] = useState(params.q);
  const [draftWhere, setDraftWhere] = useState(params.where);
  const [allOpen, setAllOpen] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
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
  const toggleIn = (key: 'arrangement' | 'type' | 'level' | 'practice' | 'need', value: string) => {
    const list = params[key] as string[];
    update({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] } as Partial<SearchParams>);
  };
  const clearAll = () => {
    setDraftQ('');
    setDraftWhere('');
    setSp(new URLSearchParams());
  };

  const selected = results.find((j) => j.id === selectedId) ?? null;
  const filterCount = activeFilterCount(params);
  const hasPassport = !!profile && (Object.keys(profile.accessNeeds).length > 0 || Object.keys(profile.workPreferences).length > 0);
  const requiredNeeds = profile ? Object.entries(profile.accessNeeds).filter(([, n]) => n.importance === 'required').map(([id]) => id) : [];

  const pill = (id: string, label: string, count: number, content: React.ReactNode) => (
    <Popover key={id} active={openPopover === id} onClose={() => setOpenPopover(null)} activator={<Button disclosure pressed={count > 0} onClick={() => setOpenPopover(openPopover === id ? null : id)} ariaExpanded={openPopover === id}>{count > 0 ? `${label} · ${count}` : label}</Button>}>
      <Box padding="400" minWidth="280px" maxWidth="420px">
        {content}
      </Box>
    </Popover>
  );

  const needsFilterContent = (
    <BlockStack gap="300">
      <Text as="p" variant="bodySm" tone="subdued">
        Shows only jobs where the employer has <strong>confirmed</strong> each need. Unknown never counts.
      </Text>
      {ACCESS_CATEGORIES.map((c) => {
        const items = FILTER_FEATURES.filter((f) => f.category === c.id);
        if (!items.length) return null;
        return (
          <BlockStack key={c.id} gap="100">
            <Text as="h3" variant="headingSm">
              {c.label}
            </Text>
            {items.map((f) => (
              <Checkbox key={f.id} label={f.label} checked={params.need.includes(f.id)} onChange={() => toggleIn('need', f.id)} />
            ))}
          </BlockStack>
        );
      })}
    </BlockStack>
  );

  return (
    <div className="ow-container">
      <BlockStack gap="500">
        <BlockStack gap="100">
          <Text as="h1" variant="heading2xl">
            {hasPassport ? 'Jobs that work for you' : 'Find work'}
          </Text>
          <Text as="p" tone="subdued">
            {hasPassport ? 'Every job compared with your passport. Differences and unknowns are shown, nothing is hidden, and you decide.' : 'Search normally, then filter by what you need. Every accessibility filter matches only what employers have confirmed.'}
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: draftQ, where: draftWhere });
          }}
          role="search"
          aria-label="Search jobs"
        >
          <InlineStack gap="300" blockAlign="end" wrap>
            <div style={{ flex: '2 1 240px' }}>
              <TextField label="Job title, skill or company" value={draftQ} onChange={setDraftQ} autoComplete="off" prefix={<SearchIcon width={16} />} clearButton onClearButtonClick={() => setDraftQ('')} />
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <TextField label="City, state or “remote”" value={draftWhere} onChange={setDraftWhere} autoComplete="off" />
            </div>
            <Button submit variant="primary">
              Search
            </Button>
          </InlineStack>
        </form>

        <InlineStack gap="200" wrap blockAlign="center">
          {pill('need', 'What you need', params.need.length, needsFilterContent)}
          {pill(
            'hiring',
            'Hiring options',
            params.practice.length,
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">
                Accessible hiring
              </Text>
              {HIRING_OPTIONS.map((p) => (
                <Checkbox key={p.id} label={p.filterLabel} checked={params.practice.includes(p.id)} onChange={() => toggleIn('practice', p.id)} />
              ))}
            </BlockStack>,
          )}
          {pill('arrangement', 'Where', params.arrangement.length, <ChoiceList title="Where the work happens" allowMultiple choices={Object.entries(WORK_LOCATION_LABEL).map(([value, label]) => ({ value, label }))} selected={params.arrangement} onChange={(v) => update({ arrangement: v })} />)}
          {pill('type', 'Job type', params.type.length, <ChoiceList title="Employment type" allowMultiple choices={Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))} selected={params.type} onChange={(v) => update({ type: v })} />)}
          <Button icon={FilterIcon} onClick={() => setAllOpen(true)}>
            All filters
          </Button>
          {filterCount > 0 && (
            <Button variant="plain" onClick={clearAll}>
              Clear all
            </Button>
          )}
        </InlineStack>

        {(params.need.length > 0 || params.practice.length > 0) && (
          <InlineStack gap="200" wrap blockAlign="center">
            <Text as="span" variant="bodySm" tone="subdued">
              Confirmed by employer:
            </Text>
            {params.need.map((id) => (
              <Tag key={id} onRemove={() => toggleIn('need', id)}>
                {ACCESS_FEATURE_BY_ID[id]?.label ?? id}
              </Tag>
            ))}
            {params.practice.map((id) => (
              <Tag key={id} onRemove={() => toggleIn('practice', id)}>
                {HIRING_OPTION_BY_ID[id as HiringOptionId]?.filterLabel ?? id}
              </Tag>
            ))}
          </InlineStack>
        )}

        <InlineStack align="space-between" blockAlign="center" wrap gap="300">
          <Text as="h2" variant="headingLg">
            <span role="status" aria-live="polite">
              {results.length} job{results.length === 1 ? '' : 's'}
            </span>
            {params.q ? ` for “${params.q}”` : ''}
            {params.where ? ` in ${params.where}` : ''}
          </Text>
          <InlineStack gap="300" blockAlign="center">
            {hasPassport && params.sort === 'recommended' && <Badge tone="info">Ordered by your passport</Badge>}
            <Box minWidth="220px">
              <Select label="Sort by" labelInline options={[{ label: hasPassport ? 'Best for you' : 'Newest', value: 'recommended' }, { label: 'Newest', value: 'newest' }, { label: 'Highest pay', value: 'pay' }]} value={params.sort} onChange={(v) => update({ sort: v as SearchParams['sort'] })} />
            </Box>
          </InlineStack>
        </InlineStack>

        {results.length === 0 ? (
          <Box paddingBlock="1200">
            <EmptySearchResult title="No jobs have confirmed everything you asked for" description="That does not mean none exist — employers have not answered every question. Try removing a filter, then use “Ask employer” on a job that looks right." withIllustration />
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

      <Modal open={allOpen} onClose={() => setAllOpen(false)} title="All filters" primaryAction={{ content: `Show ${results.length} job${results.length === 1 ? '' : 's'}`, onAction: () => setAllOpen(false) }} secondaryActions={[{ content: 'Clear all', onAction: clearAll }]}>
        <Modal.Section>
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              What you need
            </Text>
            {needsFilterContent}
          </BlockStack>
        </Modal.Section>
        <Modal.Section>
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Accessible hiring
            </Text>
            {HIRING_OPTIONS.map((p) => (
              <Checkbox key={p.id} label={p.filterLabel} helpText={p.description} checked={params.practice.includes(p.id)} onChange={() => toggleIn('practice', p.id)} />
            ))}
          </BlockStack>
        </Modal.Section>
        <Modal.Section>
          <BlockStack gap="500">
            <ChoiceList title="Where the work happens" allowMultiple choices={Object.entries(WORK_LOCATION_LABEL).map(([value, label]) => ({ value, label }))} selected={params.arrangement} onChange={(v) => update({ arrangement: v })} />
            <ChoiceList title="Employment type" allowMultiple choices={Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))} selected={params.type} onChange={(v) => update({ type: v })} />
            <ChoiceList title="Experience level" allowMultiple choices={Object.entries(EXPERIENCE_LEVEL_LABEL).map(([value, label]) => ({ value, label }))} selected={params.level} onChange={(v) => update({ level: v })} />
            <Select label="Minimum pay (hourly equivalent)" options={[{ label: 'Any', value: '' }, { label: '$20/hr or more', value: '20' }, { label: '$25/hr or more', value: '25' }, { label: '$30/hr or more (about $62k/yr)', value: '30' }, { label: '$40/hr or more (about $83k/yr)', value: '40' }]} value={params.minPay} onChange={(v) => update({ minPay: v })} />
            <ChoiceList title="Date posted" choices={[{ value: '', label: 'Any time' }, { value: '7', label: 'Past week' }, { value: '14', label: 'Past two weeks' }, { value: '30', label: 'Past month' }]} selected={[params.posted]} onChange={(v) => update({ posted: v[0] ?? '' })} />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
}
