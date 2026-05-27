'use client';

import { useState, useEffect } from 'react';
import { analyticsOverview, analyticsUsage, type AnalyticsOverview, type UsageInfo } from '@/lib/api';
import { motion } from 'framer-motion';

/* ──────────────────────────────────────────────
   MOCK DATA
   ────────────────────────────────────────────── */

type TimeRange = '24h' | '7d' | '30d' | 'custom';

const requestVolumeData = {
  labels: ['18/06', '19/06', '20/06', '21/06', '22/06', '23/06', '24/06'],
  total: [1420, 1780, 1640, 2100, 1950, 1320, 1877],
  fake: [38, 62, 47, 78, 55, 29, 41],
};

const fakeRateData = {
  labels: ['18/06', '19/06', '20/06', '21/06', '22/06', '23/06', '24/06'],
  rates: [2.68, 3.48, 2.87, 3.71, 2.82, 2.20, 2.18],
};

const latencyData = [
  { label: 'P50', value: 98, max: 400, color: '#2e7d32' },
  { label: 'P95', value: 187, max: 400, color: '#ed6c02' },
  { label: 'P99', value: 342, max: 400, color: '#ba1a1a' },
];

const apiKeyUsageData = [
  { name: 'Production', key: 'sk_live_...9v2k', requests: 8432, color: '#0050cb' },
  { name: 'Staging', key: 'sk_stag_...4m1s', requests: 2100, color: '#4d8fe5' },
  { name: 'Dev Test', key: 'sk_test_...7h3q', requests: 342, color: '#99c2f5' },
];

/* ──────────────────────────────────────────────
   ANIMATION VARIANTS
   ────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'tween', duration: 0.4, ease: 'easeOut' } },
};

/* ──────────────────────────────────────────────
   1. REQUEST VOLUME — STACKED AREA CHART
   ────────────────────────────────────────────── */
