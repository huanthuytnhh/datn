'use client';

/**
 * DeepGuard — API Keys page.
 * Restyled to match the frontend-claude prototype (apikeys.jsx) while keeping
 * the real backend wiring: apiKeysList / apiKeysCreate / apiKeysRevoke.
 * Light mode only. Vietnamese copy. Uses shared primitives + lib/dg helpers.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon, Sparkline, StatPill, RangeToggle } from '@/components/deepguard/shared';
import { DG, fmtInt, timeAgo } from '@/lib/dg';
import { apiKeysList, apiKeysCreate, apiKeysRevoke, type ApiKeyOut } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { canEdit } from '@/lib/rbac';
import type { Role } from '@/lib/rbac';

/* ──────────────────────────────────────────────
   LOCAL VIEW MODEL
   ────────────────────────────────────────────── */
interface KeyRow {
  id: string;
  name: string;
  prefix: string;
  status: string;
  quotaUsed: number;
  quotaLimit: number;
  rpm: number;
  lastUsed: string | null; // ISO or null
  created: string; // ISO
  spark: number[];
}

const KEY_STATUS: Record<string, { color: string; bg: string; border: string; label: string }> = {
  active: { color: DG.real, bg: '#f0fdf4', border: '#bbf7d0', label: 'Active' },
  rotating: { color: DG.uncertain, bg: '#fff7ed', border: '#fed7aa', label: 'Rotating' },
  suspended: { color: DG.uncertain, bg: '#fff7ed', border: '#fed7aa', label: 'Suspended' },
  revoked: { color: DG.fake, bg: '#fef2f2', border: '#fecaca', label: 'Revoked' },
};

function quotaColor(pct: number): string {
  if (pct >= 90) return DG.fake;
  if (pct >= 70) return DG.uncertain;
  return DG.real;
}

/** Deterministic sparkline seeded from quota usage so each key looks distinct. */
function sparkFor(k: ApiKeyOut): number[] {
  if (k.quota_used === 0) return [0, 0, 0, 0, 0, 0, 0];
  const base = Math.max(1, Math.round(k.quota_used / 7));
  let seed = 0;
  for (const c of k.id) seed = (seed * 31 + c.charCodeAt(0)) % 997;
  return Array.from({ length: 7 }, (_, i) => {
    const wobble = ((seed + i * 53) % 60) / 100; // 0..0.6
    return Math.round(base * (0.7 + wobble));
  });
}

function toRow(k: ApiKeyOut): KeyRow {
  return {
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    status: k.status,
    quotaUsed: k.quota_used,
    quotaLimit: k.quota_limit,
    rpm: k.rate_limit_rpm,
    lastUsed: k.last_used_at,
    created: k.created_at,
    spark: sparkFor(k),
  };
}

