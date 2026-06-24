'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation, type DetectionKind } from '@/store/navigation';
import { detectionsList, livenessList, type DetectionListItem, type LivenessListItem } from '@/lib/api';
import { Icon, VerdictBadge, StatPill } from '@/components/deepguard/shared';
import { DG, verdictStyle, fmtInt, timeAgo } from '@/lib/dg';
import { useT } from '@/lib/i18n';

// Visual style for the per-row TYPE badge — kept consistent with the small 'Playground' pill.
const KIND_BADGE: Record<DetectionKind, { label: string; bg: string; color: string }> = {
  deepfake: { label: 'Deepfake', bg: 'rgba(0,71,204,.1)', color: '#0047cc' },
  liveness: { label: 'Liveness', bg: 'rgba(13,148,136,.1)', color: '#0d9488' },
};

// Merged history row — a deepfake list item plus its record kind (and optional liveness spoof_type).
type HistoryRow = DetectionListItem & { kind: DetectionKind; spoof_type?: string | null };

function TypeBadge({ kind }: { kind: DetectionKind }) {
  const k = KIND_BADGE[kind];
  return (
    <span
      className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
      style={{ background: k.bg, color: k.color }}
    >
      {k.label}
    </span>
  );
}

type ViewMode = 'table' | 'cards';

