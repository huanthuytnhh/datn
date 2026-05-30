'use client';

import { useEffect, useState } from 'react';
import {
  analyticsOverview,
  analyticsUsage,
  type AnalyticsOverview,
  type UsageInfo,
} from '@/lib/api';
import {
  Icon,
  AnimatedNumber,
  Sparkline,
  Donut,
  InteractiveChart,
  RangeToggle,
  StatPill,
  type ChartSeries,
  type DonutSegment,
} from '@/components/deepguard/shared';
import { DG, fmtInt } from '@/lib/dg';

/* ──────────────────────────────────────────────
   DeepGuard — Analytics (premium redesign)
   Real data: analyticsOverview(days) + analyticsUsage()
   ────────────────────────────────────────────── */

const cardSx: React.CSSProperties = {
  background: '#fff',
  borderRadius: 13,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.045)',
};

/* ── KPI card backed by a real scalar ── */
function KpiCard({
  label,
  value,
  icon,
  color,
  decimals = 0,
  suffix = '',
  spark,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  decimals?: number;
  suffix?: string;
  spark?: number[];
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        ...cardSx,
        boxShadow: hov
          ? '0 4px 16px rgba(0,0,0,0.09),0 0 0 1px rgba(0,0,0,0.05)'
          : cardSx.boxShadow,
        transition: 'box-shadow .18s ease',
      }}
      className="p-4"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: color + '12' }}
        >
          <Icon name={icon} className="text-[16px]" style={{ color }} fill />
        </div>
      </div>
      <p className="text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>
        {label}
      </p>
      <p
        className="text-[21px] font-bold leading-none mb-2.5 tabular-nums"
        style={{ color: '#0a1628', letterSpacing: '-0.022em' }}
      >
        <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
      </p>
      {spark && spark.length > 1 && <Sparkline data={spark} color={color} w={110} h={20} />}
    </div>
  );
}

