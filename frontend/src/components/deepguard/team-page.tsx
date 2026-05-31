'use client';

import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { Icon, StatPill } from '@/components/deepguard/shared';
import { DG, timeAgo } from '@/lib/dg';
import { useAuthStore } from '@/store/auth';
import {
  canManageUser,
  assignableRoles,
  ROLE_LABEL,
  type Role,
} from '@/lib/rbac';
import {
  usersList,
  usersInvite,
  usersUpdate,
  usersDelete,
  type UserListItem,
  type InviteUserResponse,
} from '@/lib/api';

/* ──────────────────────────────────────────────
   DeepGuard — Team & Roles (RBAC)
   Wired to the real backend /users API (admin-gated):
     • usersList()   → load members
     • usersInvite() → invite a new member (returns invite_url/token)
     • usersUpdate() → change role / activate-deactivate
     • usersDelete() → remove (soft-delete) a member
   The ROLES / PERMISSIONS matrix below is STATIC descriptive reference
   content only — it documents what each backend role can do; it is not
   fetched from the backend.
   ────────────────────────────────────────────── */

/* ── Backend role names (deepguard_db UserRole enum) — mirrors rbac `Role`. ── */
type RoleName = Role;

interface RoleMeta {
  color: string;
  desc: string;
}

/* ── Static reference: per-role color + description (labels come from ROLE_LABEL). ── */
const ROLES: Record<RoleName, RoleMeta> = {
  sysadmin: { color: '#be123c', desc: 'Vận hành nền tảng DeepGuard (xuyên tenant), toàn quyền hệ thống' },
  admin: { color: '#0050cb', desc: 'Toàn quyền: quản lý tổ chức, billing, thành viên, keys' },
  developer: { color: '#7c3aed', desc: 'Tạo & dùng API keys, xem analytics, chạy playground' },
  compliance: { color: '#2e7d32', desc: 'Xem lịch sử, analytics, audit logs, thêm ghi chú review' },
  viewer: { color: '#64748b', desc: 'Chỉ xem dashboard & lịch sử, không chỉnh sửa' },
};

/** Resolve role label + metadata defensively for any role string the backend returns. */
function roleMeta(role: string): RoleMeta & { label: string } {
  const meta = ROLES[role as RoleName];
  return {
    label: ROLE_LABEL[role as RoleName] ?? role,
    color: meta?.color ?? '#64748b',
    desc: meta?.desc ?? '',
  };
}

/* Roles shown across the descriptive reference matrix / role chips (all 5). */
const MATRIX_ROLES: RoleName[] = ['sysadmin', 'admin', 'developer', 'compliance', 'viewer'];

interface Permission {
  cap: string;
  sysadmin: boolean;
  admin: boolean;
  developer: boolean;
  compliance: boolean;
  viewer: boolean;
}

const PERMISSIONS: Permission[] = [
  { cap: 'Xem Dashboard & Analytics', sysadmin: true, admin: true, developer: true, compliance: true, viewer: true },
  { cap: 'Chạy Playground / Detect API', sysadmin: true, admin: true, developer: true, compliance: false, viewer: false },
  { cap: 'Quản lý API Keys', sysadmin: true, admin: true, developer: true, compliance: false, viewer: false },
  { cap: 'Thêm ghi chú review', sysadmin: true, admin: true, developer: true, compliance: true, viewer: false },
  { cap: 'Cấu hình Model & Threshold', sysadmin: true, admin: true, developer: false, compliance: false, viewer: false },
  { cap: 'Quản lý thành viên & quyền', sysadmin: true, admin: true, developer: false, compliance: false, viewer: false },
  { cap: 'Billing & subscription', sysadmin: false, admin: true, developer: false, compliance: false, viewer: false },
  { cap: 'Quản trị nền tảng (xuyên tenant)', sysadmin: true, admin: false, developer: false, compliance: false, viewer: false },
];

/* ── Helpers ── */
function initialsOf(name: string, email: string): string {
  const src = (name || email || '?').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

/* ── Local helper components ── */
function RoleBadge({ role }: { role: string }) {
  const r = roleMeta(role);
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border"
      style={{ color: r.color, background: `${r.color}10`, borderColor: `${r.color}33` }}
    >
      {r.label}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-dgreal">
        <span className="w-1.5 h-1.5 rounded-full bg-dgreal animate-pulse" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
      Inactive
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
    <div className="glass-panel rounded-2xl py-16 px-6 shadow-sm border border-white/60 flex flex-col items-center text-center dg-rise">
      <span className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon name={icon} className="text-[28px] text-slate-300" />
      </span>
      <p className="text-sm font-black text-slate-700">{title}</p>
      <p className="text-[12px] text-slate-400 mt-1 max-w-xs">{desc}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 h-9 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.03] active:scale-[0.97] transition-all"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dg-fade" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'dg-rise .28s cubic-bezier(.22,1,.36,1) both' }}
      >
        {children}
      </div>
    </div>
  );
}

