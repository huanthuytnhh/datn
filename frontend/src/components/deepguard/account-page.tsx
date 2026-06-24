'use client';

/* ──────────────────────────────────────────────
   DeepGuard — Tài khoản cá nhân (profile, mật khẩu & bảo mật)
   Wired to the REAL backend:
     - authMe()              → load profile + tenant on mount
     - authUpdateMe()        → save name / phone / timezone (also refreshes auth store)
     - authChangePassword()  → change password (surfaces backend errors)
   2FA / connected accounts / danger-zone destructive actions have no backend yet,
   so the UI is kept but marked "sắp có" (no fake persistence). Logout is real.
   Light mode only. Vietnamese copy. Uses shared primitives + lib/dg helpers.
   ────────────────────────────────────────────── */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Icon } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';
import { useAuthStore } from '@/store/auth';
import { useNavigation } from '@/store/navigation';
import { authMe, authUpdateMe, authChangePassword, type UserOut, type TenantOut } from '@/lib/api';
import { useT } from '@/lib/i18n';

const INPUT =
  'w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all';

const INPUT_RO =
  'w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-500 cursor-not-allowed';

const TZ_OPTIONS = ['Asia/Ho_Chi_Minh', 'Asia/Bangkok', 'Asia/Singapore', 'UTC'];

/** "Sắp có" pill for UI sections without a backend yet. */
function SoonTag() {
  const t = useT();
  return (
    <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-400 border border-slate-200">
      {t('account.soon')}
    </span>
  );
}

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
  title: ReactNode;
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
        <p className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">{title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** dd/mm/yyyy from an ISO string, or fallback. */
function fmtDate(iso: string | null | undefined, fallback = '—'): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ── Editable profile draft (name / phone / timezone only) ── */
interface ProfileDraft {
  name: string;
  phone: string;
  tz: string;
}

function draftFromUser(u: UserOut | null): ProfileDraft {
  return {
    name: u?.name ?? '',
    phone: u?.phone ?? '',
    tz: u?.timezone ?? 'Asia/Ho_Chi_Minh',
  };
}

