'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Icon, Sparkline, StatPill, AnimatedNumber } from '@/components/deepguard/shared';
import { DG, fmtInt } from '@/lib/dg';
import { useAuthStore } from '@/store/auth';

/* ──────────────────────────────────────────────
   DeepGuard — Billing & Usage
   ────────────────────────────────────────────── */

/* TODO: backend — no billing endpoint yet. PLANS / INVOICES / BILLING_USAGE /
   PER_KEY_USAGE ported inline from the frontend-claude prototype (data-saas.jsx).
   Current plan + quota are read from useAuthStore().tenant when available. */

interface Plan {
  name: string;
  price: number | null;
  unit: string;
  quota: string;
  rpm: number;
  features: string[];
  current: boolean;
}

const PLANS: Plan[] = [
  { name: 'Starter', price: 0, unit: 'miễn phí', quota: '1K req/tháng', rpm: 60, features: ['1 API key', 'Image detection', 'Community support'], current: false },
  { name: 'Pro', price: 4_900_000, unit: '₫/tháng', quota: '50K req/tháng', rpm: 200, features: ['10 API keys', 'Image + Video + Liveness', 'Webhooks', 'Email support'], current: false },
  { name: 'Enterprise', price: null, unit: 'liên hệ', quota: 'Không giới hạn', rpm: 1000, features: ['Unlimited keys', 'SSO/SAML', 'SLA 99.99%', 'Dedicated support', 'On-prem option'], current: true },
];

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid';
  period: string;
  method: string;
}

const INVOICES: Invoice[] = [
  { id: 'INV-2026-005', date: '01/05/2026', amount: 24_800_000, status: 'paid', period: 'Tháng 5/2026', method: 'Visa ••4242' },
  { id: 'INV-2026-004', date: '01/04/2026', amount: 23_100_000, status: 'paid', period: 'Tháng 4/2026', method: 'Visa ••4242' },
  { id: 'INV-2026-003', date: '01/03/2026', amount: 22_400_000, status: 'paid', period: 'Tháng 3/2026', method: 'Visa ••4242' },
  { id: 'INV-2026-002', date: '01/02/2026', amount: 21_900_000, status: 'paid', period: 'Tháng 2/2026', method: 'Bank transfer' },
  { id: 'INV-2026-001', date: '01/01/2026', amount: 20_500_000, status: 'paid', period: 'Tháng 1/2026', method: 'Bank transfer' },
];

interface BillingUsage {
  used: number;
  included: number;
  overage: number;
  rate: number;
  cycle: string;
  trend: number[];
}

const BILLING_USAGE: BillingUsage = {
  used: 59_367,
  included: 100_000,
  overage: 0,
  rate: 280,
  cycle: 'Còn 12 ngày',
  trend: [38_000, 44_000, 51_000, 56_000, 59_367],
};

interface KeyUsage {
  name: string;
  req: number;
  fake: number;
  share: number;
}

const PER_KEY_USAGE: KeyUsage[] = [
  { name: 'Production Web', req: 6240, fake: 142, share: 48.6 },
  { name: 'Mobile App', req: 4180, fake: 121, share: 32.5 },
  { name: 'Sandbox', req: 1620, fake: 64, share: 12.6 },
  { name: 'KYC Batch', req: 807, fake: 15, share: 6.3 },
];

const KEY_COLORS = [DG.primary, '#7c3aed', DG.real, DG.uncertain];

/* ── helpers ── */
function fmtVND(n: number | null): string {
  return n == null ? '—' : n.toLocaleString('vi-VN') + '₫';
}

function quotaColor(pct: number): string {
  if (pct >= 90) return DG.fake;
  if (pct >= 75) return DG.uncertain;
  return DG.real;
}