function Field({ label, req, children }: { label: string; req?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 inline-flex items-center gap-1">
        {label}
        {req && <span className="text-dgfake">*</span>}
      </span>
      {children}
    </label>
  );
}

function MemberDrawer({
  member,
  isSelf,
  myRole,
  busy,
  onClose,
  onChangeRole,
  onToggleActive,
  onRemove,
}: {
  member: UserListItem | null;
  isSelf: boolean;
  myRole: Role | undefined;
  busy: boolean;
  onClose: () => void;
  onChangeRole: (id: string, role: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
  onRemove: (id: string) => void;
}) {
  if (!member) return null;
  const meta = roleMeta(member.role);
  const key = member.role as keyof Permission;
  const caps = PERMISSIONS.filter(
    (p) => p[key as 'sysadmin' | 'admin' | 'developer' | 'compliance' | 'viewer'],
  );
  /* Can the current actor manage this member at all? (never self, never higher rank) */
  const manageable = !isSelf && canManageUser(myRole, member.role);
  const options = assignableRoles(myRole);
  const roleInOptions = options.some((r) => r === member.role);
  /* All write controls require manage rights; self-protection handled by `manageable`. */
  const controlsDisabled = !manageable || busy;
  return (
    <div className="fixed inset-0 z-[55] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dg-fade" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md h-full bg-white/90 backdrop-blur-xl border-l border-white shadow-2xl overflow-y-auto custom-scrollbar"
        style={{ animation: 'dg-rise .32s cubic-bezier(.22,1,.36,1) both' }}
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-sm font-black text-slate-900">Chi tiết thành viên</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
              style={{ background: meta.color }}
            >
              {initialsOf(member.name, member.email)}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-slate-900 truncate">{member.name}</p>
              <p className="text-[12px] text-slate-400 truncate">{member.email}</p>
              <div className="mt-1">
                <StatusBadge active={member.is_active} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase">Hoạt động cuối</p>
              <p className="text-[13px] font-bold text-slate-700">
                {member.last_login_at ? timeAgo(member.last_login_at) : 'Chưa đăng nhập'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase">Tham gia</p>
              <p className="text-[13px] font-bold text-slate-700">
                {new Date(member.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Vai trò</p>
            {manageable && roleInOptions ? (
              <select
                value={member.role}
                disabled={busy}
                onChange={(e) => onChangeRole(member.id, e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: meta.color, fontWeight: 700 }}
              >
                {options.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            ) : (
              /* Not manageable (higher rank / self / actor not admin) → static badge of ACTUAL role. */
              <div className="flex items-center gap-2">
                <RoleBadge role={member.role} />
                <Icon name="lock" className="text-[14px] text-slate-300" />
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{meta.desc}</p>
            {isSelf && (
              <p className="text-[11px] text-dgwarn mt-1.5 font-semibold">
                Không thể đổi vai trò của chính bạn.
              </p>
            )}
            {!isSelf && !manageable && (
              <p className="text-[11px] text-dgwarn mt-1.5 font-semibold">
                Bạn không thể quản lý thành viên có vai trò cao hơn.
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
              Quyền hạn ({caps.length}) · tham khảo
            </p>
            <div className="space-y-1.5">
              {caps.map((c) => (
                <div key={c.cap} className="flex items-center gap-2 text-[12px] text-slate-600">
                  <Icon name="check_circle" className="text-[15px] text-dgreal" fill />
                  {c.cap}
                </div>
              ))}
            </div>
          </div>

          {manageable && (
            <div className="pt-2 space-y-2">
              <button
                onClick={() => onToggleActive(member.id, !member.is_active)}
                disabled={controlsDisabled}
                className="w-full py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 text-dgwarn bg-orange-50 border-orange-200 hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-50"
              >
                <Icon name={member.is_active ? 'pause_circle' : 'play_circle'} className="text-[16px]" />
                {member.is_active ? 'Tạm ngưng truy cập' : 'Kích hoạt lại'}
              </button>
              <button
                onClick={() => onRemove(member.id)}
                disabled={controlsDisabled}
                className="w-full py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 text-dgfake bg-red-50 border-red-200 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50"
              >
                <Icon name="person_remove" className="text-[16px]" />
                Gỡ khỏi workspace
              </button>
            </div>
          )}
          {isSelf && (
            <p className="text-[11px] text-slate-400 text-center pt-2">
              Bạn không thể tạm ngưng hoặc gỡ chính mình.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Invite success result (shows returned token / invite_url) ── */
function InviteResult({ result, onClose }: { result: InviteUserResponse; onClose: () => void }) {
  const [copied, setCopied] = useState<'url' | 'token' | null>(null);
  const copy = (kind: 'url' | 'token', value: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 1600);
    });
  };
  return (
    <Modal onClose={onClose}>
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-dgreal/[0.08] flex items-center justify-center">
          <Icon name="mark_email_read" className="text-[20px] text-dgreal" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900">Đã tạo lời mời</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Gửi link dưới đây cho {result.email} để hoàn tất đăng ký
          </p>
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="flex items-center gap-2">
          <RoleBadge role={result.role} />
          <span className="text-[11px] text-slate-400">
            Hết hạn {new Date(result.expires_at).toLocaleString('vi-VN')}
          </span>
        </div>

        <Field label="Invite URL">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={result.invite_url}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20"
            />
            <button
              onClick={() => copy('url', result.invite_url)}
              className="h-10 px-3 bg-dgblue text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.97] transition-all shrink-0"
            >
              <Icon name={copied === 'url' ? 'check' : 'content_copy'} className="text-[15px]" />
              {copied === 'url' ? 'Đã copy' : 'Copy'}
            </button>
          </div>
        </Field>

        <Field label="Token">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={result.token}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20"
            />
            <button
              onClick={() => copy('token', result.token)}
              className="h-10 px-3 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[11px] flex items-center gap-1.5 hover:bg-slate-50 transition-all shrink-0"
            >
              <Icon name={copied === 'token' ? 'check' : 'content_copy'} className="text-[15px]" />
              {copied === 'token' ? 'Đã copy' : 'Copy'}
            </button>
          </div>
        </Field>
      </div>
      <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-dgblue text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97] transition-all"
        >
          Xong
        </button>
      </div>
    </Modal>
  );
}

/* ── Page ── */
export default function TeamPage() {
  const currentUser = useAuthStore((s) => s.user);
  const myRole = useAuthStore((s) => s.user?.role) as Role | undefined;
  const myId = useAuthStore((s) => s.user?.id);

  /* Roles this actor may invite/assign (admin → 4, sysadmin → all 5). */
  const inviteRoles = useMemo(() => assignableRoles(myRole), [myRole]);

  const [members, setMembers] = useState<UserListItem[]>([]);
  const [query, setQuery] = useState('');
  const [roleF, setRoleF] = useState<'ALL' | RoleName>('ALL');
  const [tab, setTab] = useState<'members' | 'roles'>('members');
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState<{ email: string; name: string; role: RoleName }>({
    email: '',
    name: '',
    role: 'developer',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<UserListItem | null>(null);
  const [inviteResult, setInviteResult] = useState<InviteUserResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersList();
      setMembers(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được danh sách thành viên');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isSelf = useCallback((id: string) => !!currentUser && currentUser.id === id, [currentUser]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: members.length };
    for (const r of MATRIX_ROLES) c[r] = members.filter((m) => m.role === r).length;
    return c;
  }, [members]);

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          (roleF === 'ALL' || m.role === roleF) &&
          (query === '' ||
            m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.email.toLowerCase().includes(query.toLowerCase())),
      ),
    [members, roleF, query],
  );

  const invite = async () => {
    if (!form.email.trim() || !form.name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await usersInvite(form.email.trim(), form.name.trim(), form.role);
      setShowInvite(false);
      setForm({ email: '', name: '', role: 'developer' });
      setInviteResult(res);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mời thành viên thất bại');
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (id: string, role: string) => {
    if (isSelf(id) || busy) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await usersUpdate(id, { role });
      setMembers((p) => p.map((m) => (m.id === id ? updated : m)));
      setDetail((d) => (d && d.id === id ? updated : d));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đổi vai trò thất bại');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (id: string, next: boolean) => {
    if (isSelf(id) || busy) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await usersUpdate(id, { is_active: next });
      setMembers((p) => p.map((m) => (m.id === id ? updated : m)));
      setDetail((d) => (d && d.id === id ? updated : d));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật trạng thái thất bại');
    } finally {
      setBusy(false);
    }
  };

  const removeMember = async (id: string) => {
    if (isSelf(id) || busy) return;
    setBusy(true);
    setError(null);
    try {
      await usersDelete(id);
      setDetail(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gỡ thành viên thất bại');
    } finally {
      setBusy(false);
    }
  };

  const roleChips: { id: 'ALL' | RoleName; label: string }[] = [
    { id: 'ALL', label: 'Tất cả' },
    ...MATRIX_ROLES.map((r) => ({ id: r, label: ROLE_LABEL[r] })),
  ];

  const activeCount = members.filter((m) => m.is_active).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 dg-rise">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Team &amp; Roles</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {members.length} thành viên · {activeCount} đang hoạt động
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 h-9 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
        >
          <Icon name="person_add" className="text-[16px]" /> Mời thành viên
        </button>
      </div>

      {error && (
        <div className="glass-panel rounded-xl px-4 py-3 border border-red-200 bg-red-50/70 flex items-center gap-2 dg-rise">
          <Icon name="error" className="text-[18px] text-dgfake" />
          <span className="text-[12px] font-semibold text-dgfake flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-dgfake/60 hover:text-dgfake">
            <Icon name="close" className="text-[16px]" />
          </button>
        </div>
      )}

      {/* quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 dg-rise">
        <StatPill icon="group" label="Thành viên" value={members.length} />
        <StatPill icon="bolt" label="Đang hoạt động" value={activeCount} color={DG.real} />
        <StatPill icon="block" label="Tạm ngưng" value={members.length - activeCount} color={DG.uncertain} />
        <StatPill icon="admin_panel_settings" label="Vai trò" value={MATRIX_ROLES.length} color="#7c3aed" />
      </div>

      {/* tabs */}
      <div className="flex items-center gap-1 dg-rise">
        {(
          [
            ['members', 'Thành viên', 'group'],
            ['roles', 'Vai trò & quyền', 'admin_panel_settings'],
          ] as const
        ).map(([id, l, ic]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold transition-all ${
              tab === id ? 'bg-white text-dgblue shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon name={ic} className="text-[17px]" />
            {l}
          </button>
        ))}
      </div>

      {tab === 'members' ? (
        <>
          {/* filter */}
          <div className="glass-panel rounded-2xl p-4 shadow-sm border border-white/60 dg-rise flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm tên, email…"
                className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {roleChips.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setRoleF(c.id)}
                  className={`px-3 h-9 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                    roleF === c.id
                      ? 'bg-dgblue text-white border-transparent shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {c.label}
                  <span
                    className={`text-[9px] tabular-nums px-1 rounded ${
                      roleF === c.id ? 'bg-white/20' : 'bg-slate-100'
                    }`}
                  >
                    {counts[c.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* members table */}
          {loading ? (
            <div className="glass-panel rounded-2xl p-4 shadow-sm border border-white/60 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-3 flex-1 rounded bg-slate-100 animate-pulse" />
                  <div className="h-5 w-20 rounded bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <StateBlock
              icon="person_search"
              title={members.length === 0 ? 'Chưa có thành viên' : 'Không tìm thấy thành viên'}
              desc={
                members.length === 0
                  ? 'Mời thành viên đầu tiên vào workspace của bạn.'
                  : 'Thử đổi bộ lọc vai trò hoặc mời thành viên mới.'
              }
              action="Mời thành viên"
              onAction={() => setShowInvite(true)}
            />
          ) : (
            <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-rise">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-white/60 border-b border-slate-100">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                      <th className="px-6 py-3.5">Thành viên</th>
                      <th className="px-4 py-3.5">Vai trò</th>
                      <th className="px-4 py-3.5">Trạng thái</th>
                      <th className="px-4 py-3.5">Hoạt động cuối</th>
                      <th className="px-4 py-3.5">Tham gia</th>
                      <th className="px-6 py-3.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((m) => {
                      const meta = roleMeta(m.role);
                      const self = isSelf(m.id);
                      /* Manageable = actor outranks-or-equals target AND it's not the actor's own row. */
                      const manageable = canManageUser(myRole, m.role) && m.id !== myId;
                      const rowOptions = assignableRoles(myRole);
                      const roleInOptions = rowOptions.some((r) => r === m.role);
                      return (
                        <tr
                          key={m.id}
                          className="data-table-row hover:bg-dgblue/[0.02] transition-colors group cursor-pointer"
                          onClick={() => setDetail(m)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                                style={{ background: meta.color }}
                              >
                                {initialsOf(m.name, m.email)}
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                                  {m.name}
                                  {self && (
                                    <span className="text-[9px] font-black text-dgblue bg-dgblue/[0.08] px-1.5 py-0.5 rounded">
                                      BẠN
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400">{m.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                            {manageable && roleInOptions ? (
                              <select
                                value={m.role}
                                disabled={busy}
                                onChange={(e) => changeRole(m.id, e.target.value)}
                                className="text-[11px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:border-dgblue disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ color: meta.color }}
                              >
                                {rowOptions.map((r) => (
                                  <option key={r} value={r}>
                                    {ROLE_LABEL[r]}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              /* Higher-ranked member, self, or actor lacks rights → static badge of ACTUAL role. */
                              <RoleBadge role={m.role} />
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge active={m.is_active} />
                          </td>
                          <td className="px-4 py-4 text-[11px] text-slate-500 font-medium">
                            {m.last_login_at ? timeAgo(m.last_login_at) : '—'}
                          </td>
                          <td className="px-4 py-4 text-[11px] text-slate-500 font-medium">
                            {new Date(m.created_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Icon name="chevron_right" className="text-[18px] text-slate-300 group-hover:text-dgblue transition-colors" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* role cards (descriptive reference) */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 dg-rise">
            <Icon name="info" className="text-[15px]" />
            Bảng dưới là tài liệu tham khảo về vai trò &amp; quyền — không phải cấu hình động từ backend.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 dg-rise">
            {MATRIX_ROLES.map((role) => {
              const r = ROLES[role];
              return (
                <div key={role} className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${r.color}12` }}>
                      <Icon name="shield_person" className="text-[19px]" style={{ color: r.color }} fill />
                    </span>
                    <div>
                      <p className="text-sm font-black text-slate-800">{ROLE_LABEL[role]}</p>
                      <p className="text-[10px] font-bold tabular-nums" style={{ color: r.color }}>
                        {members.filter((m) => m.role === role).length} thành viên
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>

          {/* permission matrix (descriptive reference) */}
          <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-rise">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Ma trận phân quyền</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Tham khảo · mô tả khả năng theo từng vai trò</p>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[640px]">
                <thead className="bg-white/60 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3.5 text-left">Khả năng</th>
                    {MATRIX_ROLES.map((r) => (
                      <th key={r} className="px-4 py-3.5 text-center" style={{ color: ROLES[r].color }}>
                        {ROLE_LABEL[r]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {PERMISSIONS.map((p) => (
                    <tr key={p.cap} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 text-[12px] font-semibold text-slate-700">{p.cap}</td>
                      {MATRIX_ROLES.map((r) => (
                        <td key={r} className="px-4 py-3 text-center">
                          {p[r] ? (
                            <Icon name="check_circle" className="text-[18px] text-dgreal" fill />
                          ) : (
                            <Icon name="remove" className="text-[16px] text-slate-300" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <MemberDrawer
        member={detail}
        isSelf={detail ? isSelf(detail.id) : false}
        myRole={myRole}
        busy={busy}
        onClose={() => setDetail(null)}
        onChangeRole={changeRole}
        onToggleActive={toggleActive}
        onRemove={removeMember}
      />

      {showInvite && (
        <Modal onClose={() => setShowInvite(false)}>
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dgblue/[0.06] flex items-center justify-center">
              <Icon name="person_add" className="text-[20px] text-dgblue" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Mời thành viên</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Tạo lời mời vào workspace</p>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <Field label="Họ tên" req>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nguyễn Văn A"
                autoFocus
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
              />
            </Field>
            <Field label="Email" req>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ten@vietbank.vn"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
              />
            </Field>
            <Field label="Vai trò">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as RoleName })}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
              >
                {/* Actor can never invite a role above their own level (admin can't invite sysadmin). */}
                {inviteRoles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </Field>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-500 leading-relaxed">{roleMeta(form.role).desc}</p>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowInvite(false)}
              className="px-5 py-2.5 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={invite}
              disabled={!form.email.trim() || !form.name.trim() || busy}
              className="px-6 py-2.5 bg-dgblue text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Icon name={busy ? 'progress_activity' : 'send'} className={`text-[14px] ${busy ? 'animate-spin' : ''}`} />
              {busy ? 'Đang gửi…' : 'Gửi lời mời'}
            </button>
          </div>
        </Modal>
      )}

      {inviteResult && <InviteResult result={inviteResult} onClose={() => setInviteResult(null)} />}
    </div>
  );
}