export default function AccountPage() {
  const t = useT();
  const navigate = useNavigation((s) => s.navigate);

  // Seed from auth store, then refresh from authMe() on mount.
  const [user, setUser] = useState<UserOut | null>(useAuthStore.getState().user);
  const [tenant, setTenant] = useState<TenantOut | null>(useAuthStore.getState().tenant);

  const [draft, setDraft] = useState<ProfileDraft>(draftFromUser(user));
  const [savedDraft, setSavedDraft] = useState<ProfileDraft>(draftFromUser(user));
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [pwd, setPwd] = useState({ cur: '', next: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  // Refresh the canonical profile from the backend once on mount.
  useEffect(() => {
    let alive = true;
    authMe()
      .then(({ user: u, tenant: tn }) => {
        if (!alive) return;
        setUser(u);
        setTenant(tn);
        const d = draftFromUser(u);
        setDraft(d);
        setSavedDraft(d);
      })
      .catch(() => {
        /* keep store-seeded values if /auth/me fails (e.g. offline) */
      });
    return () => {
      alive = false;
    };
  }, []);

  const onToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Viewer';
  const dirty = JSON.stringify(savedDraft) !== JSON.stringify(draft);
  const initials =
    (draft.name || user?.name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase() || 'DG';

  /* ── Save personal info → authUpdateMe + refresh auth store ── */
  const onSaveInfo = async () => {
    if (!dirty || savingInfo) return;
    setSavingInfo(true);
    setInfoError(null);
    try {
      const updated = await authUpdateMe({
        name: draft.name.trim(),
        phone: draft.phone.trim() || undefined,
        timezone: draft.tz,
      });
      setUser(updated);
      const d = draftFromUser(updated);
      setDraft(d);
      setSavedDraft(d);

      // Refresh the auth store so sidebar/header reflect the new name immediately.
      const { token, tenant: storeTenant, setAuth } = useAuthStore.getState();
      const tk = token ?? (typeof window !== 'undefined' ? localStorage.getItem('dg_token') : null);
      const tn = tenant ?? storeTenant;
      if (tk && tn) setAuth(tk, updated, tn);

      onToast(t('account.toast_info_saved'));
    } catch (err) {
      setInfoError(err instanceof Error ? err.message : t('account.error_save'));
    } finally {
      setSavingInfo(false);
    }
  };

  /* ── Change password → authChangePassword ── */
  const pwdStrength =
    pwd.next.length === 0
      ? 0
      : pwd.next.length < 8
        ? 1
        : /[A-Z]/.test(pwd.next) && /\d/.test(pwd.next) && pwd.next.length >= 12
          ? 3
          : 2;
  const strengthLabel = ['', t('account.pwd_weak'), t('account.pwd_medium'), t('account.pwd_strong')][pwdStrength];
  const strengthColor = ['#e2e8f0', DG.fake, DG.uncertain, DG.real][pwdStrength];

  const mismatch = pwd.confirm.length > 0 && pwd.next !== pwd.confirm;
  const pwdValid = pwd.cur.length > 0 && pwd.next.length >= 8 && pwd.next === pwd.confirm;

  const onChangePwd = async () => {
    if (!pwdValid || savingPwd) return;
    setSavingPwd(true);
    setPwdError(null);
    try {
      await authChangePassword(pwd.cur, pwd.next);
      setPwd({ cur: '', next: '', confirm: '' });
      onToast(t('account.toast_pwd_changed'));
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : t('account.error_change_pwd'));
    } finally {
      setSavingPwd(false);
    }
  };

  const onLogout = () => {
    useAuthStore.getState().logout();
    navigate('login');
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="dg-rise">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">{t('account.title')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('account.subtitle')}</p>
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
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black text-slate-900">{user?.name || draft.name || t('account.user_fallback')}</h2>
            <RoleBadge role={role} />
          </div>
          <p className="text-sm text-slate-500">
            {tenant?.name ?? 'DeepGuard'}
            {tenant?.plan ? ` · ${tenant.plan}` : ''}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: user?.is_active ? DG.real : '#94a3b8' }}
            />
            {user?.is_active ? t('account.status_active') : t('account.status_inactive')} · {user?.email ?? '—'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('account.last_login')}</span>
          <span className="text-sm font-black text-slate-700 tabular-nums">
            {fmtDate(user?.last_login_at, t('account.never_logged'))}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* personal info — wired to authUpdateMe */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
          <h2 className="text-base font-black text-slate-900 mb-5">{t('account.section_info')}</h2>
          <div className="space-y-4">
            <Field label={t('account.field_name')}>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className={INPUT}
                placeholder={t('account.field_name')}
              />
            </Field>
            <Field label={t('account.field_email')}>
              <input value={user?.email ?? ''} readOnly disabled className={INPUT_RO} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('account.field_phone')}>
                <input
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  className={INPUT}
                  placeholder="+84 ..."
                />
              </Field>
              <Field label={t('account.field_role')}>
                <input value={role} readOnly disabled className={INPUT_RO} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('account.field_org')}>
                <input value={tenant?.name ?? '—'} readOnly disabled className={INPUT_RO} />
              </Field>
              <Field label={t('account.field_tz')}>
                <select value={draft.tz} onChange={(e) => setDraft({ ...draft, tz: e.target.value })} className={INPUT}>
                  {TZ_OPTIONS.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {infoError && (
            <p className="mt-3 text-[12px] font-semibold text-dgfake flex items-center gap-1.5 dg-fade">
              <Icon name="error" className="text-[16px]" fill />
              {infoError}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => {
                setDraft(savedDraft);
                setInfoError(null);
              }}
              disabled={!dirty || savingInfo}
              className="px-4 py-2.5 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('account.btn_revert')}
            </button>
            <button
              onClick={onSaveInfo}
              disabled={!dirty || savingInfo}
              className="px-5 py-2.5 bg-dgblue text-white rounded-xl font-bold text-[12px] shadow-lg shadow-dgblue/25 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {savingInfo ? t('account.btn_saving') : t('account.btn_save')}
            </button>
          </div>
        </div>

        {/* security */}
        <div className="space-y-5">
          {/* password change — wired to authChangePassword */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
            <h2 className="text-base font-black text-slate-900 mb-4">{t('account.section_pwd')}</h2>
            <div className="space-y-3">
              <Field label={t('account.pwd_current')}>
                <input
                  type="password"
                  value={pwd.cur}
                  onChange={(e) => {
                    setPwd({ ...pwd, cur: e.target.value });
                    if (pwdError) setPwdError(null);
                  }}
                  placeholder="••••••••"
                  className={INPUT}
                />
              </Field>
              <Field label={t('account.pwd_new')}>
                <input
                  type="password"
                  value={pwd.next}
                  onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                  placeholder={t('account.pwd_min')}
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
              <Field label={t('account.pwd_confirm')}>
                <input
                  type="password"
                  value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  placeholder={t('account.pwd_retype')}
                  className={INPUT}
                />
              </Field>
              {mismatch && (
                <p className="text-[11px] font-semibold text-dgfake dg-fade">{t('account.pwd_mismatch')}</p>
              )}
            </div>

            {pwdError && (
              <p className="mt-3 text-[12px] font-semibold text-dgfake flex items-center gap-1.5 dg-fade">
                <Icon name="error" className="text-[16px]" fill />
                {pwdError}
              </p>
            )}

            <button
              onClick={onChangePwd}
              disabled={!pwdValid || savingPwd}
              className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingPwd ? t('account.btn_updating_pwd') : t('account.btn_update_pwd')}
            </button>
          </div>

          {/* 2FA / recovery — no backend yet */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
            <SettingRow
              icon="phonelink_lock"
              title={
                <>
                  Two-Factor Authentication <SoonTag />
                </>
              }
              desc={t('account.2fa_desc')}
            >
              <button
                disabled
                className="px-3 py-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed"
              >
                {t('account.2fa_setup')}
              </button>
            </SettingRow>
            <SettingRow
              icon="vpn_key"
              title={
                <>
                  Recovery codes <SoonTag />
                </>
              }
              desc={t('account.recovery_desc')}
            >
              <button
                disabled
                className="px-3 py-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed"
              >
                {t('account.recovery_regen')}
              </button>
            </SettingRow>
          </div>
        </div>
      </div>

      {/* connected accounts — no backend yet */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise">
        <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
          {t('account.linked_title')} <SoonTag />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              ['Google Workspace', 'mail', '#ea4335'],
              ['Okta SSO', 'shield', '#0050cb'],
              ['Microsoft Azure AD', 'window', '#00a4ef'],
            ] as [string, string, string][]
          ).map(([name, ic, col]) => (
            <div key={name} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${col}14` }}>
                <Icon name={ic} className="text-[18px]" style={{ color: col }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-800 truncate">{name}</p>
                <p className="text-[10px] font-semibold text-slate-400">{t('account.linked_none')}</p>
              </div>
              <button disabled className="text-[11px] font-bold text-slate-300 cursor-not-allowed">
                {t('account.linked_btn')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* danger zone — destructive account actions have no backend; logout is real */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 border-l-4 border-l-dgfake dg-rise">
        <h2 className="text-base font-black text-dgfake mb-2 flex items-center gap-2">
          <Icon name="warning" className="text-[20px]" />
          {t('account.danger_title')}
        </h2>
        <SettingRow title={t('account.logout_title')} desc={t('account.logout_desc')}>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {t('account.logout_btn')}
          </button>
        </SettingRow>
        <SettingRow
          title={
            <>
              {t('account.deactivate_title')} <SoonTag />
            </>
          }
          desc={t('account.deactivate_desc')}
        >
          <button
            disabled
            className="px-4 py-2 text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed"
          >
            {t('account.deactivate_btn')}
          </button>
        </SettingRow>
        <SettingRow
          title={
            <>
              {t('account.delete_title')} <SoonTag />
            </>
          }
          desc={t('account.delete_desc')}
        >
          <button
            disabled
            className="px-4 py-2 text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed"
          >
            {t('account.delete_btn')}
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
