'use client';

import { useNavigation, type Page } from '@/store/navigation';
import { Icon } from '@/components/deepguard/shared';

const META: Record<string, { title: string; sub?: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Tổng quan' },
  playground: { title: 'API Playground', sub: 'Workbench v2.1' },
  history: { title: 'Lịch sử phát hiện', sub: 'Compliance' },
  detail: { title: 'Chi tiết phát hiện', sub: 'Forensic' },
  tenants: { title: 'Quản lý Tenants', sub: 'Admin Panel' },
  audit: { title: 'Audit Logs', sub: 'Compliance' },
  apikeys: { title: 'API Keys', sub: 'Quản lý khóa' },
  docs: { title: 'API Documentation', sub: 'v2.1' },
  analytics: { title: 'Analytics', sub: 'Thống kê sâu' },
  webhooks: { title: 'Webhooks', sub: 'Cấu hình callback' },
  liveness: { title: 'Liveness Check', sub: 'Workspace' },
  team: { title: 'Team & Roles', sub: 'Admin' },
  billing: { title: 'Billing & Usage', sub: 'Account' },
  notifications: { title: 'Thông báo', sub: 'Inbox' },
  settings: { title: 'Cài đặt', sub: 'Account' },
  models: { title: 'Models & Thresholds', sub: 'AI' },
  status: { title: 'Status & Compliance', sub: 'Trust' },
  account: { title: 'Tài khoản cá nhân', sub: 'Account' },
};

export default function TopHeader() {
  const { currentPage, navigate } = useNavigation();
  const meta = META[currentPage] ?? { title: 'DeepGuard' };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 border-b border-white/50 bg-white/75 backdrop-blur-xl flex justify-between items-center h-16 px-8 shadow-sm">
      <div className="flex items-center gap-3">
        {currentPage === 'detail' && (
          <button
            onClick={() => navigate('history')}
            className="w-9 h-9 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600"
          >
            <Icon name="arrow_back" />
          </button>
        )}
        <span className="text-sm font-bold text-slate-800">{meta.title}</span>
        {meta.sub && (
          <>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500">{meta.sub}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-full bg-white/60 border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium w-44">
          <Icon name="search" className="text-[18px]" /> Tìm request…
          <kbd className="ml-auto text-[9px] font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
        </button>

        <div className="flex items-center gap-2 px-3 h-9 bg-white/60 rounded-full border border-slate-200">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold text-slate-600">MODEL READY</span>
        </div>

        <button
          onClick={() => navigate('notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/60 border border-slate-200 text-slate-500 hover:text-dgblue transition-colors"
        >
          <Icon name="notifications" className="text-[19px]" fill={currentPage === 'notifications'} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-dgfake rounded-full" />
        </button>

        {currentPage === 'playground' && (
          <button className="bg-dgblue text-white px-4 h-9 rounded-full shadow-lg shadow-dgblue/25 hover:bg-dgblue/90 transition-all text-xs font-bold flex items-center gap-2">
            <Icon name="download" className="text-[18px]" /> Xuất Báo Cáo
          </button>
        )}
        {currentPage === 'detail' && (
          <button className="bg-white border border-slate-200 text-slate-700 px-4 h-9 rounded-full hover:bg-slate-50 transition-all text-xs font-bold flex items-center gap-2 shadow-sm">
            <Icon name="picture_as_pdf" className="text-[18px]" /> Forensic Report
          </button>
        )}
      </div>
    </header>
  );
}