function RequestVolumeChart() {
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 45, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const data = requestVolumeData;
  const maxY = Math.ceil(Math.max(...data.total) / 500) * 500;

  const xStep = chartW / (data.labels.length - 1);
  const toX = (i: number) => padding.left + i * xStep;
  const toY = (v: number) => padding.top + chartH - (v / maxY) * chartH;

  // Total area path
  const totalAreaD = data.total
    .map((v, i) => (i === 0 ? `M${toX(i)},${toY(v)}` : `L${toX(i)},${toY(v)}`))
    .join(' ');
  const totalAreaPath = `${totalAreaD} L${toX(data.total.length - 1)},${padding.top + chartH} L${padding.left},${padding.top + chartH} Z`;

  // Fake area path (stacked on top of total, but shown as separate area from bottom)
  const fakeAreaD = data.fake
    .map((v, i) => (i === 0 ? `M${toX(i)},${toY(v)}` : `L${toX(i)},${toY(v)}`))
    .join(' ');
  const fakeAreaPath = `${fakeAreaD} L${toX(data.fake.length - 1)},${padding.top + chartH} L${padding.left},${padding.top + chartH} Z`;

  // Grid lines
  const gridCount = 5;
  const yTicks = Array.from({ length: gridCount + 1 }, (_, i) =>
    Math.round((maxY / gridCount) * i)
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0050cb" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#0050cb" stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id="areaRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ba1a1a" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#ba1a1a" stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={padding.left}
            y1={toY(tick)}
            x2={width - padding.right}
            y2={toY(tick)}
            stroke="#e2e8f0"
            strokeWidth={1}
            strokeDasharray={tick === 0 ? '0' : '4 4'}
          />
          <text
            x={padding.left - 12}
            y={toY(tick) + 4}
            textAnchor="end"
            fill="#94a3b8"
            style={{ fontSize: '10px', fontWeight: 600 }}
          >
            {tick.toLocaleString()}
          </text>
        </g>
      ))}

      {/* X labels */}
      {data.labels.map((label, i) => (
        <text
          key={label}
          x={toX(i)}
          y={height - 12}
          textAnchor="middle"
          fill="#94a3b8"
          style={{ fontSize: '11px', fontWeight: 600 }}
        >
          {label}
        </text>
      ))}

      {/* Total area */}
      <path d={totalAreaPath} fill="url(#areaBlue)" />
      {/* Fake area */}
      <path d={fakeAreaPath} fill="url(#areaRed)" />

      {/* Total line */}
      <polyline
        points={data.total.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')}
        fill="none"
        stroke="#0050cb"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Fake line */}
      <polyline
        points={data.fake.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')}
        fill="none"
        stroke="#ba1a1a"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Total dots */}
      {data.total.map((v, i) => (
        <circle
          key={`t${i}`}
          cx={toX(i)}
          cy={toY(v)}
          r={4}
          fill="#0050cb"
          stroke="white"
          strokeWidth={2}
        />
      ))}

      {/* Fake dots */}
      {data.fake.map((v, i) => (
        <circle
          key={`f${i}`}
          cx={toX(i)}
          cy={toY(v)}
          r={4}
          fill="#ba1a1a"
          stroke="white"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────
   2. FAKE RATE — LINE + AREA CHART
   ────────────────────────────────────────────── */
function FakeRateChart() {
  const width = 500;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 45, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const data = fakeRateData;
  const maxY = 5;

  const xStep = chartW / (data.labels.length - 1);
  const toX = (i: number) => padding.left + i * xStep;
  const toY = (v: number) => padding.top + chartH - (v / maxY) * chartH;

  const lineD = data.rates
    .map((v, i) => (i === 0 ? `M${toX(i)},${toY(v)}` : `L${toX(i)},${toY(v)}`))
    .join(' ');

  const areaPath = `${lineD} L${toX(data.rates.length - 1)},${padding.top + chartH} L${padding.left},${padding.top + chartH} Z`;

  const gridCount = 5;
  const yTicks = Array.from({ length: gridCount + 1 }, (_, i) =>
    ((maxY / gridCount) * i).toFixed(1)
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="fakeRateGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ed6c02" stopOpacity={0.4} />
          <stop offset="50%" stopColor="#ba1a1a" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#ba1a1a" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yTicks.map((tick, idx) => {
        const val = parseFloat(tick);
        const y = toY(val);
        return (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={1}
              strokeDasharray={idx === 0 ? '0' : '4 4'}
            />
            <text
              x={padding.left - 10}
              y={y + 4}
              textAnchor="end"
              fill="#94a3b8"
              style={{ fontSize: '10px', fontWeight: 600 }}
            >
              {tick}%
            </text>
          </g>
        );
      })}

      {/* X labels */}
      {data.labels.map((label, i) => (
        <text
          key={label}
          x={toX(i)}
          y={height - 12}
          textAnchor="middle"
          fill="#94a3b8"
          style={{ fontSize: '10px', fontWeight: 600 }}
        >
          {label}
        </text>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#fakeRateGrad)" />

      {/* Line */}
      <path d={lineD} fill="none" stroke="#ba1a1a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {data.rates.map((v, i) => (
        <circle
          key={i}
          cx={toX(i)}
          cy={toY(v)}
          r={4}
          fill="#ba1a1a"
          stroke="white"
          strokeWidth={2}
        />
      ))}

      {/* Value labels on dots */}
      {data.rates.map((v, i) => (
        <text
          key={`vl${i}`}
          x={toX(i)}
          y={toY(v) - 10}
          textAnchor="middle"
          fill="#ba1a1a"
          style={{ fontSize: '9px', fontWeight: 700 }}
        >
          {v.toFixed(1)}%
        </text>
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────
   3. LATENCY BARS
   ────────────────────────────────────────────── */
function LatencyBars() {
  return (
    <div className="space-y-5">
      {latencyData.map((item) => {
        const pct = (item.value / item.max) * 100;
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-slate-700">{item.label}</span>
              <span className="text-[12px] font-black" style={{ color: item.color }}>
                {item.value}ms
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 8px ${item.color}40`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
   4. TOP API KEYS — HORIZONTAL BAR CHART
   ────────────────────────────────────────────── */
function ApiKeyUsageChart() {
  const maxRequests = Math.max(...apiKeyUsageData.map((d) => d.requests));

  return (
    <div className="space-y-4">
      {apiKeyUsageData.map((item, idx) => {
        const pct = (item.requests / maxRequests) * 100;
        return (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white"
                  style={{ backgroundColor: item.color }}
                >
                  #{idx + 1}
                </span>
                <div>
                  <p className="text-[12px] font-bold text-slate-800">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{item.key}</p>
                </div>
              </div>
              <span className="text-[12px] font-black text-slate-700">
                {item.requests.toLocaleString()} <span className="text-slate-400 font-medium">requests</span>
              </span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 * idx }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}30`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
   ANALYTICS PAGE
   ────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  const daysMap: Record<TimeRange, number> = { '24h': 1, '7d': 7, '30d': 30, 'custom': 30 };

  useEffect(() => {
    const days = daysMap[timeRange];
    analyticsOverview(days).then(setOverview).catch(() => {});
    analyticsUsage().then(setUsage).catch(() => {});
  }, [timeRange]);

  const rangeOptions: { key: TimeRange; label: string }[] = [
    { key: '24h', label: '24h' },
    { key: '7d', label: '7d' },
    { key: '30d', label: '30d' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ── Page Header ── */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Thống kê & biểu đồ chi tiết — VietBank Workspace</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:shadow-md transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
      </motion.div>

      {/* ══════════════════════════════════════
          TIME RANGE SELECTOR
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        {rangeOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setTimeRange(opt.key)}
            className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${
              timeRange === opt.key
                ? 'bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════
          REQUEST VOLUME — AREA CHART
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 shadow-md border border-white/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-black text-slate-900">Request volume</h2>
            <p className="text-xs text-slate-400 mt-0.5">Tổng requests và deepfake phát hiện theo thời gian</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-[3px] bg-[#0050cb] rounded-full" />
              <span className="text-[11px] font-semibold text-slate-500">Tổng requests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-[3px] bg-[#ba1a1a] rounded-full" />
              <span className="text-[11px] font-semibold text-slate-500">Fake detected</span>
            </div>
          </div>
        </div>
        <RequestVolumeChart />
      </motion.div>

      {/* ══════════════════════════════════════
          TWO-COLUMN SECTION
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── LEFT: Fake Rate Chart ── */}
        <div className="glass-panel rounded-2xl p-6 shadow-md border border-white/60">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 bg-[#ba1a1a] rounded-full" />
            <h2 className="text-base font-black text-slate-900">Tỷ lệ phát hiện fake</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">Phần trăm request bị phát hiện deepfake theo ngày</p>
          <FakeRateChart />
        </div>

        {/* ── RIGHT: Latency ── */}
        <div className="glass-panel rounded-2xl p-6 shadow-md border border-white/60">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" />
            <h2 className="text-base font-black text-slate-900">Độ trễ (Latency)</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">Phân phối độ trễ API response</p>

          {/* Latency summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Avg', value: overview?.avg_latency_ms ?? latencyData[0].value, color: '#2e7d32' },
              { label: 'P95', value: overview?.p95_latency_ms ?? latencyData[1].value, color: '#ed6c02' },
              { label: 'Total', value: overview?.total_requests ?? 0, color: '#0050cb' },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-3 rounded-xl border"
                style={{
                  backgroundColor: `${item.color}08`,
                  borderColor: `${item.color}20`,
                }}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-xl font-black" style={{ color: item.color }}>
                  {item.label === 'Total' ? item.value.toLocaleString() : <>{item.value}<span className="text-[11px] font-semibold text-slate-400">ms</span></>}
                </p>
              </div>
            ))}
          </div>

          <LatencyBars />
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          TOP API KEYS — HORIZONTAL BAR
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 shadow-md border border-white/60">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" />
            <h2 className="text-base font-black text-slate-900">Top API keys theo usage</h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Tổng: {apiKeyUsageData.reduce((s, d) => s + d.requests, 0).toLocaleString()} requests
          </span>
        </div>
        <ApiKeyUsageChart />
      </motion.div>
    </motion.div>
  );
}
