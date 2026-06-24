'use client';

import { useState, useMemo, useEffect, useCallback, Fragment, type ReactNode } from 'react';
import { Icon, StatPill, Donut } from '@/components/deepguard/shared';
import { DG, fmtInt, timeAgo } from '@/lib/dg';
import {
  tenantsList,
  tenantsCreate,
  tenantUpdateById,
  tenantUsers,
  tenantApiKeys,
  tenantUserUpdate,
  type TenantListItem,
  type TenantUserItem,
  type TenantApiKeyItem,
} from '@/lib/api';
import { ROLE_LABEL, type Role } from '@/lib/rbac';
import { useAuthStore } from '@/store/auth';

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */
type Plan = 'Starter' | 'Pro' | 'Enterprise';
type TenantStatus = 'active' | 'suspended' | 'pending';

/** Nhãn nút hành động theo trạng thái: pending → Duyệt; suspended → Kích hoạt; active → Suspend. */
const statusActionLabel = (s: TenantStatus) => (s === 'active' ? 'Suspend' : s === 'pending' ? 'Duyệt' : 'Kích hoạt');

/** Normalised view-model derived from the real TenantListItem. */
interface Tenant {
  id: string;
  name: string;
  plan: Plan;
  quotaUsed: number;
  quotaLimit: number;
  users: number;
  status: TenantStatus;
  created: string;
}

/* ──────────────────────────────────────────────
   API → VIEW-MODEL MAPPING
   ────────────────────────────────────────────── */
