'use client';

/* ──────────────────────────────────────────────
   DeepGuard — Adaptive, role-aware Dashboard
   One component, branches by user role:
     developer  → integration dashboard (API keys + usage)
     admin      → tenant overview (quota vs usage, top keys, quick links)
     compliance → FAKE detections needing review + compliance status
     sysadmin   → platform ops (cross-tenant KPIs + tenants table)
     viewer     → read-only overview (KPIs + chart + recent detections)
   Page body only (sidebar + top header live in the shell).
   ────────────────────────────────────────────── */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';
import { useAppearanceStore, type DashboardLayout } from '@/store/appearance';
import { canEdit, ROLE_LABEL, type Role } from '@/lib/rbac';
import {
  analyticsOverview,
  analyticsUsage,
  detectionsList,
  apiKeysList,
  tenantGet,
  tenantsList,
  platformOverview,
  type AnalyticsOverview,
  type UsageInfo,
  type DetectionListItem,
  type ApiKeyOut,
  type TenantInfo,
  type TenantListItem,
  type PlatformOverview,
} from '@/lib/api';
import {
  Icon,
  VerdictBadge,
  AnimatedNumber,
  Sparkline,
  Donut,
  RangeToggle,
  InteractiveChart,
  type ToggleOption,
  type ChartSeries,
} from '@/components/deepguard/shared';
import { DG, fmtInt, timeAgo } from '@/lib/dg';

/* range → days lookup for the analytics endpoint */
const RANGE_DAYS: Record<string, number> = { today: 1, '7d': 7, '30d': 30 };
const RANGE_OPTIONS: ToggleOption[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
];
const RANGE_LABEL: Record<string, string> = { today: 'Hôm nay', '7d': '7 ngày', '30d': '30 ngày' };

/* ── Build a per-day time-series (total / fake / real) from raw detections ── */
function buildSeries(detections: DetectionListItem[], days: number) {
  const buckets: { label: string; total: number; fake: number; real: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    buckets.push({
      label:
        days <= 7
          ? d.toLocaleDateString('vi-VN', { weekday: 'short' })
          : `${d.getDate()}/${d.getMonth() + 1}`,
      total: 0,
      fake: 0,
      real: 0,
    });
  }
  const startMs = (() => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1));
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  for (const det of detections) {
    const t = new Date(det.created_at).getTime();
    if (t < startMs) continue;
    const idx = Math.floor((t - startMs) / 86_400_000);
    if (idx < 0 || idx >= buckets.length) continue;
    buckets[idx].total += 1;
    if (det.verdict === 'FAKE') buckets[idx].fake += 1;
    else if (det.verdict === 'REAL') buckets[idx].real += 1;
  }
  return buckets;
}

/* ── KPI card ── */
interface KpiCardData {
  title: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  iconBg: string;
  spark?: number[];
  sparkColor?: string;
  alert?: boolean;
  progress?: number;
  sub?: string;
}

