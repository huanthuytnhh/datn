'use client';

import { Fragment, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Icon } from '@/components/deepguard/shared';
import { timeAgo } from '@/lib/dg';
import {
  webhooksList,
  webhooksCreate,
  webhooksUpdate,
  webhooksDelete,
  type WebhookOut,
} from '@/lib/api';

/* ──────────────────────────────────────────────
   EVENT CONFIG
   ────────────────────────────────────────────── */
const availableEvents = [
  { value: 'job.completed', label: 'job.completed', color: '#2e7d32', bg: 'bg-green-50', border: 'border-green-200' },
  { value: 'job.failed', label: 'job.failed', color: '#ba1a1a', bg: 'bg-red-50', border: 'border-red-200' },
  { value: 'quota.warning', label: 'quota.warning', color: '#ed6c02', bg: 'bg-orange-50', border: 'border-orange-200' },
];

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen - 3) + '...';
}

function getEventConfig(value: string) {
  return availableEvents.find((e) => e.value === value) ?? { value, label: value, color: '#64748b', bg: 'bg-slate-50', border: 'border-slate-200' };
}

/** Human-readable "last delivery" cell from a WebhookOut. */
function lastDeliveryLabel(w: WebhookOut): string {
  if (!w.last_delivery_at) return 'Chưa có';
  const ago = timeAgo(w.last_delivery_at);
  return w.last_delivery_status != null ? `${ago} · ${w.last_delivery_status}` : ago;
}

/* ──────────────────────────────────────────────
   ANIMATION VARIANTS
   ────────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'tween', duration: 0.4, ease: 'easeOut' } },
};

/* ──────────────────────────────────────────────
   ACTION MENU
   ────────────────────────────────────────────── */
