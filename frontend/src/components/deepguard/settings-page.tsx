'use client';

/* ──────────────────────────────────────────────
   DeepGuard — Settings (Org / Security / Notifications)
   ORGANIZATION section is wired to the REAL backend (tenantGet / tenantUpdate).
   SECURITY + NOTIFICATIONS remain LOCAL STATE only (backend not available yet).
   ────────────────────────────────────────────── */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Icon } from '@/components/deepguard/shared';
import { useAuthStore } from '@/store/auth';
import { tenantGet, tenantUpdate, type TenantInfo } from '@/lib/api';

/* ── shared input styling (no global dg-input class) ── */
const INPUT_CLASS =
  'w-full h-[42px] px-3 rounded-xl bg-slate-50/70 border border-slate-200 text-[13px] font-medium text-slate-800 outline-none transition-colors focus:border-dgblue focus:bg-white';

/* ── form field wrapper ── */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

/* ── labelled setting row with a trailing control ── */
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
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-50 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Icon name={icon} className="text-[18px] text-slate-500" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-800">{title}</p>
          <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ── toggle switch ── */
function Switch({ on, onToggle }: { on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onToggle(!on)}
      className={`relative rounded-full transition-colors ${on ? 'bg-dgblue' : 'bg-slate-200'}`}
      style={{ height: 22, width: 40 }}
    >
      <span
        className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all"
        style={{ left: on ? '20px' : '2px' }}
      />
    </button>
  );
}

type TabId = 'org' | 'security' | 'notif';

