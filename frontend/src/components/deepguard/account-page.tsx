'use client';

/* ──────────────────────────────────────────────
   DeepGuard — Tài khoản cá nhân (profile, mật khẩu & bảo mật)
   Profile header reads the REAL signed-in user from useAuthStore().
   All editable forms are LOCAL STATE only (no backend endpoint exists).
   ────────────────────────────────────────────── */

import { useState, useEffect, type ReactNode } from 'react';
import { Icon } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';
import { useAuthStore } from '@/store/auth';

const INPUT =
  'w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all';

/* ── Local form field ── */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</span>
      {children}
    </label>
  );
}

/* ── Role badge (mirrors prototype) ── */
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    Admin: { color: DG.primary, bg: '#eff6ff', border: '#bfdbfe' },
    Analyst: { color: DG.uncertain, bg: '#fff7ed', border: '#fed7aa' },
    Viewer: { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' },
  };
  const s = map[role] ?? map.Viewer;
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      {role}
    </span>
  );
}

/* ── Setting row (icon + title/desc + action) ── */
function SettingRow({
  icon,
  title,
  desc,
  children,
}: {
  icon?: string;
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0 border-b border-slate-100 last:border-0">
      {icon && (
        <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 text-slate-500">
          <Icon name={icon} className="text-[18px]" />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-800">{title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

interface ProfileInfo {
  name: string;
  email: string;
  phone: string;
  title: string;
  dept: string;
  tz: string;
}

export default function AccountPage() {
  // Real signed-in user for the profile header.
  const user = useAuthStore((s) => s.user);
  const tenant = useAuthStore((s) => s.tenant);

  // Editable forms — LOCAL STATE only. // TODO: backend — no dedicated endpoint yet.
  const [info, setInfo] = useState<ProfileInfo>({
    name: user?.name ?? 'Người dùng',
    email: user?.email ?? '',
    phone: '+84 912 345 678',
    title: 'Lead Engineer',
    dept: tenant?.name ?? 'Risk & Fraud',
    tz: 'Asia/Ho_Chi_Minh',
  });
  const [draft, setDraft] = useState<ProfileInfo>(info);
  const [pwd, setPwd] = useState({ cur: '', next: '', confirm: '' });
  const [twofa, setTwofa] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Sync header/form with the real user once auth hydrates from storage.
  useEffect(() => {
    if (!user) return;
    const next: ProfileInfo = {
      name: user.name,
      email: user.email,
      phone: '+84 912 345 678',
      title: 'Lead Engineer',
      dept: tenant?.name ?? 'Risk & Fraud',
      tz: 'Asia/Ho_Chi_Minh',
    };
    setInfo(next);
    setDraft(next);
     
  }, [user?.email, tenant?.name]);

  const onToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin';
  const dirty = JSON.stringify(info) !== JSON.stringify(draft);
  const initials =
    info.name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase() || 'DG';

  const pwdStrength =
    pwd.next.length === 0
      ? 0
      : pwd.next.length < 8
        ? 1
        : /[A-Z]/.test(pwd.next) && /\d/.test(pwd.next) && pwd.next.length >= 12
          ? 3
          : 2;
  const strengthLabel = ['', 'Yếu', 'Khá', 'Mạnh'][pwdStrength];
  const strengthColor = ['#e2e8f0', DG.fake, DG.uncertain, DG.real][pwdStrength];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="dg-rise">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Tài khoản cá nhân</h1>
        <p className="text-sm text-slate-500 mt-0.5">Quản lý thông tin cá nhân, mật khẩu &amp; bảo mật tài khoản</p>
      </div>

      {/* profile header — real signed-in user */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise flex flex-wrap items-center gap-5">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg,#0050cb,#7c3aed)' }}
          >
            {initials}
          </div>
          <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-500 hover:text-dgblue transition-colors">
            <Icon name="photo_camera" className="text-[15px]" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black text-slate-900">{info.name}</h2>
            <RoleBadge role={role} />
          </div>
          <p className="text-sm text-slate-500">
            {info.title} · {tenant?.name ?? info.dept}
            {tenant?.plan ? ` · ${tenant.plan}` : ''}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-dgreal animate-pulse" />
            Đang hoạt động · {info.email}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thành viên từ</span>
          <span className="text-sm font-black text-slate-700 tabular-nums">01/01/2025</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* personal info — local state */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
          <h2 className="text-base font-black text-slate-900 mb-5">Thông tin cá nhân</h2>
          <div className="space-y-4">
            <Field label="Họ và tên">
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={INPUT} />
            </Field>
            <Field label="Email">
              <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={INPUT} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Số điện thoại">
                <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={INPUT} />
              </Field>
              <Field label="Chức danh">
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={INPUT} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phòng ban">
                <input value={draft.dept} onChange={(e) => setDraft({ ...draft, dept: e.target.value })} className={INPUT} />
              </Field>
              <Field label="Múi giờ">
                <select value={draft.tz} onChange={(e) => setDraft({ ...draft, tz: e.target.value })} className={INPUT}>
                  <option>Asia/Ho_Chi_Minh</option>
                  <option>Asia/Bangkok</option>
                  <option>UTC</option>
                </select>
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => setDraft(info)}
              disabled={!dirty}
              className="px-4 py-2.5 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Hoàn tác
            </button>
            <button
              onClick={() => {
                // TODO: backend — persist personal info once an endpoint exists.
                setInfo(draft);
                onToast('Đã lưu thông tin cá nhân');
              }}
              disabled={!dirty}
              className="px-5 py-2.5 bg-dgblue text-white rounded-xl font-bold text-[12px] shadow-lg shadow-dgblue/25 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>

        {/* security — local state */}
        <div className="space-y-5">
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
            <h2 className="text-base font-black text-slate-900 mb-4">Đổi mật khẩu</h2>
            <div className="space-y-3">
              <Field label="Mật khẩu hiện tại">
                <input
                  type="password"
                  value={pwd.cur}
                  onChange={(e) => setPwd({ ...pwd, cur: e.target.value })}
                  placeholder="••••••••"
                  className={INPUT}
                />
              </Field>
              <Field label="Mật khẩu mới">
                <input
                  type="password"
                  value={pwd.next}
                  onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                  placeholder="Tối thiểu 12 ký tự"
                  className={INPUT}
                />
              </Field>
              {pwd.next && (
                <div className="flex items-center gap-2 dg-fade">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-all"
                        style={{ background: i <= pwdStrength ? strengthColor : '#e2e8f0' }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
              <Field label="Xác nhận mật khẩu">
                <input
                  type="password"
                  value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  className={INPUT}
                />
              </Field>
            </div>
            <button
              onClick={() => {
                // TODO: backend — submit password change once an endpoint exists.
                onToast('Đã đổi mật khẩu');
                setPwd({ cur: '', next: '', confirm: '' });
              }}
              disabled={!pwd.cur || pwd.next.length < 8 || pwd.next !== pwd.confirm}
              className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cập nhật mật khẩu
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
            <SettingRow
              icon="phonelink_lock"
              title="Two-Factor Authentication"
              desc={twofa ? 'Đã bật · Authenticator app' : 'Tăng cường bảo mật đăng nhập'}
            >
              {twofa ? (
                <button
                  onClick={() => setTwofa(false) /* TODO: backend */}
                  className="px-3 py-1.5 text-[11px] font-bold text-dgfake bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Tắt
                </button>
              ) : (
                <button
                  onClick={() => {
                    // TODO: backend — enable 2FA via API.
                    setTwofa(true);
                    onToast('Đã bật 2FA');
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold text-white bg-dgblue rounded-lg hover:scale-[1.03] transition-all"
                >
                  Thiết lập
                </button>
              )}
            </SettingRow>
            <SettingRow icon="vpn_key" title="Recovery codes" desc="10 mã khôi phục dùng một lần khi mất thiết bị 2FA.">
              <button className="px-3 py-1.5 text-[11px] font-bold text-dgblue bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
                Tạo lại
              </button>
            </SettingRow>
          </div>
        </div>
      </div>

      {/* connected accounts */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
        <h2 className="text-base font-black text-slate-900 mb-4">Tài khoản liên kết</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              ['Google Workspace', 'mail', '#ea4335', true],
              ['Okta SSO', 'shield', '#0050cb', false],
              ['Microsoft Azure AD', 'window', '#00a4ef', false],
            ] as [string, string, string, boolean][]
          ).map(([name, ic, col, linked]) => (
            <div key={name} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${col}14` }}>
                <Icon name={ic} className="text-[18px]" style={{ color: col }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-800 truncate">{name}</p>
                <p className="text-[10px] font-semibold" style={{ color: linked ? DG.real : '#94a3b8' }}>
                  {linked ? 'Đã liên kết' : 'Chưa liên kết'}
                </p>
              </div>
              <button
                className={`text-[11px] font-bold transition-colors ${linked ? 'text-dgfake hover:underline' : 'text-dgblue hover:underline'}`}
              >
                {linked ? 'Gỡ' : 'Liên kết'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* danger zone */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 border-l-4 border-l-dgfake dg-rise">
        <h2 className="text-base font-black text-dgfake mb-2 flex items-center gap-2">
          <Icon name="warning" className="text-[20px]" />
          Vùng nguy hiểm
        </h2>
        <SettingRow
          title="Vô hiệu hoá tài khoản"
          desc="Tạm thời khoá tài khoản. Bạn có thể kích hoạt lại bằng cách đăng nhập."
        >
          <button className="px-4 py-2 text-[11px] font-bold text-dgwarn bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
            Vô hiệu hoá
          </button>
        </SettingRow>
        <SettingRow title="Xoá tài khoản" desc="Xoá vĩnh viễn tài khoản & dữ liệu cá nhân. Không thể hoàn tác.">
          <button className="px-4 py-2 text-[11px] font-bold text-dgfake bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
            Xoá tài khoản
          </button>
        </SettingRow>
      </div>

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 dg-fade">
          <div className="glass-panel rounded-xl shadow-lg px-4 py-3 border border-white flex items-center gap-2.5">
            <Icon name="check_circle" className="text-[18px] text-dgreal" fill />
            <span className="text-[13px] font-bold text-slate-800">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
