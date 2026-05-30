'use client';

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Icon, StatPill } from '@/components/deepguard/shared';
import { DG, timeAgo, minsAgo } from '@/lib/dg';

/* ──────────────────────────────────────────────
   DeepGuard — Team & Roles (RBAC)
   Ported from frontend-claude prototype (team.jsx + data-saas.jsx).
   No backend endpoint for team membership yet → mock data is inlined below.
   TODO: backend — replace MEMBERS / PENDING_INVITES / ROLES / PERMISSIONS
   with real /tenants/{id}/members + /roles API calls once available.
   ────────────────────────────────────────────── */

/* ── Types ── */
type RoleName = 'Admin' | 'Developer' | 'Analyst' | 'Viewer';

interface RoleMeta {
  color: string;
  desc: string;
}

interface Permission {
  cap: string;
  Admin: boolean;
  Developer: boolean;
  Analyst: boolean;
  Viewer: boolean;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  status: 'active' | 'inactive';
  lastActive: string;
  initials: string;
  joined: string;
}

interface Invite {
  email: string;
  role: RoleName;
  sentAt: string;
}

/* ── Mock data (TODO: backend) ── */
const ROLES: Record<RoleName, RoleMeta> = {
  Admin: { color: '#0050cb', desc: 'Toàn quyền: quản lý tổ chức, billing, thành viên, keys' },
  Developer: { color: '#7c3aed', desc: 'Tạo & dùng API keys, xem analytics, chạy playground' },
  Analyst: { color: '#2e7d32', desc: 'Xem lịch sử, analytics, thêm ghi chú review' },
  Viewer: { color: '#64748b', desc: 'Chỉ xem dashboard & lịch sử, không chỉnh sửa' },
};
const ROLE_NAMES = Object.keys(ROLES) as RoleName[];

const PERMISSIONS: Permission[] = [
  { cap: 'Xem Dashboard & Analytics', Admin: true, Developer: true, Analyst: true, Viewer: true },
  { cap: 'Chạy Playground / Detect API', Admin: true, Developer: true, Analyst: false, Viewer: false },
  { cap: 'Quản lý API Keys', Admin: true, Developer: true, Analyst: false, Viewer: false },
  { cap: 'Thêm ghi chú review', Admin: true, Developer: true, Analyst: true, Viewer: false },
  { cap: 'Cấu hình Model & Threshold', Admin: true, Developer: false, Analyst: false, Viewer: false },
  { cap: 'Quản lý thành viên & quyền', Admin: true, Developer: false, Analyst: false, Viewer: false },
  { cap: 'Billing & subscription', Admin: true, Developer: false, Analyst: false, Viewer: false },
];

const MEMBERS: Member[] = [
  { id: 'u1', name: 'Nguyễn Văn An', email: 'an.nguyen@vietbank.vn', role: 'Admin', status: 'active', lastActive: minsAgo(4), initials: 'NA', joined: '01/01/2025' },
  { id: 'u2', name: 'Trần Thị Bình', email: 'binh.tran@vietbank.vn', role: 'Developer', status: 'active', lastActive: minsAgo(38), initials: 'TB', joined: '08/01/2025' },
  { id: 'u3', name: 'Lê Văn Cường', email: 'cuong.le@vietbank.vn', role: 'Analyst', status: 'active', lastActive: minsAgo(140), initials: 'LC', joined: '15/01/2025' },
  { id: 'u4', name: 'Phạm Thị Dung', email: 'dung.pham@vietbank.vn', role: 'Developer', status: 'active', lastActive: minsAgo(420), initials: 'PD', joined: '22/02/2025' },
  { id: 'u5', name: 'Hoàng Văn Em', email: 'em.hoang@vietbank.vn', role: 'Viewer', status: 'inactive', lastActive: minsAgo(8640), initials: 'HE', joined: '03/03/2025' },
];

const PENDING_INVITES: Invite[] = [
  { email: 'fdung@vietbank.vn', role: 'Analyst', sentAt: minsAgo(120) },
  { email: 'gminh@vietbank.vn', role: 'Developer', sentAt: minsAgo(1500) },
];