export default function SettingsPage() {
  const seedTenant = useAuthStore((s) => s.tenant);
  const currentUser = useAuthStore((s) => s.user);

  const [tab, setTab] = useState<TabId>('org');

  // ── ORGANIZATION — wired to REAL backend (tenantGet / tenantUpdate) ──
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSaveError, setOrgSaveError] = useState<string | null>(null);
  // editable org form fields (source of truth seeded from tenantGet)
  const [orgForm, setOrgForm] = useState({
    name: seedTenant?.name ?? '',
    billing_email: '',
  });
  // a non-admin/sysadmin user gets a 403 on PATCH → keep fields read-only
  const canEditOrg = currentUser?.role === 'admin' || currentUser?.role === 'sysadmin';

  // ── SECURITY + NOTIFICATIONS — LOCAL STATE only (backend not available yet) ──
  const [sec, setSec] = useState({
    twofa: true,
    sso: false,
    ipAllow: true,
    sessionTimeout: true,
    forcePwd: false,
  });
  const [prefs, setPrefs] = useState({
    alertEmail: true,
    alertPush: true,
    quota: true,
    weekly: true,
    billing: true,
    productNews: false,
  });
  const [ips, setIps] = useState<string[]>(['203.162.10.0/24', '14.169.0.0/16']);
  const [newIp, setNewIp] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // local-only toast (no toast provider in contract)
  const onToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  // ── load current tenant (source of truth for the org form) ──
  const loadTenant = useCallback(async () => {
    setOrgLoading(true);
    setOrgError(null);
    try {
      const t = await tenantGet();
      setTenant(t);
      setOrgForm({ name: t.name, billing_email: t.billing_email ?? '' });
    } catch (e) {
      setOrgError(e instanceof Error ? e.message : 'Không tải được thông tin tổ chức');
    } finally {
      setOrgLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTenant();
  }, [loadTenant]);

  const onSaveOrg = async () => {
    setOrgSaving(true);
    setOrgSaveError(null);
    try {
      const updated = await tenantUpdate({
        name: orgForm.name.trim(),
        billing_email: orgForm.billing_email.trim(),
      });
      setTenant(updated);
      setOrgForm({ name: updated.name, billing_email: updated.billing_email ?? '' });
      onToast('Đã lưu thông tin tổ chức');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      // backend returns 403 for non-admin/sysadmin
      if (/403|forbidden|permission|quyền/i.test(msg)) {
        setOrgSaveError('Chỉ admin mới sửa được thông tin tổ chức.');
      } else {
        setOrgSaveError(msg || 'Không lưu được thông tin tổ chức.');
      }
    } finally {
      setOrgSaving(false);
    }
  };

  // read-only display helpers
  const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const fmtNum = (n?: number) => (typeof n === 'number' ? n.toLocaleString('vi-VN') : '—');

  const tabs: [TabId, string, string][] = [
    ['org', 'Tổ chức', 'corporate_fare'],
    ['security', 'Bảo mật', 'security'],
    ['notif', 'Thông báo', 'notifications'],
  ];

  return (
    <div className="space-y-5 max-w-4xl custom-scrollbar">
      <div className="dg-rise">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Cài đặt</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Quản lý tổ chức, bảo mật &amp; tùy chọn thông báo
        </p>
      </div>

      {/* tabs */}
      <div className="flex items-center gap-1 dg-rise border-b border-slate-100">
        {tabs.map(([id, label, ic]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
              tab === id
                ? 'text-dgblue border-dgblue'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            <Icon name={ic} className="text-[18px]" fill={tab === id} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Organization (REAL backend) ── */}
      {tab === 'org' && (
        <div className="space-y-5 dg-fade">
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <h2 className="text-base font-black text-slate-900 mb-5">Thông tin tổ chức</h2>

            {/* loading */}
            {orgLoading && (
              <div className="flex items-center gap-2 py-8 justify-center text-slate-400 text-[13px] font-medium">
                <Icon name="progress_activity" className="text-[20px] animate-spin" />
                Đang tải thông tin tổ chức…
              </div>
            )}

            {/* load error */}
            {!orgLoading && orgError && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-[12px] font-bold text-dgfake">
                  <Icon name="error" className="text-[18px]" />
                  {orgError}
                </div>
                <button
                  type="button"
                  onClick={() => void loadTenant()}
                  className="px-3 py-1.5 text-[11px] font-bold text-dgfake bg-white border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            {!orgLoading && !orgError && tenant && (
              <>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-dgblue flex items-center justify-center text-white shadow-lg shadow-dgblue/30">
                    <Icon name="account_balance" className="text-[30px]" fill />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">Logo tổ chức</p>
                    <p className="text-[11px] text-slate-400 mb-2">PNG/SVG, tối thiểu 128×128px</p>
                    <button
                      type="button"
                      className="px-3 py-1.5 text-[11px] font-bold text-dgblue bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Tải lên
                    </button>
                  </div>
                </div>

                {/* non-admin notice */}
                {!canEditOrg && (
                  <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-[12px] font-bold text-amber-700">
                    <Icon name="lock" className="text-[17px]" />
                    Chỉ admin mới sửa được thông tin tổ chức.
                  </div>
                )}

                {/* editable fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Tên tổ chức">
                    <input
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      disabled={!canEditOrg || orgSaving}
                      className={`${INPUT_CLASS} disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                  </Field>
                  <Field label="Email thanh toán (billing)">
                    <input
                      type="email"
                      value={orgForm.billing_email}
                      onChange={(e) => setOrgForm({ ...orgForm, billing_email: e.target.value })}
                      disabled={!canEditOrg || orgSaving}
                      placeholder="billing@example.com"
                      className={`${INPUT_CLASS} disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                  </Field>
                </div>

                {/* read-only tenant info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
                  <div className="px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Gói cước</p>
                    <p className="text-[13px] font-bold text-slate-800 mt-0.5 capitalize">{tenant.plan}</p>
                  </div>
                  <div className="px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hạn mức / tháng</p>
                    <p className="text-[13px] font-bold text-slate-800 mt-0.5 tabular-nums">
                      {fmtNum(tenant.current_usage)} / {fmtNum(tenant.monthly_quota)}
                    </p>
                  </div>
                  <div className="px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email admin</p>
                    <p className="text-[13px] font-bold text-slate-800 mt-0.5 truncate" title={tenant.admin_email}>
                      {tenant.admin_email || '—'}
                    </p>
                  </div>
                  <div className="px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ngày tạo</p>
                    <p className="text-[13px] font-bold text-slate-800 mt-0.5 tabular-nums">{fmtDate(tenant.created_at)}</p>
                  </div>
                </div>

                {/* save error (incl. 403) */}
                {orgSaveError && (
                  <div className="flex items-center gap-2 px-4 py-3 mt-5 rounded-xl bg-red-50 border border-red-200 text-[12px] font-bold text-dgfake">
                    <Icon name="error" className="text-[17px]" />
                    {orgSaveError}
                  </div>
                )}

                <div className="flex justify-end mt-5">
                  <button
                    type="button"
                    onClick={() => void onSaveOrg()}
                    disabled={!canEditOrg || orgSaving}
                    className="px-5 py-2.5 bg-dgblue text-white rounded-xl font-bold text-xs shadow-lg shadow-dgblue/25 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {orgSaving && <Icon name="progress_activity" className="text-[16px] animate-spin" />}
                    {orgSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* danger zone */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 border-l-4 border-l-dgfake">
            <h2 className="text-base font-black text-dgfake mb-2 flex items-center gap-2">
              <Icon name="warning" className="text-[20px]" />
              Vùng nguy hiểm
            </h2>
            <SettingRow
              title="Xoá tổ chức"
              desc="Xoá vĩnh viễn workspace, toàn bộ keys, dữ liệu & lịch sử. Không thể hoàn tác."
            >
              <button
                type="button"
                className="px-4 py-2 text-[11px] font-bold text-dgfake bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Xoá tổ chức
              </button>
            </SettingRow>
          </div>
        </div>
      )}

      {/* ── Security ── */}
      {tab === 'security' && (
        <div className="space-y-5 dg-fade">
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <h2 className="text-base font-black text-slate-900 mb-3">Xác thực</h2>
            <SettingRow
              icon="phonelink_lock"
              title="Two-Factor Authentication (2FA)"
              desc="Bắt buộc TOTP/Authenticator cho mọi thành viên khi đăng nhập."
            >
              <Switch
                on={sec.twofa}
                onToggle={(v) => {
                  setSec({ ...sec, twofa: v });
                  onToast(`2FA ${v ? 'bật' : 'tắt'}`);
                }}
              />
            </SettingRow>
            <SettingRow
              icon="vpn_key"
              title="SSO / SAML"
              desc="Đăng nhập một lần qua Okta, Azure AD, Google Workspace (Enterprise)."
            >
              <Switch on={sec.sso} onToggle={(v) => setSec({ ...sec, sso: v })} />
            </SettingRow>
            <SettingRow
              icon="schedule"
              title="Tự động đăng xuất"
              desc="Kết thúc phiên sau 30 phút không hoạt động."
            >
              <Switch
                on={sec.sessionTimeout}
                onToggle={(v) => setSec({ ...sec, sessionTimeout: v })}
              />
            </SettingRow>
            <SettingRow
              icon="password"
              title="Bắt buộc đổi mật khẩu định kỳ"
              desc="Yêu cầu đổi mật khẩu mỗi 90 ngày."
            >
              <Switch on={sec.forcePwd} onToggle={(v) => setSec({ ...sec, forcePwd: v })} />
            </SettingRow>
          </div>

          {/* IP allowlist */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">IP Allowlist</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Chỉ cho phép truy cập API từ các dải IP này
                </p>
              </div>
              <Switch on={sec.ipAllow} onToggle={(v) => setSec({ ...sec, ipAllow: v })} />
            </div>
            {sec.ipAllow && (
              <div className="dg-fade space-y-2">
                {ips.map((ip) => (
                  <div
                    key={ip}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                  >
                    <Icon name="lan" className="text-[17px] text-slate-400" />
                    <code className="text-[12px] font-mono font-bold text-slate-700 flex-1 tabular-nums">
                      {ip}
                    </code>
                    <button
                      type="button"
                      onClick={() => setIps((p) => p.filter((x) => x !== ip))}
                      className="text-slate-400 hover:text-dgfake transition-colors"
                    >
                      <Icon name="close" className="text-[16px]" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    placeholder="VD: 192.168.1.0/24"
                    className={`${INPUT_CLASS} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = newIp.trim();
                      if (v) {
                        setIps((p) => [...p, v]);
                        setNewIp('');
                      }
                    }}
                    className="px-4 h-[42px] bg-dgblue text-white rounded-xl font-bold text-xs shadow-lg shadow-dgblue/25 hover:scale-[1.02] transition-all flex items-center gap-1.5"
                  >
                    <Icon name="add" className="text-[16px]" />
                    Thêm
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* active sessions */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <h2 className="text-base font-black text-slate-900 mb-4">Phiên đăng nhập</h2>
            <div className="space-y-2">
              {(
                [
                  ['macOS · Chrome', 'Hà Nội · 14.169.x.x', 'Hiện tại', true],
                  ['iOS · Safari', 'TP.HCM · 14.231.x.x', '2 giờ trước', false],
                  ['Windows · Edge', 'Đà Nẵng · 27.72.x.x', '1 ngày trước', false],
                ] as [string, string, string, boolean][]
              ).map(([dev, loc, when, cur]) => (
                <div
                  key={dev}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                >
                  <Icon
                    name={dev.includes('iOS') ? 'phone_iphone' : 'computer'}
                    className="text-[18px] text-slate-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-700">
                      {dev}
                      {cur && (
                        <span className="ml-2 text-[9px] font-black text-dgreal bg-emerald-50 px-1.5 py-0.5 rounded">
                          PHIÊN NÀY
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 tabular-nums">
                      {loc} · {when}
                    </p>
                  </div>
                  {!cur && (
                    <button type="button" className="text-[11px] font-bold text-dgfake hover:underline">
                      Thu hồi
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* local-only note */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-500">
            <Icon name="cloud_off" className="text-[16px]" />
            Lưu cục bộ — backend sắp có
          </div>
        </div>
      )}

      {/* ── Notifications ── */}
      {tab === 'notif' && (
        <div className="space-y-5 dg-fade">
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <h2 className="text-base font-black text-slate-900 mb-3">Tùy chọn thông báo</h2>
          <SettingRow
            icon="gpp_maybe"
            title="Cảnh báo deepfake (email)"
            desc="Email khi phát hiện FAKE vượt ngưỡng cảnh báo."
          >
            <Switch on={prefs.alertEmail} onToggle={(v) => setPrefs({ ...prefs, alertEmail: v })} />
          </SettingRow>
          <SettingRow
            icon="notifications_active"
            title="Cảnh báo realtime (in-app)"
            desc="Thông báo đẩy trong ứng dụng khi có sự kiện quan trọng."
          >
            <Switch on={prefs.alertPush} onToggle={(v) => setPrefs({ ...prefs, alertPush: v })} />
          </SettingRow>
          <SettingRow
            icon="data_usage"
            title="Cảnh báo quota"
            desc="Báo khi đạt 80% và 100% hạn mức tháng."
          >
            <Switch on={prefs.quota} onToggle={(v) => setPrefs({ ...prefs, quota: v })} />
          </SettingRow>
          <SettingRow
            icon="summarize"
            title="Báo cáo tuần"
            desc="Tổng hợp số liệu phát hiện gửi mỗi sáng thứ Hai."
          >
            <Switch on={prefs.weekly} onToggle={(v) => setPrefs({ ...prefs, weekly: v })} />
          </SettingRow>
          <SettingRow
            icon="receipt_long"
            title="Thông báo billing"
            desc="Hoá đơn, thanh toán & thay đổi gói cước."
          >
            <Switch on={prefs.billing} onToggle={(v) => setPrefs({ ...prefs, billing: v })} />
          </SettingRow>
          <SettingRow
            icon="campaign"
            title="Tin tức sản phẩm"
            desc="Cập nhật model, tính năng mới & thông báo bảo trì."
          >
            <Switch
              on={prefs.productNews}
              onToggle={(v) => setPrefs({ ...prefs, productNews: v })}
            />
          </SettingRow>
        </div>

        {/* local-only note */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-500">
          <Icon name="cloud_off" className="text-[16px]" />
          Lưu cục bộ — backend sắp có
        </div>
        </div>
      )}

      {/* local toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 dg-rise flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-[12px] font-bold shadow-xl">
          <Icon name="check_circle" className="text-[18px] text-dgreal" fill />
          {toast}
        </div>
      )}
    </div>
  );
}