function normPlan(p: string): Plan {
  const v = (p || '').toLowerCase();
  if (v.startsWith('enter')) return 'Enterprise';
  if (v.startsWith('pro')) return 'Pro';
  return 'Starter';
}
function normStatus(s: string): TenantStatus {
  const v = (s || '').toLowerCase();
  if (v === 'suspended') return 'suspended';
  if (v === 'pending') return 'pending';
  return 'active';
}
function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
}
function mapTenant(t: TenantListItem): Tenant {
  return {
    id: t.id,
    name: t.name,
    plan: normPlan(t.plan),
    quotaUsed: t.current_usage ?? 0,
    quotaLimit: t.monthly_quota ?? 0,
    users: t.user_count ?? 0,
    status: normStatus(t.status),
    created: fmtDate(t.created_at),
  };
}

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
  return Math.min(100, Math.round((t.quotaUsed / t.quotaLimit) * 100));
}
/** Relative time guarded against null timestamps. */
function relTime(iso: string | null | undefined): string {
  return iso ? timeAgo(iso) : 'chưa có';
}
/** quota usage % for an API key (0 limit ⇒ 0). */
function keyPct(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function roleLabel(role: string): string {
  return role in ROLE_LABEL ? ROLE_LABEL[role as Role] : role;
}

/** Map an API-key status string → badge palette. */
function keyStatusStyle(status: string): { label: string; color: string; bg: string; border: string } {
  const s = (status || '').toLowerCase();
  if (s === 'active') return { label: 'Active', color: DG.real, bg: '#f0fdf4', border: '#bbf7d0' };
  if (s === 'revoked') return { label: 'Revoked', color: DG.fake, bg: '#fef2f2', border: '#fecaca' };
  if (s === 'expired') return { label: 'Expired', color: DG.uncertain, bg: '#fff7ed', border: '#fed7aa' };
  return { label: status || '—', color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' };
}

const PLANS: Plan[] = ['Starter', 'Pro', 'Enterprise'];
/** Roles a sysadmin may assign here — sysadmin itself is excluded (backend 400s). */
const EDITABLE_ROLES: Role[] = ['viewer', 'developer', 'compliance', 'admin'];

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
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border bg-green-50 text-dgreal border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-dgreal animate-pulse" />
        Active
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border bg-amber-50 text-dgwarn border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-dgwarn animate-pulse" />
        Chờ duyệt
      </span>
    );
  }
  return (
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
   Backend list endpoint returns aggregates per tenant; the drill-down
   lazy-loads the tenant's users + api keys (sysadmin cross-tenant).
   Time-series traffic has no endpoint yet → kept as "sắp có".
   ────────────────────────────────────────────── */

/** Lazily-loaded, per-tenant drill-down payload (cached by tenant id). */
interface TenantDrill {
  loading: boolean;
  error: string;
  users: TenantUserItem[] | null;
  keys: TenantApiKeyItem[] | null;
}

function ComingSoon({ icon, title }: { icon: string; title: string }) {
  return (
    <div>
      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Icon name={icon} className="text-[14px]" /> {title}
      </h4>
      <div className="bg-white/70 rounded-lg border border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-center gap-1.5 min-h-[96px]">
        <Icon name="hourglass_empty" className="text-[22px] text-slate-300" />
        <span className="text-[11px] font-semibold text-slate-400">chi tiết theo tenant — sắp có</span>
      </div>
    </div>
  );
}

/** Section header reused across the drill-down panels. */
function PanelHead({ icon, title, count }: { icon: string; title: string; count?: number }) {
  return (
    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
      <Icon name={icon} className="text-[14px]" /> {title}
      {count != null && (
        <span className="ml-0.5 px-1.5 rounded bg-slate-100 text-slate-500 text-[9px] tabular-nums font-black">
          {count}
        </span>
      )}
    </h4>
  );
}

/** Small loading / error / empty fallback shared by both panels. */
function PanelState({ kind, text }: { kind: 'loading' | 'error' | 'empty'; text: string }) {
  const icon = kind === 'loading' ? 'progress_activity' : kind === 'error' ? 'error' : 'inbox';
  const tone = kind === 'error' ? 'text-dgfake' : 'text-slate-400';
  return (
    <div className="bg-white/70 rounded-lg border border-slate-100 p-4 flex flex-col items-center justify-center text-center gap-1.5 min-h-[96px]">
      <Icon name={icon} className={`text-[22px] ${kind === 'loading' ? 'animate-spin text-dgblue/40' : 'text-slate-300'}`} />
      <span className={`text-[11px] font-semibold ${tone}`}>{text}</span>
    </div>
  );
}

/** Single editable user row — role <select> + activate/deactivate toggle (sysadmin). */
function UserRow({
  user,
  tenantId,
  isSelf,
  onUpdated,
  onError,
}: {
  user: TenantUserItem;
  tenantId: string;
  isSelf: boolean;
  onUpdated: (u: TenantUserItem) => void;
  onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  // sysadmin role isn't editable here; if a user already holds it, keep it shown but locked.
  const roleEditable = !isSelf && user.role !== 'sysadmin';

  const patch = async (data: { role?: string; is_active?: boolean }) => {
    setSaving(true);
    onError('');
    try {
      const updated = await tenantUserUpdate(tenantId, user.id, data);
      onUpdated(updated);
    } catch (e: unknown) {
      onError(e instanceof Error ? e.message : 'Cập nhật người dùng thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-3.5 py-2.5 flex items-center gap-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold text-slate-800 truncate flex items-center gap-1.5">
          {user.name || user.email}
          {isSelf && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider bg-dgblue/10 text-dgblue shrink-0">
              BẠN
            </span>
          )}
        </p>
        <p className="text-[10.5px] text-slate-400 truncate">{user.email}</p>
      </div>

      {/* Role select (locked for self / existing sysadmin) */}
      <select
        value={user.role}
        disabled={saving || !roleEditable}
        onChange={(e) => {
          const next = e.target.value;
          if (next !== user.role) void patch({ role: next });
        }}
        title={roleEditable ? 'Đổi vai trò' : 'Không thể sửa vai trò này'}
        className="shrink-0 w-[112px] px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10.5px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* keep an out-of-list role (e.g. sysadmin) visible even though it's locked */}
        {!(EDITABLE_ROLES as string[]).includes(user.role) && (
          <option value={user.role}>{roleLabel(user.role)}</option>
        )}
        {EDITABLE_ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </select>

      {/* Activate / deactivate toggle */}
      <button
        type="button"
        disabled={saving || isSelf}
        onClick={() => void patch({ is_active: !user.is_active })}
        title={isSelf ? 'Không thể sửa chính bạn' : user.is_active ? 'Tạm ngưng' : 'Kích hoạt'}
        className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9.5px] font-black tracking-wider border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          user.is_active
            ? 'text-dgreal bg-green-50 border-green-200 hover:bg-green-100'
            : 'text-dgwarn bg-orange-50 border-orange-200 hover:bg-orange-100'
        }`}
      >
        {saving ? (
          <Icon name="progress_activity" className="text-[12px] animate-spin" />
        ) : (
          <Icon name={user.is_active ? 'toggle_on' : 'toggle_off'} className="text-[14px]" fill />
        )}
        {user.is_active ? 'Active' : 'Tạm ngưng'}
      </button>

      <span className="shrink-0 w-[58px] text-right text-[9.5px] text-slate-400">
        {relTime(user.last_login_at)}
      </span>
    </div>
  );
}

/** Editable list of a tenant's users (sysadmin cross-tenant). */
function UsersPanel({
  drill,
  tenantId,
  currentUserId,
  onUserUpdated,
}: {
  drill: TenantDrill;
  tenantId: string;
  currentUserId: string | undefined;
  onUserUpdated: (tenantId: string, user: TenantUserItem) => void;
}) {
  const { loading, error, users } = drill;
  const [rowError, setRowError] = useState('');
  return (
    <div>
      <PanelHead icon="group" title="Người dùng" count={users?.length} />
      {loading && !users ? (
        <PanelState kind="loading" text="Đang tải người dùng…" />
      ) : error ? (
        <PanelState kind="error" text={error} />
      ) : !users || users.length === 0 ? (
        <PanelState kind="empty" text="Chưa có người dùng" />
      ) : (
        <>
          {rowError && (
            <div className="mb-2 rounded-lg px-3 py-2 border border-red-200 bg-red-50/70 flex items-center gap-1.5 text-[10.5px] font-semibold text-dgfake dg-fade">
              <Icon name="error" className="text-[13px] shrink-0" />
              <span className="min-w-0 break-words">{rowError}</span>
            </div>
          )}
          <div className="bg-white/70 rounded-lg border border-slate-100 divide-y divide-slate-50 max-h-[260px] overflow-y-auto custom-scrollbar">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                tenantId={tenantId}
                isSelf={u.id === currentUserId}
                onUpdated={(updated) => onUserUpdated(tenantId, updated)}
                onError={setRowError}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** READ-ONLY list of a tenant's API keys. */
function ApiKeysPanel({ drill }: { drill: TenantDrill }) {
  const { loading, error, keys } = drill;
  return (
    <div>
      <PanelHead icon="key" title="API Keys" count={keys?.length} />
      {loading && !keys ? (
        <PanelState kind="loading" text="Đang tải API keys…" />
      ) : error ? (
        <PanelState kind="error" text={error} />
      ) : !keys || keys.length === 0 ? (
        <PanelState kind="empty" text="Chưa có API key" />
      ) : (
        <div className="bg-white/70 rounded-lg border border-slate-100 divide-y divide-slate-50 max-h-[260px] overflow-y-auto custom-scrollbar">
          {keys.map((k) => {
            const ks = keyStatusStyle(k.status);
            const pct = keyPct(k.quota_used, k.quota_limit);
            const qc = quotaColor(pct);
            return (
              <div key={k.id} className="px-3.5 py-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-slate-800 truncate">{k.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{k.prefix}••••••</p>
                  </div>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-black tracking-wider border shrink-0"
                    style={{ color: ks.color, background: ks.bg, borderColor: ks.border }}
                  >
                    {ks.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">
                    Quota{' '}
                    <span className="font-black text-slate-700 tabular-nums">{fmtInt(k.quota_used)}</span>
                    <span className="text-slate-300"> / {fmtInt(k.quota_limit)}</span>
                  </span>
                  <span className="text-slate-400">{relTime(k.last_used_at)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: qc, boxShadow: `0 0 8px ${qc}30` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TenantDetail({
  tenant,
  drill,
  currentUserId,
  onUserUpdated,
}: {
  tenant: Tenant;
  drill: TenantDrill;
  currentUserId: string | undefined;
  onUserUpdated: (tenantId: string, user: TenantUserItem) => void;
}) {
  const pct = quotaPct(tenant);
  return (
    <div className="px-6 py-5 bg-slate-50/60 border-t border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Overview — real aggregates */}
        <div>
          <PanelHead icon="insights" title="Tổng quan" />
          <div className="bg-white/70 rounded-lg border border-slate-100 p-4 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Quota tháng</span>
              <span className="text-[12px] font-black text-slate-800 tabular-nums">
                {fmtInt(tenant.quotaUsed)}{' '}
                <span className="text-slate-300 font-bold">/ {fmtInt(tenant.quotaLimit)}</span>
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: quotaColor(pct), boxShadow: `0 0 8px ${quotaColor(pct)}30` }}
              />
            </div>
            <div className="flex justify-between text-[11px] pt-1">
              <span className="text-slate-500 font-medium">Mức sử dụng</span>
              <span className="font-bold" style={{ color: quotaColor(pct) }}>{pct}%</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Người dùng</span>
              <span className="font-bold text-slate-700 tabular-nums">{fmtInt(tenant.users)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Trạng thái</span>
              <span className="font-bold text-slate-700">{tenant.status === 'active' ? 'Active' : tenant.status === 'pending' ? 'Chờ duyệt' : 'Suspended'}</span>
            </div>
          </div>
        </div>

        {/* Users — real, lazy-loaded, editable (sysadmin cross-tenant) */}
        <UsersPanel
          drill={drill}
          tenantId={tenant.id}
          currentUserId={currentUserId}
          onUserUpdated={onUserUpdated}
        />

        {/* API Keys — real, lazy-loaded, read-only */}
        <ApiKeysPanel drill={drill} />

        {/* Lưu lượng — no time-series endpoint yet */}
        <ComingSoon icon="monitoring" title="Lưu lượng 7 ngày" />
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
            <p className="text-[10px] text-slate-400">{tenant.created}</p>
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
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: qc, boxShadow: `0 0 8px ${qc}30` }}
            />
          </div>
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
            title={statusActionLabel(tenant.status)}
          >
            <Icon name={tenant.status === 'active' ? 'block' : 'check'} className="text-[16px]" />
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
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<ViewMode>('table');
  const [plan, setPlan] = useState<'ALL' | Plan>('ALL');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<Tenant | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [createNotice, setCreateNotice] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ admin_email: string; temp_password: string } | null>(null);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [wizStep, setWizStep] = useState(0);
  /** Per-tenant drill-down cache (users + api keys), keyed by tenant id. */
  const [drilldowns, setDrilldowns] = useState<Record<string, TenantDrill>>({});
  /** Current sysadmin's own id — used to lock their row in the users panel. */
  const currentUserId = useAuthStore((s) => s.user?.id);

  /** Patch a single user inside a tenant's drill-down cache after a successful edit. */
  const patchDrillUser = useCallback((tenantId: string, updated: TenantUserItem) => {
    setDrilldowns((prev) => {
      const cur = prev[tenantId];
      if (!cur?.users) return prev;
      return {
        ...prev,
        [tenantId]: {
          ...cur,
          users: cur.users.map((u) => (u.id === updated.id ? updated : u)),
        },
      };
    });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    tenantsList()
      .then((res) => setTenants(res.items.map(mapTenant)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Lỗi tải danh sách tenants'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Lazy-load a tenant's users + api keys on first expand; cached afterwards. */
  const loadDrill = useCallback((id: string) => {
    setDrilldowns((prev) => {
      if (prev[id] && (prev[id].loading || prev[id].users || prev[id].keys || prev[id].error)) {
        return prev; // already loaded / loading / errored → reuse cache
      }
      return { ...prev, [id]: { loading: true, error: '', users: null, keys: null } };
    });
    void Promise.all([tenantUsers(id), tenantApiKeys(id)])
      .then(([users, keys]) =>
        setDrilldowns((prev) => ({ ...prev, [id]: { loading: false, error: '', users, keys } })),
      )
      .catch((e: unknown) =>
        setDrilldowns((prev) => ({
          ...prev,
          [id]: {
            loading: false,
            error: e instanceof Error ? e.message : 'Lỗi tải chi tiết tenant',
            users: prev[id]?.users ?? null,
            keys: prev[id]?.keys ?? null,
          },
        })),
      );
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const cached = drilldowns[expanded];
    if (cached && (cached.loading || cached.users || cached.keys || cached.error)) return;
    loadDrill(expanded);
  }, [expanded, drilldowns, loadDrill]);

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

  const kpis = useMemo(() => {
    const active = tenants.filter((x) => x.status === 'active').length;
    const totalUsage = tenants.reduce((s, x) => s + x.quotaUsed, 0);
    const totalUsers = tenants.reduce((s, x) => s + x.users, 0);
    return { total: tenants.length, active, totalUsage, totalUsers };
  }, [tenants]);

  const wizSteps = ['Tổ chức', 'Gói & quota', 'Quản trị viên'];
  const canNext = wizStep === 0 ? !!form.name.trim() : wizStep === 1 ? true : !!form.email.trim();

  const openCreate = () => {
    setForm(emptyForm);
    setWizStep(0);
    setCreateNotice(false);
    setCreatedResult(null);
    setShowCreate(true);
  };

  /** Tạo tenant qua POST /tenants (sysadmin). Tenant ACTIVE ngay + admin có mật khẩu tạm (hiện 1 lần). */
  const submitCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setCreating(true);
    setCreateNotice(false);
    setActionError('');
    try {
      const res = await tenantsCreate({
        name: form.name.trim(),
        admin_email: form.email.trim(),
        admin_name: form.adminName.trim() || undefined,
        plan: form.plan.toLowerCase(),
        monthly_quota: form.quota,
      });
      setCreatedResult({ admin_email: res.admin_email, temp_password: res.temp_password });
      load();
    } catch (e: unknown) {
      setCreateNotice(true);
      setActionError(e instanceof Error ? e.message : 'Tạo tenant thất bại');
    } finally {
      setCreating(false);
    }
  };

  const applyUpdate = async (
    id: string,
    data: { status?: TenantStatus; plan?: string; monthly_quota?: number },
  ) => {
    setBusyId(id);
    setActionError('');
    try {
      await tenantUpdateById(id, data);
      load();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Cập nhật tenant thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const doSuspend = async (t: Tenant) => {
    const next: TenantStatus = t.status === 'active' ? 'suspended' : 'active';
    await applyUpdate(t.id, { status: next });
    setSuspendTarget(null);
  };

  const changePlan = (t: Tenant, next: Plan) => {
    if (next === t.plan) return;
    void applyUpdate(t.id, { plan: next.toLowerCase() });
  };

  const adjustQuota = (t: Tenant) => {
    const input = window.prompt(`Quota hàng tháng cho ${t.name} (requests):`, String(t.quotaLimit));
    if (input == null) return;
    const value = parseInt(input, 10);
    if (Number.isNaN(value) || value < 0) {
      setActionError('Quota không hợp lệ');
      return;
    }
    void applyUpdate(t.id, { monthly_quota: value });
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
            onClick={load}
            disabled={loading}
            className="px-3 h-9 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-wider disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Icon name="refresh" className={`text-[14px] ${loading ? 'animate-spin' : ''}`} />
            Tải lại
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
            data-tour="tn-create"
            onClick={openCreate}
            className="px-4 h-9 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
          >
            <Icon name="add" className="text-[16px]" /> Tạo tenant
          </button>
        </div>
      </div>

      {/* KPI summary — derived from real list */}
      <div data-tour="tn-kpis" className="grid grid-cols-2 md:grid-cols-4 gap-3 dg-fade">
        <StatPill label="Tổng tenants" value={kpis.total} color={DG.primary} icon="apartment" />
        <StatPill label="Đang hoạt động" value={kpis.active} color={DG.real} icon="check_circle" />
        <StatPill label="Tổng usage" value={fmtInt(kpis.totalUsage)} color={DG.primary} icon="data_usage" />
        <StatPill label="Tổng người dùng" value={fmtInt(kpis.totalUsers)} color={DG.uncertain} icon="group" />
      </div>

      {/* action error */}
      {actionError && (
        <div className="glass-panel rounded-xl px-4 py-3 border border-red-200 bg-red-50/60 dg-fade flex items-center gap-2 text-[12px] font-semibold text-dgfake">
          <Icon name="error" className="text-[16px]" />
          {actionError}
        </div>
      )}

      {/* filter bar */}
      <div data-tour="tn-filter" className="glass-panel rounded-2xl p-4 shadow-sm border border-white/60 dg-fade flex flex-wrap items-center gap-3">
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
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 shadow-sm border border-white/60 text-center dg-fade">
          <Icon name="progress_activity" className="text-[40px] text-dgblue/40 animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-400">Đang tải danh sách tenants…</p>
        </div>
      ) : error ? (
        <StateBlock
          icon="error"
          title="Không tải được dữ liệu"
          desc={error}
          action="Thử lại"
          onAction={load}
        />
      ) : filtered.length === 0 ? (
        <StateBlock
          icon="apartment"
          title={tenants.length === 0 ? 'Chưa có tenant nào' : 'Không tìm thấy tenant'}
          desc={
            tenants.length === 0
              ? 'Chưa có tổ chức nào trong hệ thống.'
              : 'Không có tenant nào khớp với bộ lọc hiện tại.'
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t2) => (
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
                  <th className="px-4 py-3.5">Tạo lúc</th>
                  <th className="px-4 py-3.5">Users</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((tn) => {
                  const pct = quotaPct(tn);
                  const qc = quotaColor(pct);
                  const open = expanded === tn.id;
                  const busy = busyId === tn.id;
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
                              <p className="text-[10px] text-slate-400 font-mono">{tn.id.slice(0, 8)}</p>
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
                          <span className="text-[12px] font-semibold text-slate-600 tabular-nums">{tn.created}</span>
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
                              disabled={busy}
                              className="px-2.5 py-1.5 text-[10px] font-bold text-dgwarn bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <Icon name={tn.status === 'active' ? 'block' : 'check'} className="text-[13px]" />
                              {statusActionLabel(tn.status)}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={7} className="p-0 dg-fade">
                            <div className="px-6 pt-4 bg-slate-50/60 border-t border-slate-100 flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Đổi gói</span>
                                <div className="inline-flex gap-1">
                                  {PLANS.map((pl) => (
                                    <button
                                      key={pl}
                                      onClick={() => changePlan(tn, pl)}
                                      disabled={busy || pl === tn.plan}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider border transition-all disabled:cursor-default ${
                                        pl === tn.plan
                                          ? 'bg-dgblue text-white border-transparent'
                                          : 'bg-white border-slate-200 text-slate-500 hover:border-dgblue/40 disabled:opacity-50'
                                      }`}
                                    >
                                      {pl}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => adjustQuota(tn)}
                                disabled={busy}
                                className="ml-auto px-3 py-1.5 rounded-lg text-[10px] font-bold text-dgblue bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                <Icon name="tune" className="text-[13px]" /> Chỉnh quota
                              </button>
                            </div>
                            <TenantDetail
                              tenant={tn}
                              drill={drilldowns[tn.id] ?? { loading: true, error: '', users: null, keys: null }}
                              currentUserId={currentUserId}
                              onUserUpdated={patchDrillUser}
                            />
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
              {filtered.length} tenant{filtered.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-dgreal animate-pulse" />
              System operational
            </span>
          </div>
        </div>
      )}

      {/* Create modal — 3-step wizard (submits via tenantsCreate → POST /tenants) */}
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
            {createNotice && (
              <div className="rounded-xl px-4 py-3 border border-rose-200 bg-rose-50 flex items-start gap-2.5 dg-fade">
                <Icon name="error" className="text-[18px] text-dgfake shrink-0 mt-0.5" />
                <p className="text-[12px] font-semibold text-rose-700 leading-relaxed">
                  {actionError || 'Tạo tenant thất bại.'}
                </p>
              </div>
            )}
            {createdResult && (
              <div className="dg-fade space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-full bg-dgreal/10 border border-dgreal/20 flex items-center justify-center shrink-0">
                    <Icon name="check_circle" className="text-[20px] text-dgreal" />
                  </span>
                  <div>
                    <p className="text-[13px] font-black text-slate-800">Đã tạo tổ chức «{form.name}»</p>
                    <p className="text-[11px] text-slate-500">Tài khoản admin đã kích hoạt (ACTIVE).</p>
                  </div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
                  <p className="text-[11px] font-bold text-amber-700">⚠ Mật khẩu tạm chỉ hiện 1 lần — gửi cho admin, họ buộc đổi khi đăng nhập.</p>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-500">Email</span>
                    <span className="font-mono font-bold text-slate-800">{createdResult.admin_email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="text-slate-500">Mật khẩu tạm</span>
                    <span className="flex items-center gap-2">
                      <code className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">{createdResult.temp_password}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(createdResult.temp_password)}
                        className="text-dgblue hover:opacity-70" title="Sao chép"
                      >
                        <Icon name="content_copy" className="text-[15px]" />
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            )}
            {!createdResult && wizStep === 0 && (
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
              </div>
            )}
            {!createdResult && wizStep === 1 && (
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
            {!createdResult && wizStep === 2 && (
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
                    <span className="font-bold text-slate-700">{form.name || '—'}</span>
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
            {createdResult ? (
              <button
                onClick={() => setShowCreate(false)}
                className="ml-auto px-6 py-2.5 rounded-xl font-semibold text-[13px] flex items-center gap-2 transition-all bg-dgblue text-white shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97]"
              >
                <Icon name="check" className="text-[14px]" /> Xong
              </button>
            ) : (
              <>
                <button
                  onClick={() => (wizStep === 0 ? setShowCreate(false) : setWizStep(wizStep - 1))}
                  disabled={creating}
                  className="px-4 py-2.5 text-[12.5px] font-semibold rounded-xl transition-all flex items-center gap-1.5 text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  {wizStep === 0 ? 'Hủy' : (<><Icon name="arrow_back" className="text-[14px]" />Quay lại</>)}
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
                    onClick={submitCreate}
                    disabled={!form.email.trim() || creating}
                    className="px-6 py-2.5 rounded-xl font-semibold text-[13px] flex items-center gap-2 transition-all bg-dgblue text-white shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {creating ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang tạo…</>
                    ) : (
                      <><Icon name="check" className="text-[14px]" /> Tạo tenant</>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Suspend modal */}
      {suspendTarget && (
        <Modal onClose={() => setSuspendTarget(null)} max="max-w-sm">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${suspendTarget.status === 'active' ? 'bg-red-50' : 'bg-green-50'}`}>
                <Icon name={suspendTarget.status === 'active' ? 'warning' : 'check_circle'} className={`text-[20px] ${suspendTarget.status === 'active' ? 'text-dgfake' : 'text-dgreal'}`} />
              </div>
              <h2 className="text-base font-black text-slate-900">
                Xác nhận {statusActionLabel(suspendTarget.status)}
              </h2>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {suspendTarget.status === 'active' ? (
                <>
                  Chắc chắn suspend <b className="text-slate-900">{suspendTarget.name}</b>? Tất cả API keys sẽ bị ngưng.
                </>
              ) : suspendTarget.status === 'pending' ? (
                <>
                  Duyệt tổ chức <b className="text-slate-900">{suspendTarget.name}</b>? Tổ chức sẽ được kích hoạt và quản trị viên có thể đăng nhập.
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
              onClick={() => doSuspend(suspendTarget)}
              disabled={busyId === suspendTarget.id}
              className={`px-6 py-2.5 text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 ${
                suspendTarget.status === 'active' ? 'bg-dgfake shadow-dgfake/25' : 'bg-dgreal shadow-dgreal/25'
              }`}
            >
              <Icon name={suspendTarget.status === 'active' ? 'block' : 'check'} className="text-[14px]" />
              {statusActionLabel(suspendTarget.status)}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
