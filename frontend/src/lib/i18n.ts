import { useLocale } from '@/store/locale';

/* ──────────────────────────────────────────────
   DeepGuard i18n — dictionary + useT() hook.
   Coverage: nav.*, header.*, login.*, common.*
   All other page bodies are NOT converted (bounded scope).
   ────────────────────────────────────────────── */

type Entry = { vi: string; en: string };

const DICT: Record<string, Entry> = {
  /* ── nav: sidebar item labels ── */
  'nav.dashboard':          { vi: 'Dashboard',          en: 'Dashboard' },
  'nav.playground':         { vi: 'API Playground',     en: 'API Playground' },
  'nav.liveness':           { vi: 'Liveness Check',     en: 'Liveness Check' },
  'nav.history':            { vi: 'Lịch sử phát hiện',  en: 'Detection History' },
  'nav.models':             { vi: 'Models & Thresholds', en: 'Models & Thresholds' },
  'nav.apikeys':            { vi: 'API Keys',            en: 'API Keys' },
  'nav.docs':               { vi: 'API Docs',            en: 'API Docs' },
  'nav.status':             { vi: 'Status & Compliance', en: 'Status & Compliance' },
  'nav.team':               { vi: 'Team & Roles',        en: 'Team & Roles' },
  'nav.tenants':            { vi: 'Quản lý Tenants',     en: 'Manage Tenants' },
  'nav.account':            { vi: 'Tài khoản',           en: 'Account' },
  'nav.settings':           { vi: 'Cài đặt',             en: 'Settings' },
  'nav.analytics':          { vi: 'Analytics',           en: 'Analytics' },
  'nav.webhooks':           { vi: 'Webhooks',            en: 'Webhooks' },
  'nav.audit':              { vi: 'Audit Logs',          en: 'Audit Logs' },
  'nav.billing':            { vi: 'Billing & Usage',     en: 'Billing & Usage' },
  /* ── nav: group section titles ── */
  'nav.group.workspace':    { vi: 'Workspace',           en: 'Workspace' },
  'nav.group.ai_models':    { vi: 'AI Models',           en: 'AI Models' },
  'nav.group.compliance':   { vi: 'Compliance',          en: 'Compliance' },
  'nav.group.admin':        { vi: 'Admin',               en: 'Admin' },
  'nav.group.account':      { vi: 'Account',             en: 'Account' },

  /* ── header: page title / subtitle ── */
  'header.dashboard.title':     { vi: 'Dashboard',              en: 'Dashboard' },
  'header.dashboard.sub':       { vi: 'Tổng quan',              en: 'Overview' },
  'header.playground.title':    { vi: 'API Playground',         en: 'API Playground' },
  'header.playground.sub':      { vi: 'Workbench v2.1',         en: 'Workbench v2.1' },
  'header.history.title':       { vi: 'Lịch sử phát hiện',      en: 'Detection History' },
  'header.history.sub':         { vi: 'Compliance',             en: 'Compliance' },
  'header.detail.title':        { vi: 'Chi tiết phát hiện',     en: 'Detection Detail' },
  'header.detail.sub':          { vi: 'Forensic',               en: 'Forensic' },
  'header.tenants.title':       { vi: 'Quản lý Tenants',        en: 'Manage Tenants' },
  'header.tenants.sub':         { vi: 'Admin Panel',            en: 'Admin Panel' },
  'header.audit.title':         { vi: 'Audit Logs',             en: 'Audit Logs' },
  'header.audit.sub':           { vi: 'Compliance',             en: 'Compliance' },
  'header.apikeys.title':       { vi: 'API Keys',               en: 'API Keys' },
  'header.apikeys.sub':         { vi: 'Quản lý khóa',           en: 'Key Management' },
  'header.docs.title':          { vi: 'API Documentation',      en: 'API Documentation' },
  'header.docs.sub':            { vi: 'v2.1',                   en: 'v2.1' },
  'header.analytics.title':     { vi: 'Analytics',              en: 'Analytics' },
  'header.analytics.sub':       { vi: 'Thống kê sâu',           en: 'Deep Analytics' },
  'header.webhooks.title':      { vi: 'Webhooks',               en: 'Webhooks' },
  'header.webhooks.sub':        { vi: 'Cấu hình callback',      en: 'Callback Config' },
  'header.liveness.title':      { vi: 'Liveness Check',         en: 'Liveness Check' },
  'header.liveness.sub':        { vi: 'Workspace',              en: 'Workspace' },
  'header.team.title':          { vi: 'Team & Roles',           en: 'Team & Roles' },
  'header.team.sub':            { vi: 'Admin',                  en: 'Admin' },
  'header.billing.title':       { vi: 'Billing & Usage',        en: 'Billing & Usage' },
  'header.billing.sub':         { vi: 'Account',                en: 'Account' },
  'header.notifications.title': { vi: 'Thông báo',              en: 'Notifications' },
  'header.notifications.sub':   { vi: 'Inbox',                  en: 'Inbox' },
  'header.settings.title':      { vi: 'Cài đặt',                en: 'Settings' },
  'header.settings.sub':        { vi: 'Account',                en: 'Account' },
  'header.models.title':        { vi: 'Models & Thresholds',    en: 'Models & Thresholds' },
  'header.models.sub':          { vi: 'AI',                     en: 'AI' },
  'header.status.title':        { vi: 'Status & Compliance',    en: 'Status & Compliance' },
  'header.status.sub':          { vi: 'Trust',                  en: 'Trust' },
  'header.account.title':       { vi: 'Tài khoản cá nhân',      en: 'My Account' },
  'header.account.sub':         { vi: 'Account',                en: 'Account' },

  /* ── login page ── */
  'login.title':            { vi: 'Đăng nhập',                      en: 'Sign In' },
  'login.subtitle':         { vi: 'Truy cập hệ thống phát hiện deepfake', en: 'Access the deepfake detection system' },
  'login.email':            { vi: 'Email',                           en: 'Email' },
  'login.password':         { vi: 'Mật khẩu',                       en: 'Password' },
  'login.forgot':           { vi: 'Quên mật khẩu?',                 en: 'Forgot password?' },
  'login.remember':         { vi: 'Ghi nhớ đăng nhập',              en: 'Remember me' },
  'login.submit':           { vi: 'Đăng nhập',                      en: 'Sign In' },
  'login.submitting':       { vi: 'Đang xác thực...',               en: 'Authenticating...' },
  'login.success':          { vi: 'Đăng nhập thành công',           en: 'Signed in successfully' },
  'login.redirect':         { vi: 'Đang chuyển hướng đến Dashboard...', en: 'Redirecting to Dashboard...' },
  'login.register_cta':     { vi: 'Chưa có tổ chức?',              en: 'No organisation yet?' },
  'login.register_link':    { vi: 'Đăng ký dùng thử',              en: 'Start free trial' },
  'login.error.empty':      { vi: 'Vui lòng nhập email và mật khẩu.', en: 'Please enter your email and password.' },
  'login.error.failed':     { vi: 'Đăng nhập thất bại',            en: 'Sign in failed' },
  'login.pw_weak':          { vi: 'Yếu',                            en: 'Weak' },
  'login.pw_medium':        { vi: 'Trung bình',                     en: 'Medium' },
  'login.pw_strong':        { vi: 'Mạnh',                           en: 'Strong' },
  'login.pw_placeholder':   { vi: 'Nhập mật khẩu',                  en: 'Enter password' },
  'login.status_ok':        { vi: 'Hệ thống hoạt động bình thường', en: 'All systems operational' },

  /* ── settings page ── */
  'settings.language':      { vi: 'Ngôn ngữ',                       en: 'Language' },
  'settings.language_desc': { vi: 'Ngôn ngữ hiển thị của giao diện', en: 'Dashboard display language' },

  /* ── common ── */
  'common.vi':              { vi: 'Tiếng Việt',                      en: 'Vietnamese' },
  'common.en':              { vi: 'English',                          en: 'English' },
};

/** Translate a key to the current locale. Falls back to the key itself if missing. */
export function useT(): (key: string) => string {
  const locale = useLocale((s) => s.locale);
  return (key: string): string => DICT[key]?.[locale] ?? key;
}
