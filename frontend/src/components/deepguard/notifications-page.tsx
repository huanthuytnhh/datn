'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from '@/components/deepguard/shared';
import { useNavigation, type Page } from '@/store/navigation';
import {
  notificationsList,
  notificationMarkRead,
  notificationsReadAll,
  notificationDelete,
  type NotificationOut,
} from '@/lib/api';
import { DG, timeAgo } from '@/lib/dg';

/* ──────────────────────────────────────────────
   DeepGuard — Notifications Center
   Wired to the real backend /notifications API.
   ────────────────────────────────────────────── */

type NotifType = 'info' | 'success' | 'warning' | 'critical';

interface NotifTypeMeta {
  icon: string;
  color: string;
  bg: string;
  label: string;
}

const NOTIF_TYPE: Record<NotifType, NotifTypeMeta> = {
  info:     { icon: 'info',         color: '#0050cb', bg: '#eff6ff', label: 'Thông tin' },
  success:  { icon: 'check_circle', color: '#2e7d32', bg: '#f0fdf4', label: 'Thành công' },
  warning:  { icon: 'warning',      color: '#ed6c02', bg: '#fff7ed', label: 'Cảnh báo' },
  critical: { icon: 'error',        color: '#ba1a1a', bg: '#fef2f2', label: 'Nghiêm trọng' },
};

const FALLBACK_META: NotifTypeMeta = NOTIF_TYPE.info;

function typeMeta(type: string): NotifTypeMeta {
  return NOTIF_TYPE[type as NotifType] ?? FALLBACK_META;
}

type FilterId = 'all' | 'unread' | NotifType;

const CHIPS: { id: FilterId; label: string }[] = [
  { id: 'all',      label: 'Tất cả' },
  { id: 'unread',   label: 'Chưa đọc' },
  { id: 'info',     label: 'Thông tin' },
  { id: 'success',  label: 'Thành công' },
  { id: 'warning',  label: 'Cảnh báo' },
  { id: 'critical', label: 'Nghiêm trọng' },
];

// Valid in-app pages a notification link can target.
const VALID_PAGES: ReadonlySet<Page> = new Set<Page>([
  'dashboard', 'history', 'models', 'webhooks', 'apikeys', 'settings',
  'analytics', 'audit', 'tenants', 'team', 'billing', 'account',
  'status', 'liveness', 'playground', 'docs',
]);

