'use client';

import { useState, useMemo, Fragment, type ReactNode } from 'react';
import { Icon, StatPill, Sparkline, Donut } from '@/components/deepguard/shared';
import { DG, fmtInt } from '@/lib/dg';

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */
type Plan = 'Starter' | 'Pro' | 'Enterprise';
type TenantStatus = 'active' | 'suspended';
type KeyStatus = 'active' | 'rotating' | 'revoked';

interface TenantApiKey {
  name: string;
  prefix: string;
  status: KeyStatus;
}
interface TenantUser {
  name: string;
  email: string;
  role: string;
}
interface Tenant {
  id: string;
  name: string;
  plan: Plan;
  quotaUsed: number;
  quotaLimit: number;
  users: number;
  status: TenantStatus;
  created: string;
  region: string;
  fakeRate: number;
  trend: number[];
  reqMonth: number;
  apiKeys: TenantApiKey[];
  userList: TenantUser[];
}

/* ──────────────────────────────────────────────
   MOCK DATA
   TODO: wire to backend when tenant endpoints exist.
   There is currently NO backend route for tenants, so this
   page operates entirely on local in-memory state.
   ────────────────────────────────────────────── */
const TENANTS: Tenant[] = [
  {
    id: '1', name: 'VietBank', plan: 'Enterprise', quotaUsed: 8470, quotaLimit: 10000, users: 5,
    status: 'active', created: '01/01/2025', region: 'Hà Nội', fakeRate: 2.7,
    trend: [620, 710, 680, 790, 845, 910, 870], reqMonth: 8470,
    apiKeys: [
      { name: 'Production', prefix: 'dg_live_…8af3', status: 'active' },
      { name: 'Staging', prefix: 'dg_test_…b12a', status: 'active' },
      { name: 'Testing', prefix: 'dg_test_…d4e7', status: 'rotating' },
    ],
    userList: [
      { name: 'Nguyễn Văn A', email: 'nguyenvana@vietbank.vn', role: 'Admin' },
      { name: 'Trần Thị B', email: 'tranthib@vietbank.vn', role: 'Developer' },
      { name: 'Lê Văn C', email: 'levanc@vietbank.vn', role: 'Viewer' },
    ],
  },
  {
    id: '2', name: 'TechcomFinance', plan: 'Pro', quotaUsed: 6120, quotaLimit: 8000, users: 4,
    status: 'active', created: '15/02/2025', region: 'TP.HCM', fakeRate: 3.4,
    trend: [410, 480, 520, 600, 580, 640, 612], reqMonth: 6120,
    apiKeys: [
      { name: 'Main', prefix: 'dg_live_…1a2b', status: 'active' },
      { name: 'Backup', prefix: 'dg_live_…3c4d', status: 'active' },
    ],
    userList: [
      { name: 'Phạm Minh D', email: 'phamminhd@tcf.vn', role: 'Admin' },
      { name: 'Hoàng Thị E', email: 'hoangthie@tcf.vn', role: 'Developer' },
    ],
  },
  {
    id: '3', name: 'MoMo Wallet', plan: 'Enterprise', quotaUsed: 19240, quotaLimit: 20000, users: 8,
    status: 'active', created: '20/12/2024', region: 'TP.HCM', fakeRate: 4.1,
    trend: [2100, 2400, 2650, 2800, 2750, 2900, 2840], reqMonth: 19240,
    apiKeys: [
      { name: 'Production', prefix: 'dg_live_…9z0x', status: 'active' },
      { name: 'KYC Batch', prefix: 'dg_live_…7y2k', status: 'active' },
    ],
    userList: [
      { name: 'Đỗ Văn F', email: 'dovanf@momo.vn', role: 'Admin' },
      { name: 'Vũ Thị G', email: 'vuthig@momo.vn', role: 'Developer' },
    ],
  },
  {
    id: '4', name: 'Sacombank', plan: 'Pro', quotaUsed: 7650, quotaLimit: 8000, users: 3,
    status: 'active', created: '08/03/2025', region: 'Đà Nẵng', fakeRate: 2.2,
    trend: [820, 910, 980, 1040, 1010, 1090, 1065], reqMonth: 7650,
    apiKeys: [{ name: 'Production', prefix: 'dg_live_…5m6n', status: 'active' }],
    userList: [{ name: 'Bùi Văn H', email: 'buivanh@sacombank.vn', role: 'Admin' }],
  },
  {
    id: '5', name: 'ZaloPay Test', plan: 'Starter', quotaUsed: 92, quotaLimit: 100, users: 2,
    status: 'suspended', created: '10/04/2025', region: 'TP.HCM', fakeRate: 1.1,
    trend: [12, 18, 9, 22, 14, 8, 9], reqMonth: 92,
    apiKeys: [{ name: 'Default', prefix: 'dg_test_…q1w2', status: 'revoked' }],
    userList: [{ name: 'Ngô Thị I', email: 'ngothii@zalopay.vn', role: 'Admin' }],
  },
  {
    id: '6', name: 'VNPay', plan: 'Starter', quotaUsed: 41, quotaLimit: 100, users: 1,
    status: 'active', created: '22/04/2025', region: 'Hà Nội', fakeRate: 0,
    trend: [4, 6, 3, 8, 5, 7, 8], reqMonth: 41,
    apiKeys: [{ name: 'Sandbox', prefix: 'dg_test_…e3r4', status: 'active' }],
    userList: [{ name: 'Lý Văn K', email: 'lyvank@vnpay.vn', role: 'Admin' }],
  },
];

