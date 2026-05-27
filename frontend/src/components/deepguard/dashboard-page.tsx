'use client';

import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { motion } from 'framer-motion';
import { analyticsOverview, analyticsUsage, detectionsList, type AnalyticsOverview, type UsageInfo, type DetectionListItem } from '@/lib/api';

/* ──────────────────────────────────────────────
   MOCK DATA
   ────────────────────────────────────────────── */
const kpiCards = [
  {
    title: 'Tổng requests',
    value: '12,847',
    trend: '↑12% vs tuần trước',
    trendColor: '#2e7d32',
    icon: 'api',
    iconBg: '#0050cb',
  },
  {
    title: 'Deepfake detected',
    value: '342',
    trend: '2.7%',
    trendColor: '#ba1a1a',
    icon: 'warning',
    iconBg: '#ba1a1a',
  },
  {
    title: 'Avg latency',
    value: '142ms',
    trend: 'P95: 187ms',
    trendColor: '#64748b',
    icon: 'speed',
    iconBg: '#0050cb',
  },
  {
    title: 'Quota remaining',
    value: '7,153 / 10,000',
    trend: '',
    trendColor: '',
    icon: 'database',
    iconBg: '#0050cb',
    progress: 71.5,
  },
];

const chartData = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  total: [1680, 1920, 1750, 2100, 1980, 1540, 1877],
  fake: [42, 58, 45, 72, 51, 33, 41],
};

const recentDetections = [
  { id: 'req_a8f2c1', time: '2 phút trước', verdict: 'FAKE', confidence: 94.12, media: 'face_swap_01.jpg' },
  { id: 'req_b3d7e4', time: '5 phút trước', verdict: 'REAL', confidence: 97.84, media: 'selfie_kyc.png' },
  { id: 'req_c5f9a6', time: '12 phút trước', verdict: 'FAKE', confidence: 88.56, media: 'gan_generated.mp4' },
  { id: 'req_d1h2j8', time: '18 phút trước', verdict: 'UNCERTAIN', confidence: 62.30, media: 'id_card_front.jpg' },
  { id: 'req_e4k7m3', time: '25 phút trước', verdict: 'REAL', confidence: 99.01, media: 'portrait_vn.jpg' },
];

const quickActions = [
  {
    title: 'Test API ngay',
    description: 'Thử nghiệm Detection API trực tiếp',
    icon: 'terminal',
    page: 'playground' as const,
    color: '#0050cb',
  },
  {
    title: 'Xem Analytics',
    description: 'Thống kê & biểu đồ chi tiết',
    icon: 'analytics',
    page: 'analytics' as const,
    color: '#2e7d32',
  },
  {
    title: 'Quản lý API Keys',
    description: 'Tạo & thu hồi API keys',
    icon: 'key',
    page: 'apikeys' as const,
    color: '#ed6c02',
  },
];

/* ──────────────────────────────────────────────
   VERDICT BADGE
   ────────────────────────────────────────────── */
function VerdictBadge({ verdict }: { verdict: string }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    FAKE: { bg: 'bg-red-50', text: 'text-[#ba1a1a]', border: 'border-red-200' },
    REAL: { bg: 'bg-green-50', text: 'text-[#2e7d32]', border: 'border-green-200' },
    UNCERTAIN: { bg: 'bg-orange-50', text: 'text-[#ed6c02]', border: 'border-orange-200' },
  };
  const s = styles[verdict] ?? styles.UNCERTAIN;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
      {verdict}
    </span>
  );
}

/* ──────────────────────────────────────────────
   SVG LINE CHART
   ────────────────────────────────────────────── */
