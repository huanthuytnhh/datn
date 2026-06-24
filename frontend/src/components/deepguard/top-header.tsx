'use client';

import { useEffect, useState } from 'react';
import { useNavigation, type Page } from '@/store/navigation';
import { Icon } from '@/components/deepguard/shared';
import { RadiusQuickToggle } from '@/components/deepguard/radius-switcher';
import { useOnboardingStore } from '@/store/onboarding';
import { notificationsList } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { useLocale, type Locale } from '@/store/locale';

/* Page key → i18n key prefix (title = header.<page>.title, sub = header.<page>.sub) */
const META_KEYS: Record<string, string> = {
  dashboard:     'header.dashboard',
  playground:    'header.playground',
  history:       'header.history',
  detail:        'header.detail',
  tenants:       'header.tenants',
  audit:         'header.audit',
  apikeys:       'header.apikeys',
  docs:          'header.docs',
  analytics:     'header.analytics',
  webhooks:      'header.webhooks',
  liveness:      'header.liveness',
  team:          'header.team',
  billing:       'header.billing',
  notifications: 'header.notifications',
  settings:      'header.settings',
  models:        'header.models',
  status:        'header.status',
  account:       'header.account',
};

/* Small segmented VI/EN toggle */
function LangToggle() {
  const { locale, setLocale } = useLocale();
  const options: { value: Locale; label: string }[] = [
    { value: 'vi', label: 'VI' },
    { value: 'en', label: 'EN' },
  ];
  return (
    <div
      className="flex items-center rounded-lg overflow-hidden"
      style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.7)' }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLocale(opt.value)}
          className="h-8 px-2.5 text-[11px] font-bold transition-colors"
          style={
            locale === opt.value
              ? { background: '#0050cb', color: 'white' }
              : { color: '#64748b' }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function TopHeader() {
  const { currentPage, navigate } = useNavigation();
  const openTip = useOnboardingStore((s) => s.openTip);
  const t = useT();
  const metaPrefix = META_KEYS[currentPage as string];
  const metaTitle = metaPrefix ? t(`${metaPrefix}.title`) : 'DeepGuard';
  const metaSub   = metaPrefix ? t(`${metaPrefix}.sub`)   : undefined;

  // Số thông báo chưa đọc — chỉ hiện chấm đỏ khi > 0 (thay vì hardcode luôn sáng).
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    notificationsList({ unread_only: true, limit: 1 })
      .then((res) => setUnread(res.unread))
      .catch(() => setUnread(0));
  }, [currentPage]);

  return (
    <header
      className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 flex justify-between items-center h-14 px-7"
      style={{
        background: 'rgba(245,248,252,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <div className="flex items-center gap-2.5">
        {currentPage === 'detail' && (
          <button
            onClick={() => navigate('history')}
            className="w-8 h-8 -ml-1 flex items-center justify-center rounded-lg hover:bg-slate-200/60 transition-colors text-slate-500"
          >
            <Icon name="arrow_back" className="text-[18px]" />
          </button>
        )}
        <button
          onClick={openTip}
          title="Bấm để xem hướng dẫn trang này"
          className="group flex items-center gap-1.5 hover:text-dgblue transition-colors"
        >
          <span className="text-[13.5px] font-semibold text-slate-800 group-hover:text-dgblue">{metaTitle}</span>
          <Icon name="info" className="text-[14px] text-slate-300 group-hover:text-dgblue/70 transition-colors" />
        </button>
        {metaSub && (
          <>
            <span className="text-slate-300 text-sm select-none">/</span>
            <span className="text-[11.5px] text-slate-400 font-medium">{metaSub}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="hidden sm:flex items-center gap-2 px-3 h-8 text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors w-40"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8 }}
        >
          <Icon name="search" className="text-[16px]" />
          <span className="flex-1 text-left">Tìm request…</span>
          <kbd className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">⌘K</kbd>
        </button>

        <div
          className="flex items-center gap-1.5 px-2.5 h-8"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8 }}
        >
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold text-slate-500 tracking-wide">READY</span>
        </div>

        <RadiusQuickToggle />

        <LangToggle />

        <button
          onClick={openTip}
          title="Hướng dẫn trang"
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-dgblue transition-colors rounded-lg hover:bg-white/70"
        >
          <Icon name="help" className="text-[18px]" />
        </button>

        <button
          onClick={() => navigate('notifications')}
          className="relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-dgblue transition-colors rounded-lg hover:bg-white/70"
        >
          <Icon name="notifications" className="text-[18px]" fill={currentPage === 'notifications'} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-dgfake rounded-full" />
          )}
        </button>

        {currentPage === 'playground' && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 h-8 rounded-lg text-white text-[12px] font-semibold transition-all hover:opacity-90"
            style={{ background: '#0050cb', boxShadow: '0 2px 10px rgba(0,80,203,0.3)' }}
          >
            <Icon name="download" className="text-[16px]" />
            Xuất Báo Cáo
          </button>
        )}
        {currentPage === 'detail' && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 h-8 rounded-lg text-slate-700 text-[12px] font-semibold transition-all hover:bg-slate-100"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.09)' }}
          >
            <Icon name="picture_as_pdf" className="text-[16px]" />
            Forensic Report
          </button>
        )}
      </div>
    </header>
  );
}