/* ──────────────────────────────────────────────
   HELPERS / STYLE MAPS
   ────────────────────────────────────────────── */
const PLAN_STYLE: Record<Plan, { color: string; bg: string; border: string }> = {
  Starter: { color: '#ed6c02', bg: '#fff7ed', border: '#fed7aa' },
  Pro: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  Enterprise: { color: DG.primary, bg: '#eff6ff', border: '#bfdbfe' },
};
function quotaColor(p: number): string {
  return p >= 90 ? DG.fake : p >= 70 ? DG.uncertain : DG.real;
}
function quotaPct(t: Tenant): number {
  if (t.quotaLimit === 0) return 0;
  return Math.round((t.quotaUsed / t.quotaLimit) * 100);
}

const KEY_STATUS_STYLE: Record<KeyStatus, string> = {
  active: 'bg-emerald-50 text-emerald-600',
  rotating: 'bg-amber-50 text-amber-600',
  revoked: 'bg-red-50 text-red-600',
};

const PLANS: Plan[] = ['Starter', 'Pro', 'Enterprise'];
const REGIONS = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

/* ──────────────────────────────────────────────
   SMALL PRESENTATIONAL PIECES
   ────────────────────────────────────────────── */
function PlanBadge({ plan }: { plan: Plan }) {
  const s = PLAN_STYLE[plan] ?? PLAN_STYLE.Starter;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      {plan}
    </span>
  );
}

function StatusBadge({ status }: { status: TenantStatus }) {
  return status === 'active' ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border bg-green-50 text-dgreal border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-dgreal animate-pulse" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border bg-red-50 text-dgfake border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-dgfake" />
      Suspended
    </span>
  );
}