/** Map a notification link like '/history' to a navigable Page (or null if unknown). */
function linkToPage(link: string | null): Page | null {
  if (!link) return null;
  const seg = link.replace(/^\/+/, '').split(/[/?#]/)[0].trim();
  return VALID_PAGES.has(seg as Page) ? (seg as Page) : null;
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function StateBlock({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="glass-panel rounded-2xl p-12 shadow-sm border border-white/60 flex flex-col items-center text-center gap-3 dg-fade">
      <Icon name={icon} className="text-[44px] text-slate-300" />
      <div>
        <p className="text-sm font-bold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigation((s) => s.navigate);

  const [items, setItems] = useState<NotificationOut[]>([]);
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState<FilterId>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<NotificationOut | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    notificationsList({ limit: 100 })
      .then((res) => {
        setItems(res.items);
        setUnread(res.unread);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Lỗi tải thông báo'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      items.filter((n) =>
        filter === 'all' ? true : filter === 'unread' ? !n.read : n.type === filter,
      ),
    [items, filter],
  );

  // Optimistically mark an item read in local state + recompute unread count.
  const markReadLocal = useCallback((id: string) => {
    setItems((p) => {
      let changed = false;
      const next = p.map((n) => {
        if (n.id === id && !n.read) { changed = true; return { ...n, read: true }; }
        return n;
      });
      if (changed) setUnread((u) => Math.max(0, u - 1));
      return next;
    });
  }, []);

  const markRead = useCallback(
    (id: string) => {
      markReadLocal(id);
      notificationMarkRead(id).catch(() => load()); // reconcile on failure
    },
    [markReadLocal, load],
  );

  const markAll = useCallback(() => {
    setItems((p) => p.map((n) => ({ ...n, read: true })));
    setUnread(0);
    notificationsReadAll()
      .then(() => load())
      .catch(() => load());
  }, [load]);

  const remove = useCallback(
    (id: string) => {
      setItems((p) => {
        const target = p.find((n) => n.id === id);
        if (target && !target.read) setUnread((u) => Math.max(0, u - 1));
        return p.filter((n) => n.id !== id);
      });
      notificationDelete(id).catch(() => load()); // reconcile on failure
    },
    [load],
  );

  const openDetail = useCallback(
    (n: NotificationOut) => {
      if (!n.read) markRead(n.id);
      const page = linkToPage(n.link);
      if (page) {
        navigate(page);
      } else {
        setSelected(n);
      }
    },
    [markRead, navigate],
  );

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 dg-rise">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            Thông báo
            {unread > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white bg-dgfake tabular-nums">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 tabular-nums">{unread} thông báo chưa đọc</p>
        </div>
        <button
          onClick={markAll}
          disabled={unread === 0}
          className="flex items-center gap-2 px-4 h-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="done_all" className="text-[18px]" /> Đánh dấu đã đọc tất cả
        </button>
      </div>

      {/* filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap dg-rise">
        {CHIPS.map((c) => {
          const cnt =
            c.id === 'all'
              ? items.length
              : c.id === 'unread'
                ? unread
                : items.filter((n) => n.type === c.id).length;
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-3 h-9 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                active
                  ? 'bg-dgblue text-white border-transparent shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {c.label}
              <span
                className={`text-[9px] tabular-nums px-1 rounded ${active ? 'bg-white/20' : 'bg-slate-100'}`}
              >
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass-panel rounded-2xl p-4 border border-white/60 flex items-center gap-3"
            >
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <StateBlock
          icon="cloud_off"
          title="Không tải được thông báo"
          desc={error || 'Kết nối tới máy chủ bị gián đoạn. Thử lại sau giây lát.'}
        />
      ) : filtered.length === 0 ? (
        <StateBlock
          icon="notifications_off"
          title="Không có thông báo"
          desc={
            filter === 'unread'
              ? 'Bạn đã đọc hết thông báo. Tuyệt vời!'
              : 'Chưa có thông báo nào trong mục này.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const ty = typeMeta(n.type);
            return (
              <div
                key={n.id}
                onClick={() => openDetail(n)}
                className={`group feed-in glass-panel rounded-2xl p-4 border shadow-sm flex items-start gap-3.5 transition-all hover:shadow-md cursor-pointer ${
                  n.read ? 'border-white/60' : 'border-dgblue/20'
                }`}
                style={n.read ? {} : { background: 'rgba(0,80,203,.025)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: ty.bg }}
                >
                  <Icon name={ty.icon} className="text-[20px]" style={{ color: ty.color }} fill />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-black text-slate-800">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-dgblue shrink-0" />}
                    {linkToPage(n.link) && (
                      <Icon name="open_in_new" className="text-[13px] text-slate-300" />
                    )}
                  </div>
                  {n.body && (
                    <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">{n.body}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{timeAgo(n.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                    disabled={n.read}
                    title="Đánh dấu đã đọc"
                    className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-slate-400 hover:text-dgblue transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <Icon name="mark_email_read" className="text-[17px]" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                    title="Xoá"
                    className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-slate-400 hover:text-dgfake transition-colors"
                  >
                    <Icon name="delete" className="text-[17px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/30 dg-fade"
            onClick={() => setSelected(null)}
          />
          <aside className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-slate-100 flex flex-col feed-in custom-scrollbar overflow-y-auto">
            {(() => {
              const ty = typeMeta(selected.type);
              const page = linkToPage(selected.link);
              return (
                <>
                  <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: ty.bg }}
                      >
                        <Icon
                          name={ty.icon}
                          className="text-[22px]"
                          style={{ color: ty.color }}
                          fill
                        />
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded"
                        style={{ color: ty.color, background: ty.bg }}
                      >
                        {ty.label}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                      title="Đóng"
                    >
                      <Icon name="close" className="text-[20px]" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4 flex-1">
                    <h2 className="text-lg font-black text-slate-900 leading-snug">
                      {selected.title}
                    </h2>
                    {selected.body && (
                      <p className="text-sm text-slate-600 leading-relaxed">{selected.body}</p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <Icon name="schedule" className="text-[15px]" />
                      <span className="tabular-nums">{fmtDateTime(selected.created_at)}</span>
                      <span>· {timeAgo(selected.created_at)}</span>
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 flex items-center gap-2">
                    {page && (
                      <button
                        onClick={() => { navigate(page); setSelected(null); }}
                        className="flex-1 flex items-center justify-center gap-2 h-10 bg-dgblue text-white rounded-xl text-xs font-bold hover:bg-dgblue/90 transition-all shadow-sm"
                      >
                        <Icon name="open_in_new" className="text-[18px]" /> Mở
                      </button>
                    )}
                    {!page && (
                      <div className="flex-1 flex items-center justify-center gap-2 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-400">
                        <Icon name="mark_email_read" className="text-[18px]" /> Đã đọc
                      </div>
                    )}
                    <button
                      onClick={() => { remove(selected.id); setSelected(null); }}
                      className="flex items-center justify-center gap-2 h-10 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-dgfake hover:bg-dgfake/5 transition-all"
                      style={{ borderColor: `${DG.fake}30` }}
                    >
                      <Icon name="delete" className="text-[18px]" /> Xoá
                    </button>
                  </div>
                </>
              );
            })()}
          </aside>
        </div>
      )}
    </div>
  );
}
