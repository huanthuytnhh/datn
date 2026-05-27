'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiKeysList, apiKeysCreate, apiKeysRevoke, type ApiKeyOut } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */
interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  status: 'active' | 'suspended' | 'revoked';
  quotaUsed: number;
  quotaLimit: number;
  lastUsed: string;
  created: string;
}


function getUsagePercent(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(Math.round((used / limit) * 100), 100);
}

function getUsageColor(percent: number): string {
  if (percent >= 90) return '#ba1a1a';
  if (percent >= 70) return '#ed6c02';
  return '#2e7d32';
}

/* ──────────────────────────────────────────────
   STATUS BADGE
   ────────────────────────────────────────────── */
function StatusBadge({ status }: { status: ApiKey['status'] }) {
  const config: Record<string, { bg: string; text: string; border: string; label: string; dot: string }> = {
    active: { bg: 'bg-green-50', text: 'text-[#2e7d32]', border: 'border-green-200', label: 'Active', dot: 'bg-[#2e7d32]' },
    suspended: { bg: 'bg-amber-50', text: 'text-[#ed6c02]', border: 'border-amber-200', label: 'Suspended', dot: 'bg-[#ed6c02]' },
    revoked: { bg: 'bg-red-50', text: 'text-[#ba1a1a]', border: 'border-red-200', label: 'Revoked', dot: 'bg-[#ba1a1a]' },
  };
  const s = config[status] ?? config.active;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  );
}

/* ──────────────────────────────────────────────
   QUOTA BAR
   ────────────────────────────────────────────── */
