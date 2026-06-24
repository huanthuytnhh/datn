'use client';

import { useNavigation, type Page } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';
import { Icon } from '@/components/deepguard/shared';
import { canAccess, ROLE_LABEL, type Role } from '@/lib/rbac';
import { useT } from '@/lib/i18n';

interface NavEntry {
  icon: string;
  labelKey: string;
  page: Page;
  soon?: boolean;
}

const NAV: { titleKey: string; items: NavEntry[] }[] = [
  {
    titleKey: 'nav.group.workspace',
    items: [
      { icon: 'dashboard',     labelKey: 'nav.dashboard',  page: 'dashboard' },
      { icon: 'terminal',      labelKey: 'nav.playground', page: 'playground' },
      { icon: 'face_6',        labelKey: 'nav.liveness',   page: 'liveness' },
      { icon: 'analytics',     labelKey: 'nav.analytics',  page: 'analytics' },
      { icon: 'key',           labelKey: 'nav.apikeys',    page: 'apikeys' },
      { icon: 'webhook',       labelKey: 'nav.webhooks',   page: 'webhooks' },
      { icon: 'menu_book',     labelKey: 'nav.docs',       page: 'docs' },
    ],
  },
  {
    titleKey: 'nav.group.ai_models',
    items: [{ icon: 'model_training', labelKey: 'nav.models', page: 'models' }],
  },
  {
    titleKey: 'nav.group.compliance',
    items: [
      { icon: 'history',       labelKey: 'nav.history', page: 'history' },
      { icon: 'gavel',         labelKey: 'nav.audit',   page: 'audit' },
      { icon: 'monitor_heart', labelKey: 'nav.status',  page: 'status' },
    ],
  },
  {
    titleKey: 'nav.group.admin',
    items: [
      { icon: 'domain', labelKey: 'nav.tenants', page: 'tenants' },
      { icon: 'group',  labelKey: 'nav.team',    page: 'team' },
    ],
  },
  {
    titleKey: 'nav.group.account',
    items: [
      { icon: 'person',      labelKey: 'nav.account',  page: 'account' },
      { icon: 'credit_card', labelKey: 'nav.billing',  page: 'billing' },
      { icon: 'settings',    labelKey: 'nav.settings', page: 'settings' },
    ],
  },
];

export default function Sidebar() {
  const { currentPage, navigate } = useNavigation();
  const { user, tenant, logout } = useAuthStore();
  const role = useAuthStore((s) => s.user?.role) as Role | undefined;
  const t = useT();

  // Filter nav by role: hide inaccessible items, then drop empty groups.
  const visibleNav = NAV.map((group) => ({
    ...group,
    items: group.items.filter((it) => canAccess(role, it.page)),
  })).filter((group) => group.items.length > 0);

  const isActive = (pg: Page) => currentPage === pg || (pg === 'history' && currentPage === 'detail');
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'DG';
  const handleLogout = () => {
    logout();
    navigate('login');
  };

  return (
    <aside className="fixed h-full w-[240px] left-0 top-0 border-r border-white/50 bg-white/75 backdrop-blur-xl flex flex-col py-6 px-3.5 shadow-md z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-7 px-2 cursor-pointer group" onClick={() => navigate('landing')}>
        <div
          className="w-11 h-11 rounded-[13px] flex items-center justify-center text-white shrink-0 transition-transform group-hover:scale-[1.03]"
          style={{
            background: 'linear-gradient(145deg,#0047cc 0%,#1a6fff 60%,#4f8fff 100%)',
            boxShadow: '0 6px 18px rgba(0,71,204,0.36), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          <Icon name="security" fill className="text-[22px]" />
        </div>
        <div className="leading-none">
          <div className="flex items-baseline">
            <span className="text-[18px] font-light" style={{ color: '#0047cc', letterSpacing: '-0.025em' }}>Deep</span>
            <span className="text-[18px] font-black" style={{ color: '#0a1628', letterSpacing: '-0.025em' }}>Guard</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="inline-flex items-center px-1.5 py-[2px] rounded text-[8px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(0,71,204,0.08)', color: '#0047cc' }}
            >
              {tenant?.name ?? 'VietBank'}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Workspace</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar -mr-1.5 pr-1.5">
        {visibleNav.map((group) => (
          <div key={group.titleKey}>
            <div className="px-4 pt-5 pb-1.5 text-[10px] font-semibold text-slate-400 tracking-widest uppercase select-none">
              {t(group.titleKey)}
            </div>
            {group.items.map((it) => {
              const active = isActive(it.page);
              return (
                <button
                  key={it.page}
                  onClick={() => !it.soon && navigate(it.page)}
                  className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-[13px] relative ${
                    active ? 'font-semibold' : it.soon ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50/80 font-medium'
                  }`}
                  style={active ? { background: 'rgba(0,71,204,0.07)', color: '#0047cc' } : {}}
                >
                  <Icon name={it.icon} className="text-[18px]" fill={active} />
                  <span className="flex-1 text-left">{t(it.labelKey)}</span>
                  {it.soon && (
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                      soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="mt-3 px-1 cursor-pointer" onClick={() => navigate('account')}>
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl transition-colors hover:bg-slate-50" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg,#0047cc,#4f8fff)' }}
          >
            {initials}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate text-slate-700">{user?.email ?? 'you@example.com'}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {role ? ROLE_LABEL[role] : (user?.role ?? 'Developer')}
              {tenant?.plan ? ` · ${tenant.plan}` : ''}
            </p>
          </div>
          <button
            title="Đăng xuất"
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="text-slate-300 hover:text-red-400 transition-colors shrink-0 p-1"
          >
            <Icon name="logout" className="text-[16px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
