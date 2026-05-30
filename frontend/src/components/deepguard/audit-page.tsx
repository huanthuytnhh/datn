'use client';

import { Fragment, useState, useEffect, useMemo, useCallback } from 'react';
import { auditLogsList, type AuditLogItem } from '@/lib/api';
import { Icon, StatPill, RangeToggle, Sparkline, AnimatedNumber, CodeBlock } from '@/components/deepguard/shared';
import { DG, fmtInt, timeAgo } from '@/lib/dg';

/* ── Severity derived from action type (backend has no severity field) ── */
type Sev = 'info' | 'warn' | 'crit';
const SEV_STYLE: Record<Sev, { color: string; label: string }> = {
  info: { color: DG.primary, label: 'Info' },
  warn: { color: DG.uncertain, label: 'Warning' },
  crit: { color: DG.fake, label: 'Critical' },
};

interface ActionMeta {
  color: string;
  bg: string;
  border: string;
  icon: string;
  sev: Sev;
}
const ACTION_META: Record<string, ActionMeta> = {
  'api_key.created':   { color: '#2e7d32', bg: '#f0fdf4', border: '#bbf7d0', icon: 'key',          sev: 'info' },
  'api_key.revoked':   { color: '#ba1a1a', bg: '#fef2f2', border: '#fecaca', icon: 'key_off',      sev: 'warn' },
  'detection.created': { color: '#0050cb', bg: '#eff6ff', border: '#bfdbfe', icon: 'image_search', sev: 'info' },
  'detection.viewed':  { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: 'visibility',   sev: 'info' },
  'webhook.created':   { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: 'webhook',      sev: 'info' },
  'webhook.failed':    { color: '#ed6c02', bg: '#fff7ed', border: '#fed7aa', icon: 'error',        sev: 'warn' },
  'user.login':        { color: '#ed6c02', bg: '#fff7ed', border: '#fed7aa', icon: 'login',        sev: 'info' },
  'user.logout':       { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', icon: 'logout',       sev: 'info' },
  'tenant.suspended':  { color: '#ba1a1a', bg: '#fef2f2', border: '#fecaca', icon: 'block',        sev: 'crit' },
  'tenant.created':    { color: '#2e7d32', bg: '#f0fdf4', border: '#bbf7d0', icon: 'domain_add',   sev: 'info' },
};
const FALLBACK_META: ActionMeta = { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: 'bolt', sev: 'info' };
const metaFor = (action: string): ActionMeta => {
  if (ACTION_META[action]) return ACTION_META[action];
  if (action.startsWith('api_key')) return ACTION_META['api_key.created'];
  if (action.startsWith('detection')) return ACTION_META['detection.viewed'];
  if (action.startsWith('webhook')) return action.includes('fail') ? ACTION_META['webhook.failed'] : ACTION_META['webhook.created'];
  if (action.startsWith('tenant')) return action.includes('suspend') ? ACTION_META['tenant.suspended'] : ACTION_META['tenant.created'];
  if (action.startsWith('user')) return ACTION_META['user.login'];
  return FALLBACK_META;
};

const RESOURCE_ICON: Record<string, string> = {
  api_key: 'key', detection: 'image_search', webhook: 'webhook', user: 'person', tenant: 'domain',
};

const ACTION_OPTIONS = Object.keys(ACTION_META);
const RESOURCE_OPTIONS = ['api_key', 'detection', 'webhook', 'user', 'tenant'];

const DATE_RANGES: { label: string; hours: number | null }[] = [
  { label: '24 giờ qua', hours: 24 },
  { label: '7 ngày qua', hours: 24 * 7 },
  { label: '30 ngày qua', hours: 24 * 30 },
  { label: 'Tất cả', hours: null },
];

/* ── date helpers (Vietnamese) ── */
function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
function fmtTimeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function dayKey(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return 'Hôm nay';
  if (d.toDateString() === yest.toDateString()) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

/* ── single expandable row (shared by both views) ── */
function AuditRow({ row, open, onToggle, timeline }: {
  row: AuditLogItem;
  open: boolean;
  onToggle: () => void;
  timeline: boolean;
}) {
  const m = metaFor(row.action);
  const sev = SEV_STYLE[m.sev];
  return (
    <Fragment>
      <tr onClick={onToggle} className="data-table-row cursor-pointer">
        {timeline ? (
          <td className="px-5 py-3 whitespace-nowrap">
            <span className="text-[12px] font-bold text-slate-700 tabular-nums">{fmtTimeOnly(row.created_at)}</span>
          </td>
        ) : (
          <td className="px-5 py-3 text-[11px] font-medium text-slate-600 whitespace-nowrap tabular-nums">
            {fmtDateTime(row.created_at)}
          </td>
        )}
        <td className="px-5 py-3">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-black rounded border font-mono"
            style={{ color: m.color, background: m.bg, borderColor: m.border }}
          >
            <Icon name={m.icon} className="text-[13px]" />
            {row.action}
          </span>
        </td>
        <td className="px-5 py-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <Icon name={RESOURCE_ICON[row.resource_type] ?? 'description'} className="text-[15px] text-slate-400" />
            {row.resource_type}
          </span>
        </td>
        <td className="px-5 py-3 text-[11px] text-slate-600 truncate max-w-[180px]">{row.user_email ?? '—'}</td>
        <td className="px-5 py-3 font-mono text-[10px] text-slate-400 hidden md:table-cell">{row.ip_address ?? '—'}</td>
        <td className="px-5 py-3 text-right">
          <Icon
            name="chevron_right"
            className="text-[18px] transition-transform"
            style={{ color: open ? DG.primary : '#cbd5e1', transform: open ? 'rotate(90deg)' : 'none' }}
          />
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-50/70 dg-fade">
          <td colSpan={6} className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Metadata</p>
                <CodeBlock code={JSON.stringify(row.metadata ?? {}, null, 2)} />
              </div>
              <div className="space-y-3">
                {row.resource_id && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-wider">Resource ID</p>
                    <p className="font-mono text-[11px] text-slate-600 break-all">{row.resource_id}</p>
                  </div>
                )}
                {row.user_agent && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-wider">User Agent</p>
                    <p className="font-mono text-[11px] text-slate-600 break-all">{row.user_agent}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Severity</span>
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded"
                    style={{ color: sev.color, background: `${sev.color}14` }}
                  >
                    {sev.label}
                  </span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-wider">Thời điểm</p>
                  <p className="text-[11px] text-slate-600">{fmtDateTime(row.created_at)} · {timeAgo(row.created_at)}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export default function AuditPage() {
  const [view, setView] = useState<'timeline' | 'table'>('timeline');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [query, setQuery] = useState('');
  const [dateRangeIdx, setDateRangeIdx] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const limit = 50;

  const dateParams = useMemo(() => {
    const range = DATE_RANGES[dateRangeIdx];
    if (range.hours == null) return {};
    const end = new Date();
    const start = new Date(end.getTime() - range.hours * 60 * 60 * 1000);
    return { start_date: start.toISOString(), end_date: end.toISOString() };
  }, [dateRangeIdx]);

  useEffect(() => {
    setLoading(true);
    setError('');
    auditLogsList({
      action: actionFilter || undefined,
      resource_type: resourceFilter || undefined,
      page: currentPage,
      limit,
      ...dateParams,
    })
      .then((r) => { setRows(r.items); setTotal(r.total); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Lỗi tải audit logs'))
      .finally(() => setLoading(false));
  }, [actionFilter, resourceFilter, dateParams, currentPage, refreshTick]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  /* client-side free-text search over the current page */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      r.action.toLowerCase().includes(q) ||
      (r.user_email ?? '').toLowerCase().includes(q) ||
      (r.ip_address ?? '').includes(q) ||
      r.resource_type.toLowerCase().includes(q),
    );
  }, [rows, query]);

  /* summary stats from current page */
  const sevCounts = useMemo(() => {
    const c: Record<Sev, number> = { info: 0, warn: 0, crit: 0 };
    rows.forEach((r) => { c[metaFor(r.action).sev]++; });
    return c;
  }, [rows]);

  const topActions = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => { c[r.action] = (c[r.action] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [rows]);

  const timeSpark = useMemo(() => {
    const buckets = new Array(8).fill(0);
    rows.forEach((r) => {
      const h = Math.floor((Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 6));
      if (h >= 0 && h < 8) buckets[7 - h]++;
    });
    return buckets.map((v) => v || 1);
  }, [rows]);

  const grouped = useMemo(() => {
    const g: Record<string, AuditLogItem[]> = {};
    filtered.forEach((r) => { const k = dayKey(r.created_at); (g[k] = g[k] || []).push(r); });
    return Object.entries(g);
  }, [filtered]);

  const exportCsv = useCallback(() => {
    if (rows.length === 0) return;
    const headers = ['id', 'created_at', 'action', 'resource_type', 'resource_id', 'user_email', 'ip_address'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push([
        r.id, r.created_at, r.action, r.resource_type,
        r.resource_id ?? '', r.user_email ?? '', r.ip_address ?? '',
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rows]);

  const resetFilters = () => {
    setActionFilter(''); setResourceFilter(''); setQuery(''); setDateRangeIdx(1); setCurrentPage(1);
  };

  const tableHead = (timeline: boolean) => (
    <thead className="bg-white/60 border-b border-slate-100">
      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
        <th className="px-5 py-3.5">{timeline ? 'Giờ' : 'Thời gian'}</th>
        <th className="px-5 py-3.5">Action</th>
        <th className="px-5 py-3.5">Resource</th>
        <th className="px-5 py-3.5">User</th>
        <th className="px-5 py-3.5 hidden md:table-cell">IP</th>
        <th className="px-5 py-3.5 w-10" />
      </tr>
    </thead>
  );

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 dg-fade">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {fmtInt(total)} sự kiện · nhật ký bảo mật &amp; tuân thủ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshTick((t) => t + 1)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
            title="Làm mới"
          >
            <Icon name="refresh" className={`text-[18px] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <RangeToggle
            value={view}
            onChange={(id) => setView(id as 'timeline' | 'table')}
            options={[{ id: 'timeline', label: 'Timeline' }, { id: 'table', label: 'Bảng' }]}
          />
          <button
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="flex items-center gap-2 px-4 h-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="download" className="text-[18px]" /> Xuất CSV
          </button>
        </div>
      </div>

      {/* summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 dg-fade">
        <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 flex items-center gap-5">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sự kiện (trang)</p>
            <p className="text-3xl font-black text-slate-900 tabular-nums leading-tight">
              <AnimatedNumber value={rows.length} />
            </p>
          </div>
          <div className="flex-1 flex justify-end"><Sparkline data={timeSpark} color={DG.primary} w={140} h={44} /></div>
        </div>
        <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Theo mức độ</p>
          <div className="flex items-center gap-4">
            {(Object.keys(SEV_STYLE) as Sev[]).map((k) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: SEV_STYLE[k].color }} />
                <span className="text-[11px] font-semibold text-slate-500">{SEV_STYLE[k].label}</span>
                <span className="text-sm font-black tabular-nums" style={{ color: SEV_STYLE[k].color }}>{sevCounts[k]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Top actions</p>
          {topActions.length === 0 ? (
            <p className="text-[11px] text-slate-400 font-medium">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-1.5">
              {topActions.map(([a, n]) => {
                const max = topActions[0][1];
                const m = metaFor(a);
                return (
                  <div key={a} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 w-28 truncate">{a}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(n / max) * 100}%`, background: m.color }} />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 tabular-nums w-6 text-right">{n}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* filter bar */}
      <div className="glass-panel rounded-2xl p-4 shadow-sm border border-white/60 dg-fade flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm action, user, IP…"
            className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-dgblue"
        >
          <option value="">Tất cả action</option>
          {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={resourceFilter}
          onChange={(e) => { setResourceFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-dgblue"
        >
          <option value="">Mọi resource</option>
          {RESOURCE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={dateRangeIdx}
          onChange={(e) => { setDateRangeIdx(parseInt(e.target.value)); setCurrentPage(1); }}
          className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-dgblue"
        >
          {DATE_RANGES.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
        </select>
      </div>

      {/* content */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-4 shadow-sm border border-white/60 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-2">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-5 w-40 rounded" />
              <div className="skeleton h-3 flex-1" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel rounded-2xl p-10 shadow-sm border border-white/60 flex flex-col items-center text-center gap-3">
          <Icon name="error" className="text-[40px] text-dgfake" />
          <p className="text-sm font-bold text-slate-700">{error}</p>
          <button onClick={() => setRefreshTick((t) => t + 1)} className="px-4 h-9 bg-dgblue text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all">
            Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 shadow-sm border border-white/60 flex flex-col items-center text-center gap-3">
          <Icon name="search_off" className="text-[40px] text-slate-300" />
          <div>
            <p className="text-sm font-bold text-slate-700">Không có sự kiện phù hợp</p>
            <p className="text-xs text-slate-400 mt-0.5">Thử đổi bộ lọc action / resource hoặc xoá từ khoá.</p>
          </div>
          <button onClick={resetFilters} className="px-4 h-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
            Xoá bộ lọc
          </button>
        </div>
      ) : view === 'timeline' ? (
        <div className="space-y-5">
          {grouped.map(([day, dayRows]) => (
            <div key={day} className="dg-fade">
              <div className="flex items-center gap-3 mb-2.5 px-1">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{day}</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">{dayRows.length}</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[720px]">
                    {tableHead(true)}
                    <tbody className="divide-y divide-slate-50">
                      {dayRows.map((r) => (
                        <AuditRow
                          key={r.id}
                          row={r}
                          timeline
                          open={expanded === r.id}
                          onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-fade">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[760px]">
              {tableHead(false)}
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => (
                  <AuditRow
                    key={r.id}
                    row={r}
                    timeline={false}
                    open={expanded === r.id}
                    onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* pagination + immutable note */}
      {!loading && !error && (
        <div className="glass-panel rounded-2xl px-6 py-3 shadow-sm border border-white/60 flex items-center justify-between dg-fade">
          <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
            <Icon name="lock" className="text-[13px]" /> Immutable audit trail · {fmtInt(total)} bản ghi
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 text-slate-400 hover:text-dgblue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Icon name="first_page" className="text-[18px]" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-slate-400 hover:text-dgblue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            <span className="text-[11px] font-bold text-slate-600 px-2 tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 text-slate-600 hover:text-dgblue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-1.5 text-slate-600 hover:text-dgblue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Icon name="last_page" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