function ActionMenu({
  status,
  onAction,
}: {
  status: 'active' | 'paused';
  onAction: (action: 'edit' | 'toggle' | 'delete') => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const items: { label: string; icon: string; color: string; action: 'edit' | 'toggle' | 'delete' }[] = [
    { label: 'Edit', icon: 'edit', color: 'text-slate-600', action: 'edit' },
    status === 'active'
      ? { label: 'Pause', icon: 'pause_circle', color: 'text-[#ed6c02]', action: 'toggle' }
      : { label: 'Activate', icon: 'play_circle', color: 'text-[#2e7d32]', action: 'toggle' },
    { label: 'Delete', icon: 'delete', color: 'text-[#ba1a1a]', action: 'delete' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors group"
        aria-label="Actions"
      >
        <Icon name="more_vert" className="text-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-1 z-50 glass-panel rounded-xl shadow-xl border border-white/80 py-1.5 min-w-[150px]"
          >
            {items.map((item, idx) => (
              <button
                key={item.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(item.action);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-semibold hover:bg-slate-50 transition-colors ${item.color} ${idx === items.length - 1 ? 'border-t border-slate-100 mt-1 pt-2.5' : ''}`}
              >
                <Icon name={item.icon} className="text-[16px]" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
   WEBHOOKS PAGE
   ────────────────────────────────────────────── */
export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState('');

  const loadWebhooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await webhooksList();
      setWebhooks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được danh sách webhook');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWebhooks();
  }, [loadWebhooks]);

  const resetForm = () => {
    setNewUrl('');
    setNewEvents([]);
    setNewSecret('');
  };

  const handleCreateWebhook = async () => {
    if (!newUrl.trim() || newEvents.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await webhooksCreate(newUrl.trim(), [...newEvents], newSecret.trim() || undefined);
      resetForm();
      setShowCreateForm(false);
      await loadWebhooks();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tạo webhook thất bại');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStatus = async (w: WebhookOut) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = w.status === 'active' ? 'paused' : 'active';
      await webhooksUpdate(w.id, { status: next });
      await loadWebhooks();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật trạng thái thất bại');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async (w: WebhookOut) => {
    if (busy) return;
    const newUrlEdit = prompt('Nhập URL mới:', w.url);
    if (!newUrlEdit?.trim() || newUrlEdit.trim() === w.url) return;
    setBusy(true);
    setError(null);
    try {
      await webhooksUpdate(w.id, { url: newUrlEdit.trim() });
      await loadWebhooks();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật URL thất bại');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (w: WebhookOut) => {
    if (busy) return;
    if (!confirm('Xóa webhook này?')) return;
    setBusy(true);
    setError(null);
    try {
      await webhooksDelete(w.id);
      await loadWebhooks();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa webhook thất bại');
    } finally {
      setBusy(false);
    }
  };

  const toggleEvent = (value: string) => {
    setNewEvents((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ══════════════════════════════════════
          PAGE HEADER
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Icon name="webhook" className="text-[28px] text-[#0050cb]" />
            Webhooks
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý webhook endpoints cho hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowCreateForm((prev) => !prev); resetForm(); }}
            className="px-5 py-2.5 bg-[#0050cb] text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:shadow-[#0050cb]/30 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
          >
            <Icon name="add" className="text-[16px]" />
            Thêm webhook
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          ERROR BANNER
          ══════════════════════════════════════ */}
      {error && (
        <motion.div variants={itemVariants} className="glass-panel rounded-xl px-5 py-3 border border-red-200 bg-red-50/60 flex items-center gap-3">
          <Icon name="error" className="text-[18px] text-[#ba1a1a]" />
          <span className="text-[12px] font-semibold text-[#ba1a1a]">{error}</span>
          <button
            onClick={loadWebhooks}
            className="ml-auto px-3 py-1.5 text-[10px] font-bold text-[#ba1a1a] bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Thử lại
          </button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          CREATE FORM
          ══════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-panel rounded-2xl p-6 shadow-md border border-white/60">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#0050cb]/5 flex items-center justify-center">
                  <Icon name="add_circle" className="text-[20px] text-[#0050cb]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Tạo Webhook mới</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Nhập thông tin webhook endpoint</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* URL */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    URL <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://your-server.com/webhook"
                    className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all"
                    autoFocus
                  />
                </div>

                {/* Event types */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-3">
                    Event types <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {availableEvents.map((evt) => (
                      <label
                        key={evt.value}
                        className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                          newEvents.includes(evt.value)
                            ? `${evt.bg} ${evt.border}`
                            : 'bg-white/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newEvents.includes(evt.value)}
                          onChange={() => toggleEvent(evt.value)}
                          className="sr-only"
                        />
                        <span
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            newEvents.includes(evt.value)
                              ? 'border-current'
                              : 'border-slate-300'
                          }`}
                          style={{ color: newEvents.includes(evt.value) ? evt.color : undefined }}
                        >
                          {newEvents.includes(evt.value) && (
                            <Icon name="check" className="text-[12px]" />
                          )}
                        </span>
                        <span
                          className={`text-[12px] font-semibold ${
                            newEvents.includes(evt.value) ? '' : 'text-slate-500'
                          }`}
                          style={{ color: newEvents.includes(evt.value) ? evt.color : undefined }}
                        >
                          {evt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Secret key */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Secret key <span className="text-slate-300 font-normal normal-case">(tùy chọn)</span>
                  </label>
                  <input
                    type="text"
                    value={newSecret}
                    onChange={(e) => setNewSecret(e.target.value)}
                    placeholder="HMAC secret key"
                    className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-5 py-2.5 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateWebhook}
                    disabled={!newUrl.trim() || newEvents.length === 0 || busy}
                    className="px-6 py-2.5 bg-[#0050cb] text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Icon name={busy ? 'progress_activity' : 'add'} className={`text-[14px] ${busy ? 'animate-spin' : ''}`} />
                    Tạo webhook
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          LOADING STATE
          ══════════════════════════════════════ */}
      {loading && (
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-12 shadow-md border border-white/60 text-center">
          <Icon name="progress_activity" className="text-[40px] text-[#0050cb] animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400 font-medium">Đang tải danh sách webhook…</p>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          EMPTY STATE
          ══════════════════════════════════════ */}
      {!loading && !error && webhooks.length === 0 && (
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-12 shadow-md border border-white/60 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#0050cb]/5 flex items-center justify-center mx-auto mb-5">
            <Icon name="webhook" className="text-[40px] text-[#0050cb]/30" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">Chưa có webhook nào</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Thêm webhook đầu tiên để nhận thông báo real-time khi có sự kiện trong hệ thống DeepGuard.
          </p>
          <button
            onClick={() => { setShowCreateForm(true); resetForm(); }}
            className="px-6 py-3 bg-[#0050cb] text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all inline-flex items-center gap-2"
          >
            <Icon name="add" className="text-[16px]" />
            Thêm webhook đầu tiên
          </button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          WEBHOOK LIST TABLE
          ══════════════════════════════════════ */}
      {!loading && webhooks.length > 0 && (
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl shadow-md border border-white/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">URL</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Events</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Last delivery</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {webhooks.map((webhook) => {
                  const isActive = webhook.status === 'active';
                  return (
                    <Fragment key={webhook.id}>
                      <tr className="hover:bg-[#0050cb]/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0050cb]/5 flex items-center justify-center shrink-0 group-hover:bg-[#0050cb]/10 transition-colors">
                              <Icon name="webhook" className="text-[16px] text-[#0050cb]" />
                            </div>
                            <code className="text-[12px] font-mono font-semibold text-slate-700" title={webhook.url}>
                              {truncateUrl(webhook.url)}
                            </code>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {webhook.events.map((evt) => {
                              const config = getEventConfig(evt);
                              return (
                                <span
                                  key={evt}
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider border ${config.bg} ${config.border}`}
                                  style={{ color: config.color }}
                                >
                                  {config.label}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border bg-green-50 text-[#2e7d32] border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border bg-amber-50 text-[#ed6c02] border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ed6c02]" />
                              Paused
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-[11px] text-slate-500 font-medium">{lastDeliveryLabel(webhook)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled
                              title="Test delivery — sắp có"
                              className="px-3 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed flex items-center gap-1"
                            >
                              <Icon name="send" className="text-[12px]" />
                              Test
                              <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 text-[8px] tracking-wider">SẮP CÓ</span>
                            </button>
                            <ActionMenu
                              status={isActive ? 'active' : 'paused'}
                              onAction={(action) => {
                                if (action === 'edit') handleEdit(webhook);
                                else if (action === 'toggle') handleToggleStatus(webhook);
                                else if (action === 'delete') handleDelete(webhook);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse" />
              <span className="text-[10px] text-slate-400 font-semibold">Webhook service active</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
