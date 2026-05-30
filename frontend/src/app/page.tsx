'use client';

import { useNavigation } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';
import { canAccess, type Role } from '@/lib/rbac';
import { Icon } from '@/components/deepguard/shared';
import LandingPage from '@/components/deepguard/landing-page';
import LoginPage from '@/components/deepguard/login-page';
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

const standalonePages = ['landing', 'login'];

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
  const role = useAuthStore((s) => s.user?.role) as Role | undefined;

  // Standalone pages (landing, login) — no sidebar/header
  if (standalonePages.includes(currentPage)) {
    const Component = currentPage === 'landing' ? LandingPage : LoginPage;
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
    <div className="min-h-screen bg-[#F0F9FF] text-[#0b1c30] font-sans overflow-x-hidden relative">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-blob bg-blue-200 w-[600px] h-[600px] top-[-200px] right-[-100px]" />
        <div className="bg-blob bg-indigo-100 w-[500px] h-[500px] bottom-[-100px] left-[-100px]" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Top Header */}
      <TopHeader />

      {/* Main Content */}
      <main className="ml-[240px] pt-24 px-8 pb-12 max-w-[1600px] mx-auto">
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
    </div>
  );
}