function StateBlock({
  icon,
  title,
  desc,
  action,
  onAction,
}: {
  icon: string;
  title: string;
  desc: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="glass-panel rounded-2xl p-12 shadow-sm border border-white/60 text-center dg-fade">
      <div className="w-20 h-20 rounded-2xl bg-dgblue/5 flex items-center justify-center mx-auto mb-5">
        <Icon name={icon} className="text-[40px] text-dgblue/30" />
      </div>
      <h3 className="text-lg font-black text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">{desc}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/20 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all inline-flex items-center gap-2"
        >
          <Icon name="add" className="text-[16px]" />
          {action}
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  req,
  hint,
  children,
}: {
  label: string;
  req?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12.5px] font-semibold text-slate-700">
          {label}
          {req && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Modal({
  children,
  onClose,
  max = 'max-w-md',
}: {
  children: ReactNode;
  onClose: () => void;
  max?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center p-4 dg-fade"
      onClick={onClose}
      style={{ background: 'rgba(6,15,35,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full ${max} relative z-10 overflow-hidden rounded-2xl`}
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.24),0 0 0 1px rgba(0,0,0,0.05)' }}
      >
        <div style={{ height: 3, background: `linear-gradient(90deg,${DG.primary} 0%,#60a5fa 100%)` }} />
        {children}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   EXPANDABLE TABLE DETAIL
   ────────────────────────────────────────────── */
function TenantDetail({ tenant }: { tenant: Tenant }) {
  const pct = quotaPct(tenant);
  return (
    <div className="px-6 py-5 bg-slate-50/60 border-t border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Keys */}
        <div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Icon name="key" className="text-[14px]" /> API Keys ({tenant.apiKeys.length})
          </h4>
          <div className="space-y-2">
            {tenant.apiKeys.map((k) => (
              <div key={k.prefix} className="flex items-center gap-2 px-3 py-2 bg-white/70 rounded-lg border border-slate-100">
                <span className="text-[12px] font-semibold text-slate-700">{k.name}</span>
                <code className="text-[10px] font-mono text-slate-400 ml-auto">{k.prefix}</code>
                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${KEY_STATUS_STYLE[k.status]}`}>
                  {k.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Users */}
        <div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Icon name="group" className="text-[14px]" /> Users ({tenant.userList.length})
          </h4>
          <div className="space-y-2">
            {tenant.userList.map((u) => (
              <div key={u.email} className="px-3 py-2 bg-white/70 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-slate-700">{u.name}</span>
                  <span className="text-[9px] font-bold text-dgblue bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {u.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">{u.email}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day traffic */}
        <div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Icon name="monitoring" className="text-[14px]" /> Lưu lượng 7 ngày
          </h4>
          <div className="bg-white/70 rounded-lg border border-slate-100 p-4">
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-black text-slate-900 tabular-nums">{fmtInt(tenant.reqMonth)}</span>
              <Sparkline data={tenant.trend} color={DG.primary} w={120} h={36} />
            </div>
            <div className="space-y-1.5 mt-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Fake rate</span>
                <span className="font-bold text-dgfake">{tenant.fakeRate}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Quota</span>
                <span className="font-bold" style={{ color: quotaColor(pct) }}>{pct}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Khu vực</span>
                <span className="font-bold text-slate-700">{tenant.region}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   GRID CARD
   ────────────────────────────────────────────── */
function TenantCard({
  tenant,
  onView,
  onSuspend,
}: {
  tenant: Tenant;
  onView: (t: Tenant) => void;
  onSuspend: (t: Tenant) => void;
}) {
  const pct = quotaPct(tenant);
  const qc = quotaColor(pct);
  return (
    <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 hover:shadow-md hover:-translate-y-0.5 transition-all dg-fade flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-dgblue/[0.08] flex items-center justify-center shrink-0">
            <Icon name="apartment" className="text-[20px] text-dgblue" fill />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-800 truncate">{tenant.name}</p>
            <p className="text-[10px] text-slate-400">{tenant.region} · {tenant.created}</p>
          </div>
        </div>
        <PlanBadge plan={tenant.plan} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Donut
          segments={[
            { value: tenant.quotaUsed, color: qc },
            { value: Math.max(tenant.quotaLimit - tenant.quotaUsed, 0), color: '#eef2f7' },
          ]}
          size={72}
          stroke={9}
        >
          <span className="text-[13px] font-black tabular-nums" style={{ color: qc }}>{pct}%</span>
        </Donut>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quota tháng</p>
          <p className="text-sm font-black text-slate-800 tabular-nums">
            {fmtInt(tenant.quotaUsed)} <span className="text-slate-300 font-bold">/ {fmtInt(tenant.quotaLimit)}</span>
          </p>
          <Sparkline data={tenant.trend} color={DG.primary} w={110} h={26} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-3">
          <StatusBadge status={tenant.status} />
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <Icon name="person" className="text-[14px] text-slate-400" />{tenant.users}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(tenant)}
            className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-dgblue transition-colors"
            title="Chi tiết"
          >
            <Icon name="visibility" className="text-[16px]" />
          </button>
          <button
            onClick={() => onSuspend(tenant)}
            className="w-7 h-7 rounded-lg hover:bg-orange-50 flex items-center justify-center text-slate-400 hover:text-dgwarn transition-colors"
            title={tenant.status === 'active' ? 'Suspend' : 'Activate'}
          >
            <Icon name="block" className="text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */
type ViewMode = 'table' | 'grid';

interface CreateForm {
  name: string;
  domain: string;
  region: string;
  plan: Plan;
  quota: number;
  rpm: number;
  adminName: string;
  email: string;
}
const emptyForm: CreateForm = {
  name: '', domain: '', region: 'Hà Nội', plan: 'Pro', quota: 10000, rpm: 200, adminName: '', email: '',
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>(TENANTS);
  const [view, setView] = useState<ViewMode>('table');
  const [plan, setPlan] = useState<'ALL' | Plan>('ALL');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<Tenant | null>(null);
  const [emptyDemo, setEmptyDemo] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [wizStep, setWizStep] = useState(0);

  const counts = useMemo(
    () => ({
      ALL: tenants.length,
      Starter: tenants.filter((x) => x.plan === 'Starter').length,
      Pro: tenants.filter((x) => x.plan === 'Pro').length,
      Enterprise: tenants.filter((x) => x.plan === 'Enterprise').length,
    }),
    [tenants],
  );

  const filtered = useMemo(
    () =>
      tenants.filter(
        (x) =>
          (plan === 'ALL' || x.plan === plan) &&
          (query === '' || x.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [tenants, plan, query],
  );
  const display = emptyDemo ? [] : filtered;

  const kpis = useMemo(() => {
    const active = tenants.filter((x) => x.status === 'active').length;
    const totalReq = tenants.reduce((s, x) => s + x.reqMonth, 0);
    const avgFake = tenants.length ? tenants.reduce((s, x) => s + x.fakeRate, 0) / tenants.length : 0;
    return { total: tenants.length, active, totalReq, avgFake };
  }, [tenants]);

  const wizSteps = ['Tổ chức', 'Gói & quota', 'Quản trị viên'];
  const canNext = wizStep === 0 ? !!form.name.trim() : wizStep === 1 ? true : !!form.email.trim();

  const openCreate = () => {
    setForm(emptyForm);
    setWizStep(0);
    setShowCreate(true);
  };

  const create = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const newTenant: Tenant = {
      id: String(Date.now()),
      name: form.name.trim(),
      plan: form.plan,
      quotaUsed: 0,
      quotaLimit: form.quota,
      users: 1,
      status: 'active',
      created: new Date().toLocaleDateString('vi-VN'),
      region: form.region,
      fakeRate: 0,
      trend: [0, 0, 0, 0, 0, 0, 0],
      reqMonth: 0,
      apiKeys: [],
      userList: [
        {
          name: form.adminName.trim() || `${form.name.trim()} Admin`,
          email: form.email.trim(),
          role: 'Admin',
        },
      ],
    };
    setTenants((p) => [newTenant, ...p]);
    setShowCreate(false);
  };

  const doSuspend = (id: string) => {
    setTenants((p) =>
      p.map((x) =>
        x.id === id ? { ...x, status: x.status === 'active' ? 'suspended' : 'active' } : x,
      ),
    );
    setSuspendTarget(null);
  };

  const planChips: { id: 'ALL' | Plan; label: string }[] = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'Starter', label: 'Starter' },
    { id: 'Pro', label: 'Pro' },
    { id: 'Enterprise', label: 'Enterprise' },
  ];

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 dg-fade">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            Quản lý Tenants
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-blue-50 text-dgblue border border-blue-200">
              {counts.ALL}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý tổ chức, quota & phân quyền hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEmptyDemo((v) => !v)}
            className="px-3 h-9 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-wider"
          >
            {emptyDemo ? 'Show data' : 'Empty demo'}
          </button>
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-white">
            {([['table', 'table_rows'], ['grid', 'grid_view']] as [ViewMode, string][]).map(([m, ic]) => (
              <button
                key={m}
                onClick={() => setView(m)}
                className={`w-9 h-8 rounded-lg flex items-center justify-center transition-all ${
                  view === m ? 'bg-white text-dgblue shadow-sm' : 'text-slate-400'
                }`}
              >
                <Icon name={ic} className="text-[18px]" />
              </button>
            ))}
          </div>
          <button
            onClick={openCreate}
            className="px-4 h-9 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
          >
            <Icon name="add" className="text-[16px]" /> Tạo tenant
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 dg-fade">
        <StatPill label="Tổng tenants" value={kpis.total} color={DG.primary} icon="apartment" />
        <StatPill label="Đang hoạt động" value={kpis.active} color={DG.real} icon="check_circle" />
        <StatPill label="Requests / tháng" value={fmtInt(kpis.totalReq)} color={DG.primary} icon="data_usage" />
        <StatPill label="Fake rate TB" value={`${kpis.avgFake.toFixed(1)}%`} color={DG.fake} icon="gpp_maybe" />
      </div>

      {/* filter bar */}
      <div className="glass-panel rounded-2xl p-4 shadow-sm border border-white/60 dg-fade flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên tổ chức…"
            className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {planChips.map((c) => (
            <button
              key={c.id}
              onClick={() => setPlan(c.id)}
              className={`px-3 h-9 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                plan === c.id
                  ? 'bg-dgblue text-white border-transparent shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {c.label}
              <span className={`text-[9px] tabular-nums px-1 rounded ${plan === c.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                {counts[c.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      {display.length === 0 ? (
        <StateBlock
          icon="apartment"
          title="Chưa có tenant nào"
          desc="Tạo tenant đầu tiên để quản lý workspace và phân quyền cho tổ chức."
          action="Tạo tenant đầu tiên"
          onAction={openCreate}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {display.map((t2) => (
            <TenantCard
              key={t2.id}
              tenant={t2}
              onView={(x) => {
                setView('table');
                setExpanded(x.id);
              }}
              onSuspend={setSuspendTarget}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-fade">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[920px]">
              <thead className="bg-white/60 border-b border-slate-100">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                  <th className="px-6 py-3.5">Tổ chức</th>
                  <th className="px-4 py-3.5">Plan</th>
                  <th className="px-4 py-3.5">Quota</th>
                  <th className="px-4 py-3.5">7 ngày</th>
                  <th className="px-4 py-3.5">Users</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {display.map((tn) => {
                  const pct = quotaPct(tn);
                  const qc = quotaColor(pct);
                  const open = expanded === tn.id;
                  return (
                    <Fragment key={tn.id}>
                      <tr
                        onClick={() => setExpanded(open ? null : tn.id)}
                        className="hover:bg-dgblue/[0.025] transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-dgblue/[0.06] group-hover:bg-dgblue/[0.12] flex items-center justify-center shrink-0 transition-colors">
                              <Icon name="apartment" className="text-[18px] text-dgblue" fill />
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-slate-800">{tn.name}</p>
                              <p className="text-[10px] text-slate-400">{tn.region}</p>
                            </div>
                            <Icon
                              name={open ? 'expand_less' : 'expand_more'}
                              className="text-[16px] text-slate-300 group-hover:text-slate-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <PlanBadge plan={tn.plan} />
                        </td>
                        <td className="px-4 py-4 min-w-[160px]">
                          <div className="flex items-baseline gap-1 mb-1.5">
                            <span className="text-[11px] font-black text-slate-700 tabular-nums">{fmtInt(tn.quotaUsed)}</span>
                            <span className="text-[10px] text-slate-400">/ {fmtInt(tn.quotaLimit)}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: qc, boxShadow: `0 0 8px ${qc}30` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Sparkline data={tn.trend} color={DG.primary} w={84} h={28} />
                        </td>
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
                            <Icon name="person" className="text-[14px] text-slate-400" />{tn.users}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={tn.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setExpanded(open ? null : tn.id)}
                              className="px-2.5 py-1.5 text-[10px] font-bold text-dgblue bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                              <Icon name="visibility" className="text-[13px]" />View
                            </button>
                            <button
                              onClick={() => setSuspendTarget(tn)}
                              className="px-2.5 py-1.5 text-[10px] font-bold text-dgwarn bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1"
                            >
                              <Icon name="block" className="text-[13px]" />
                              {tn.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={7} className="p-0 dg-fade">
                            <TenantDetail tenant={tn} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              {display.length} tenant{display.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-dgreal animate-pulse" />
              System operational
            </span>
          </div>
        </div>
      )}

      {/* Create modal — 3-step wizard */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} max="max-w-lg">
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg,${DG.primary} 0%,#60a5fa 100%)` }}
                >
                  <Icon name="add_business" className="text-[22px] text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900">Tạo Tenant mới</h2>
                  <p className="text-[12px] text-slate-400 mt-0.5">{wizSteps[wizStep]}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <div className="flex items-start">
              {wizSteps.map((s, i) => (
                <Fragment key={s}>
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                        i < wizStep ? 'bg-dgreal text-white' : i === wizStep ? 'bg-dgblue text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                      style={i === wizStep ? { boxShadow: '0 0 0 4px rgba(0,80,203,0.12)' } : {}}
                    >
                      {i < wizStep ? <Icon name="check" className="text-[15px]" /> : i + 1}
                    </div>
                    <span
                      className={`text-[10px] font-semibold whitespace-nowrap transition-colors ${
                        i === wizStep ? 'text-dgblue' : i < wizStep ? 'text-dgreal' : 'text-slate-400'
                      }`}
                    >
                      {s}
                    </span>
                  </div>
                  {i < wizSteps.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] mt-4 mx-2 rounded-full transition-all duration-500 ${
                        i < wizStep ? 'bg-dgreal' : 'bg-slate-100'
                      }`}
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="px-6 py-5 space-y-4 min-h-[220px] border-t border-slate-100">
            {wizStep === 0 && (
              <div className="space-y-4 dg-fade">
                <Field label="Tên tổ chức" req>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: VietBank"
                    autoFocus
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
                  />
                </Field>
                <Field label="Domain">
                  <input
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    placeholder="vietbank.vn"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
                  />
                </Field>
                <Field label="Khu vực">
                  <select
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all appearance-none cursor-pointer"
                  >
                    {REGIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
            {wizStep === 1 && (
              <div className="space-y-4 dg-fade">
                <Field label="Gói cước">
                  <div className="grid grid-cols-3 gap-2">
                    {PLANS.map((pl) => {
                      const st = PLAN_STYLE[pl];
                      return (
                        <button
                          key={pl}
                          onClick={() => setForm({ ...form, plan: pl })}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            form.plan === pl ? 'border-dgblue bg-dgblue/[0.03]' : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black tracking-wider"
                            style={{ color: st.color, background: st.bg }}
                          >
                            {pl}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Quota hàng tháng">
                  <div className="relative">
                    <input
                      type="number"
                      value={form.quota}
                      onChange={(e) => setForm({ ...form, quota: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full px-4 py-2.5 pr-20 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">requests</span>
                  </div>
                </Field>
                <Field label="Rate limit">
                  <div className="relative">
                    <input
                      type="number"
                      value={form.rpm}
                      onChange={(e) => setForm({ ...form, rpm: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full px-4 py-2.5 pr-12 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">rpm</span>
                  </div>
                </Field>
              </div>
            )}
            {wizStep === 2 && (
              <div className="space-y-4 dg-fade">
                <Field label="Tên quản trị viên">
                  <input
                    value={form.adminName}
                    onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
                  />
                </Field>
                <Field label="Email quản trị viên" req>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@company.com"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
                  />
                </Field>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Tóm tắt</p>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Tổ chức</span>
                    <span className="font-bold text-slate-700">{form.name || '—'} · {form.region}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Gói</span>
                    <span className="font-bold text-slate-700">{form.plan} · {fmtInt(form.quota)} req</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Admin</span>
                    <span className="font-bold text-slate-700">{form.email || '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={() => (wizStep === 0 ? setShowCreate(false) : setWizStep(wizStep - 1))}
              className="px-4 py-2.5 text-[12.5px] font-semibold rounded-xl transition-all flex items-center gap-1.5 text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
            >
              {wizStep === 0 ? (
                'Hủy'
              ) : (
                <>
                  <Icon name="arrow_back" className="text-[14px]" />Quay lại
                </>
              )}
            </button>
            {wizStep < 2 ? (
              <button
                onClick={() => canNext && setWizStep(wizStep + 1)}
                disabled={!canNext}
                className="px-6 py-2.5 rounded-xl font-semibold text-[13px] flex items-center gap-2 transition-all bg-dgblue text-white shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Tiếp tục <Icon name="arrow_forward" className="text-[14px]" />
              </button>
            ) : (
              <button
                onClick={create}
                disabled={!form.email.trim()}
                className="px-6 py-2.5 rounded-xl font-semibold text-[13px] flex items-center gap-2 transition-all bg-dgblue text-white shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Icon name="check" className="text-[14px]" /> Tạo tenant
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Suspend modal */}
      {suspendTarget && (
        <Modal onClose={() => setSuspendTarget(null)} max="max-w-sm">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Icon name="warning" className="text-[20px] text-dgfake" />
              </div>
              <h2 className="text-base font-black text-slate-900">
                Xác nhận {suspendTarget.status === 'active' ? 'Suspend' : 'Activate'}
              </h2>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {suspendTarget.status === 'active' ? (
                <>
                  Chắc chắn suspend <b className="text-slate-900">{suspendTarget.name}</b>? Tất cả API keys sẽ bị ngưng.
                </>
              ) : (
                <>
                  Kích hoạt lại <b className="text-slate-900">{suspendTarget.name}</b>?
                </>
              )}
            </p>
          </div>
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={() => setSuspendTarget(null)}
              className="px-5 py-2.5 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={() => doSuspend(suspendTarget.id)}
              className={`px-6 py-2.5 text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center gap-2 ${
                suspendTarget.status === 'active' ? 'bg-dgfake shadow-dgfake/25' : 'bg-dgreal shadow-dgreal/25'
              }`}
            >
              <Icon name={suspendTarget.status === 'active' ? 'block' : 'check'} className="text-[14px]" />
              {suspendTarget.status === 'active' ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
