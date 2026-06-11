'use client';

import { useEffect } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';
import { useAppearanceStore } from '@/store/appearance';
import { useOnboardingStore } from '@/store/onboarding';
import { PAGE_TOURS } from '@/lib/onboarding';
import { canAccess, defaultPageFor, type Role } from '@/lib/rbac';
import { Icon } from '@/components/deepguard/shared';
import LandingPage from '@/components/deepguard/landing-page';
import LoginPage from '@/components/deepguard/login-page';
import RegisterPage from '@/components/deepguard/register-page';
import AcceptInvitePage from '@/components/deepguard/accept-invite-page';
import ForceChangePassword from '@/components/deepguard/force-change-password';
import Sidebar from '@/components/deepguard/sidebar';
import TopHeader from '@/components/deepguard/top-header';
import DashboardPage from '@/components/deepguard/dashboard-page';
import PlaygroundPage from '@/components/deepguard/playground-page';
import HistoryPage from '@/components/deepguard/history-page';
import DetailPage from '@/components/deepguard/detail-page';
import ApiKeysPage from '@/components/deepguard/apikeys-page';
import AnalyticsPage from '@/components/deepguard/analytics-page';
import DocsPage from '@/components/deepguard/docs-page';
import WebhooksPage from '@/components/deepguard/webhooks-page';
import TenantsPage from '@/components/deepguard/tenants-page';
import AuditPage from '@/components/deepguard/audit-page';
import LivenessPage from '@/components/deepguard/liveness-page';
import TeamPage from '@/components/deepguard/team-page';
import BillingPage from '@/components/deepguard/billing-page';
import NotificationsPage from '@/components/deepguard/notifications-page';
import SettingsPage from '@/components/deepguard/settings-page';
import ModelsPage from '@/components/deepguard/models-page';
import StatusPage from '@/components/deepguard/status-page';
import AccountPage from '@/components/deepguard/account-page';
import OnboardingTour from '@/components/deepguard/onboarding-tour';
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
} as const;

const standalonePages = ['landing', 'login', 'register', 'accept-invite'];

const standaloneComponents: Record<string, React.ComponentType> = {
  landing: LandingPage,
  login: LoginPage,
  register: RegisterPage,
  'accept-invite': AcceptInvitePage,
};

const pageComponents: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  playground: PlaygroundPage,
  history: HistoryPage,
  detail: DetailPage,
  apikeys: ApiKeysPage,
  analytics: AnalyticsPage,
  docs: DocsPage,
  webhooks: WebhooksPage,
  tenants: TenantsPage,
  audit: AuditPage,
  liveness: LivenessPage,
  team: TeamPage,
  billing: BillingPage,
  notifications: NotificationsPage,
  settings: SettingsPage,
  models: ModelsPage,
  status: StatusPage,
  account: AccountPage,
};