/* ── Honest empty state for widgets with no backend field ── */
function EmptyState({ icon, title, note }: { icon: string; title: string; note: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
        style={{ background: 'rgba(0,0,0,0.035)' }}
      >
        <Icon name={icon} className="text-[22px]" style={{ color: '#94a3b8' }} />
      </div>
      <p className="text-[12.5px] font-semibold text-slate-500">{title}</p>
      <p className="text-[11.5px] font-medium mt-1 max-w-[220px]" style={{ color: '#b0bec5' }}>
        {note}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const daysMap: Record<string, number> = { '7d': 7, '30d': 30 };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const days = daysMap[range] ?? 7;
    Promise.all([
      analyticsOverview(days).catch(() => null),
      analyticsUsage().catch(() => null),
    ]).then(([o, u]) => {
      if (!alive) return;
      setOverview(o);
      setUsage(u);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
     
  }, [range]);

  const rangeLabel = range === '30d' ? '30 ngày qua' : '7 ngày qua';

  /* KPIs from real overview scalars */
  const kpis = overview
    ? [
        {
          label: 'Tổng requests',
          value: overview.total_requests,
          icon: 'data_usage',
          color: DG.primary,
          decimals: 0,
          suffix: '',
        },
        {
          label: 'Deepfake rate',
          value: overview.fake_rate,
          icon: 'gpp_maybe',
          color: DG.fake,
          decimals: 1,
          suffix: '%',
        },
        {
          label: 'P95 Latency',
          value: overview.p95_latency_ms,
          icon: 'speed',
          color: '#b45309',
          decimals: 0,
          suffix: 'ms',
        },
        {
          label: 'Avg Latency',
          value: overview.avg_latency_ms,
          icon: 'timer',
          color: '#0369a1',
          decimals: 0,
          suffix: 'ms',
        },
        {
          label: 'Fake detected',
          value: overview.fake_detected,
          icon: 'error_outline',
          color: DG.fake,
          decimals: 0,
          suffix: '',
        },
      ]
    : [];

  /* Verdict composition (real counts) → InteractiveChart bar + Donut */
  const verdictSeries: ChartSeries[] = overview
    ? [
        { key: 'real', label: 'Real', color: DG.real, on: true, values: [overview.real_detected] },
        { key: 'fake', label: 'Fake', color: DG.fake, on: true, values: [overview.fake_detected] },
        {
          key: 'uncertain',
          label: 'Không chắc chắn',
          color: DG.uncertain,
          on: true,
          values: [overview.uncertain],
        },
      ]
    : [];

  const donutSegments: DonutSegment[] = overview
    ? [
        { value: overview.real_detected, color: DG.real },
        { value: overview.fake_detected, color: DG.fake },
        { value: overview.uncertain, color: DG.uncertain },
      ]
    : [];
  const verdictTotal = overview
    ? overview.real_detected + overview.fake_detected + overview.uncertain
    : 0;

  /* Latency percentiles — only avg & p95 are real; p50/p99 unavailable */
  const latRows = overview
    ? [
        { label: 'Avg', value: overview.avg_latency_ms, color: '#0369a1', real: true },
        { label: 'P50', value: null, color: '#166534', real: false },
        { label: 'P95', value: overview.p95_latency_ms, color: '#b45309', real: true },
        { label: 'P99', value: null, color: DG.fake, real: false },
      ]
    : [];
  const latMax = overview ? Math.max(overview.avg_latency_ms, overview.p95_latency_ms, 1) * 1.4 : 1;

  return (
    <div className="space-y-5 pb-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 dg-rise">
        <div>
          <h1 className="text-[21px] font-bold text-slate-900" style={{ letterSpacing: '-0.022em' }}>
            Analytics
          </h1>
          <p className="text-[13px] font-medium mt-0.5" style={{ color: '#94a3b8' }}>
            Phân tích chuyên sâu · {rangeLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RangeToggle
            value={range}
            onChange={setRange}
            options={[
              { id: '7d', label: '7 ngày' },
              { id: '30d', label: '30 ngày' },
            ]}
          />
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 dg-rise">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={cardSx} className="p-4">
                <div className="skeleton h-3 w-14 mb-3 rounded" />
                <div className="skeleton h-7 w-20 mb-2.5 rounded" />
                <div className="skeleton h-4 w-full rounded" />
              </div>
            ))
          : kpis.map((c) => <KpiCard key={c.label} {...c} />)}
      </div>

      {/* ── Usage / quota pill row (real analyticsUsage) ── */}
      {!loading && usage && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 dg-rise">
          <StatPill
            icon="bolt"
            label="Đã dùng tháng này"
            value={<AnimatedNumber value={usage.current_usage} />}
            color={DG.primary}
          />
          <StatPill
            icon="inventory_2"
            label="Hạn mức tháng"
            value={<AnimatedNumber value={usage.monthly_quota} />}
            color="#0369a1"
          />
          <StatPill
            icon="data_usage"
            label="Còn lại"
            value={
              <>
                <AnimatedNumber value={usage.remaining} />{' '}
                <span className="text-[11px] font-semibold text-slate-400">
                  ({usage.usage_percent.toFixed(1)}% dùng)
                </span>
              </>
            }
            color={usage.usage_percent >= 80 ? DG.uncertain : DG.real}
          />
        </div>
      )}

      {/* ── Verdict composition: bar chart + donut ── */}
      <div style={cardSx} className="dg-rise overflow-hidden">
        <div
          className="px-6 pt-5 pb-4 flex flex-wrap items-center justify-between gap-3"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
        >
          <div>
            <h2 className="text-[14px] font-semibold text-slate-800" style={{ letterSpacing: '-0.01em' }}>
              Phân bố kết quả phát hiện
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: '#94a3b8' }}>
              Tổng hợp {rangeLabel}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {[
              ['Real', DG.real],
              ['Fake', DG.fake],
              ['Không chắc chắn', DG.uncertain],
            ].map(([label, color]) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
          <div className="px-4 pt-4 pb-2">
            {loading ? (
              <div className="skeleton h-[300px] w-full rounded-lg" />
            ) : verdictTotal > 0 ? (
              <InteractiveChart
                axis={[rangeLabel]}
                points="Kết quả"
                series={verdictSeries}
                mode="bar"
              />
            ) : (
              <EmptyState
                icon="bar_chart"
                title="Chưa có dữ liệu phát hiện"
                note="Chạy detection để xem phân bố kết quả Real / Fake / Không chắc chắn."
              />
            )}
          </div>
          <div
            className="flex flex-col items-center justify-center gap-5 px-5 py-6 lg:border-l"
            style={{ borderColor: 'rgba(0,0,0,0.05)' }}
          >
            {loading ? (
              <div className="skeleton w-[120px] h-[120px] rounded-full" />
            ) : verdictTotal > 0 ? (
              <>
                <Donut segments={donutSegments} size={120} stroke={14}>
                  <span className="text-[10px] font-medium text-slate-400">Tổng</span>
                  <span className="text-[16px] font-bold text-slate-700 tabular-nums">
                    {fmtInt(verdictTotal)}
                  </span>
                </Donut>
                <div className="w-full space-y-2">
                  {[
                    { label: 'Real', value: overview!.real_detected, color: DG.real },
                    { label: 'Fake', value: overview!.fake_detected, color: DG.fake },
                    { label: 'Không chắc chắn', value: overview!.uncertain, color: DG.uncertain },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-[12px] font-medium text-slate-500 flex-1">{s.label}</span>
                      <span className="text-[12px] font-semibold text-slate-700 tabular-nums">
                        {fmtInt(s.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon="donut_large" title="—" note="Không có dữ liệu." />
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom row: latency percentiles · per-key · geo ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 dg-rise">
        {/* Latency percentiles (avg + p95 real, p50/p99 unavailable) */}
        <div style={cardSx} className="p-5">
          <h3
            className="text-[13px] font-semibold text-slate-800 mb-1"
            style={{ letterSpacing: '-0.01em' }}
          >
            Độ trễ (Latency)
          </h3>
          <p className="text-[11.5px] font-medium mb-5" style={{ color: '#b0bec5' }}>
            Phân phối thời gian phản hồi API
          </p>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-5 w-full rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {latRows.map((r) => {
                const pct = r.value != null ? (r.value / latMax) * 100 : 0;
                return (
                  <div key={r.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-slate-600">{r.label}</span>
                      {r.real ? (
                        <span className="text-[12px] font-bold tabular-nums" style={{ color: r.color }}>
                          {r.value}ms
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-semibold text-slate-300">
                          chưa hỗ trợ
                        </span>
                      )}
                    </div>
                    <div className="h-[5px] w-full rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: r.real ? r.color : 'transparent',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Per-API-key usage — no backend field yet */}
        <div style={cardSx} className="p-5">
          <h3
            className="text-[13px] font-semibold text-slate-800 mb-1"
            style={{ letterSpacing: '-0.01em' }}
          >
            Theo API key
          </h3>
          <p className="text-[11.5px] font-medium" style={{ color: '#b0bec5' }}>
            Phân bổ requests theo từng key
          </p>
          <EmptyState
            icon="key"
            title="Chưa có dữ liệu theo key"
            note="Thống kê usage theo từng API key sẽ sớm khả dụng."
          />
        </div>

        {/* Geo distribution — no backend field yet */}
        <div style={cardSx} className="p-5">
          <h3
            className="text-[13px] font-semibold text-slate-800 mb-1"
            style={{ letterSpacing: '-0.01em' }}
          >
            Phân bố khu vực
          </h3>
          <p className="text-[11.5px] font-medium" style={{ color: '#b0bec5' }}>
            Lưu lượng theo vị trí địa lý
          </p>
          <EmptyState
            icon="public"
            title="Sắp ra mắt"
            note="Phân tích theo khu vực địa lý đang được phát triển."
          />
        </div>
      </div>
    </div>
  );
}