function QuotaBar({ used, limit }: { used: number; limit: number }) {
  const percent = getUsagePercent(used, limit);
  const color = getUsageColor(percent);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-1">
        <span className="text-[11px] font-black text-slate-700">{used.toLocaleString()}</span>
        <span className="text-[10px] text-slate-400 font-medium">/ {limit.toLocaleString()}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}30` }}
        />
      </div>
      <span className="text-[9px] font-bold" style={{ color }}>{percent}%</span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   ACTION MENU
   ────────────────────────────────────────────── */
function ActionMenu({ keyId, onAction }: { keyId: string; onAction: (keyId: string, action: string) => void }) {
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
    { label: 'Rename', icon: 'edit', color: 'text-slate-600' },
    { label: 'Rotate', icon: 'autorenew', color: 'text-[#0050cb]' },
    { label: 'Suspend', icon: 'pause_circle', color: 'text-[#ed6c02]' },
    { label: 'Revoke', icon: 'delete', color: 'text-[#ba1a1a]' },
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
            className="absolute right-0 top-full mt-1 z-50 glass-panel rounded-xl shadow-xl border border-white/80 py-1.5 min-w-[160px]"
          >
            {items.map((item, idx) => (
              <button
                key={item.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(keyId, item.label.toLowerCase());
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
   API KEYS PAGE
   ────────────────────────────────────────────── */
export default function ApiKeysPage() {
  const setApiKey = useAuthStore((s) => s.setApiKey);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyQuota, setNewKeyQuota] = useState(10000);
  const [newKeyRpm, setNewKeyRpm] = useState(100);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadKeys = () => {
    setLoading(true);
    apiKeysList()
      .then((data) => setKeys(data.map(apiOutToLocal)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadKeys(); }, []);

  function apiOutToLocal(k: ApiKeyOut): ApiKey {
    return {
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      status: k.status as ApiKey['status'],
      quotaUsed: k.quota_used,
      quotaLimit: k.quota_limit,
      lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('vi-VN') : 'Chưa sử dụng',
      created: new Date(k.created_at).toLocaleDateString('vi-VN'),
    };
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || creating) return;
    setCreating(true);
    try {
      const created = await apiKeysCreate(newKeyName.trim(), newKeyQuota, newKeyRpm);
      setKeys((prev) => [apiOutToLocal(created), ...prev]);
      setCreatedKey(created.plain_key);
      setApiKey(created.plain_key);
      setNewKeyName('');
      setNewKeyQuota(10000);
      setNewKeyRpm(100);
      setShowCreateModal(false);
      setCopied(false);
    } catch {
      alert('Tạo API key thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDismissBanner = () => {
    setCreatedKey(null);
  };

  const handleAction = async (keyId: string, action: string) => {
    if (action === 'revoke') {
      if (!confirm('Thu hồi API key này?')) return;
      await apiKeysRevoke(keyId).catch(() => {});
      loadKeys();
    }
  };

  const displayKeys = loading ? [] : keys;

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
            <span className="material-symbols-outlined text-[28px] text-[#0050cb]">key</span>
            API Keys
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý API keys cho VietBank Workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowCreateModal(true); setNewKeyName(''); setNewKeyQuota(10000); setNewKeyRpm(100); }}
            className="px-5 py-2.5 bg-[#0050cb] text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:shadow-[#0050cb]/30 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tạo key mới
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          KEY CREATED BANNER
          ══════════════════════════════════════ */}
      <AnimatePresence>
        {createdKey && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#2e7d32]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[#2e7d32] text-[20px]">check_circle</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-black text-[#2e7d32]">
                    API key đã tạo. Copy ngay — sẽ không hiển thị lại!
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <code className="text-[12px] font-mono font-bold bg-white/80 text-slate-800 px-3 py-1.5 rounded-lg border border-green-100 select-all break-all">
                      {createdKey}
                    </code>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyKey}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-[#2e7d32] text-white'
                      : 'bg-white border border-green-200 text-[#2e7d32] hover:bg-green-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Đã copy!' : 'Copy'}
                </button>
                <button
                  onClick={handleDismissBanner}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-100 transition-colors"
                  aria-label="Đóng"
                >
                  <span className="material-symbols-outlined text-[16px] text-green-600">close</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          EMPTY STATE
          ══════════════════════════════════════ */}
      {displayKeys.length === 0 && (
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-12 shadow-md border border-white/60 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#0050cb]/5 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-[40px] text-[#0050cb]/30">vpn_key_off</span>
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">Chưa có API key nào</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Tạo API key đầu tiên để bắt đầu tích hợp DeepGuard Detection API vào ứng dụng của bạn.
          </p>
          <button
            onClick={() => { setShowCreateModal(true); setNewKeyName(''); setNewKeyQuota(10000); setNewKeyRpm(100); }}
            className="px-6 py-3 bg-[#0050cb] text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tạo key đầu tiên
          </button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          KEYS TABLE
          ══════════════════════════════════════ */}
      {displayKeys.length > 0 && (
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl shadow-md border border-white/60 overflow-hidden">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Tên</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Prefix</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Quota</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Lần cuối sử dụng</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Tạo ngày</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayKeys.map((key) => (
                  <tr
                    key={key.id}
                    className="hover:bg-[#0050cb]/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0050cb]/5 flex items-center justify-center shrink-0 group-hover:bg-[#0050cb]/10 transition-colors">
                          <span className="material-symbols-outlined text-[16px] text-[#0050cb]">key</span>
                        </div>
                        <span className="text-[13px] font-bold text-slate-800">{key.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="text-[11px] font-mono font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {key.prefix}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={key.status} />
                    </td>
                    <td className="px-4 py-4 min-w-[140px]">
                      <QuotaBar used={key.quotaUsed} limit={key.quotaLimit} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] text-slate-500 font-medium">{key.lastUsed}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] text-slate-500 font-medium">{key.created}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu keyId={key.id} onAction={handleAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              {displayKeys.length} key{displayKeys.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse" />
              <span className="text-[10px] text-slate-400 font-semibold">API endpoints active</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          INFO CARDS
          ══════════════════════════════════════ */}
      {displayKeys.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#0050cb]/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#0050cb]">shield</span>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Bảo mật</p>
                <p className="text-[13px] font-bold text-slate-700">Key rotation</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Rotate key thường xuyên để đảm bảo an toàn. Key cũ sẽ bị vô hiệu sau 24h khi rotate.
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#2e7d32]/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#2e7d32]">speed</span>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Rate Limit</p>
                <p className="text-[13px] font-bold text-slate-700">100 RPM mặc định</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Giới hạn request/phút giúp bảo vệ hệ thống. Nâng cấp plan để tăng giới hạn.
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-5 shadow-sm border border-white/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#ed6c02]/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#ed6c02]">data_usage</span>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Quota</p>
                <p className="text-[13px] font-bold text-slate-700">Theo dõi sử dụng</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Monitor quota để tránh gián đoạn dịch vụ. Cảnh báo tự động khi đạt 80%.
            </p>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          CREATE MODAL
          ══════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel rounded-2xl shadow-2xl border border-white/80 w-full max-w-md relative z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0050cb]/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-[#0050cb]">add_circle</span>
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Tạo API Key mới</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Key sẽ hiển thị một lần duy nhất sau khi tạo</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Tên key <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="VD: Production API Key"
                    className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all"
                    autoFocus
                  />
                </div>

                {/* Quota */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Giới hạn quota
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newKeyQuota}
                      onChange={(e) => setNewKeyQuota(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      requests
                    </span>
                  </div>
                </div>

                {/* Rate Limit */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Rate limit (RPM)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newKeyRpm}
                      onChange={(e) => setNewKeyRpm(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      rpm
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim()}
                  className="px-6 py-2.5 bg-[#0050cb] text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Tạo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