function StateBlock({
  icon,
  title,
  desc,
  action,
  onAction,
  danger,
}: {
  icon: string;
  title: string;
  desc: string;
  action?: string;
  onAction?: () => void;
  danger?: boolean;
}) {
  return (
    <div className="glass-panel rounded-2xl p-12 shadow-sm border border-white/60 text-center dg-fade">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: danger ? '#fef2f2' : 'rgba(0,80,203,.05)' }}
      >
        <Icon name={icon} className="text-[34px]" style={{ color: danger ? DG.fake : 'rgba(0,80,203,.4)' }} />
      </div>
      <h3 className="text-base font-black text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 mb-5 max-w-sm mx-auto">{desc}</p>
      {action && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.03] active:scale-[0.97] transition-all"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function PagerBtn({ disabled, onClick, icon }: { disabled: boolean; onClick: () => void; icon: string }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-dgblue hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Icon name={icon} className="text-[18px]" />
    </button>
  );
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const nums = useMemo(() => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const arr: number[] = [1];
    const s = Math.max(2, page - 1);
    const e = Math.min(totalPages - 1, page + 1);
    if (s > 2) arr.push(-1);
    for (let p = s; p <= e; p++) arr.push(p);
    if (e < totalPages - 1) arr.push(-1);
    arr.push(totalPages);
    return arr;
  }, [page, totalPages]);

  return (
    <div className="flex items-center gap-1">
      <PagerBtn disabled={page === 1} onClick={() => onPage(1)} icon="first_page" />
      <PagerBtn disabled={page === 1} onClick={() => onPage(Math.max(1, page - 1))} icon="chevron_left" />
      {nums.map((n, i) =>
        n === -1 ? (
          <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-slate-300 text-xs">
            …
          </span>
        ) : (
          <button
            key={n}
            onClick={() => onPage(n)}
            className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${
              page === n ? 'bg-dgblue text-white shadow-sm' : 'text-slate-500 hover:bg-white'
            }`}
          >
            {n}
          </button>
        ),
      )}
      <PagerBtn disabled={page >= totalPages} onClick={() => onPage(Math.min(totalPages, page + 1))} icon="chevron_right" />
      <PagerBtn disabled={page >= totalPages} onClick={() => onPage(totalPages)} icon="last_page" />
    </div>
  );
}

export default function HistoryPage() {
  const t = useT();

  const DATE_RANGES: { label: string; hours: number | null }[] = [
    { label: t('history.range_7d'), hours: 24 * 7 },
    { label: t('history.range_24h'), hours: 24 },
    { label: t('history.range_30d'), hours: 24 * 30 },
    { label: t('history.range_all'), hours: null },
  ];

  const VERDICT_CHIPS: { id: string; label: string; color: string }[] = [
    { id: '', label: t('history.filter_all'), color: DG.primary },
    { id: 'REAL', label: 'Real', color: DG.real },
    { id: 'FAKE', label: 'Fake', color: DG.fake },
    { id: 'UNCERTAIN', label: 'Uncertain', color: DG.uncertain },
  ];

  const KIND_CHIPS: { id: '' | DetectionKind; label: string; color: string }[] = [
    { id: '', label: t('history.filter_all'), color: DG.primary },
    { id: 'deepfake', label: 'Deepfake', color: '#0047cc' },
    { id: 'liveness', label: 'Liveness', color: '#0d9488' },
  ];

  const { navigate, setSelectedRequestId, setSelectedKind } = useNavigation();
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [verdictFilter, setVerdictFilter] = useState('');
  const [kindFilter, setKindFilter] = useState<'' | DetectionKind>('');
  const [dateRangeIdx, setDateRangeIdx] = useState(0);
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const limit = 20;

  const dateParams = useMemo(() => {
    const range = DATE_RANGES[dateRangeIdx];
    if (range.hours == null) return {};
    const end = new Date();
    const start = new Date(end.getTime() - range.hours * 60 * 60 * 1000);
    return { start_date: start.toISOString(), end_date: end.toISOString() };
  }, [dateRangeIdx]);

  // Date-range lower bound applied client-side to liveness rows (the /liveness endpoint
  // doesn't accept a date filter, so we filter the merged list ourselves).
  const startMs = useMemo(() => {
    const range = DATE_RANGES[dateRangeIdx];
    if (range.hours == null) return null;
    return Date.now() - range.hours * 60 * 60 * 1000;
  }, [dateRangeIdx]);

  useEffect(() => {
    setLoading(true);
    setError('');
    // Fetch both sources; each catch is independent so one failing source doesn't blank the page.
    Promise.all([
      detectionsList({ page: 1, limit: 100, ...dateParams }).catch(() => null),
      livenessList({ page: 1, limit: 100 }).catch(() => null),
    ])
      .then(([dRes, lRes]) => {
        if (!dRes && !lRes) {
          setError(t('history.error_load'));
          setRows([]);
          return;
        }
        const detRows: HistoryRow[] = (dRes?.items ?? []).map((it) => ({ ...it, kind: 'deepfake' }));
        const liveRows: HistoryRow[] = (lRes?.items ?? []).map((it: LivenessListItem) => ({
          request_id: it.check_id,
          verdict: it.verdict,
          confidence: it.confidence,
          prob_fake: it.liveness_score,
          processing_time_ms: it.processing_time_ms,
          model_version: it.model_version,
          image_hash: '',
          created_at: it.created_at,
          source: it.source,
          kind: 'liveness',
          spoof_type: it.spoof_type,
        }));
        const merged = [...detRows, ...liveRows].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setRows(merged);
      })
      .finally(() => setLoading(false));
  }, [dateParams, refreshTick]);

  // Normalize liveness verdicts so the REAL/FAKE/UNCERTAIN filter chips include them:
  // LIVE → REAL, SPOOF → FAKE (F3 fix — only used in predicate, data is not mutated).
  const normalizeVerdict = (v: string): string => {
    if (v === 'LIVE') return 'REAL';
    if (v === 'SPOOF') return 'FAKE';
    return v;
  };

  // Client-side filters over the merged list: date range + record kind + verdict chip +
  // confidence threshold + text search.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (startMs == null || new Date(r.created_at).getTime() >= startMs) &&
        (kindFilter === '' || r.kind === kindFilter) &&
        (verdictFilter === '' || normalizeVerdict(r.verdict) === verdictFilter) &&
        (confidenceFilter === 0 || r.confidence >= confidenceFilter) &&
        (q === '' ||
          r.request_id.toLowerCase().includes(q) ||
          r.model_version.toLowerCase().includes(q) ||
          (r.image_hash !== '' && r.image_hash.toLowerCase().includes(q))),
    );
  }, [rows, startMs, kindFilter, verdictFilter, confidenceFilter, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // F9: clamp currentPage to totalPages whenever filter/data shrinks the page count.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages]);

  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * limit, currentPage * limit),
    [filtered, currentPage],
  );

  // Stat strip derived from the full merged list.
  const stats = useMemo(() => {
    const c = { fake: 0, real: 0, uncertain: 0, deepfake: 0, liveness: 0 };
    let confSum = 0;
    for (const r of rows) {
      if (r.verdict === 'FAKE' || r.verdict === 'SPOOF') c.fake++;
      else if (r.verdict === 'REAL' || r.verdict === 'LIVE') c.real++;
      else c.uncertain++;
      if (r.kind === 'deepfake') c.deepfake++;
      else c.liveness++;
      confSum += r.confidence;
    }
    return {
      ...c,
      avgConf: rows.length ? confSum / rows.length : 0,
    };
  }, [rows]);

  const handleRowClick = (r: HistoryRow) => {
    setSelectedKind(r.kind);
    setSelectedRequestId(r.request_id);
    navigate('detail');
  };

  const handleExportCsv = useCallback(() => {
    if (filtered.length === 0) return;
    const headers = ['kind', 'request_id', 'created_at', 'verdict', 'confidence', 'prob_fake', 'model_version', 'processing_time_ms'];
    const lines = [headers.join(',')];
    for (const r of filtered) {
      lines.push(
        [r.kind, r.request_id, r.created_at, r.verdict, r.confidence.toFixed(2), r.prob_fake.toFixed(4), r.model_version, r.processing_time_ms]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_page${currentPage}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered, currentPage]);

  const clearFilters = () => {
    setVerdictFilter('');
    setKindFilter('');
    setQuery('');
    setConfidenceFilter(0);
    setDateRangeIdx(0);
    setCurrentPage(1);
  };

  const effState: 'loading' | 'error' | 'empty' | 'noresults' | 'ready' = loading
    ? 'loading'
    : error
      ? 'error'
      : rows.length === 0
        ? 'empty'
        : filtered.length === 0
          ? 'noresults'
          : 'ready';

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 dg-rise">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{t('history.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('history.subtitle')
              .replace('{total}', fmtInt(total))
              .replace('{deepfake}', fmtInt(stats.deepfake))
              .replace('{liveness}', fmtInt(stats.liveness))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-white">
            {([['table', 'table_rows'], ['cards', 'grid_view']] as [ViewMode, string][]).map(([m, ic]) => (
              <button
                key={m}
                onClick={() => setView(m)}
                className={`w-9 h-8 rounded-lg flex items-center justify-center transition-all ${
                  view === m ? 'bg-white text-dgblue shadow-sm' : 'text-slate-400'
                }`}
                title={m}
              >
                <Icon name={ic} className="text-[18px]" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setRefreshTick((t) => t + 1)}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
            title={t('history.btn_refresh')}
          >
            <Icon name="refresh" className={`text-[18px] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            data-tour="hs-export"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 h-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="download" className="text-[18px]" /> {t('history.btn_export')}
          </button>
        </div>
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 dg-rise">
        <StatPill label={t('history.stat_total')} value={fmtInt(total)} color={DG.primary} icon="data_usage" />
        <StatPill label="Real" value={fmtInt(stats.real)} color={DG.real} icon="verified" />
        <StatPill label="Fake" value={fmtInt(stats.fake)} color={DG.fake} icon="gpp_maybe" />
        <StatPill label={t('history.stat_avg_conf')} value={`${stats.avgConf.toFixed(1)}%`} color={DG.uncertain} icon="target" />
      </div>

      {/* filter bar */}
      <div data-tour="hs-filter" className="glass-panel rounded-2xl p-4 shadow-sm border border-white/60 dg-rise flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('history.search_placeholder')}
            className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {KIND_CHIPS.map((c) => (
            <button
              key={c.id || 'ALL_KINDS'}
              onClick={() => {
                setKindFilter(c.id);
                setCurrentPage(1);
              }}
              className={`px-3 h-9 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                kindFilter === c.id ? 'text-white border-transparent shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
              style={kindFilter === c.id ? { background: c.color } : undefined}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {VERDICT_CHIPS.map((c) => (
            <button
              key={c.id || 'ALL'}
              onClick={() => {
                setVerdictFilter(c.id);
                setCurrentPage(1);
              }}
              className={`px-3 h-9 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                verdictFilter === c.id ? 'text-white border-transparent shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
              style={verdictFilter === c.id ? { background: c.color } : undefined}
            >
              {c.label}
            </button>
          ))}
        </div>

        <select
          value={dateRangeIdx}
          onChange={(e) => {
            setDateRangeIdx(parseInt(e.target.value));
            setCurrentPage(1);
          }}
          className="h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
        >
          {DATE_RANGES.map((r, i) => (
            <option key={r.label} value={i}>
              {r.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 min-w-[170px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">
            {t('history.conf_label').replace('{val}', String(confidenceFilter))}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(parseInt(e.target.value))}
            className="flex-1 accent-dgblue"
          />
        </div>
      </div>

      {/* content */}
      {effState === 'loading' ? (
        <div className="glass-panel rounded-2xl p-4 shadow-sm border border-white/60 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-2">
              <div className="skeleton w-10 h-10 rounded-lg" />
              <div className="skeleton h-3 flex-1" />
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-3 w-12" />
            </div>
          ))}
        </div>
      ) : effState === 'error' ? (
        <StateBlock
          icon="cloud_off"
          title={t('history.error_load')}
          desc={error || t('history.error_network')}
          action={t('history.error_retry')}
          onAction={() => setRefreshTick((tk) => tk + 1)}
          danger
        />
      ) : effState === 'empty' ? (
        <StateBlock
          icon="inbox"
          title={t('history.empty_title')}
          desc={t('history.empty_desc')}
          action={t('history.empty_action')}
          onAction={() => navigate('playground')}
        />
      ) : effState === 'noresults' ? (
        <StateBlock
          icon="search_off"
          title={t('history.noresult_title')}
          desc={t('history.noresult_desc')}
          action={t('history.noresult_action')}
          onAction={clearFilters}
        />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {paged.map((r) => {
            const s = verdictStyle(r.verdict);
            return (
              <button
                key={r.request_id}
                onClick={() => handleRowClick(r)}
                className="glass-panel rounded-2xl overflow-hidden border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group dg-rise"
              >
                <div className="relative aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
                  <Icon name="image" className="text-[40px] text-slate-300" />
                  <span className="absolute top-2 left-2">
                    <VerdictBadge verdict={r.verdict} />
                  </span>
                  <span className="absolute top-2 right-2">
                    <TypeBadge kind={r.kind} />
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[12px] font-bold text-slate-700 truncate font-mono">{r.request_id.slice(0, 12)}…</p>
                    {r.source === 'playground' && (
                      <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide" style={{ background: 'rgba(0,71,204,.1)', color: '#0047cc' }}>Playground</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{r.model_version}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-slate-400">{timeAgo(r.created_at)}</span>
                    <span className="text-[12px] font-black tabular-nums" style={{ color: s.color }}>
                      {r.confidence.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-rise">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead className="bg-white/60 border-b border-slate-100">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3.5">{t('history.col_request')}</th>
                  <th className="px-5 py-3.5">{t('history.col_time')}</th>
                  <th className="px-5 py-3.5">{t('history.col_verdict')}</th>
                  <th className="px-5 py-3.5">{t('history.col_confidence')}</th>
                  <th className="px-5 py-3.5">{t('history.col_model')}</th>
                  <th className="px-5 py-3.5 text-right">{t('history.col_latency')}</th>
                  <th className="px-5 py-3.5 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paged.map((r) => {
                  const s = verdictStyle(r.verdict);
                  return (
                    <tr key={r.request_id} onClick={() => handleRowClick(r)} className="data-table-row cursor-pointer">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                            <Icon name="image" className="text-[18px] text-slate-300" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[12px] font-bold text-slate-700 truncate font-mono">{r.request_id.slice(0, 8)}…</p>
                              <TypeBadge kind={r.kind} />
                              {r.source === 'playground' && (
                                <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide" style={{ background: 'rgba(0,71,204,.1)', color: '#0047cc' }}>Playground</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{r.image_hash ? r.image_hash.slice(0, 16) : r.request_id.slice(0, 16) || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[11px] text-slate-500 font-medium whitespace-nowrap">{timeAgo(r.created_at)}</td>
                      <td className="px-5 py-3">
                        <VerdictBadge verdict={r.verdict} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-black text-slate-800 tabular-nums w-12">{r.confidence.toFixed(1)}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${r.confidence}%`, background: s.color }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[11px] font-semibold text-slate-600 font-mono">{r.model_version}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-[11px] text-slate-500 font-medium tabular-nums">{r.processing_time_ms}ms</td>
                      <td className="px-5 py-3 text-right">
                        <Icon name="chevron_right" className="text-[18px] text-slate-300" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* pagination */}
      {effState === 'ready' && (
        <div className="flex items-center justify-between px-1 dg-fade">
          <span className="text-[11px] font-bold text-slate-500">
            {t('history.pagination')
              .replace('{page}', String(currentPage))
              .replace('{total}', String(totalPages))
              .replace('{count}', fmtInt(total))}
          </span>
          <Pagination page={currentPage} totalPages={totalPages} onPage={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
