'use client';

import { useNavigation, type Page } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';

const workspaceItems: { icon: string; label: string; page: Page }[] = [
  { icon: 'dashboard', label: 'Dashboard', page: 'dashboard' },
  { icon: 'terminal', label: 'API Playground', page: 'playground' },
  { icon: 'key', label: 'API Keys', page: 'apikeys' },
  { icon: 'analytics', label: 'Analytics', page: 'analytics' },
  { icon: 'webhook', label: 'Webhooks', page: 'webhooks' },
  { icon: 'menu_book', label: 'API Docs', page: 'docs' },
];

const adminItems: { icon: string; label: string; page: Page }[] = [
  { icon: 'domain', label: 'Quản lý Tenants', page: 'tenants' },
];

const complianceItems: { icon: string; label: string; page: Page }[] = [
  { icon: 'history', label: 'Lịch sử phát hiện', page: 'history' },
  { icon: 'gavel', label: 'Audit Logs', page: 'history' },
];

function UserCard() {
  const { user, tenant, logout } = useAuthStore();
  const navigate = useNavigation((s) => s.navigate);
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'DG';
  const handleLogout = () => { logout(); navigate('login'); };
  return (
    <div className="mt-auto p-4 glass-panel rounded-xl border border-white/60">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#0050cb]/10 flex items-center justify-center text-[#0050cb] font-bold text-xs flex-shrink-0">{initials}</div>
        <div className="overflow-hidden flex-1 min-w-0">
          <p className="text-[11px] font-bold truncate">{user?.email ?? 'dev@vietbank.vn'}</p>
          <p className="text-[9px] text-slate-500 uppercase">{user?.role ?? 'Developer'} · {tenant?.plan ?? ''}</p>
        </div>
        <button onClick={handleLogout} title="Đăng xuất" className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
          <span className="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { currentPage, navigate } = useNavigation();

  const isActive = (page: Page) => {
    if (page === 'history' && currentPage === 'detail') return true;
    return currentPage === page;
  };

  const NavItem = ({ icon, label, page }: { icon: string; label: string; page: Page }) => (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); navigate(page); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
        isActive(page)
          ? 'bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20 font-bold'
          : 'text-slate-600 hover:bg-white/50'
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span> {label}
    </a>
  );

  return (
    <aside className="fixed h-full w-[240px] left-0 top-0 border-r border-white/40 bg-white/70 backdrop-blur-xl flex flex-col py-6 px-4 shadow-md z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => navigate('landing')}>
        <div className="w-10 h-10 rounded-xl bg-[#0050cb] flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined">security</span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter text-[#0050cb] italic">DeepGuard</h1>
          <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400">VietBank Workspace</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace</div>
        {workspaceItems.map((item) => (
          <NavItem key={item.page} {...item} />
        ))}

        <div className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</div>
        {complianceItems.map((item) => (
          <NavItem key={item.page + item.label} {...item} />
        ))}

        <div className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</div>
        {adminItems.map((item) => (
          <NavItem key={item.page} {...item} />
        ))}
      </nav>

      {/* User Info */}
      <UserCard />
    </aside>
  );
}