/* ──────────────────────────────────────────────
   SMALL PRESENTATION HELPERS
   ────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = KEY_STATUS[status] ?? KEY_STATUS.active;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'animate-pulse' : ''}`} style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function ActionMenu({ onAction, canRevoke }: { onAction: (label: string) => void; canRevoke: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const items: Array<[string, string, string]> = [['Thu hồi', 'delete', DG.fake]];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        disabled={!canRevoke}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        aria-label="Actions"
      >
        <Icon name="more_vert" className="text-[18px]" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 glass-panel rounded-xl shadow-xl border border-white/80 py-1.5 min-w-[160px] dg-fade"
        >
          {items.map(([label, icon, color]) => (
            <button
              key={label}
              onClick={(e) => {
                e.stopPropagation();
                onAction(label);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-semibold hover:bg-slate-50 transition-colors"
              style={{ color }}
            >
              <Icon name={icon} className="text-[16px]" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
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
    <div className="glass-panel rounded-2xl p-12 shadow-md border border-white/60 text-center dg-fade">
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
          <Icon name="add" className="text-[16px]" /> {action}
        </button>
      )}
    </div>
  );
}

function Field({ label, req, children }: { label: string; req?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
        {label} {req && <span className="text-dgfake">*</span>}
      </label>
      {children}
    </div>
  );
}

function Modal({ onClose, children, max = 'max-w-lg' }: { onClose: () => void; children: ReactNode; max?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dg-fade" onClick={onClose}>
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

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */
export default function ApiKeysPage() {
  const setApiKey = useAuthStore((s) => s.setApiKey);
  const userRole = useAuthStore((s) => s.user?.role as Role | undefined);
  const canWrite = canEdit(userRole, 'apikeys');

  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [query, setQuery] = useState('');
  const [statusF, setStatusF] = useState('ALL');

  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState<'config' | 'reveal'>('config');
  const [newKeyPlain, setNewKeyPlain] = useState('');
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');
  const [revealShow, setRevealShow] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [form, setForm] = useState({ name: '', quota: 10000, rpm: 100 });

  const loadKeys = () => {
    setLoading(true);
    apiKeysList()
      .then((data) => setKeys(data.map(toRow)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const counts = useMemo(
    () => ({
      ALL: keys.length,
      active: keys.filter((k) => k.status === 'active').length,
      rotating: keys.filter((k) => k.status === 'rotating').length,
      revoked: keys.filter((k) => k.status === 'revoked').length,
    }),
    [keys],
  );

  const kpis = useMemo(() => {
    const totalReq = keys.reduce((s, k) => s + k.quotaUsed, 0);
    const totalQuota = keys.reduce((s, k) => s + k.quotaLimit, 0);
    return {
      total: keys.length,
      active: counts.active,
      totalReq,
      usagePct: totalQuota ? Math.round((totalReq / totalQuota) * 100) : 0,
    };
  }, [keys, counts]);

  const filtered = useMemo(
    () =>
      keys.filter(
        (k) =>
          (statusF === 'ALL' || k.status === statusF) &&
          (query === '' || k.name.toLowerCase().includes(query.toLowerCase()) || k.prefix.toLowerCase().includes(query.toLowerCase())),
      ),
    [keys, statusF, query],
  );

  const statusChips = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'active', label: 'Active' },
    { id: 'rotating', label: 'Rotating' },
    { id: 'revoked', label: 'Revoked' },
  ];

  const openCreate = () => {
    setForm({ name: '', quota: 10000, rpm: 100 });
    setStep('config');
    setNewKeyPlain('');
    setCreateErr('');
    setRevealShow(false);
    setKeyCopied(false);
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || creating) return;
    setCreating(true);
    setCreateErr('');
    try {
      const created = await apiKeysCreate(form.name.trim(), form.quota, form.rpm);
      setKeys((prev) => [toRow(created), ...prev]);
      setApiKey(created.plain_key);
      setNewKeyPlain(created.plain_key);
      setStep('reveal');   // banner trên cùng chỉ hiện SAU khi đóng modal (finishReveal) — tránh trùng lặp
    } catch (e: unknown) {
      setCreateErr(e instanceof Error ? e.message : 'Tạo API key thất bại');
    } finally {
      setCreating(false);
    }
  };

  const copyNewKey = () => {
    if (!newKeyPlain) return;
    navigator.clipboard?.writeText(newKeyPlain);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };
  // Đóng modal reveal → để lại banner nhắc copy (chỉ 1 surface tại 1 thời điểm)
  const finishReveal = () => {
    setCreatedKey(newKeyPlain);
    setShowCreate(false);
  };
  const maskKey = (k: string) => (k.length > 14 ? `${k.slice(0, 10)}${'•'.repeat(18)}${k.slice(-4)}` : k);

  const handleRevoke = async (key: KeyRow) => {
    if (!confirm(`Thu hồi API key "${key.name}"?`)) return;
    await apiKeysRevoke(key.id).catch(() => {});
    loadKeys();
  };

  const copyBanner = () => {
    if (!createdKey) return;
    navigator.clipboard?.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lastUsedLabel = (iso: string | null) => (iso ? timeAgo(iso) : 'Chưa dùng');
  const createdLabel = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 dg-fade">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">API Keys</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý khóa truy cập cho VietBank Workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <RangeToggle
            value={view}
            onChange={(v) => setView(v as 'table' | 'cards')}
            options={[
              { id: 'table', label: 'Bảng' },
              { id: 'cards', label: 'Thẻ' },
            ]}
          />
          {canWrite && (
            <button
              data-tour="ak-create"
              onClick={openCreate}
              className="px-4 h-9 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
            >
              <Icon name="add" className="text-[16px]" /> Tạo key mới
            </button>
          )}
        </div>
      </div>

      {/* ── Reveal banner ── */}
      {createdKey && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 dg-fade">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-dgreal/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="check_circle" className="text-dgreal text-[20px]" fill />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black text-dgreal">API key đã tạo — copy ngay, sẽ không hiển thị lại!</p>
              <code className="mt-2 inline-block text-[12px] font-mono font-bold bg-white/80 text-slate-800 px-3 py-1.5 rounded-lg border border-green-100 select-all break-all">
                {createdKey}
              </code>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyBanner}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                copied ? 'bg-dgreal text-white' : 'bg-white border border-green-200 text-dgreal hover:bg-green-50'
              }`}
            >
              <Icon name={copied ? 'check' : 'content_copy'} className="text-[14px]" />
              {copied ? 'Đã copy!' : 'Copy'}
            </button>
            <button
              onClick={() => setCreatedKey(null)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-100 transition-colors text-green-600"
              aria-label="Đóng"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </div>
        </div>
      )}

      {/* ── KPI pills ── */}
      <div data-tour="ak-kpis" className="grid grid-cols-2 md:grid-cols-4 gap-3 dg-fade">
        <StatPill label="Tổng keys" value={fmtInt(kpis.total)} color={DG.primary} icon="key" />
        <StatPill label="Đang active" value={fmtInt(kpis.active)} color={DG.real} icon="check_circle" />
        <StatPill label="Requests đã dùng" value={fmtInt(kpis.totalReq)} color={DG.primary} icon="data_usage" />
        <StatPill label="Quota tổng" value={`${kpis.usagePct}%`} color={DG.uncertain} icon="speed" />
      </div>

      {/* ── Filter bar ── */}
      <div className="glass-panel rounded-2xl p-4 shadow-sm border border-white/60 dg-fade flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên key, prefix…"
            className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {statusChips.map((c) => (
            <button
              key={c.id}
              onClick={() => setStatusF(c.id)}
              className={`px-3 h-9 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                statusF === c.id ? 'bg-dgblue text-white border-transparent shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {c.label}
              <span className={`text-[9px] tabular-nums px-1 rounded ${statusF === c.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                {counts[c.id as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-4 shadow-sm border border-white/60 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-2 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
              <div className="h-3 w-40 rounded bg-slate-100" />
              <div className="h-3 flex-1 rounded bg-slate-100" />
              <div className="h-3 w-16 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <StateBlock
          icon="vpn_key_off"
          title={keys.length === 0 ? 'Chưa có API key nào' : 'Không có key phù hợp'}
          desc={
            keys.length === 0
              ? 'Tạo API key đầu tiên để bắt đầu tích hợp DeepGuard Detection API vào ứng dụng của bạn.'
              : 'Thử đổi bộ lọc trạng thái hoặc tạo API key mới để bắt đầu tích hợp.'
          }
          action={canWrite ? 'Tạo key đầu tiên' : undefined}
          onAction={canWrite ? openCreate : undefined}
        />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((k) => {
            const pct = k.quotaLimit ? Math.round((k.quotaUsed / k.quotaLimit) * 100) : 0;
            const qc = quotaColor(pct);
            return (
              <div
                key={k.id}
                className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 hover:shadow-md hover:-translate-y-0.5 transition-all dg-fade"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-dgblue/8 flex items-center justify-center shrink-0">
                      <Icon name="key" className="text-[18px] text-dgblue" fill />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800 truncate">{k.name}</p>
                      <code className="text-[10px] font-mono text-slate-400">{k.prefix}</code>
                    </div>
                  </div>
                  <ActionMenu canRevoke={canWrite && k.status !== 'revoked'} onAction={(l) => l === 'Thu hồi' && handleRevoke(k)} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Quota · {k.rpm} RPM</span>
                  <Sparkline data={k.spark} color={DG.primary} w={80} h={24} />
                </div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-[12px] font-black text-slate-700 tabular-nums">{fmtInt(k.quotaUsed)}</span>
                  <span className="text-[10px] text-slate-400">/ {fmtInt(k.quotaLimit)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: qc }} />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <StatusBadge status={k.status} />
                  <span className="text-[10px] text-slate-400 font-medium">{lastUsedLabel(k.lastUsed)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-fade">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[900px]">
              <thead className="bg-white/60 border-b border-slate-100">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                  <th className="px-6 py-3.5">Tên</th>
                  <th className="px-4 py-3.5">Prefix</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5">Quota</th>
                  <th className="px-4 py-3.5">7 ngày</th>
                  <th className="px-4 py-3.5">RPM</th>
                  <th className="px-4 py-3.5">Lần cuối</th>
                  <th className="px-4 py-3.5">Tạo ngày</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((k) => {
                  const pct = k.quotaLimit ? Math.round((k.quotaUsed / k.quotaLimit) * 100) : 0;
                  const qc = quotaColor(pct);
                  return (
                    <tr key={k.id} className="data-table-row hover:bg-dgblue/[0.025] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-dgblue/6 group-hover:bg-dgblue/12 flex items-center justify-center shrink-0 transition-colors">
                            <Icon name="key" className="text-[16px] text-dgblue" />
                          </div>
                          <span className="text-[13px] font-bold text-slate-800">{k.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <code className="text-[11px] font-mono font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          {k.prefix}
                        </code>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={k.status} />
                      </td>
                      <td className="px-4 py-4 min-w-[150px]">
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-[11px] font-black text-slate-700 tabular-nums">{fmtInt(k.quotaUsed)}</span>
                          <span className="text-[10px] text-slate-400">/ {fmtInt(k.quotaLimit)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: qc, boxShadow: `0 0 8px ${qc}30` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Sparkline data={k.spark} color={DG.primary} w={78} h={26} />
                      </td>
                      <td className="px-4 py-4 text-[11px] font-bold text-slate-600 tabular-nums">{k.rpm}</td>
                      <td className="px-4 py-4 text-[11px] text-slate-500 font-medium">{lastUsedLabel(k.lastUsed)}</td>
                      <td className="px-4 py-4 text-[11px] text-slate-500 font-medium">{createdLabel(k.created)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          <ActionMenu canRevoke={canWrite && k.status !== 'revoked'} onAction={(l) => l === 'Thu hồi' && handleRevoke(k)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              {filtered.length} key{filtered.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-dgreal animate-pulse" />
              API endpoints active
            </span>
          </div>
        </div>
      )}

      {/* ── Info cards ── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dg-fade">
          {(
            [
              ['shield', DG.primary, 'Bảo mật', 'Key rotation', 'Rotate key định kỳ. Key cũ vô hiệu sau 24h khi rotate.'],
              ['speed', DG.real, 'Rate Limit', '100 RPM mặc định', 'Giới hạn req/phút bảo vệ hệ thống. Nâng plan để tăng.'],
              ['data_usage', DG.uncertain, 'Quota', 'Theo dõi sử dụng', 'Cảnh báo tự động khi đạt 80% hạn mức quota.'],
            ] as Array<[string, string, string, string, string]>
          ).map(([ic, col, tag, title, desc]) => (
            <div key={tag} className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${col}10` }}>
                  <Icon name={ic} className="text-[20px]" style={{ color: col }} fill />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{tag}</p>
                  <p className="text-[13px] font-bold text-slate-700">{title}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Create modal ── */}
      {showCreate && (
        <Modal onClose={() => (step === 'reveal' ? finishReveal() : setShowCreate(false))}>
          {step === 'config' ? (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-dgblue">
                    <Icon name="key" className="text-[22px] text-white" fill />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Tạo API Key mới</h2>
                    <p className="text-[12px] text-slate-400 mt-0.5">Cấu hình quyền truy cập</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Đóng"
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <Field label="Tên key" req>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Production API Key"
                    autoFocus
                    className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Quota">
                    <div className="relative">
                      <input
                        type="number"
                        value={form.quota}
                        onChange={(e) => setForm({ ...form, quota: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">req</span>
                    </div>
                  </Field>
                  <Field label="Rate limit">
                    <div className="relative">
                      <input
                        type="number"
                        value={form.rpm}
                        onChange={(e) => setForm({ ...form, rpm: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">rpm</span>
                    </div>
                  </Field>
                </div>
              </div>
              {createErr && (
                <div className="px-6 pb-1">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                    <Icon name="error" className="text-[15px] text-dgfake shrink-0" />
                    <span className="text-[12px] font-semibold text-dgfake">{createErr}</span>
                  </div>
                </div>
              )}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 text-[12.5px] font-semibold rounded-xl text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!form.name.trim() || creating}
                  className="px-6 py-2.5 rounded-xl font-semibold text-[13px] flex items-center gap-2 bg-dgblue text-white shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {creating ? 'Đang tạo…' : 'Tạo key'}
                  {!creating && <Icon name="arrow_forward" className="text-[14px]" />}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,#1a7f3c,#34d399)', boxShadow: '0 4px 16px rgba(46,125,50,0.28)' }}
                >
                  <Icon name="check_circle" className="text-[22px] text-white" fill />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900">Key đã tạo thành công!</h2>
                  <p className="text-[12px] text-slate-400 mt-0.5">Copy ngay — sẽ không hiển thị lại</p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-4">
                {/* Secret key — masked + reveal + copy inline */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Secret key</p>
                    <button
                      onClick={() => setRevealShow((v) => !v)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                    >
                      <Icon name={revealShow ? 'visibility_off' : 'visibility'} className="text-[14px]" />
                      {revealShow ? 'Ẩn' : 'Hiện'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-slate-50">
                    <code className="flex-1 min-w-0 px-2.5 py-2 text-[13px] font-mono font-semibold text-slate-800 break-all select-all">
                      {revealShow ? newKeyPlain : maskKey(newKeyPlain)}
                    </code>
                    <button
                      onClick={copyNewKey}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-all ${
                        keyCopied ? 'bg-dgreal text-white' : 'bg-dgblue text-white hover:bg-dgblue/90'
                      }`}
                    >
                      <Icon name={keyCopied ? 'check' : 'content_copy'} className="text-[14px]" />
                      {keyCopied ? 'Đã copy' : 'Copy'}
                    </button>
                  </div>
                </div>
                {/* Cảnh báo 1-lần */}
                <div className="flex items-start gap-2 text-[11px] text-amber-700">
                  <Icon name="warning" className="text-[15px] text-dgwarn mt-px shrink-0" />
                  <p className="leading-relaxed">Key đầy đủ chỉ hiển thị <b>một lần</b>. Lưu vào nơi an toàn (vault / <code className="font-mono">.env</code>) — không thể xem lại sau khi đóng.</p>
                </div>
                {/* Summary chips */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    ['Tên', form.name || '—'],
                    ['Quota', fmtInt(form.quota)],
                    ['Rate limit', `${form.rpm} rpm`],
                  ].map(([l, v]) => (
                    <div key={l} className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{l}</p>
                      <p className="text-[12px] font-bold text-slate-700 mt-0.5 truncate tabular-nums">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={finishReveal}
                  className="px-6 py-2.5 rounded-xl font-semibold text-[13px] flex items-center gap-2 bg-dgblue text-white shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97] transition-all"
                >
                  <Icon name="check" className="text-[15px]" /> Xong
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
