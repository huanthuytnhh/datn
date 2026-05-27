'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */
interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'paused';
  lastDelivery: string;
}

/* ──────────────────────────────────────────────
   MOCK DATA
   ────────────────────────────────────────────── */
const initialWebhooks: Webhook[] = [
  {
    id: '1',
    url: 'https://vietbank.vn/api/webhooks/deepfake',
    events: ['job.completed', 'job.failed'],
    status: 'active',
    lastDelivery: '5 phút trước',
  },
  {
    id: '2',
    url: 'https://staging.vietbank.vn/hooks/alerts',
    events: ['quota.warning'],
    status: 'paused',
    lastDelivery: '2 ngày trước',
  },
];

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

/* ──────────────────────────────────────────────
   CONTAINER VARIANTS
   ────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'tween', duration: 0.4, ease: 'easeOut' } },
};

/* ──────────────────────────────────────────────
   ACTION MENU
   ────────────────────────────────────────────── */
function ActionMenu({ webhookId, onAction }: { webhookId: string; onAction: (id: string, action: string) => void }) {
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

  const items = [
    { label: 'Edit', icon: 'edit', color: 'text-slate-600' },
    { label: 'Pause', icon: 'pause_circle', color: 'text-[#ed6c02]' },
    { label: 'Delete', icon: 'delete', color: 'text-[#ba1a1a]' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors group"
        aria-label="Actions"
      >
        <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-600 transition-colors">
          more_vert
        </span>
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
                  onAction(webhookId, item.label.toLowerCase());
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-semibold hover:bg-slate-50 transition-colors ${item.color} ${idx === items.length - 1 ? 'border-t border-slate-100 mt-1 pt-2.5' : ''}`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
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
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState('');
  const [testResult, setTestResult] = useState<Record<string, string>>({});
  const [showEmpty, setShowEmpty] = useState(false);

  const displayWebhooks = showEmpty ? [] : webhooks;

  const handleCreateWebhook = () => {
    if (!newUrl.trim() || newEvents.length === 0) return;

    const newWebhook: Webhook = {
      id: String(Date.now()),
      url: newUrl.trim(),
      events: [...newEvents],
      status: 'active',
      lastDelivery: 'Chưa có',
    };

    setWebhooks((prev) => [newWebhook, ...prev]);
    setNewUrl('');
    setNewEvents([]);
    setNewSecret('');
    setShowCreateForm(false);
  };

  const handleTestWebhook = (id: string) => {
    const latency = Math.floor(Math.random() * 300) + 100;
    const statusCodes = [200, 200, 200, 201, 200];
    const code = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    setTestResult((prev) => ({
      ...prev,
      [id]: `✅ Delivered — ${code} OK — ${latency}ms`,
    }));
  };

  const handleAction = (id: string, action: string) => {
    if (action === 'delete') {
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } else if (action === 'pause') {
      setWebhooks((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: w.status === 'paused' ? 'active' as const : 'paused' as const } : w))
      );
    } else if (action === 'edit') {
      const newUrlEdit = prompt('Nhập URL mới:');
      if (newUrlEdit?.trim()) {
        setWebhooks((prev) =>
          prev.map((w) => (w.id === id ? { ...w, url: newUrlEdit.trim() } : w))
        );
      }
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
            <span className="material-symbols-outlined text-[28px] text-[#0050cb]">webhook</span>
            Webhooks
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý webhook endpoints cho hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEmpty((prev) => !prev)}
            className="px-3 py-2 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-wider"
            title="Toggle empty state (demo)"
          >
            {showEmpty ? 'Show Data' : 'Empty Demo'}
          </button>
          <button
            onClick={() => { setShowCreateForm((prev) => !prev); setNewUrl(''); setNewEvents([]); setNewSecret(''); }}
            className="px-5 py-2.5 bg-[#0050cb] text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:shadow-[#0050cb]/30 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Thêm webhook
          </button>
        </div>
      </motion.div>

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
                  <span className="material-symbols-outlined text-[20px] text-[#0050cb]">add_circle</span>
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
                            <span className="material-symbols-outlined text-[12px]">check</span>
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
                    disabled={!newUrl.trim() || newEvents.length === 0}
                    className="px-6 py-2.5 bg-[#0050cb] text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Tạo webhook
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          EMPTY STATE
          ══════════════════════════════════════ */}
      {displayWebhooks.length === 0 && (
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-12 shadow-md border border-white/60 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#0050cb]/5 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-[40px] text-[#0050cb]/30">webhook</span>
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">Chưa có webhook nào</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Thêm webhook đầu tiên để nhận thông báo real-time khi có sự kiện trong hệ thống DeepGuard.
          </p>
          <button
            onClick={() => { setShowCreateForm(true); setNewUrl(''); setNewEvents([]); setNewSecret(''); }}
            className="px-6 py-3 bg-[#0050cb] text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Thêm webhook đầu tiên
          </button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          WEBHOOK LIST TABLE
          ══════════════════════════════════════ */}
      {displayWebhooks.length > 0 && (
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
                {displayWebhooks.map((webhook) => (
                  <>
                    <tr
                      key={webhook.id}
                      className="hover:bg-[#0050cb]/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#0050cb]/5 flex items-center justify-center shrink-0 group-hover:bg-[#0050cb]/10 transition-colors">
                            <span className="material-symbols-outlined text-[16px] text-[#0050cb]">webhook</span>
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
                        {webhook.status === 'active' ? (
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
                        <span className="text-[11px] text-slate-500 font-medium">{webhook.lastDelivery}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTestWebhook(webhook.id)}
                            className="px-3 py-1.5 text-[10px] font-bold text-[#0050cb] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">send</span>
                            Test
                          </button>
                          <ActionMenu webhookId={webhook.id} onAction={handleAction} />
                        </div>
                      </td>
                    </tr>
                    {/* Test result row */}
                    {testResult[webhook.id] && (
                      <tr key={`${webhook.id}-test`}>
                        <td colSpan={5} className="px-6 py-0">
                          <div className="mx-6 mb-3 mt-1 p-3 bg-green-50/60 rounded-xl border border-green-100">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-bold text-[#2e7d32]">
                                {testResult[webhook.id]}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              {displayWebhooks.length} webhook{displayWebhooks.length !== 1 ? 's' : ''}
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