export default function Home() {
  const { currentPage, navigate } = useNavigation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const role = user?.role as Role | undefined;

  // Khi bất kỳ API call nào nhận 401, tự động logout + về login
  useEffect(() => {
    const handler = () => { logout(); navigate('login'); };
    window.addEventListener('dg:session-expired', handler);
    return () => window.removeEventListener('dg:session-expired', handler);
  }, [logout, navigate]);
  const obOpenTip = useOnboardingStore((s) => s.openTip);
  const obStartTour = useOnboardingStore((s) => s.startTour);
  const obShowWelcome = useOnboardingStore((s) => s.showWelcome);
  const obPhase = useOnboardingStore((s) => s.phase);
  const obWelcomed = useOnboardingStore((s) => s.welcomed);
  const obAutoWalk = useOnboardingStore((s) => s.autoWalk);
  const obSeenPages = useOnboardingStore((s) => s.seenPages);

  // Sync the radius mode store + <html data-radius> from localStorage on mount
  // (the no-FOUC script in layout.tsx already set the attribute before paint).
  useEffect(() => {
    useAppearanceStore.getState().hydrate();
  }, []);

  // Link mời /?invite=<token> → mở trang accept-invite (ưu tiên cao nhất, kể cả khi đã có token cũ).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasInvite = new URLSearchParams(window.location.search).get('invite');
    if (hasInvite && currentPage !== 'accept-invite') navigate('accept-invite');
  }, [currentPage, navigate]);

  // Redirect theo trạng thái đăng nhập:
  //  - đã đăng nhập mà đang ở landing/login → vào dashboard (giữ trong app sau reload).
  //  - chưa đăng nhập mà ở trang workspace → đẩy về login.
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('invite')) return; // nhường cho accept-invite
    if (user && (currentPage === 'landing' || currentPage === 'login')) {
      navigate(defaultPageFor((user.role as Role) ?? 'viewer'));
    } else if (!user && !standalonePages.includes(currentPage)) {
      navigate('login');
    }
  }, [user, currentPage, navigate]);

  // Onboarding: lần đầu → modal chào mừng; nếu đã đồng ý "đi một vòng" → mỗi trang lần đầu tự chạy tour.
  useEffect(() => {
    if (!user || user.must_change_password) return;
    if (standalonePages.includes(currentPage)) return;
    if (obPhase !== 'closed') return;
    const uid = user.id;
    if (!obWelcomed[uid]) { obShowWelcome(); return; }
    if (obAutoWalk[uid] && !obSeenPages[`${uid}::${currentPage}`]) {
      const hasTour = !!PAGE_TOURS[currentPage] || currentPage === 'dashboard';
      if (hasTour) obStartTour(); else obOpenTip();
    }
  }, [user, currentPage, obPhase, obWelcomed, obAutoWalk, obSeenPages, obShowWelcome, obStartTour, obOpenTip]);

  // Standalone pages (landing, login, register, accept-invite) — no sidebar/header
  if (standalonePages.includes(currentPage)) {
    const Component = standaloneComponents[currentPage] ?? LandingPage;
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <Component />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Force-change-password gate: authenticated user with a temp password must
  // change it before reaching any workspace page (block the whole layout).
  if (user && user.must_change_password) {
    return <ForceChangePassword />;
  }

  // All workspace pages share sidebar + header layout
  const PageComponent = pageComponents[currentPage];
  const allowed = canAccess(role, currentPage);

  const deniedView = (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="text-center px-10 py-12 rounded-3xl max-w-md"
        style={{
          background: 'linear-gradient(155deg,rgba(255,255,255,.9) 0%,rgba(255,255,255,.72) 100%)',
          backdropFilter: 'blur(52px) saturate(200%)',
          WebkitBackdropFilter: 'blur(52px) saturate(200%)',
          border: '1px solid rgba(255,255,255,.72)',
          boxShadow: '0 12px 48px rgba(0,0,0,.09),inset 0 1.5px 0 rgba(255,255,255,.95)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(186,26,26,.08)', border: '1px solid rgba(186,26,26,.18)' }}
        >
          <Icon name="lock" fill className="text-[30px]" style={{ color: '#ba1a1a' }} />
        </div>
        <h2 className="text-[19px] font-black text-slate-800 mb-2" style={{ letterSpacing: '-0.02em' }}>
          Không có quyền truy cập
        </h2>
        <p className="text-[13px] text-slate-500 mb-6">
          Tài khoản của bạn không có quyền xem trang này.
        </p>
        <button
          onClick={() => navigate('dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold transition-transform hover:scale-[1.02]"
          style={{ background: '#0050cb', boxShadow: '0 4px 20px rgba(0,80,203,.3)' }}
        >
          <Icon name="dashboard" className="text-[18px]" />
          Về Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#0b1c30] font-sans overflow-x-hidden relative">
      {/* Background — muted blobs for depth without visual noise */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-blob w-[700px] h-[700px] top-[-200px] right-[-150px]" style={{ background: 'radial-gradient(circle, rgba(99,130,255,0.35) 0%, transparent 70%)' }} />
        <div className="bg-blob w-[500px] h-[500px] bottom-[-100px] left-[-80px]" style={{ background: 'radial-gradient(circle, rgba(139,167,255,0.22) 0%, transparent 70%)' }} />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Top Header */}
      <TopHeader />

      {/* Main Content */}
      <main className="ml-[240px] pt-[72px] px-8 pb-12 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {!allowed ? deniedView : PageComponent && <PageComponent />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Product tour theo role (overlay, tự bật lần đầu mỗi user) */}
      <OnboardingTour />
    </div>
  );
}