function RequestChart() {
  const width = 700;
  const height = 280;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxTotal = Math.max(...chartData.total);
  const yMax = Math.ceil(maxTotal / 500) * 500;

  const xStep = chartW / (chartData.days.length - 1);

  const toX = (i: number) => padding.left + i * xStep;
  const toYTotal = (v: number) => padding.top + chartH - (v / yMax) * chartH;
  const toYFake = (v: number) => {
    const fakeMax = Math.ceil(Math.max(...chartData.fake) / 20) * 20;
    return padding.top + chartH - (v / fakeMax) * chartH;
  };

  const totalPoints = chartData.total.map((v, i) => `${toX(i)},${toYTotal(v)}`).join(' ');
  const fakePoints = chartData.fake.map((v, i) => `${toX(i)},${toYFake(v)}`).join(' ');

  // Area fills
  const totalArea = chartData.total
    .map((v, i) => `${toX(i)},${toYTotal(v)}`)
    .join(' ');
  const totalAreaPath = `M${padding.left},${padding.top + chartH} L${totalArea} L${toX(chartData.total.length - 1)},${padding.top + chartH} Z`;

  const fakeArea = chartData.fake
    .map((v, i) => `${toX(i)},${toYFake(v)}`)
    .join(' ');
  const fakeAreaPath = `M${padding.left},${padding.top + chartH} L${fakeArea} L${toX(chartData.fake.length - 1)},${padding.top + chartH} Z`;

  // Grid lines
  const gridLines = 5;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => Math.round((yMax / gridLines) * i));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={padding.left}
            y1={toYTotal(tick)}
            x2={width - padding.right}
            y2={toYTotal(tick)}
            stroke="#e2e8f0"
            strokeWidth={1}
            strokeDasharray={tick === 0 ? '0' : '4 4'}
          />
          <text
            x={padding.left - 10}
            y={toYTotal(tick) + 4}
            textAnchor="end"
            className="text-[10px] fill-slate-400"
            style={{ fontSize: '10px' }}
          >
            {tick.toLocaleString()}
          </text>
        </g>
      ))}

      {/* X axis labels */}
      {chartData.days.map((day, i) => (
        <text
          key={day}
          x={toX(i)}
          y={height - 10}
          textAnchor="middle"
          className="fill-slate-400"
          style={{ fontSize: '11px', fontWeight: 600 }}
        >
          {day}
        </text>
      ))}

      {/* Area fills */}
      <path d={totalAreaPath} fill="url(#blueGradient)" opacity={0.15} />
      <path d={fakeAreaPath} fill="url(#redGradient)" opacity={0.1} />

      {/* Total line */}
      <polyline
        points={totalPoints}
        fill="none"
        stroke="#0050cb"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Fake line */}
      <polyline
        points={fakePoints}
        fill="none"
        stroke="#ba1a1a"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Total dots */}
      {chartData.total.map((v, i) => (
        <circle key={`t${i}`} cx={toX(i)} cy={toYTotal(v)} r={4} fill="#0050cb" stroke="white" strokeWidth={2} />
      ))}

      {/* Fake dots */}
      {chartData.fake.map((v, i) => (
        <circle key={`f${i}`} cx={toX(i)} cy={toYFake(v)} r={4} fill="#ba1a1a" stroke="white" strokeWidth={2} />
      ))}

      {/* Gradients */}
      <defs>
        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0050cb" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#0050cb" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ba1a1a" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#ba1a1a" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ──────────────────────────────────────────────
   DASHBOARD PAGE
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

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