/* ── local Modal (no Modal in shared) ── */
function Modal({ onClose, children, max = 'max-w-lg' }: { onClose: () => void; children: ReactNode; max?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dg-fade" onClick={onClose} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`glass-panel rounded-2xl shadow-2xl border border-white/80 w-full ${max} relative z-10 overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );
}

export default function BillingPage() {
  const tenant = useAuthStore((s) => s.tenant);
  const [showPlans, setShowPlans] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(id);
  }, []);

  /* current plan: prefer tenant.plan from auth store, fall back to prototype */
  const current = useMemo(() => {
    if (tenant?.plan) {
      const match = PLANS.find((p) => p.name.toLowerCase() === tenant.plan.toLowerCase());
      if (match) return match;
    }
    return PLANS.find((p) => p.current) ?? PLANS[PLANS.length - 1];
  }, [tenant]);

  /* usage: prefer live tenant quota/usage, fall back to prototype mock */
  const u = useMemo<BillingUsage>(() => {
    if (tenant && tenant.monthly_quota > 0) {
      return {
        ...BILLING_USAGE,
        used: tenant.current_usage,
        included: tenant.monthly_quota,
        overage: Math.max(0, tenant.current_usage - tenant.monthly_quota),
      };
    }
    return BILLING_USAGE;
  }, [tenant]);

  const pct = Math.min(100, Math.round((u.used / u.included) * 100));
  const projected = Math.round(u.used / 0.6); // simple end-of-cycle projection
  const projectedCost = u.overage * u.rate;
  const remaining = Math.max(0, u.included - u.used);

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 dg-rise">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Billing &amp; Usage</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gói cước, mức sử dụng &amp; hoá đơn — {tenant?.name ?? 'VietBank Workspace'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 h-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Icon name="download" className="text-[18px]" /> Tải hoá đơn
          </button>
          <button
            onClick={() => setShowPlans(true)}
            className="px-4 h-9 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
          >
            <Icon name="upgrade" className="text-[16px]" /> Đổi gói
          </button>
        </div>
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 dg-rise">
        <StatPill icon="data_usage" label="Đã dùng kỳ này" value={fmtInt(u.used)} color={DG.primary} />
        <StatPill icon="speed" label="Còn lại" value={fmtInt(remaining)} color={DG.real} />
        <StatPill icon="trending_up" label="RPM" value={fmtInt(current.rpm)} color="#7c3aed" />
        <StatPill icon="payments" label="Phí phụ trội" value={fmtVND(projectedCost)} color={u.overage > 0 ? DG.uncertain : DG.real} />
      </div>

      {/* current plan + usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* plan card */}
        <div
          className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gói hiện tại</span>
            <span className="text-[9px] font-black text-dgblue bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">ACTIVE</span>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{current.name}</p>
          <p className="text-sm text-slate-500 mt-1">{current.quota} · {current.rpm} RPM</p>
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            {current.features.slice(0, 4).map((f) => (
              <div key={f} className="flex items-center gap-2 text-[12px] text-slate-600">
                <Icon name="check_circle" className="text-[15px] text-dgreal" fill />{f}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowPlans(true)}
            className="w-full mt-5 py-2.5 bg-dgblue/5 text-dgblue rounded-xl font-bold text-xs hover:bg-dgblue/10 transition-colors"
          >
            So sánh các gói
          </button>
        </div>

        {/* usage meter */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-900">Mức sử dụng chu kỳ này</h2>
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Icon name="schedule" className="text-[14px]" />{u.cycle}
            </span>
          </div>
          {loading ? (
            <div className="skeleton h-24 w-full rounded-xl" />
          ) : (
            <>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="text-3xl font-black text-slate-900 tabular-nums">
                    <AnimatedNumber value={u.used} />
                  </span>
                  <span className="text-sm text-slate-400 font-bold"> / {fmtInt(u.included)} req</span>
                </div>
                <span className="text-sm font-black tabular-nums" style={{ color: quotaColor(pct) }}>{pct}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${pct}%`, background: quotaColor(pct), boxShadow: `0 0 10px ${quotaColor(pct)}40` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-5">
                <span>Dự kiến cuối kỳ: ~{fmtInt(projected)}</span>
                <span>Phụ trội: {fmtInt(u.overage)} req</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {([
                  ['Đã dùng', fmtInt(u.used), DG.primary],
                  ['Còn lại', fmtInt(remaining), DG.real],
                  ['Phí phụ trội', `${fmtInt(u.overage)} req`, DG.uncertain],
                ] as const).map(([l, v, c]) => (
                  <div key={l} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase">{l}</p>
                    <p className="text-sm font-black tabular-nums" style={{ color: c }}>{v}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* cost projection + payment method + next bill */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 dg-rise">
        {/* cost projection */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Dự phóng chi phí</h3>
            <Sparkline data={u.trend} color={DG.primary} w={84} h={28} />
          </div>
          <p className="text-2xl font-black text-slate-900 tabular-nums">{fmtVND(projectedCost)}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {u.overage > 0 ? `${fmtInt(u.overage)} req × ${fmtVND(u.rate)}/req` : 'Trong hạn mức · không phụ trội'}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: quotaColor(pct) }}>
            <Icon name="insights" className="text-[15px]" />Dự kiến ~{fmtInt(projected)} req cuối kỳ
          </div>
        </div>

        {/* payment method */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Phương thức thanh toán</h3>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-12 h-8 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <Icon name="credit_card" className="text-[18px] text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-800">Visa •••• 4242</p>
              <p className="text-[11px] text-slate-400">Hết hạn 08/2027 · Mặc định</p>
            </div>
            <button className="px-3 py-1.5 text-[11px] font-bold text-dgblue bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
              Thay đổi
            </button>
          </div>
        </div>

        {/* next bill */}
        <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Hoá đơn kế tiếp</h3>
          <p className="text-2xl font-black text-slate-900 tabular-nums">{fmtVND(24_800_000)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Xuất ngày 01/06/2026</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-dgreal">
            <Icon name="event_available" className="text-[15px]" />Tự động gia hạn
          </div>
        </div>
      </div>

      {/* usage breakdown by API key */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-slate-900">Mức sử dụng theo API key</h2>
          <span className="text-[11px] font-bold text-slate-400">{PER_KEY_USAGE.length} keys</span>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-9 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {PER_KEY_USAGE.map((k, i) => {
              const color = KEY_COLORS[i % KEY_COLORS.length];
              return (
                <div key={k.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-[12px] font-bold text-slate-700 truncate">{k.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-slate-400 font-medium tabular-nums hidden sm:inline">{fmtInt(k.fake)} FAKE</span>
                      <span className="text-[12px] font-black text-slate-800 tabular-nums">{fmtInt(k.req)} req</span>
                      <span className="text-[11px] font-black tabular-nums w-12 text-right" style={{ color }}>{k.share}%</span>
                    </div>
                  </div>
                  <div className="score-bar h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${k.share}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* invoices */}
      <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-rise">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Lịch sử hoá đơn</h2>
          <span className="text-[11px] font-bold text-slate-400">{INVOICES.length} hoá đơn</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[640px]">
              <thead className="bg-white/60 border-b border-slate-100">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                  <th className="px-6 py-3">Mã hoá đơn</th>
                  <th className="px-4 py-3">Kỳ</th>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Phương thức</th>
                  <th className="px-4 py-3 text-right">Số tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-[12px] font-mono font-bold text-slate-700">{inv.id}</td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-600">{inv.period}</td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-500">{inv.date}</td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-500">{inv.method}</td>
                    <td className="px-4 py-3.5 text-right text-[12px] font-black text-slate-800 tabular-nums">{fmtVND(inv.amount)}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-green-50 text-dgreal border border-green-200">
                        <Icon name="check" className="text-[12px]" />Đã thanh toán
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-dgblue transition-colors ml-auto"
                        title={`Tải ${inv.id}.pdf`}
                        aria-label={`Tải hoá đơn ${inv.id}`}
                      >
                        <Icon name="download" className="text-[17px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* plan compare modal */}
      {showPlans && (
        <Modal onClose={() => setShowPlans(false)} max="max-w-3xl">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">So sánh gói cước</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Nâng cấp bất kỳ lúc nào, tính phí theo tỉ lệ</p>
            </div>
            <button
              onClick={() => setShowPlans(false)}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              aria-label="Đóng"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((p) => {
              const isCurrent = p.name === current.name;
              return (
                <div
                  key={p.name}
                  className={`rounded-2xl p-5 border-2 transition-all ${isCurrent ? 'border-dgblue bg-dgblue/[0.03]' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-lg font-black text-slate-900">{p.name}</p>
                    {isCurrent && <span className="text-[9px] font-black text-dgblue bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">HIỆN TẠI</span>}
                  </div>
                  <p className="text-2xl font-black text-slate-900 tabular-nums">
                    {p.price == null ? 'Liên hệ' : p.price === 0 ? 'Free' : fmtVND(p.price)}
                    <span className="text-[11px] text-slate-400 font-bold"> {p.price ? '/tháng' : ''}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 mb-3">{p.quota}</p>
                  <div className="space-y-2 mb-4">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-[11px] text-slate-600">
                        <Icon name="check" className="text-[14px] text-dgreal mt-0.5 shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                  <button
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-dgblue text-white shadow-lg shadow-dgblue/25 hover:scale-[1.02]'}`}
                  >
                    {isCurrent ? 'Đang dùng' : p.price == null ? 'Liên hệ sales' : 'Chọn gói'}
                  </button>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}