/* ── Local helper components ── */
function RoleBadge({ role }: { role: RoleName }) {
  const r = ROLES[role] ?? ROLES.Viewer;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border"
      style={{ color: r.color, background: `${r.color}10`, borderColor: `${r.color}33` }}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: Member['status'] }) {
  if (status === 'active') {
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
  onClose,
  onChangeRole,
  onSuspend,
  onRemove,
}: {
  member: Member | null;
  onClose: () => void;
  onChangeRole: (id: string, role: RoleName) => void;
  onSuspend: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  if (!member) return null;
  const caps = PERMISSIONS.filter((p) => p[member.role]);
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
              style={{ background: ROLES[member.role].color }}
            >
              {member.initials}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-slate-900 truncate">{member.name}</p>
              <p className="text-[12px] text-slate-400 truncate">{member.email}</p>
              <div className="mt-1">
                <StatusBadge status={member.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase">Hoạt động cuối</p>
              <p className="text-[13px] font-bold text-slate-700">{timeAgo(member.lastActive)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase">Tham gia</p>
              <p className="text-[13px] font-bold text-slate-700">{member.joined}</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Vai trò</p>
            <select
              value={member.role}
              onChange={(e) => onChangeRole(member.id, e.target.value as RoleName)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
              style={{ color: ROLES[member.role].color, fontWeight: 700 }}
            >
              {ROLE_NAMES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{ROLES[member.role].desc}</p>
          </div>

          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Quyền hạn ({caps.length})</p>
            <div className="space-y-1.5">
              {caps.map((c) => (
                <div key={c.cap} className="flex items-center gap-2 text-[12px] text-slate-600">
                  <Icon name="check_circle" className="text-[15px] text-dgreal" fill />
                  {c.cap}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => onSuspend(member.id)}
              className="w-full py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 text-dgwarn bg-orange-50 border-orange-200 hover:bg-orange-100"
            >
              <Icon name={member.status === 'active' ? 'pause_circle' : 'play_circle'} className="text-[16px]" />
              {member.status === 'active' ? 'Tạm ngưng truy cập' : 'Kích hoạt lại'}
            </button>
            <button
              onClick={() => onRemove(member.id)}
              className="w-full py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 text-dgfake bg-red-50 border-red-200 hover:bg-red-100"
            >
              <Icon name="person_remove" className="text-[16px]" />
              Gỡ khỏi workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [invites, setInvites] = useState<Invite[]>(PENDING_INVITES);
  const [query, setQuery] = useState('');
  const [roleF, setRoleF] = useState<'ALL' | RoleName>('ALL');
  const [tab, setTab] = useState<'members' | 'roles'>('members');
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState<{ email: string; role: RoleName }>({ email: '', role: 'Developer' });
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Member | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  const counts = useMemo<Record<'ALL' | RoleName, number>>(
    () => ({
      ALL: members.length,
      Admin: members.filter((m) => m.role === 'Admin').length,
      Developer: members.filter((m) => m.role === 'Developer').length,
      Analyst: members.filter((m) => m.role === 'Analyst').length,
      Viewer: members.filter((m) => m.role === 'Viewer').length,
    }),
    [members],
  );

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

  const invite = () => {
    if (!form.email.trim()) return;
    // TODO: backend — POST invite once /tenants/{id}/invites exists.
    setInvites((p) => [{ email: form.email.trim(), role: form.role, sentAt: new Date().toISOString() }, ...p]);
    setShowInvite(false);
    setForm({ email: '', role: 'Developer' });
  };
  const changeRole = (id: string, role: RoleName) => {
    setMembers((p) => p.map((m) => (m.id === id ? { ...m, role } : m)));
    setDetail((d) => (d && d.id === id ? { ...d, role } : d));
  };
  const removeMember = (id: string) => {
    setMembers((p) => p.filter((m) => m.id !== id));
    setDetail(null);
  };
  const toggleSuspend = (id: string) => {
    setMembers((p) =>
      p.map((m) => (m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m)),
    );
    setDetail((d) => (d && d.id === id ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' } : d));
  };

  const roleChips: { id: 'ALL' | RoleName; label: string }[] = [
    { id: 'ALL', label: 'Tất cả' },
    ...ROLE_NAMES.map((r) => ({ id: r, label: r })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 dg-rise">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Team &amp; Roles</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {members.length} thành viên · {invites.length} lời mời đang chờ
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 h-9 bg-dgblue text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
        >
          <Icon name="person_add" className="text-[16px]" /> Mời thành viên
        </button>
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 dg-rise">
        <StatPill icon="group" label="Thành viên" value={members.length} />
        <StatPill icon="bolt" label="Đang hoạt động" value={members.filter((m) => m.status === 'active').length} color={DG.real} />
        <StatPill icon="schedule_send" label="Lời mời chờ" value={invites.length} color={DG.uncertain} />
        <StatPill icon="admin_panel_settings" label="Vai trò" value={ROLE_NAMES.length} color="#7c3aed" />
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
          {/* pending invites */}
          {invites.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60 dg-rise">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Icon name="schedule_send" className="text-[15px]" /> Lời mời đang chờ ({invites.length})
              </h3>
              <div className="space-y-2">
                {invites.map((iv, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Icon name="mail" className="text-[16px] text-dgwarn" />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-700 flex-1 truncate">{iv.email}</span>
                    <RoleBadge role={iv.role} />
                    <span className="text-[10px] text-slate-400">{timeAgo(iv.sentAt)}</span>
                    <button
                      onClick={() => setInvites((p) => p.filter((x) => x !== iv))}
                      className="text-slate-400 hover:text-dgfake transition-colors"
                    >
                      <Icon name="close" className="text-[16px]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    {counts[c.id]}
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
              title="Không tìm thấy thành viên"
              desc="Thử đổi bộ lọc vai trò hoặc mời thành viên mới."
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
                    {filtered.map((m) => (
                      <tr
                        key={m.id}
                        className="data-table-row hover:bg-dgblue/[0.02] transition-colors group cursor-pointer"
                        onClick={() => setDetail(m)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                              style={{ background: ROLES[m.role].color }}
                            >
                              {m.initials}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-slate-800">{m.name}</p>
                              <p className="text-[11px] text-slate-400">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={m.role}
                            onChange={(e) => changeRole(m.id, e.target.value as RoleName)}
                            className="text-[11px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:border-dgblue"
                            style={{ color: ROLES[m.role].color }}
                          >
                            {ROLE_NAMES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={m.status} />
                        </td>
                        <td className="px-4 py-4 text-[11px] text-slate-500 font-medium">{timeAgo(m.lastActive)}</td>
                        <td className="px-4 py-4 text-[11px] text-slate-500 font-medium">{m.joined}</td>
                        <td className="px-6 py-4 text-right">
                          <Icon name="chevron_right" className="text-[18px] text-slate-300 group-hover:text-dgblue transition-colors" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* role cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 dg-rise">
            {(Object.entries(ROLES) as [RoleName, RoleMeta][]).map(([role, r]) => (
              <div key={role} className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${r.color}12` }}>
                    <Icon name="shield_person" className="text-[19px]" style={{ color: r.color }} fill />
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-800">{role}</p>
                    <p className="text-[10px] font-bold tabular-nums" style={{ color: r.color }}>
                      {members.filter((m) => m.role === role).length} thành viên
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>

          {/* permission matrix */}
          <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-rise">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Ma trận phân quyền</h2>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[640px]">
                <thead className="bg-white/60 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3.5 text-left">Khả năng</th>
                    {ROLE_NAMES.map((r) => (
                      <th key={r} className="px-4 py-3.5 text-center" style={{ color: ROLES[r].color }}>
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {PERMISSIONS.map((p) => (
                    <tr key={p.cap} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 text-[12px] font-semibold text-slate-700">{p.cap}</td>
                      {ROLE_NAMES.map((r) => (
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
        onClose={() => setDetail(null)}
        onChangeRole={changeRole}
        onSuspend={toggleSuspend}
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
              <p className="text-[11px] text-slate-400 mt-0.5">Gửi lời mời qua email vào workspace</p>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <Field label="Email" req>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ten@vietbank.vn"
                autoFocus
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
              />
            </Field>
            <Field label="Vai trò">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as RoleName })}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all"
              >
                {ROLE_NAMES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-500 leading-relaxed">{ROLES[form.role].desc}</p>
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
              disabled={!form.email.trim()}
              className="px-6 py-2.5 bg-dgblue text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg shadow-dgblue/25 hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Icon name="send" className="text-[14px]" /> Gửi lời mời
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
