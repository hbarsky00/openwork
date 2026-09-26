import { Autocomplete, BlockStack, Button, Icon, InlineStack, Text } from '@shopify/polaris';
import { PickedList } from './StrengthsPicker';
import { SearchIcon } from '@shopify/polaris-icons';
import { useMemo, useState } from 'react';
import { ACCESS_CATEGORIES, ACCESS_FEATURES, ACCESS_FEATURE_BY_ID, HIRING_OPTIONS, HIRING_OPTION_BY_ID, type HiringOptionId } from '../lib/access';
import { jobSatisfies } from '../lib/match';
import type { Employer, Job } from '../lib/types';

/** Needs a first-time visitor is most likely to look for. Shown as quick picks. */
const QUICK = ['stepFreeEntrance', 'screenReaderCompatible', 'captions', 'writtenCommunication', 'predictableSchedule', 'jobCoach', 'remoteWork', 'quietWorkspace'];

interface Props {
  jobs: Job[];
  employers: Employer[];
  needs: string[];
  practices: HiringOptionId[];
  onChange: (next: { needs: string[]; practices: HiringOptionId[] }) => void;
  /** Filter-row mode: no label, no quick picks. */
  compact?: boolean;
}

/**
 * One typeahead over every need and hiring option, with live job counts, plus
 * a few quick picks. Replaces the wall of chips: type "capt" and choose
 * "Captions on meetings and video · 4 jobs". Selected items become tags.
 */
export function NeedsSearch({ jobs, employers, needs, practices, onChange, compact = false }: Props) {
  const [query, setQuery] = useState('');
  const employerById = useMemo(() => Object.fromEntries(employers.map((e) => [e.id, e])) as Record<string, Employer>, [employers]);
  const published = useMemo(() => jobs.filter((j) => j.status === 'published'), [jobs]);

  // Count, per option, how many jobs have CONFIRMED it. Unknown never counts.
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of ACCESS_FEATURES) if (f.filter) c[`need:${f.id}`] = published.filter((j) => employerById[j.employerId] && jobSatisfies(f.id, j, employerById[j.employerId]) === 'confirmed').length;
    for (const h of HIRING_OPTIONS) c[`practice:${h.id}`] = published.filter((j) => j.hiringOptions.includes(h.id)).length;
    return c;
  }, [published, employerById]);

  const selected = [...needs.map((n) => `need:${n}`), ...practices.map((p) => `practice:${p}`)];
  const q = query.trim().toLowerCase();

  const sections = useMemo(() => {
    const match = (label: string) => !q || label.toLowerCase().includes(q);
    const opt = (value: string, label: string, n: number) => ({ value, label: (<span className="ow-opt"><span>{label}</span><span className="ow-opt__n">{n}</span></span>) as unknown as string });
    const out: { title: string; options: { value: string; label: string }[] }[] = [];
    for (const c of ACCESS_CATEGORIES) {
      const opts = ACCESS_FEATURES.filter((f) => f.filter && f.category === c.id && match(f.label)).map((f) => opt(`need:${f.id}`, f.label, counts[`need:${f.id}`] ?? 0));
      if (opts.length) out.push({ title: c.label, options: opts });
    }
    for (const g of ['demonstrate', 'interview', 'workplace'] as const) {
      const opts = HIRING_OPTIONS.filter((h) => h.group === g && match(h.filterLabel)).map((h) => opt(`practice:${h.id}`, h.filterLabel, counts[`practice:${h.id}`] ?? 0));
      if (opts.length) out.push({ title: g === 'demonstrate' ? 'Ways to show your skills' : g === 'interview' ? 'Interview accessibility' : 'Workplace flexibility', options: opts });
    }
    return out;
  }, [q, counts]);

  const apply = (vals: string[]) => {
    onChange({
      needs: vals.filter((v) => v.startsWith('need:')).map((v) => v.slice(5)),
      practices: vals.filter((v) => v.startsWith('practice:')).map((v) => v.slice(9) as HiringOptionId),
    });
    setQuery('');
    // Get the list out of the way so the results are what you see next.
    (document.activeElement as HTMLElement | null)?.blur();
  };
  const toggle = (v: string) => apply(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  const labelOf = (v: string) => (v.startsWith('need:') ? ACCESS_FEATURE_BY_ID[v.slice(5)]?.label : HIRING_OPTION_BY_ID[v.slice(9) as HiringOptionId]?.filterLabel) ?? v;

  return (
    <BlockStack gap="300">
      <Autocomplete
        allowMultiple
        options={sections}
        selected={selected}
        onSelect={apply}
        listTitle={q ? undefined : 'Everything employers can confirm'}
        emptyState={
          <Text as="p" tone="subdued">
            Nothing matches “{query}”. Try another word — “step”, “quiet”, “interpreter”.
          </Text>
        }
        textField={<Autocomplete.TextField label="Accessibility needs" labelHidden={compact} value={query} onChange={setQuery} autoComplete="off" prefix={<Icon source={SearchIcon} />} placeholder={compact ? (selected.length ? `${selected.length} need${selected.length === 1 ? '' : 's'} · add more` : 'Accessibility needs — captions, step-free, job coach…') : 'Type a need — captions, step-free, written instructions, job coach…'} helpText={compact ? undefined : 'Only jobs where the employer has confirmed it. Unknown never counts.'} />}
      />

      <PickedList items={selected.map(labelOf)} label="Your needs" onRemove={(lab) => { const v = selected.find((x) => labelOf(x) === lab); if (v) toggle(v); }} />
      {selected.length > 0 && (
        <InlineStack>
          <Button variant="plain" onClick={() => apply([])}>
            Clear needs
          </Button>
        </InlineStack>
      )}

      {!compact && selected.length === 0 && (
        <InlineStack gap="200" wrap blockAlign="center">
          <Text as="span" variant="bodySm" tone="subdued">
            Common:
          </Text>
          {QUICK.map((id) => (
            <Button key={id} size="slim" onClick={() => toggle(`need:${id}`)}>
              {`${ACCESS_FEATURE_BY_ID[id].label} · ${counts[`need:${id}`] ?? 0}`}
            </Button>
          ))}
        </InlineStack>
      )}
    </BlockStack>
  );
}
