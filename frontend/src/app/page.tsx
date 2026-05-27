'use client';

import { useNavigation } from '@/store/navigation';
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
};

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
};

export default function Home() {
  const { currentPage } = useNavigation();

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
            {PageComponent && <PageComponent />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