export default function DashboardPage() {
  const navigate = useNavigation((s) => s.navigate);
  const setSelectedRequestId = useNavigation((s) => s.setSelectedRequestId);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [recent, setRecent] = useState<DetectionListItem[]>([]);

  useEffect(() => {
    analyticsOverview(7).then(setOverview).catch(() => {});
    analyticsUsage().then(setUsage).catch(() => {});
    detectionsList({ limit: 5 }).then((r) => setRecent(r.items)).catch(() => {});
  }, []);

  const kpiCards = [
    {
      title: 'Tổng requests',
      value: overview ? overview.total_requests.toLocaleString() : '—',
      trend: overview ? `Fake rate: ${overview.fake_rate.toFixed(1)}%` : '',
      trendColor: '#2e7d32',
      icon: 'api',
      iconBg: '#0050cb',
    },
    {
      title: 'Deepfake detected',
      value: overview ? overview.fake_detected.toLocaleString() : '—',
      trend: overview ? `${overview.fake_rate.toFixed(1)}%` : '',
      trendColor: '#ba1a1a',
      icon: 'warning',
      iconBg: '#ba1a1a',
    },
    {
      title: 'Avg latency',
      value: overview ? `${overview.avg_latency_ms}ms` : '—',
      trend: overview ? `P95: ${overview.p95_latency_ms}ms` : '',
      trendColor: '#64748b',
      icon: 'speed',
      iconBg: '#0050cb',
    },
    {
      title: 'Quota remaining',
      value: usage ? `${usage.remaining.toLocaleString()} / ${usage.monthly_quota.toLocaleString()}` : '—',
      trend: '',
      trendColor: '',
      icon: 'database',
      iconBg: '#0050cb',
      progress: usage ? usage.usage_percent : undefined,
    },
  ];

  const handleRowClick = (id: string) => {
    setSelectedRequestId(id);
    navigate('detail');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ── Page Header ── */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Tổng quan hệ thống DeepGuard — VietBank Workspace</p>
      </motion.div>

      {/* ══════════════════════════════════════
          1. KPI CARDS
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="glass-panel rounded-2xl p-5 shadow-md border border-white/60 hover:shadow-lg hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${card.iconBg}10` }}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ color: card.iconBg }}>{card.icon}</span>
              </div>
              {card.title === 'Deepfake detected' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#ba1a1a] bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#ba1a1a] rounded-full animate-pulse" />
                  Alert
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
            <p className="text-2xl font-black tracking-tight text-slate-900">{card.value}</p>
            {card.trend && (
              <p className="text-[11px] font-semibold mt-2" style={{ color: card.trendColor }}>
                {card.trend}
              </p>
            )}
            {card.progress !== undefined && (
              <div className="mt-3">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0050cb] rounded-full transition-all duration-1000"
                    style={{ width: `${card.progress}%`, boxShadow: '0 0 10px rgba(0, 80, 203, 0.3)' }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{card.progress}% đã sử dụng</p>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════
          2. LINE CHART
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 shadow-md border border-white/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-black text-slate-900">Request volume 7 ngày</h2>
            <p className="text-xs text-slate-400 mt-0.5">So sánh tổng requests và deepfake phát hiện</p>
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
        <RequestChart />
      </motion.div>

      {/* ══════════════════════════════════════
          3. BOTTOM SECTION — 2 COLUMNS
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── LEFT: Recent Detections ── */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-6 shadow-md border border-white/60">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" />
              <h2 className="text-base font-black text-slate-900">Phát hiện gần đây</h2>
            </div>
            <button
              onClick={() => navigate('history')}
              className="text-[11px] font-bold text-[#0050cb] hover:underline flex items-center gap-1"
            >
              Xem tất cả
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <div className="col-span-2">Thời gian</div>
            <div className="col-span-4">Media</div>
            <div className="col-span-3">Verdict</div>
            <div className="col-span-3 text-right">Confidence</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-slate-50">
            {recent.length === 0 && (
              <div className="px-4 py-6 text-center text-[12px] text-slate-400">Chưa có dữ liệu</div>
            )}
            {recent.map((det) => (
              <div
                key={det.request_id}
                onClick={() => handleRowClick(det.request_id)}
                className="data-table-row grid grid-cols-12 gap-3 px-4 py-3 items-center rounded-lg"
              >
                <div className="col-span-2 text-[11px] text-slate-500 font-medium">{formatTimeAgo(det.created_at)}</div>
                <div className="col-span-4 text-[12px] text-slate-700 font-semibold truncate font-mono">{det.image_hash.slice(0, 12)}…</div>
                <div className="col-span-3">
                  <VerdictBadge verdict={det.verdict} />
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-[12px] font-black text-slate-800">{det.confidence.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Quick Actions ── */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-md border border-white/60">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" />
            <h2 className="text-base font-black text-slate-900">Thao tác nhanh</h2>
          </div>

          <div className="space-y-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.page)}
                className="w-full group glass-panel rounded-xl p-4 border border-white/60 hover:shadow-md transition-all text-left flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${action.color}10` }}
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ color: action.color }}>
                    {action.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-black text-slate-800">{action.title}</p>
                    <span className="material-symbols-outlined text-[14px] text-slate-400 group-hover:text-[#0050cb] group-hover:translate-x-1 transition-all">
                      arrow_forward
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{action.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* System Status */}
          <div className="mt-6 p-4 bg-green-50/60 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-[#2e7d32] rounded-full animate-pulse" />
              <span className="text-[11px] font-black text-[#2e7d32] uppercase tracking-wider">System Healthy</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 font-medium">API Uptime</span>
                <span className="font-bold text-[#2e7d32]">99.97%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 font-medium">Model Version</span>
                <span className="font-bold text-slate-700">v2.1.3</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 font-medium">Last Deploy</span>
                <span className="font-bold text-slate-700">3 giờ trước</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
