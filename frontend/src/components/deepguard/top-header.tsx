'use client';

import { useNavigation } from '@/store/navigation';

export default function TopHeader() {
  const { currentPage, navigate } = useNavigation();

  const getTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'playground': return 'API Playground';
      case 'history': return 'Lịch sử phát hiện';
      case 'detail': return 'Chi tiết phát hiện';
      case 'apikeys': return 'API Keys';
      case 'analytics': return 'Analytics';
      case 'docs': return 'API Documentation';
      case 'webhooks': return 'Webhooks';
      case 'tenants': return 'Quản lý Tenants';
      default: return 'DeepGuard';
    }
  };

  const getSubtitle = () => {
    switch (currentPage) {
      case 'playground': return 'Workbench v2.1';
      case 'dashboard': return 'Tổng quan';
      case 'apikeys': return 'Quản lý khóa truy cập';
      case 'analytics': return 'Thống kê sử dụng';
      case 'docs': return 'v2.1';
      case 'webhooks': return 'Cấu hình callback';
      case 'tenants': return 'Admin Panel';
      default: return null;
    }
  };

  const getBadge = () => {
    switch (currentPage) {
      case 'history': return { text: '127 EVENTS', color: 'bg-[#0050cb]/10 text-[#0050cb] border-[#0050cb]/20' };
      case 'tenants': return { text: '12 TENANTS', color: 'bg-purple-50 text-purple-600 border-purple-200' };
      default: return null;
    }
  };

  const badge = getBadge();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl flex justify-between items-center h-16 px-8 shadow-sm">
      <div className="flex items-center gap-4">
        {currentPage === 'detail' && (
          <button
            onClick={() => navigate('history')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-800">{getTitle()}</span>
            {badge && (
              <div className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${badge.color}`}>{badge.text}</div>
            )}
          </div>
          {currentPage === 'detail' && (
            <p className="text-[10px] font-mono text-slate-400">ID: abc-123-def-456</p>
          )}
        </div>
        {getSubtitle() && (
          <>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500">{getSubtitle()}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full border border-slate-200">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-slate-600">MODEL READY</span>
        </div>
        {currentPage === 'playground' && (
          <button className="bg-[#0050cb] text-white px-4 py-1.5 rounded-full shadow-lg hover:bg-[#0050cb]/90 transition-all text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span> Xuất Báo Cáo
          </button>
        )}
        {currentPage === 'detail' && (
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-full hover:bg-slate-50 transition-all text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Forensic Report
          </button>
        )}
        {currentPage === 'analytics' && (
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-full hover:bg-slate-50 transition-all text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
          </button>
        )}
      </div>
    </header>
  );
}