function KpiCard({ card }: { card: KpiCardData }) {
  return (
    <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 hover:shadow-md hover:-translate-y-0.5 transition-all group dg-rise">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
          style={{ background: `${card.iconBg}12` }}
        >
          <Icon name={card.icon} className="text-[22px]" style={{ color: card.iconBg }} fill />
        </div>
        {card.spark && card.spark.length > 1 ? (
          <Sparkline data={card.spark} color={card.sparkColor ?? DG.primary} w={72} h={30} />
        ) : card.alert ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-dgfake bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-dgfake rounded-full animate-pulse" /> Alert
          </span>
        ) : null}
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
      <p className="text-[26px] leading-tight font-black tracking-tight text-slate-900">
        <AnimatedNumber value={card.value} decimals={card.decimals ?? 0} prefix={card.prefix} suffix={card.suffix} />
      </p>
      {card.progress != null ? (
        <div className="mt-2.5">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-dgblue rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(card.progress, 100)}%`, boxShadow: '0 0 10px rgba(0,80,203,.3)' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-[10px] text-slate-400 font-medium">{card.progress.toFixed(1)}% đã dùng</p>
            {card.sub && <p className="text-[10px] text-slate-400 font-medium">{card.sub}</p>}
          </div>
        </div>
      ) : card.sub ? (
        <p className="text-[11px] font-semibold text-slate-400 mt-2">{card.sub}</p>
      ) : null}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/60">
      <div className="skeleton h-11 w-11 rounded-xl mb-4" />
      <div className="skeleton h-3 w-24 mb-2" />
      <div className="skeleton h-7 w-28" />
    </div>
  );
}

/* ── Generic error / empty banners ── */
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="glass-panel rounded-2xl p-4 border border-red-100 bg-red-50/50 flex items-center gap-2 text-[13px] text-dgfake font-semibold dg-fade">
      <Icon name="error" className="text-[18px]" fill />
      {message}
    </div>
  );
}

function FriendlyEmpty({ icon, title, hint }: { icon: string; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-10">
      <Icon name={icon} className="text-[34px] text-slate-200" />
      <p className="text-[13px] font-semibold text-slate-400">{title}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

/* ── Shared analytics block (chart + verdict donut) ── */
interface SharedAnalytics {
  loading: boolean;
  overview: AnalyticsOverview | null;
  range: string;
  setRange: (r: string) => void;
  axis: string[];
  series: ChartSeries[];
  toggleSeries: (key: string) => void;
  mode: 'area' | 'bar';
  setMode: (m: 'area' | 'bar') => void;
  reqSpark: number[];
}

function RequestVolumeChart({ a }: { a: SharedAnalytics }) {
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise h-full">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-black text-slate-900">Request volume</h2>
          <p className="text-xs text-slate-400 mt-0.5">{RANGE_LABEL[a.range]} · theo ngày</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {a.series.map((s) => (
              <button
                key={s.key}
                onClick={() => a.toggleSeries(s.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                  s.on ? 'bg-white border-slate-200 text-slate-700' : 'bg-transparent border-transparent text-slate-300'
                }`}
              >
                <span className="w-2.5 h-[3px] rounded-full" style={{ background: s.on ? s.color : '#cbd5e1' }} />
                {s.label}
              </button>
            ))}
          </div>
          <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-white ml-1">
            {(['area', 'bar'] as const).map((m) => (
              <button
                key={m}
                onClick={() => a.setMode(m)}
                className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${
                  a.mode === m ? 'bg-white text-dgblue shadow-sm' : 'text-slate-400'
                }`}
                title={m}
              >
                <Icon name={m === 'area' ? 'show_chart' : 'bar_chart'} className="text-[18px]" />
              </button>
            ))}
          </div>
        </div>
      </div>
      {a.loading ? (
        <div className="skeleton h-[260px] w-full rounded-xl" />
      ) : a.reqSpark.some((v) => v > 0) ? (
        <InteractiveChart axis={a.axis} points="Ngày" series={a.series} mode={a.mode} />
      ) : (
        <div className="h-[260px] flex items-center justify-center">
          <FriendlyEmpty icon="bar_chart" title="Chưa có dữ liệu request trong khoảng này" />
        </div>
      )}
    </div>
  );
}

function VerdictDonut({ a }: { a: SharedAnalytics }) {
  const segs = a.overview
    ? [
        { label: 'Real', value: a.overview.real_detected, color: DG.real },
        { label: 'Fake', value: a.overview.fake_detected, color: DG.fake },
        { label: 'Uncertain', value: a.overview.uncertain, color: DG.uncertain },
      ]
    : [];
  const total = segs.reduce((s, x) => s + x.value, 0);
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise h-full">
      <h2 className="text-base font-black text-slate-900 mb-1">Verdict breakdown</h2>
      <p className="text-xs text-slate-400 mb-4">{RANGE_LABEL[a.range]}</p>
      {a.loading || !a.overview ? (
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton w-[150px] h-[150px] rounded-full" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-full rounded" />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Donut segments={segs} size={150} stroke={18}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng</span>
            <span className="text-2xl font-black text-slate-900 tabular-nums leading-none mt-0.5">
              <AnimatedNumber value={total} />
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">requests</span>
          </Donut>
          <div className="w-full mt-5 space-y-2">
            {segs.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs font-semibold text-slate-600 flex-1">{s.label}</span>
                <span className="text-xs font-black text-slate-800 tabular-nums">{fmtInt(s.value)}</span>
                <span className="text-[10px] text-slate-400 tabular-nums w-10 text-right">
                  {total ? ((s.value / total) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Recent detections table (reused by several variants) ── */
function RecentDetections({
  loading,
  recent,
  onRow,
  onViewAll,
  title = 'Phát hiện gần đây',
}: {
  loading: boolean;
  recent: DetectionListItem[];
  onRow: (id: string) => void;
  onViewAll?: () => void;
  title?: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-dgblue rounded-full" />
          <h2 className="text-base font-black text-slate-900">{title}</h2>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] font-bold text-dgblue hover:gap-2 flex items-center gap-1 transition-all"
          >
            Xem tất cả <Icon name="arrow_forward" className="text-[14px]" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
        <div className="col-span-3">Thời gian</div>
        <div className="col-span-4">Request</div>
        <div className="col-span-2">Verdict</div>
        <div className="col-span-1 text-right">Latency</div>
        <div className="col-span-2 text-right">Confidence</div>
      </div>
      <div className="divide-y divide-slate-50">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-3 py-3 items-center">
              <div className="col-span-3 skeleton h-3 w-20" />
              <div className="col-span-4 skeleton h-3 w-32" />
              <div className="col-span-2 skeleton h-4 w-14 rounded-md" />
              <div className="col-span-1 skeleton h-3 w-10 ml-auto" />
              <div className="col-span-2 skeleton h-3 w-12 ml-auto" />
            </div>
          ))
        ) : recent.length === 0 ? (
          <div className="px-3 py-8 text-center text-[13px] text-slate-400 font-semibold">Chưa có dữ liệu phát hiện</div>
        ) : (
          recent.map((det) => (
            <div
              key={det.request_id}
              onClick={() => onRow(det.request_id)}
              className="data-table-row grid grid-cols-12 gap-3 px-3 py-2.5 items-center rounded-lg cursor-pointer"
            >
              <div className="col-span-3 text-[11px] text-slate-500 font-medium">{timeAgo(det.created_at)}</div>
              <div className="col-span-4 flex items-center gap-2 min-w-0">
                <Icon name="fingerprint" className="text-[16px] text-slate-300 shrink-0" />
                <span className="text-[12px] text-slate-700 font-semibold font-mono truncate">
                  {det.image_hash.slice(0, 12)}…
                </span>
              </div>
              <div className="col-span-2">
                <VerdictBadge verdict={det.verdict} />
              </div>
              <div className="col-span-1 text-right text-[11px] text-slate-500 font-medium tabular-nums">
                {det.processing_time_ms}ms
              </div>
              <div className="col-span-2 text-right text-[12px] font-black text-slate-800 tabular-nums">
                {det.confidence.toFixed(1)}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Top API keys rail (developer + admin) ── */
function TopKeysRail({
  loading,
  keys,
  canManage,
  onManage,
}: {
  loading: boolean;
  keys: (ApiKeyOut & { share: number })[];
  canManage: boolean;
  onManage: () => void;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 dg-rise">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-dgblue rounded-full" />
          <h2 className="text-[13px] font-black text-slate-900">Top API keys</h2>
        </div>
        {canManage && (
          <button
            onClick={onManage}
            className="text-[11px] font-bold text-dgblue hover:gap-2 flex items-center gap-1 transition-all"
          >
            Quản lý <Icon name="arrow_forward" className="text-[14px]" />
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton h-3 w-full mb-1.5" />
              <div className="skeleton h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="py-6 text-center text-[12px] text-slate-400 font-semibold">Chưa có API key nào</div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div key={key.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[12px] font-bold text-slate-700 truncate">{key.name}</span>
                  {key.status === 'rotating' && <Icon name="autorenew" className="text-[13px] text-dgwarn" />}
                  {key.status === 'revoked' && <Icon name="block" className="text-[13px] text-dgfake" />}
                </div>
                <span className="text-[11px] font-black text-slate-800 tabular-nums">{fmtInt(key.quota_used)}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-dgblue rounded-full transition-all duration-1000" style={{ width: `${key.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── System status strip (shared) ── */
function StatusStrip({
  error,
  usage,
  overview,
  recent,
}: {
  error: boolean;
  usage: UsageInfo | null;
  overview: AnalyticsOverview | null;
  recent: DetectionListItem[];
}) {
  const items = [
    { icon: 'health_and_safety', label: 'System status', value: error ? 'Degraded' : 'Healthy', color: error ? DG.fake : DG.real, pulse: true },
    { icon: 'database', label: 'Quota usage', value: usage ? `${usage.usage_percent.toFixed(1)}%` : '—', color: DG.primary, pulse: false },
    { icon: 'model_training', label: 'Model version', value: recent[0]?.model_version ?? '—', color: DG.primary, pulse: false },
    { icon: 'bolt', label: 'Avg latency', value: overview ? `${overview.avg_latency_ms}ms` : '—', color: DG.uncertain, pulse: false },
  ];
  return (
    <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 dg-rise grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((s) => (
        <div key={s.label} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}12` }}>
            <Icon name={s.icon} className="text-[20px]" style={{ color: s.color }} fill />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              {s.pulse && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: s.color }} />}
              {s.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Page header (shared) ── */
function PageHeader({
  subtitle,
  range,
  setRange,
  action,
}: {
  subtitle: string;
  range: string;
  setRange: (r: string) => void;
  action?: { label: string; icon: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 dg-rise">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <RangeToggle value={range} onChange={setRange} options={RANGE_OPTIONS} />
        {action && (
          <button
            onClick={action.onClick}
            className="hidden md:flex items-center gap-2 bg-dgblue text-white px-4 h-9 rounded-xl shadow-lg shadow-dgblue/25 hover:bg-dgblue/90 transition-all text-xs font-bold"
          >
            <Icon name={action.icon} className="text-[18px]" /> {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Quick-link card (admin) ── */
function QuickLink({ icon, title, hint, onClick, color = DG.primary }: { icon: string; title: string; hint: string; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full glass-panel rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 group dg-rise"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: `${color}1a` }}>
        <Icon name={icon} className="text-[22px]" style={{ color }} fill />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-black text-slate-800">{title}</p>
          <Icon name="arrow_forward" className="text-[14px] text-slate-400 group-hover:translate-x-1 transition-all" />
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Shared analytics data hook (developer / admin / compliance / viewer)
   ════════════════════════════════════════════════════════════════════════════ */
function useSharedAnalytics(role: Role | undefined) {
  const [range, setRange] = useState('7d');
  const [mode, setMode] = useState<'area' | 'bar'>('area');
  const [chartSeries, setChartSeries] = useState<{ key: string; on: boolean }[]>([
    { key: 'total', on: true },
    { key: 'fake', on: true },
    { key: 'real', on: false },
  ]);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [recent, setRecent] = useState<DetectionListItem[]>([]);
  const [seriesRows, setSeriesRows] = useState<DetectionListItem[]>([]);
  const [keys, setKeys] = useState<ApiKeyOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const days = RANGE_DAYS[range] ?? 7;
  // key-management widgets hidden for compliance/viewer → skip apiKeysList for them
  const wantsKeys = role === 'developer' || role === 'admin';

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      analyticsOverview(days),
      analyticsUsage(),
      detectionsList({ limit: 6 }),
      detectionsList({ limit: 100 }), // backend caps limit at 100
      wantsKeys ? apiKeysList() : Promise.resolve([] as ApiKeyOut[]),
    ])
      .then(([ov, us, recentRes, seriesRes, keyList]) => {
        setOverview(ov);
        setUsage(us);
        setRecent(recentRes.items);
        setSeriesRows(seriesRes.items);
        setKeys(keyList);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [days, wantsKeys]);

  const buckets = useMemo(() => buildSeries(seriesRows, days), [seriesRows, days]);
  const axis = buckets.map((b) => b.label);
  const reqSpark = buckets.map((b) => b.total);
  const fakeSpark = buckets.map((b) => b.fake);

  const series: ChartSeries[] = useMemo(() => {
    const def: Record<string, { label: string; color: string; values: number[] }> = {
      total: { label: 'Tổng requests', color: DG.primary, values: buckets.map((b) => b.total) },
      fake: { label: 'Fake detected', color: DG.fake, values: buckets.map((b) => b.fake) },
      real: { label: 'Real', color: DG.real, values: buckets.map((b) => b.real) },
    };
    return chartSeries.map((s) => ({ key: s.key, on: s.on, ...def[s.key] }));
  }, [buckets, chartSeries]);

  const toggleSeries = (key: string) =>
    setChartSeries((s) => s.map((x) => (x.key === key ? { ...x, on: !x.on } : x)));

  const topKeys = useMemo(() => {
    const sorted = [...keys].sort((a, b) => b.quota_used - a.quota_used).slice(0, 5);
    const max = Math.max(...sorted.map((k) => k.quota_used), 1);
    return sorted.map((k) => ({ ...k, share: (k.quota_used / max) * 100 }));
  }, [keys]);

  const shared: SharedAnalytics = { loading, overview, range, setRange, axis, series, toggleSeries, mode, setMode, reqSpark };

  return { range, setRange, overview, usage, recent, keys, topKeys, loading, error, reqSpark, fakeSpark, shared };
}

type SharedData = ReturnType<typeof useSharedAnalytics>;

/* KPI builder reused by developer / admin / viewer / compliance */
function buildCoreKpis(overview: AnalyticsOverview, usage: UsageInfo | null, range: string, reqSpark: number[], fakeSpark: number[]): KpiCardData[] {
  return [
    {
      title: 'Tổng requests',
      value: overview.total_requests,
      icon: 'data_usage',
      iconBg: DG.primary,
      spark: reqSpark,
      sparkColor: DG.primary,
      sub: `${RANGE_LABEL[range]} · ${fmtInt(overview.real_detected)} real`,
    },
    {
      title: 'Deepfake detected',
      value: overview.fake_detected,
      icon: 'gpp_maybe',
      iconBg: DG.fake,
      alert: overview.fake_detected > 0,
      spark: fakeSpark.some((v) => v > 0) ? fakeSpark : undefined,
      sparkColor: DG.fake,
      sub: `${overview.fake_rate.toFixed(1)}% tỉ lệ fake`,
    },
    {
      title: 'Avg latency',
      value: overview.avg_latency_ms,
      suffix: 'ms',
      icon: 'bolt',
      iconBg: DG.uncertain,
      sub: `P95 ${overview.p95_latency_ms}ms`,
    },
    {
      title: 'Quota tháng',
      value: usage ? usage.usage_percent : 0,
      suffix: '%',
      decimals: 1,
      icon: 'database',
      iconBg: DG.real,
      progress: usage ? usage.usage_percent : 0,
      sub: usage ? `${fmtInt(usage.remaining)} còn lại` : undefined,
    },
  ];
}

/* ════════════════════════════════════════════════════════════════════════════
   VARIANT — developer (integration dashboard)
   ════════════════════════════════════════════════════════════════════════════ */
function DeveloperDashboard({ d, role }: { d: SharedData; role: Role }) {
  const navigate = useNavigation((s) => s.navigate);
  const setSelectedRequestId = useNavigation((s) => s.setSelectedRequestId);
  const { overview, usage, recent, topKeys, loading, error, reqSpark, fakeSpark, range, setRange, shared } = d;
  const canManageKeys = canEdit(role, 'apikeys');
  const handleRow = (id: string) => { setSelectedRequestId(id); navigate('detail'); };
  const kpis = overview ? buildCoreKpis(overview, usage, range, reqSpark, fakeSpark) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle="Tổng quan tích hợp API — DeepGuard Workspace"
        range={range}
        setRange={setRange}
        action={{ label: 'Test API', icon: 'rocket_launch', onClick: () => navigate('playground') }}
      />
      {error && <ErrorBanner message="Không tải được dữ liệu dashboard. Vui lòng thử lại." />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading || !overview ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />) : kpis.map((c) => <KpiCard key={c.title} card={c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RequestVolumeChart a={shared} />
        </div>
        <VerdictDonut a={shared} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentDetections loading={loading} recent={recent} onRow={handleRow} onViewAll={() => navigate('history')} />
        </div>
        <div className="space-y-5">
          <TopKeysRail loading={loading} keys={topKeys} canManage={canManageKeys} onManage={() => navigate('apikeys')} />
          <QuickLink icon="rocket_launch" title="Test Detection API" hint="Thử nghiệm trực tiếp trong Playground" onClick={() => navigate('playground')} />
        </div>
      </div>

      <StatusStrip error={error} usage={usage} overview={overview} recent={recent} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   VARIANT — admin (tenant overview)
   ════════════════════════════════════════════════════════════════════════════ */
function AdminDashboard({ d, role }: { d: SharedData; role: Role }) {
  const navigate = useNavigation((s) => s.navigate);
  const setSelectedRequestId = useNavigation((s) => s.setSelectedRequestId);
  const { overview, usage, recent, topKeys, loading, error, reqSpark, fakeSpark, range, setRange, shared } = d;

  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [tenantErr, setTenantErr] = useState(false);
  useEffect(() => {
    tenantGet().then(setTenant).catch(() => setTenantErr(true));
  }, []);

  const handleRow = (id: string) => { setSelectedRequestId(id); navigate('detail'); };
  const canManageKeys = canEdit(role, 'apikeys');

  const quotaPct = tenant && tenant.monthly_quota > 0 ? (tenant.current_usage / tenant.monthly_quota) * 100 : usage?.usage_percent ?? 0;

  const kpis: KpiCardData[] = overview
    ? [
        {
          title: 'Tenant quota',
          value: quotaPct,
          suffix: '%',
          decimals: 1,
          icon: 'corporate_fare',
          iconBg: DG.primary,
          progress: quotaPct,
          sub: tenant ? `${fmtInt(tenant.current_usage)} / ${fmtInt(tenant.monthly_quota)}` : usage ? `${fmtInt(usage.remaining)} còn lại` : undefined,
        },
        { title: 'Tổng requests', value: overview.total_requests, icon: 'data_usage', iconBg: DG.primary, spark: reqSpark, sparkColor: DG.primary, sub: `${RANGE_LABEL[range]}` },
        {
          title: 'Tỉ lệ fake',
          value: overview.fake_rate,
          suffix: '%',
          decimals: 1,
          icon: 'gpp_maybe',
          iconBg: DG.fake,
          alert: overview.fake_detected > 0,
          spark: fakeSpark.some((v) => v > 0) ? fakeSpark : undefined,
          sparkColor: DG.fake,
          sub: `${fmtInt(overview.fake_detected)} deepfake`,
        },
        { title: 'Avg latency', value: overview.avg_latency_ms, suffix: 'ms', icon: 'bolt', iconBg: DG.uncertain, sub: `P95 ${overview.p95_latency_ms}ms` },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle={tenant ? `Tổng quan tổ chức — ${tenant.name} · gói ${tenant.plan}` : 'Tổng quan tổ chức — DeepGuard Workspace'}
        range={range}
        setRange={setRange}
        action={{ label: 'Mời thành viên', icon: 'group_add', onClick: () => navigate('team') }}
      />
      {error && <ErrorBanner message="Không tải được dữ liệu tổ chức. Vui lòng thử lại." />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading || !overview ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />) : kpis.map((c) => <KpiCard key={c.title} card={c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RequestVolumeChart a={shared} />
        </div>
        <VerdictDonut a={shared} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentDetections loading={loading} recent={recent} onRow={handleRow} onViewAll={() => navigate('history')} />
        </div>
        <div className="space-y-5">
          <TopKeysRail loading={loading} keys={topKeys} canManage={canManageKeys} onManage={() => navigate('apikeys')} />

          {/* Team activity teaser */}
          <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 dg-rise">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-dgblue rounded-full" />
                <h2 className="text-[13px] font-black text-slate-900">Hoạt động nhóm</h2>
              </div>
              <button onClick={() => navigate('team')} className="text-[11px] font-bold text-dgblue hover:gap-2 flex items-center gap-1 transition-all">
                Quản lý <Icon name="arrow_forward" className="text-[14px]" />
              </button>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Quản lý thành viên, vai trò và lời mời cho <span className="font-bold text-slate-700">{tenant?.name ?? 'tổ chức'}</span>.
            </p>
          </div>

          <QuickLink icon="receipt_long" title="Billing & gói dịch vụ" hint={tenant ? `Gói hiện tại: ${tenant.plan}` : 'Xem hóa đơn và hạn mức'} onClick={() => navigate('billing')} color={DG.real} />
          <QuickLink icon="settings" title="Cài đặt tổ chức" hint="Cấu hình tenant & bảo mật" onClick={() => navigate('settings')} />
        </div>
      </div>

      <StatusStrip error={error || tenantErr} usage={usage} overview={overview} recent={recent} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   VARIANT — compliance (review queue)
   ════════════════════════════════════════════════════════════════════════════ */
function ComplianceDashboard({ d }: { d: SharedData }) {
  const navigate = useNavigation((s) => s.navigate);
  const setSelectedRequestId = useNavigation((s) => s.setSelectedRequestId);
  const { overview, usage, recent, loading, error, reqSpark, fakeSpark, range, setRange, shared } = d;

  const [fakes, setFakes] = useState<DetectionListItem[]>([]);
  const [fakesLoading, setFakesLoading] = useState(true);
  const [fakesErr, setFakesErr] = useState(false);
  useEffect(() => {
    setFakesLoading(true);
    setFakesErr(false);
    detectionsList({ verdict: 'FAKE', limit: 8 })
      .then((res) => setFakes(res.items))
      .catch(() => setFakesErr(true))
      .finally(() => setFakesLoading(false));
  }, []);

  const openDetail = (id: string) => { setSelectedRequestId(id); navigate('detail'); };

  const kpis: KpiCardData[] = overview
    ? [
        { title: 'Deepfake cần soát', value: overview.fake_detected, icon: 'gpp_maybe', iconBg: DG.fake, alert: overview.fake_detected > 0, spark: fakeSpark.some((v) => v > 0) ? fakeSpark : undefined, sparkColor: DG.fake, sub: `${overview.fake_rate.toFixed(1)}% tỉ lệ fake` },
        { title: 'Tổng requests', value: overview.total_requests, icon: 'data_usage', iconBg: DG.primary, spark: reqSpark, sparkColor: DG.primary, sub: `${RANGE_LABEL[range]}` },
        { title: 'Uncertain', value: overview.uncertain, icon: 'help', iconBg: DG.uncertain, sub: 'Cần kiểm tra thủ công' },
        { title: 'Real', value: overview.real_detected, icon: 'verified', iconBg: DG.real, sub: 'Hợp lệ' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader subtitle="Hàng đợi rà soát tuân thủ — DeepGuard" range={range} setRange={setRange} />
      {error && <ErrorBanner message="Không tải được dữ liệu tuân thủ. Vui lòng thử lại." />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading || !overview ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />) : kpis.map((c) => <KpiCard key={c.title} card={c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* FAKE review queue */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-dgfake rounded-full animate-pulse" />
              <h2 className="text-base font-black text-slate-900">Deepfake cần rà soát</h2>
            </div>
            <button onClick={() => navigate('history')} className="text-[11px] font-bold text-dgblue hover:gap-2 flex items-center gap-1 transition-all">
              Xem lịch sử <Icon name="arrow_forward" className="text-[14px]" />
            </button>
          </div>
          {fakesLoading ? (
            <div className="divide-y divide-slate-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3">
                  <div className="skeleton h-4 w-14 rounded-md" />
                  <div className="skeleton h-3 w-40 flex-1" />
                  <div className="skeleton h-3 w-12" />
                </div>
              ))}
            </div>
          ) : fakesErr ? (
            <ErrorBanner message="Không tải được danh sách cần rà soát." />
          ) : fakes.length === 0 ? (
            <FriendlyEmpty icon="task_alt" title="Không có deepfake nào cần rà soát" hint="Tất cả phát hiện đã được xử lý." />
          ) : (
            <div className="divide-y divide-slate-50">
              {fakes.map((det) => (
                <div
                  key={det.request_id}
                  onClick={() => openDetail(det.request_id)}
                  className="data-table-row flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer"
                >
                  <VerdictBadge verdict={det.verdict} />
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Icon name="fingerprint" className="text-[16px] text-slate-300 shrink-0" />
                    <span className="text-[12px] text-slate-700 font-semibold font-mono truncate">{det.image_hash.slice(0, 16)}…</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:block">{timeAgo(det.created_at)}</span>
                  <span className="text-[12px] font-black text-dgfake tabular-nums w-14 text-right">{det.confidence.toFixed(1)}%</span>
                  <Icon name="chevron_right" className="text-[18px] text-slate-300" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right rail: fake-rate donut + compliance/retention + audit teaser */}
        <div className="space-y-5">
          <VerdictDonut a={shared} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RequestVolumeChart a={shared} />
        </div>
        <div className="space-y-5">
          {/* Audit volume teaser */}
          <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 dg-rise">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-dgblue rounded-full" />
                <h2 className="text-[13px] font-black text-slate-900">Nhật ký kiểm toán</h2>
              </div>
              <button onClick={() => navigate('audit')} className="text-[11px] font-bold text-dgblue hover:gap-2 flex items-center gap-1 transition-all">
                Mở <Icon name="arrow_forward" className="text-[14px]" />
              </button>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">Theo dõi toàn bộ hành động truy cập và thay đổi cấu hình của tổ chức.</p>
          </div>

          {/* Compliance / retention status */}
          <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 dg-rise">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 bg-dgreal rounded-full" />
              <h2 className="text-[13px] font-black text-slate-900">Trạng thái tuân thủ</h2>
            </div>
            <div className="space-y-3">
              {[
                { icon: 'verified_user', label: 'Lưu trữ dữ liệu', value: '90 ngày', color: DG.real },
                { icon: 'lock', label: 'Mã hóa khi lưu', value: 'Bật', color: DG.real },
                { icon: 'history_edu', label: 'Ghi nhật ký kiểm toán', value: error ? 'Lỗi' : 'Hoạt động', color: error ? DG.fake : DG.real },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${row.color}14`, color: row.color }}>
                    <Icon name={row.icon} className="text-[18px]" fill />
                  </span>
                  <span className="text-[12px] font-semibold text-slate-600 flex-1">{row.label}</span>
                  <span className="text-[12px] font-black" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StatusStrip error={error} usage={usage} overview={overview} recent={recent} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   VARIANT — sysadmin (platform ops)
   ════════════════════════════════════════════════════════════════════════════ */
function PlanBadge({ plan }: { plan: string }) {
  return <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-600 uppercase tracking-wider">{plan}</span>;
}
function StatusDot({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const label = s === 'active' ? 'Hoạt động' : s === 'pending' ? 'Chờ duyệt' : s === 'suspended' ? 'Tạm ngưng' : status;
  const color = s === 'active' ? DG.real : s === 'pending' ? DG.uncertain : DG.fake;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function SysadminDashboard() {
  const navigate = useNavigation((s) => s.navigate);
  const [range, setRange] = useState('7d');
  const [platform, setPlatform] = useState<PlatformOverview | null>(null);
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const days = RANGE_DAYS[range] ?? 7;
  useEffect(() => {
    setLoading(true);
    setError(false);
    // Endpoints are being added — handle errors/empty gracefully, never crash.
    Promise.allSettled([platformOverview(days), tenantsList()])
      .then(([ov, ts]) => {
        if (ov.status === 'fulfilled') setPlatform(ov.value);
        if (ts.status === 'fulfilled') setTenants(ts.value.items);
        if (ov.status === 'rejected' && ts.status === 'rejected') setError(true);
      })
      .finally(() => setLoading(false));
  }, [days]);

  const kpis: KpiCardData[] = platform
    ? [
        { title: 'Tenants', value: platform.total_tenants, icon: 'corporate_fare', iconBg: DG.primary, sub: `${fmtInt(platform.active_tenants)} đang hoạt động` },
        { title: 'Người dùng', value: platform.total_users, icon: 'group', iconBg: DG.primary, sub: 'Toàn nền tảng' },
        { title: 'Tổng requests', value: platform.total_requests, icon: 'data_usage', iconBg: DG.real, sub: `${RANGE_LABEL[range]}` },
        { title: 'Tỉ lệ fake', value: platform.fake_rate, suffix: '%', decimals: 1, icon: 'gpp_maybe', iconBg: DG.fake, alert: platform.fake_detected > 0, sub: `${fmtInt(platform.fake_detected)} deepfake` },
        { title: 'Avg latency', value: platform.avg_latency_ms, suffix: 'ms', icon: 'bolt', iconBg: DG.uncertain, sub: 'Toàn hệ thống' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader subtitle="Vận hành nền tảng — DeepGuard Platform Ops" range={range} setRange={setRange} action={{ label: 'Quản lý tenants', icon: 'corporate_fare', onClick: () => navigate('tenants') }} />

      {error && <ErrorBanner message="Chưa thể tải dữ liệu nền tảng. Các endpoint đang được hoàn thiện — vui lòng thử lại sau." />}

      {/* Platform KPIs (5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {loading || !platform ? Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />) : kpis.map((c) => <KpiCard key={c.title} card={c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tenants table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-dgblue rounded-full" />
              <h2 className="text-base font-black text-slate-900">Tenants</h2>
            </div>
            <button onClick={() => navigate('tenants')} className="text-[11px] font-bold text-dgblue hover:gap-2 flex items-center gap-1 transition-all">
              Quản lý tất cả <Icon name="arrow_forward" className="text-[14px]" />
            </button>
          </div>
          <div className="grid grid-cols-12 gap-3 px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <div className="col-span-4">Tổ chức</div>
            <div className="col-span-2">Gói</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-3">Sử dụng</div>
            <div className="col-span-1 text-right" />
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 px-3 py-3 items-center">
                  <div className="col-span-4 skeleton h-3 w-32" />
                  <div className="col-span-2 skeleton h-4 w-14 rounded-md" />
                  <div className="col-span-2 skeleton h-3 w-16" />
                  <div className="col-span-3 skeleton h-1.5 w-full rounded-full" />
                  <div className="col-span-1 skeleton h-3 w-8 ml-auto" />
                </div>
              ))
            ) : tenants.length === 0 ? (
              <FriendlyEmpty icon="corporate_fare" title="Chưa có tenant nào" hint="Dữ liệu sẽ xuất hiện khi endpoint nền tảng sẵn sàng." />
            ) : (
              tenants.map((t) => {
                const pct = t.monthly_quota > 0 ? Math.min((t.current_usage / t.monthly_quota) * 100, 100) : 0;
                return (
                  <div key={t.id} className="data-table-row grid grid-cols-12 gap-3 px-3 py-3 items-center rounded-lg">
                    <div className="col-span-4 min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 truncate">{t.name}</p>
                      <p className="text-[10px] text-slate-400">{fmtInt(t.user_count)} người dùng</p>
                    </div>
                    <div className="col-span-2"><PlanBadge plan={t.plan} /></div>
                    <div className="col-span-2"><StatusDot status={t.status} /></div>
                    <div className="col-span-3">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-dgblue rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 tabular-nums">{fmtInt(t.current_usage)} / {fmtInt(t.monthly_quota)}</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <button onClick={() => navigate('tenants')} className="text-[11px] font-bold text-dgblue hover:underline">Quản lý</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* System status teaser */}
        <div className="space-y-5">
          <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 dg-rise">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-dgreal rounded-full animate-pulse" />
                <h2 className="text-[13px] font-black text-slate-900">Trạng thái hệ thống</h2>
              </div>
              <button onClick={() => navigate('status')} className="text-[11px] font-bold text-dgblue hover:gap-2 flex items-center gap-1 transition-all">
                Chi tiết <Icon name="arrow_forward" className="text-[14px]" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { icon: 'dns', label: 'API Gateway', value: error ? 'Suy giảm' : 'Hoạt động', color: error ? DG.fake : DG.real },
                { icon: 'memory', label: 'Inference cluster', value: 'Hoạt động', color: DG.real },
                { icon: 'database', label: 'Cơ sở dữ liệu', value: 'Hoạt động', color: DG.real },
                { icon: 'bolt', label: 'Avg latency', value: platform ? `${platform.avg_latency_ms}ms` : '—', color: DG.uncertain },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${row.color}14`, color: row.color }}>
                    <Icon name={row.icon} className="text-[18px]" fill />
                  </span>
                  <span className="text-[12px] font-semibold text-slate-600 flex-1">{row.label}</span>
                  <span className="text-[12px] font-black" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <QuickLink icon="settings" title="Cài đặt nền tảng" hint="Cấu hình hệ thống & bảo mật" onClick={() => navigate('settings')} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   VARIANT — viewer (read-only overview, no action buttons / CTAs)
   ════════════════════════════════════════════════════════════════════════════ */
function ViewerDashboard({ d }: { d: SharedData }) {
  const navigate = useNavigation((s) => s.navigate);
  const setSelectedRequestId = useNavigation((s) => s.setSelectedRequestId);
  const { overview, usage, recent, loading, error, reqSpark, fakeSpark, range, setRange, shared } = d;
  const openDetail = (id: string) => { setSelectedRequestId(id); navigate('detail'); };
  const kpis = overview ? buildCoreKpis(overview, usage, range, reqSpark, fakeSpark) : [];

  return (
    <div className="space-y-6">
      {/* No action button for viewer */}
      <PageHeader subtitle="Tổng quan (chỉ đọc) — DeepGuard Workspace" range={range} setRange={setRange} />
      {error && <ErrorBanner message="Không tải được dữ liệu dashboard. Vui lòng thử lại." />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading || !overview ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />) : kpis.map((c) => <KpiCard key={c.title} card={c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RequestVolumeChart a={shared} />
        </div>
        <VerdictDonut a={shared} />
      </div>

      {/* Recent detections (rows still open read-only detail; no "view all" CTA) */}
      <RecentDetections loading={loading} recent={recent} onRow={openDetail} />

      <StatusStrip error={error} usage={usage} overview={overview} recent={recent} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Root — switch by role
   ════════════════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════════════════
   BỐ CỤC MỚI (focus) — giao diện LoopAI (tím/teal) ĐỔ DỮ LIỆU THẬT từ useSharedAnalytics
   (cùng nguồn với bản cổ điển): KPI overview, biểu đồ dot-column Thực tế + Dự báo,
   bảng "Phát hiện gần đây", cảnh báo suy ra từ dữ liệu, DeepGuard Copilot.
   ════════════════════════════════════════════════════════════════════════════ */
const L_TEAL = 'rgba(79,145,255,.72)';   // Actual — medium blue
const L_PROJ = '#bfdbfe';                // AI Projected — sky-200 blue
const L_TODAY = '#0047cc';               // hôm nay — sidebar primary blue
const L_BRAND = '#0047cc';              // primary blue (sidebar match)
const L_BRAND_DK = '#003db5';           // dark blue

/** % thay đổi nửa cũ vs nửa mới của chuỗi (period-over-period trong cửa sổ). */
function halfTrend(arr: number[]): { pct: number; up: boolean } | null {
  if (arr.length < 4) return null;
  const mid = Math.floor(arr.length / 2);
  const older = arr.slice(0, mid).reduce((s, v) => s + v, 0);
  const newer = arr.slice(mid).reduce((s, v) => s + v, 0);
  if (older === 0) return newer > 0 ? { pct: 100, up: true } : null;
  const pct = Math.round(((newer - older) / older) * 100);
  return { pct, up: pct >= 0 };
}

/** Dự báo tuyến tính n điểm kế tiếp (hồi quy bậc nhất). */
function projectSeries(actual: number[], n: number): number[] {
  const len = actual.length;
  if (len < 2) return Array(n).fill(actual[len - 1] ?? 0);
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < len; i++) { sx += i; sy += actual[i]; sxx += i * i; sxy += i * actual[i]; }
  const den = len * sxx - sx * sx || 1;
  const b = (len * sxy - sx * sy) / den;
  const a = (sy - b * sx) / len;
  return Array.from({ length: n }, (_, k) => Math.max(0, Math.round(a + b * (len + k))));
}

function LoopChart({ actual, axis }: { actual: number[]; axis: string[] }) {
  const proj = useMemo(() => projectSeries(actual, Math.max(3, Math.round(actual.length * 0.4))), [actual]);
  const all = [...actual, ...proj];
  const maxV = Math.max(...all, 1);
  const dotsFor = (v: number) => (v <= 0 ? 0 : Math.min(8, Math.max(1, Math.round((v / maxV) * 8))));
  const todayIdx = actual.length - 1;
  const mean = actual.length ? Math.round(actual.reduce((s, v) => s + v, 0) / actual.length) : 0;
  const cols = all.map((v, i) => ({ v, dots: dotsFor(v), kind: i < actual.length ? (i === todayIdx ? 'today' : 'actual') : 'proj' }));
  const colColor = (k: string) => (k === 'today' ? L_TODAY : k === 'actual' ? L_TEAL : L_PROJ);
  const meanTop = `${Math.round((1 - mean / maxV) * 100)}%`;
  const step = Math.max(1, Math.floor(axis.length / 5));
  const xLabels = axis.filter((_, i) => i % step === 0);

  return (
    <div className="flex-1 relative flex items-end">
      <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-slate-400 tabular-nums">
        <span>{fmtInt(maxV)}</span><span>{fmtInt(Math.round(maxV * 0.66))}</span><span>{fmtInt(Math.round(maxV * 0.33))}</span><span>0</span>
      </div>
      <div className="ml-10 flex-1 h-full relative flex items-end justify-between pb-6">
        {mean > 0 && (
          <>
            <div className="absolute left-0 right-0 border-t border-dashed z-0" style={{ top: meanTop, borderColor: L_PROJ }} />
            <div className="absolute left-[-40px] -translate-y-1/2 text-white text-[11px] font-bold px-1.5 py-0.5 rounded z-10" style={{ top: meanTop, background: L_BRAND }}>{fmtInt(mean)}</div>
          </>
        )}
        {cols.map((c, i) => (
          <div key={i} className="flex flex-col gap-1 items-center z-10 relative">
            {Array.from({ length: c.dots }).map((_, k) => (
              <div key={k} className="w-3 h-3 rounded-full" style={{ background: colColor(c.kind) }} />
            ))}
            {c.kind === 'today' && (
              <div className="absolute -bottom-8 whitespace-nowrap text-white text-xs px-2 py-1 rounded-full" style={{ background: L_BRAND }}>Hôm nay · {fmtInt(c.v)}</div>
            )}
          </div>
        ))}
        <div className="absolute left-10 right-0 bottom-0 flex justify-between text-xs text-slate-400">
          {xLabels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

function LoopKpi({ label, value, sub, delta }: { label: string; value: string; sub: string; delta: { pct: number; up: boolean; goodUp: boolean } | null }) {
  const good = delta ? delta.up === delta.goodUp : true;
  return (
    <div style={{
      background: 'white', borderRadius: 18, padding: '20px 18px',
      border: '1px solid rgba(0,71,204,.08)',
      boxShadow: '0 2px 10px rgba(0,71,204,.06)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 108,
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', letterSpacing: '.04em', textTransform: 'uppercase' }}>{label}</span>
          {delta && (
            <span style={{
              padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              background: good ? '#f0fdf4' : '#fef2f2', color: good ? '#16a34a' : '#dc2626',
              boxShadow: `0 0 0 1px ${good ? 'rgba(22,163,74,.15)' : 'rgba(220,38,38,.15)'}`,
            }}>
              {delta.up ? '+' : ''}{delta.pct}%
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: '#08142a', letterSpacing: '-0.05em', lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', lineHeight: 1.5 }}>{sub}</span>
        </div>
    </div>
  );
}

function FocusDashboard({ d, role }: { d: SharedData; role: Role }) {
  const navigate = useNavigation((s) => s.navigate);
  const setSelectedRequestId = useNavigation((s) => s.setSelectedRequestId);
  const { overview, usage, recent, reqSpark, fakeSpark, loading, shared } = d;
  const [tab, setTab] = useState<'review' | 'all' | 'FAKE' | 'REAL'>('review');

  const reqTrend = halfTrend(reqSpark);
  const fakeTrend = halfTrend(fakeSpark);

  const counts = useMemo(() => ({
    review: recent.filter((r) => r.verdict === 'FAKE' || r.verdict === 'UNCERTAIN').length,
    all: recent.length,
    FAKE: recent.filter((r) => r.verdict === 'FAKE').length,
    REAL: recent.filter((r) => r.verdict === 'REAL').length,
  }), [recent]);
  const rows = useMemo(() => {
    if (tab === 'all') return recent;
    if (tab === 'review') return recent.filter((r) => r.verdict === 'FAKE' || r.verdict === 'UNCERTAIN');
    return recent.filter((r) => r.verdict === tab);
  }, [recent, tab]);

  // Cảnh báo ưu tiên — suy ra từ dữ liệu thật (giữ phong cách "task row" của LoopAI).
  const alerts: { color: string; title: string; meta: string; desc: string; page: Parameters<typeof navigate>[0] }[] = [];
  if (overview && overview.fake_detected > 0)
    alerts.push({ color: DG.fake, title: `${fmtInt(overview.fake_detected)} deepfake cần xem xét`, meta: `Tỉ lệ ${overview.fake_rate.toFixed(1)}%`, desc: 'Các trường hợp nghi giả mạo cần con người duyệt.', page: 'history' });
  if (usage && usage.usage_percent >= 80)
    alerts.push({ color: DG.uncertain, title: 'Sắp chạm hạn mức tháng', meta: `${usage.usage_percent.toFixed(0)}% đã dùng`, desc: `Còn ${fmtInt(usage.remaining)} request trong kỳ.`, page: (role === 'admin' ? 'billing' : 'analytics') });
  if (overview && overview.avg_latency_ms > 800)
    alerts.push({ color: DG.uncertain, title: 'Độ trễ cao hơn thường lệ', meta: `P95 ${overview.p95_latency_ms}ms`, desc: 'Theo dõi sức khỏe cụm suy luận.', page: 'status' });
  if (alerts.length === 0)
    alerts.push({ color: DG.real, title: 'Hệ thống đang ổn định', meta: 'OK', desc: 'Không có cảnh báo ưu tiên.', page: 'analytics' });

  const copilotActions: { icon: string; label: string; page: Parameters<typeof navigate>[0] }[] = [
    { icon: 'visibility', label: 'Xem phát hiện', page: 'history' },
    { icon: 'insights', label: 'Phân tích', page: 'analytics' },
    { icon: 'menu_book', label: 'Tài liệu', page: 'docs' },
    { icon: 'monitor_heart', label: 'Trạng thái', page: 'status' },
  ];

  /* Framer variants for stagger entrance */
  const containerV = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const itemV = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── LEFT col-span-8 ── */}
      <div className="lg:col-span-8 flex flex-col gap-6">

        {/* KPI row — always above fold, dùng animate thay whileInView để tránh IntersectionObserver miss on mount */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerV} initial="hidden" animate="show"
        >
          {loading || !overview ? (
            Array.from({ length: 3 }).map((_, i) => (
              <motion.div key={i} variants={itemV}><div className="skeleton h-[130px] rounded-2xl" /></motion.div>
            ))
          ) : (
            <>
              <motion.div variants={itemV}>
                <LoopKpi label="Tổng requests" value={fmtInt(overview.total_requests)} sub={`${fmtInt(overview.real_detected)} real`} delta={reqTrend ? { ...reqTrend, goodUp: true } : null} />
              </motion.div>
              <motion.div variants={itemV}>
                <LoopKpi label="Deepfake detected" value={fmtInt(overview.fake_detected)} sub={`${overview.fake_rate.toFixed(1)}% tỉ lệ`} delta={fakeTrend ? { ...fakeTrend, goodUp: false } : null} />
              </motion.div>
              <motion.div variants={itemV}>
                <LoopKpi label="Độ trễ TB" value={`${fmtInt(overview.avg_latency_ms)}ms`} sub={`P95 ${overview.p95_latency_ms}ms`} delta={null} />
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Analytics card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: '-40px' }}
          style={{
            background: 'white', borderRadius: 20, padding: '24px',
            border: '1px solid rgba(0,71,204,.09)',
            boxShadow: '0 2px 12px rgba(0,71,204,.06)',
          }}
        >
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#0047cc', letterSpacing: '.1em', textTransform: 'uppercase' }}>Phân tích</span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">Phát hiện theo thời gian</h2>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: L_TEAL }} /> Thực tế
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: L_PROJ }} /> Dự báo AI
                </span>
                <RangeToggle options={RANGE_OPTIONS} value={shared.range} onChange={shared.setRange} />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-5 h-64">
              {/* Left insight + CTA */}
              <div className="w-full md:w-60 flex flex-col justify-between">
                {/* Insight box */}
                <div style={{
                  borderRadius: 13, padding: '14px',
                  background: 'rgba(0,71,204,.05)', border: '1px solid rgba(0,71,204,.1)',
                }}>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: L_BRAND }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.6 }}>
                      Lưu lượng & tỉ lệ nghi giả theo {RANGE_LABEL[shared.range].toLowerCase()}. Nét đứt = trung bình; chấm nhạt = dự báo xu hướng AI.
                    </p>
                  </div>
                </div>
                {/* Button-in-button CTA */}
                <button
                  onClick={() => navigate('analytics')}
                  className="group w-full mt-4"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '11px 18px', borderRadius: 13, border: 'none', cursor: 'pointer',
                    background: `linear-gradient(135deg,${L_BRAND} 0%,#1a6fff 100%)`,
                    color: 'white', fontWeight: 800, fontSize: 13, letterSpacing: '.04em',
                    boxShadow: `0 4px 16px rgba(0,71,204,.35)`,
                    transition: 'all .28s cubic-bezier(.22,1,.36,1)',
                  }}
                >
                  <span>Xem phân tích</span>
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform .28s cubic-bezier(.22,1,.36,1)',
                  }}
                    className="group-hover:[transform:translate(2px,-1px)_scale(1.12)]"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
              {/* Chart */}
              {loading ? (
                <div className="flex-1 skeleton rounded-xl" />
              ) : reqSpark.some((v) => v > 0) ? (
                <LoopChart actual={reqSpark} axis={shared.axis} />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <FriendlyEmpty icon="bar_chart" title="Chưa có dữ liệu trong khoảng này" />
                </div>
              )}
            </div>
        </motion.div>

        {/* Recent detections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: '-40px' }}
          style={{
            background: 'white', borderRadius: 20, padding: '24px',
            border: '1px solid rgba(0,71,204,.08)',
            boxShadow: '0 2px 10px rgba(0,71,204,.05)',
          }}
        >
            <div className="flex justify-between items-center mb-5">
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#0047cc', letterSpacing: '.1em', textTransform: 'uppercase' }}>Log</span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">Phát hiện gần đây</h2>
              </div>
              <button
                onClick={() => navigate('history')}
                className="flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-80"
                style={{ color: L_BRAND }}
              >
                Xem lịch sử
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #f1f5f9', marginBottom: 16, paddingBottom: 0 }}>
              {([['review', 'Cần xem xét'], ['all', 'Tất cả'], ['FAKE', 'FAKE'], ['REAL', 'REAL']] as const).map(([id, label]) => (
                <button
                  key={id} onClick={() => setTab(id)}
                  style={{
                    paddingBottom: 10, paddingLeft: 12, paddingRight: 12, paddingTop: 2,
                    fontSize: 13, fontWeight: tab === id ? 700 : 500,
                    color: tab === id ? '#0047cc' : '#94a3b8',
                    background: 'none',
                    border: 'none',
                    borderBottom: tab === id ? '2px solid #0047cc' : '2px solid transparent',
                    cursor: 'pointer', transition: 'color .2s ease',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {label}
                  <span style={{
                    padding: '1px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                    background: tab === id ? 'rgba(0,71,204,.1)' : '#f1f5f9',
                    color: tab === id ? '#0047cc' : '#94a3b8',
                    transition: 'all .2s ease',
                  }}>
                    {counts[id]}
                  </span>
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
              ) : rows.length === 0 ? (
                <FriendlyEmpty icon="history" title="Không có mục nào" />
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 border-b border-slate-50">
                    <tr><th className="py-3 font-semibold">Nguồn</th><th className="py-3 font-semibold">Mã</th><th className="py-3 font-semibold">Risk</th><th className="py-3 font-semibold">Thời gian</th><th className="py-3 font-semibold">Kết luận</th><th className="py-3 font-semibold text-right">More</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.map((r) => {
                      const risk = Math.round((r.prob_fake ?? 0) * 100);
                      const color = r.verdict === 'FAKE' ? DG.fake : r.verdict === 'REAL' ? DG.real : DG.uncertain;
                      const vIcon = r.verdict === 'FAKE' ? 'priority_high' : r.verdict === 'REAL' ? 'check' : 'warning';
                      return (
                        <tr key={r.request_id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => { setSelectedRequestId(r.request_id); navigate('detail'); }}>
                          <td className="py-3 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: color }}>
                              <Icon name={vIcon} className="text-[16px]" fill />
                            </span>
                            <div>
                              <p className="font-semibold text-slate-800">{r.model_version}</p>
                              <p className="text-xs text-slate-400">Phát hiện ảnh</p>
                            </div>
                          </td>
                          <td className="py-3 text-slate-400 font-mono text-xs">{r.image_hash?.slice(0, 10)}…</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full" style={{ width: `${risk}%`, background: color }} />
                              </div>
                              <span className="font-bold text-slate-900 tabular-nums text-xs">{risk}</span>
                            </div>
                          </td>
                          <td className="py-3 text-slate-500 text-xs">{timeAgo(r.created_at)}</td>
                          <td className="py-3"><VerdictBadge verdict={r.verdict} /></td>
                          <td className="py-3 text-right text-slate-300">
                            <Icon name="chevron_right" className="text-[18px] inline" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
        </motion.div>
      </div>

      {/* ── RIGHT col-span-4 ── */}
      <div className="lg:col-span-4 flex flex-col gap-6">

        {/* Cảnh báo ưu tiên */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: '-40px' }}
          style={{
            background: 'white', borderRadius: 20, padding: '22px',
            border: '1px solid rgba(0,71,204,.09)',
            boxShadow: '0 2px 12px rgba(0,71,204,.06)',
          }}
        >
            <div className="flex justify-between items-center mb-5">
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#0047cc', letterSpacing: '.1em', textTransform: 'uppercase' }}>Alerts</span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">Cảnh báo ưu tiên</h2>
              </div>
              <button
                onClick={() => navigate('analytics')}
                className="text-xs font-semibold hover:opacity-70 transition-opacity"
                style={{ color: L_BRAND_DK }}
              >
                Xem tất cả
              </button>
            </div>
            <div className="space-y-3">
              {alerts.map((al, i) => (
                <div
                  key={i} onClick={() => navigate(al.page)}
                  className="group cursor-pointer rounded-xl transition-all hover:shadow-sm"
                  style={{
                    padding: '12px 14px',
                    background: i === 0 ? 'rgba(0,71,204,.03)' : 'transparent',
                    border: i === 0 ? '1px solid rgba(0,71,204,.08)' : '1px solid transparent',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10,
                    transition: 'all .2s cubic-bezier(.22,1,.36,1)',
                  }}
                >
                  <div className="flex gap-3">
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginTop: 1,
                      background: `${al.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg className="w-4 h-4" style={{ color: al.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{al.title}</span>
                        <span style={{ padding: '2px 7px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>{al.meta}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.5 }}>{al.desc}</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 shrink-0 mt-1 text-slate-200 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
        </motion.div>

        {/* DeepGuard Copilot */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: '-40px' }}
          style={{
            background: 'linear-gradient(155deg,#fafcff 0%,#f0f6ff 100%)',
            borderRadius: 20, padding: '22px', flex: 1,
            border: '1px solid rgba(0,71,204,.1)',
            boxShadow: '0 4px 18px rgba(0,71,204,.08)',
            display: 'flex', flexDirection: 'column',
          }}
        >
            {/* Header */}
            <div className="text-center mb-5">
              <div style={{
                width: 44, height: 44, borderRadius: 14, margin: '0 auto 10px',
                background: 'linear-gradient(145deg,#0047cc,#1a6fff)',
                boxShadow: '0 6px 16px rgba(0,71,204,.32)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p style={{ fontSize: 11.5, color: '#64748b', marginBottom: 3 }}>Chào, {ROLE_LABEL[role]}</p>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0a1628', letterSpacing: '-0.03em' }}>DeepGuard Copilot</h2>
            </div>
            {/* Action grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 'auto' }}>
              {copilotActions.map((a) => (
                <button
                  key={a.label} onClick={() => navigate(a.page)}
                  className="group"
                  style={{
                    padding: '14px 12px', borderRadius: 14, textAlign: 'left',
                    background: 'white', cursor: 'pointer',
                    border: '1px solid rgba(0,71,204,.08)',
                    boxShadow: '0 1px 4px rgba(0,71,204,.07)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 88,
                    transition: 'all .22s cubic-bezier(.22,1,.36,1)',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 9,
                    background: 'rgba(0,71,204,.07)',
                    color: L_BRAND,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background .22s ease',
                  }}
                    className="group-hover:bg-[rgba(0,71,204,.14)]"
                  >
                    <Icon name={a.icon} className="text-[17px]" />
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#374151' }}>{a.label}</span>
                </button>
              ))}
            </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Toggle chọn bố cục (Cổ điển ↔ Mới), lưu vào appearance store ── */
const DASH_LAYOUTS: { id: DashboardLayout; label: string; icon: string }[] = [
  { id: 'classic', label: 'Cổ điển', icon: 'dashboard' },
  { id: 'focus', label: 'Bố cục mới', icon: 'view_quilt' },
];
function LayoutToggle() {
  const layout = useAppearanceStore((s) => s.dashboardLayout);
  const setLayout = useAppearanceStore((s) => s.setDashboardLayout);
  return (
    <div className="flex justify-end mb-4">
      <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-white">
        {DASH_LAYOUTS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLayout(l.id)}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-[12px] font-bold transition-all ${
              layout === l.id ? 'bg-white text-dgblue shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon name={l.icon} className="text-[16px]" />{l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role) as Role | undefined;
  const layout = useAppearanceStore((s) => s.dashboardLayout);
  // Shared analytics fetch powers every variant except the sysadmin platform-ops one.
  const shared = useSharedAnalytics(role);

  let body: React.ReactNode;
  if (layout === 'focus') {
    body = <FocusDashboard d={shared} role={(role ?? 'developer') as Role} />;
  } else if (role === 'sysadmin') {
    body = <SysadminDashboard />;
  } else if (role === 'admin') {
    body = <AdminDashboard d={shared} role="admin" />;
  } else if (role === 'compliance') {
    body = <ComplianceDashboard d={shared} />;
  } else if (role === 'viewer') {
    body = <ViewerDashboard d={shared} />;
  } else {
    body = <DeveloperDashboard d={shared} role={(role ?? 'developer') as Role} />;
  }

  return (
    <div>
      <LayoutToggle />
      {body}
    </div>
  );
}
