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
  usersCreate,
  usersUpdate,
  usersDelete,
  usersResetPassword,
  type UserListItem,
} from '@/lib/api';

/* ──────────────────────────────────────────────
   DeepGuard — Team & Roles (RBAC)
   Wired to the real backend /users API (admin-gated):
     • usersList()   → load members
     • usersCreate() → create an ACTIVE member directly (email+name+role+password)
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

/* ── Copy-to-clipboard button (used by the temp-password panel) ── */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`h-9 px-3 rounded-lg font-bold text-[11px] flex items-center gap-1.5 shrink-0 border transition-all ${
        copied
          ? 'bg-green-50 border-green-200 text-dgreal'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
      aria-label="Sao chép mật khẩu tạm"
    >
      <Icon name={copied ? 'check' : 'content_copy'} className="text-[15px]" />
      {copied ? 'Đã chép' : 'Sao chép'}
    </button>
  );
}

/* ── One-time temp-password reveal panel (shown after a successful reset) ── */
function TempPasswordPanel({
  memberName,
  tempPassword,
  onClose,
}: {
  memberName: string;
  tempPassword: string;
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl border border-dgblue/20 bg-dgblue/[0.04] p-4 space-y-3 dg-rise">
      <div className="flex items-start gap-2">
        <Icon name="lock_reset" className="text-[18px] text-dgblue mt-0.5 shrink-0" fill />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-slate-800">
            Mật khẩu tạm cho {memberName}
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
            Cấp mật khẩu tạm này cho nhân viên. Họ sẽ buộc đổi khi đăng nhập.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Đóng"
        >
          <Icon name="close" className="text-[16px]" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] font-mono font-bold text-slate-800 tracking-wide flex items-center overflow-x-auto custom-scrollbar select-all">
          {tempPassword}
        </code>
        <CopyButton value={tempPassword} />
      </div>
      <p className="text-[10px] text-dgwarn font-semibold flex items-center gap-1.5">
        <Icon name="visibility_off" className="text-[13px]" />
        Mật khẩu này chỉ hiển thị một lần. Hãy lưu lại trước khi đóng.
      </p>
    </div>
  );
}

function MemberDrawer({
  member,
  isSelf,
  myRole,
  busy,
  resetInfo,
  onClose,
  onChangeRole,
  onToggleActive,
  onRemove,
  onResetPassword,
  onClearReset,
}: {
  member: UserListItem | null;
  isSelf: boolean;
  myRole: Role | undefined;
  busy: boolean;
  resetInfo: { id: string; name: string; tempPassword: string } | null;
  onClose: () => void;
  onChangeRole: (id: string, role: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
  onRemove: (id: string) => void;
  onResetPassword: (member: UserListItem) => void;
  onClearReset: () => void;
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

          {manageable && resetInfo && resetInfo.id === member.id && (
            <TempPasswordPanel
              memberName={resetInfo.name}
              tempPassword={resetInfo.tempPassword}
              onClose={onClearReset}
            />
          )}

          {manageable && (
            <div className="pt-2 space-y-2">
              <button
                onClick={() => onResetPassword(member)}
                disabled={controlsDisabled}
                className="w-full py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 text-dgblue bg-dgblue/[0.05] border-dgblue/20 hover:bg-dgblue/[0.09] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-dgblue/[0.05]"
              >
                <Icon name="lock_reset" className="text-[16px]" />
                Đặt lại mật khẩu
              </button>
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

/* ── Strong random password generator (for direct-create employee accounts) ── */
function genPassword(len = 16): string {
  const sets = {
    lower: 'abcdefghijkmnpqrstuvwxyz',
    upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
    digit: '23456789',
    sym: '!@#$%^&*?-_=+',
  };
  const all = sets.lower + sets.upper + sets.digit + sets.sym;
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  const pick = (pool: string, n: number) => pool[n % pool.length];
  // Guarantee at least one char from each class, then fill the rest.
  const chars = [
    pick(sets.lower, buf[0]),
    pick(sets.upper, buf[1]),
    pick(sets.digit, buf[2]),
    pick(sets.sym, buf[3]),
  ];
  for (let i = 4; i < len; i++) chars.push(pick(all, buf[i]));
  // Shuffle (Fisher–Yates) so the mandatory chars are not always at the front.
  const shuf = new Uint32Array(chars.length);
  crypto.getRandomValues(shuf);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuf[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

/* ── Page ── */
export default function TeamPage() {
  const currentUser = useAuthStore((s) => s.user);
  const myRole = useAuthStore((s) => s.user?.role) as Role | undefined;
  const orgName = useAuthStore((s) => s.tenant?.name);
  const myId = useAuthStore((s) => s.user?.id);

  /* Roles this actor may assign when creating an employee (admin → 4, sysadmin → all 5). */
  const assignRoles = useMemo(() => assignableRoles(myRole), [myRole]);

  const [members, setMembers] = useState<UserListItem[]>([]);
  const [query, setQuery] = useState('');
  const [roleF, setRoleF] = useState<'ALL' | RoleName>('ALL');
  const [tab, setTab] = useState<'members' | 'roles'>('members');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<{ email: string; name: string; role: RoleName; password: string }>({
    email: '',
    name: '',
    role: 'developer',
    password: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<UserListItem | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);
  /* One-time temp password revealed after a successful reset (kept until dismissed). */
  const [resetInfo, setResetInfo] = useState<{ id: string; name: string; tempPassword: string } | null>(null);
  /* Member pending a reset confirmation, if any. */
  const [resetConfirm, setResetConfirm] = useState<UserListItem | null>(null);

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

  const openCreate = () => {
    setForm({ email: '', name: '', role: 'developer', password: '' });
    setFormError(null);
    setShowPwd(false);
    setShowCreate(true);
  };

  const fillRandomPassword = () => {
    setForm((f) => ({ ...f, password: genPassword() }));
    setShowPwd(true); // reveal so the admin can copy/send it to the employee
  };

  const createMember = async () => {
    if (busy) return;
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;
    // Client-side validation before hitting the backend.
    if (!name) return setFormError('Vui lòng nhập họ tên.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFormError('Email không hợp lệ.');
    if (password.length < 8) return setFormError('Mật khẩu phải có ít nhất 8 ký tự.');

    setBusy(true);
    setFormError(null);
    try {
      const created = await usersCreate(email, name, form.role, password);
      setShowCreate(false);
      setForm({ email: '', name: '', role: 'developer', password: '' });
      setCreatedName(created.name || created.email);
      setTimeout(() => setCreatedName(null), 4000);
      await load();
    } catch (e) {
      // Surface backend errors inline (409 email exists, 403 role above level) without crashing.
      const msg = e instanceof Error ? e.message : '';
      if (/409|exist|tồn tại|đã được/i.test(msg)) {
        setFormError('Email này đã tồn tại trong tổ chức.');
      } else if (/403|forbidden|permission|quyền/i.test(msg)) {
        setFormError('Bạn không thể tạo nhân viên có vai trò cao hơn vai trò của mình.');
      } else {
        setFormError(msg || 'Tạo nhân viên thất bại.');
      }
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

  /* Open the confirm dialog; gating mirrors edit/delete (manageable + not self). */
  const requestReset = (member: UserListItem) => {
    if (isSelf(member.id) || !canManageUser(myRole, member.role)) return;
    setResetInfo(null);
    setResetConfirm(member);
  };

  /* Perform the reset → reveal the one-time temp password in the drawer panel. */
  const confirmReset = async () => {
    const member = resetConfirm;
    if (!member || busy) return;
    if (isSelf(member.id) || !canManageUser(myRole, member.role)) return;
    setBusy(true);
    setError(null);
    try {
      const { temp_password } = await usersResetPassword(member.id);
      setResetConfirm(null);
      setResetInfo({ id: member.id, name: member.name || member.email, tempPassword: temp_password });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setResetConfirm(null);
      if (/403|forbidden|permission|quyền/i.test(msg)) {
        setError('Bạn không có quyền đặt lại mật khẩu cho thành viên này.');
      } else {
        setError(msg || 'Đặt lại mật khẩu thất bại.');
      }
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
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Team &amp; Roles</h1>
            {orgName && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                style={{ background: 'rgba(0,80,203,0.08)', color: '#0047cc' }}
              >
                <Icon name="domain" className="text-[14px]" /> {orgName}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Thành viên trong tổ chức này · {members.length} người · {activeCount} đang hoạt động
          </p>
        </div>
        <button
          data-tour="tm-add"
          onClick={openCreate}
          className="px-4 h-9 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
        >
          <Icon name="person_add" className="text-[16px]" /> Thêm nhân viên
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

      {createdName && (
        <div className="glass-panel rounded-xl px-4 py-3 border border-green-200 bg-green-50/70 flex items-center gap-2 dg-rise">
          <Icon name="check_circle" className="text-[18px] text-dgreal" fill />
          <span className="text-[12px] font-semibold text-dgreal flex-1">
            Đã thêm nhân viên {createdName} vào workspace.
          </span>
          <button onClick={() => setCreatedName(null)} className="text-dgreal/60 hover:text-dgreal">
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
      <div data-tour="tm-tabs" className="flex items-center gap-1 dg-rise">
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
                  ? 'Thêm nhân viên đầu tiên vào workspace của bạn.'
                  : 'Thử đổi bộ lọc vai trò hoặc thêm nhân viên mới.'
              }
              action="Thêm nhân viên"
              onAction={openCreate}
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
                            <div className="flex items-center justify-end gap-1">
                              {manageable && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetail(m);
                                    requestReset(m);
                                  }}
                                  disabled={busy}
                                  title="Đặt lại mật khẩu"
                                  aria-label={`Đặt lại mật khẩu cho ${m.name || m.email}`}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-dgblue hover:bg-dgblue/[0.06] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Icon name="lock_reset" className="text-[18px]" />
                                </button>
                              )}
                              <Icon name="chevron_right" className="text-[18px] text-slate-300 group-hover:text-dgblue transition-colors" />
                            </div>
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
        resetInfo={resetInfo}
        onClose={() => {
          setDetail(null);
          setResetInfo(null);
        }}
        onChangeRole={changeRole}
        onToggleActive={toggleActive}
        onRemove={removeMember}
        onResetPassword={requestReset}
        onClearReset={() => setResetInfo(null)}
      />

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dgblue/[0.06] flex items-center justify-center">
              <Icon name="person_add" className="text-[20px] text-dgblue" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Thêm nhân viên</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Tạo tài khoản và cấp quyền truy cập ngay</p>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            {formError && (
              <div className="rounded-xl px-3 py-2.5 border border-red-200 bg-red-50/70 flex items-center gap-2">
                <Icon name="error" className="text-[16px] text-dgfake" />
                <span className="text-[11px] font-semibold text-dgfake">{formError}</span>
              </div>
            )}
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
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ten@example.com"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
              />
            </Field>
            <Field label="Vai trò">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as RoleName })}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
              >
                {/* Actor can never assign a role above their own level (admin can't create sysadmin). */}
                {assignRoles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mật khẩu" req>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Tối thiểu 8 ký tự"
                    autoComplete="new-password"
                    className="w-full h-10 pl-3 pr-10 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <Icon name={showPwd ? 'visibility_off' : 'visibility'} className="text-[18px]" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={fillRandomPassword}
                  className="h-10 px-3 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[11px] flex items-center gap-1.5 hover:bg-slate-50 transition-all shrink-0"
                >
                  <Icon name="casino" className="text-[15px]" />
                  Tạo ngẫu nhiên
                </button>
              </div>
            </Field>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <p className="text-[11px] text-slate-500 leading-relaxed">{roleMeta(form.role).desc}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-1.5">
                <Icon name="info" className="text-[14px] text-slate-300 mt-0.5 shrink-0" />
                Mật khẩu sẽ được cấp cho nhân viên; họ nên đổi sau khi đăng nhập.
              </p>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={createMember}
              disabled={!form.name.trim() || !form.email.trim() || form.password.length < 8 || busy}
              className="px-6 py-2.5 bg-dgblue text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Icon name={busy ? 'progress_activity' : 'person_add'} className={`text-[14px] ${busy ? 'animate-spin' : ''}`} />
              {busy ? 'Đang tạo…' : 'Tạo nhân viên'}
            </button>
          </div>
        </Modal>
      )}

      {resetConfirm && (
        <Modal onClose={() => !busy && setResetConfirm(null)}>
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dgblue/[0.06] flex items-center justify-center">
              <Icon name="lock_reset" className="text-[20px] text-dgblue" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Đặt lại mật khẩu</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {resetConfirm.name || resetConfirm.email}
              </p>
            </div>
          </div>
          <div className="px-6 py-5 space-y-3">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Hệ thống sẽ tạo một <strong className="font-bold text-slate-800">mật khẩu tạm</strong> dùng một lần
              cho thành viên này. Mật khẩu hiện tại của họ sẽ ngừng hoạt động.
            </p>
            <p className="text-[12px] text-slate-500 leading-relaxed flex items-start gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Icon name="info" className="text-[15px] text-slate-300 mt-0.5 shrink-0" />
              Cấp mật khẩu tạm này cho nhân viên. Họ sẽ buộc đổi khi đăng nhập. Mật khẩu chỉ hiển thị một lần.
            </p>
          </div>
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={() => setResetConfirm(null)}
              disabled={busy}
              className="px-5 py-2.5 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={confirmReset}
              disabled={busy}
              className="px-6 py-2.5 bg-dgblue text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Icon name={busy ? 'progress_activity' : 'lock_reset'} className={`text-[14px] ${busy ? 'animate-spin' : ''}`} />
              {busy ? 'Đang xử lý…' : 'Đặt lại mật khẩu'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
