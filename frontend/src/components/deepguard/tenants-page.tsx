'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */
interface Tenant {
  id: string;
  name: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  quotaUsed: number;
  quotaLimit: number;
  users: number;
  status: 'active' | 'suspended';
  created: string;
  apiKeys: { name: string; prefix: string }[];
  userList: { name: string; email: string; role: string }[];
}

/* ──────────────────────────────────────────────
   MOCK DATA
   ────────────────────────────────────────────── */
const initialTenants: Tenant[] = [
  {
    id: '1',
    name: 'VietBank',
    plan: 'Pro',
    quotaUsed: 8470,
    quotaLimit: 10000,
    users: 5,
    status: 'active',
    created: '01/01/2025',
    apiKeys: [
      { name: 'Production', prefix: 'sk-vbk-...8af3' },
      { name: 'Staging', prefix: 'sk-vbk-...b12a' },
      { name: 'Testing', prefix: 'sk-vbk-...d4e7' },
    ],
    userList: [
      { name: 'Nguyễn Văn A', email: 'nguyenvana@vietbank.vn', role: 'Admin' },
      { name: 'Trần Thị B', email: 'tranthib@vietbank.vn', role: 'Developer' },
      { name: 'Lê Văn C', email: 'levanc@vietbank.vn', role: 'Viewer' },
    ],
  },
  {
    id: '2',
    name: 'TechcomFinance',
    plan: 'Starter',
    quotaUsed: 87,
    quotaLimit: 100,
    users: 2,
    status: 'active',
    created: '15/02/2025',
    apiKeys: [
      { name: 'Main', prefix: 'sk-tcf-...1a2b' },
      { name: 'Backup', prefix: 'sk-tcf-...3c4d' },
    ],
    userList: [
      { name: 'Phạm Minh D', email: 'phamminhd@techcomfinance.vn', role: 'Admin' },
      { name: 'Hoàng Thị E', email: 'hoangthiee@techcomfinance.vn', role: 'Developer' },
    ],
  },
  {
    id: '3',
    name: 'MoMo Test',
    plan: 'Pro',
    quotaUsed: 0,
    quotaLimit: 10000,
    users: 1,
    status: 'suspended',
    created: '10/03/2025',
    apiKeys: [
      { name: 'Default', prefix: 'sk-mmt-...9z0x' },
    ],
    userList: [
      { name: 'Đỗ Văn F', email: 'dovanf@momo.vn', role: 'Admin' },
    ],
  },
];

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */
function getQuotaPercent(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(Math.round((used / limit) * 100), 100);
}

function getQuotaColor(percent: number): string {
  if (percent >= 90) return '#ba1a1a';
  if (percent >= 70) return '#ed6c02';
  return '#2e7d32';
}

function getPlanBadge(plan: Tenant['plan']) {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    Starter: { bg: 'bg-amber-50', text: 'text-[#ed6c02]', border: 'border-amber-200' },
    Pro: { bg: 'bg-purple-50', text: 'text-[#7c3aed]', border: 'border-purple-200' },
    Enterprise: { bg: 'bg-blue-50', text: 'text-[#0050cb]', border: 'border-blue-200' },
  };
  return config[plan] ?? config.Starter;
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
   TENANTS PAGE
   ────────────────────────────────────────────── */
export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newPlan, setNewPlan] = useState<'Starter' | 'Pro' | 'Enterprise'>('Starter');
  const [newQuota, setNewQuota] = useState(10000);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Tenant | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);

  const displayTenants = showEmpty ? [] : tenants;

  const handleCreateTenant = () => {
    if (!newCompanyName.trim() || !newAdminEmail.trim()) return;

    const newTenant: Tenant = {
      id: String(Date.now()),
      name: newCompanyName.trim(),
      plan: newPlan,
      quotaUsed: 0,
      quotaLimit: newQuota,
      users: 1,
      status: 'active',
      created: new Date().toLocaleDateString('vi-VN'),
      apiKeys: [],
      userList: [{ name: newCompanyName.trim() + ' Admin', email: newAdminEmail.trim(), role: 'Admin' }],
    };

    setTenants((prev) => [newTenant, ...prev]);
    setNewCompanyName('');
    setNewAdminEmail('');
    setNewPlan('Starter');
    setNewQuota(10000);
    setShowCreateModal(false);
  };

  const handleSuspend = (id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'suspended' ? 'active' as const : 'suspended' as const } : t
      )
    );
    setSuspendTarget(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
            <span className="material-symbols-outlined text-[28px] text-[#0050cb]">apartment</span>
            Quản lý Tenants
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-blue-50 text-[#0050cb] border border-blue-200">
              {tenants.length} tenants
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý tenant & phân quyền hệ thống</p>
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
            onClick={() => { setShowCreateModal(true); setNewCompanyName(''); setNewAdminEmail(''); setNewPlan('Starter'); setNewQuota(10000); }}
            className="px-5 py-2.5 bg-[#0050cb] text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:shadow-[#0050cb]/30 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tạo tenant
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          EMPTY STATE
          ══════════════════════════════════════ */}
      {displayTenants.length === 0 && (
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-12 shadow-md border border-white/60 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#0050cb]/5 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-[40px] text-[#0050cb]/30">apartment</span>
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">Chưa có tenant nào</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Tạo tenant đầu tiên để quản lý workspace và phân quyền cho tổ chức.
          </p>
          <button
            onClick={() => { setShowCreateModal(true); setNewCompanyName(''); setNewAdminEmail(''); setNewPlan('Starter'); setNewQuota(10000); }}
            className="px-6 py-3 bg-[#0050cb] text-white rounded-xl font-bold text-xs tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tạo tenant đầu tiên
          </button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          TENANT TABLE
          ══════════════════════════════════════ */}
      {displayTenants.length > 0 && (
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl shadow-md border border-white/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Tên company</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Quota</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Users</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-left px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Tạo ngày</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayTenants.map((tenant) => {
                  const percent = getQuotaPercent(tenant.quotaUsed, tenant.quotaLimit);
                  const quotaColor = getQuotaColor(percent);
                  const planBadge = getPlanBadge(tenant.plan);
                  const isExpanded = expandedId === tenant.id;

                  return (
                    <>
                      <tr
                        key={tenant.id}
                        onClick={() => toggleExpand(tenant.id)}
                        className="hover:bg-[#0050cb]/[0.02] transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0050cb]/5 flex items-center justify-center shrink-0 group-hover:bg-[#0050cb]/10 transition-colors">
                              <span className="material-symbols-outlined text-[16px] text-[#0050cb]">apartment</span>
                            </div>
                            <span className="text-[13px] font-bold text-slate-800">{tenant.name}</span>
                            <span className="material-symbols-outlined text-[14px] text-slate-300 group-hover:text-slate-500 transition-all">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border ${planBadge.bg} ${planBadge.text} ${planBadge.border}`}>
                            {tenant.plan}
                          </span>
                        </td>
                        <td className="px-4 py-4 min-w-[160px]">
                          <div className="space-y-1.5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-[11px] font-black text-slate-700">{tenant.quotaUsed.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 font-medium">/ {tenant.quotaLimit.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${percent}%`, backgroundColor: quotaColor, boxShadow: `0 0 8px ${quotaColor}30` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                            <span className="text-[12px] font-bold text-slate-700">{tenant.users}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {tenant.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border bg-green-50 text-[#2e7d32] border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider border bg-red-50 text-[#ba1a1a] border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-[11px] text-slate-500 font-medium">{tenant.created}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="px-3 py-1.5 text-[10px] font-bold text-[#0050cb] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                              onClick={() => toggleExpand(tenant.id)}
                            >
                              <span className="material-symbols-outlined text-[12px]">visibility</span>
                              View
                            </button>
                            <button
                              className="px-3 py-1.5 text-[10px] font-bold text-[#ed6c02] bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1"
                              onClick={() => setSuspendTarget(tenant)}
                            >
                              <span className="material-symbols-outlined text-[12px]">block</span>
                              Suspend
                            </button>
                            <button
                              className="px-3 py-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[12px]">edit</span>
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      <tr key={`${tenant.id}-detail`}>
                        <td colSpan={7} className="p-0">
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                              >
                                <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100">
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* API Keys */}
                                    <div>
                                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">key</span>
                                        API Keys ({tenant.apiKeys.length})
                                      </h4>
                                      <div className="space-y-2">
                                        {tenant.apiKeys.map((key) => (
                                          <div key={key.prefix} className="flex items-center gap-2 px-3 py-2 bg-white/60 rounded-lg border border-slate-100">
                                            <span className="text-[12px] font-semibold text-slate-700">{key.name}</span>
                                            <code className="text-[10px] font-mono text-slate-400 ml-auto">{key.prefix}</code>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Users */}
                                    <div>
                                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">group</span>
                                        Users ({tenant.userList.length})
                                      </h4>
                                      <div className="space-y-2">
                                        {tenant.userList.map((user) => (
                                          <div key={user.email} className="px-3 py-2 bg-white/60 rounded-lg border border-slate-100">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[12px] font-semibold text-slate-700">{user.name}</span>
                                              <span className="text-[9px] font-bold text-[#0050cb] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                {user.role}
                                              </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">{user.email}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Usage Summary */}
                                    <div>
                                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">analytics</span>
                                        Tóm tắt sử dụng
                                      </h4>
                                      <div className="bg-white/60 rounded-lg border border-slate-100 p-4 space-y-3">
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-slate-500 font-medium">Quota đã dùng</span>
                                          <span className="font-bold" style={{ color: quotaColor }}>
                                            {percent}% ({tenant.quotaUsed.toLocaleString()} / {tenant.quotaLimit.toLocaleString()})
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-slate-500 font-medium">API Keys active</span>
                                          <span className="font-bold text-slate-700">{tenant.apiKeys.length}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-slate-500 font-medium">Số users</span>
                                          <span className="font-bold text-slate-700">{tenant.users}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-slate-500 font-medium">Plan</span>
                                          <span className="font-bold" style={{ color: planBadge.text.includes('amber') ? '#ed6c02' : planBadge.text.includes('purple') ? '#7c3aed' : '#0050cb' }}>
                                            {tenant.plan}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              {displayTenants.length} tenant{displayTenants.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse" />
              <span className="text-[10px] text-slate-400 font-semibold">System operational</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          CREATE TENANT MODAL
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
                    <span className="material-symbols-outlined text-[20px] text-[#0050cb]">add_business</span>
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Tạo Tenant mới</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Thêm tổ chức mới vào hệ thống</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-5">
                {/* Company Name */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Tên company <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="VD: VietBank"
                    className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all"
                    autoFocus
                  />
                </div>

                {/* Admin Email */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Admin email <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all"
                  />
                </div>

                {/* Plan Dropdown */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Plan
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as 'Starter' | 'Pro' | 'Enterprise')}
                    className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all appearance-none cursor-pointer"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                {/* Monthly Quota */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Monthly quota
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newQuota}
                      onChange={(e) => setNewQuota(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 bg-white/60 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      requests
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
                  onClick={handleCreateTenant}
                  disabled={!newCompanyName.trim() || !newAdminEmail.trim()}
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

      {/* ══════════════════════════════════════
          SUSPEND CONFIRM MODAL
          ══════════════════════════════════════ */}
      <AnimatePresence>
        {suspendTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSuspendTarget(null)}
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
              className="glass-panel rounded-2xl shadow-2xl border border-white/80 w-full max-w-sm relative z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">warning</span>
                  </div>
                  <h2 className="text-base font-black text-slate-900">Xác nhận Suspend</h2>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Chắc chắn suspend <span className="font-bold text-slate-900">{suspendTarget.name}</span>? Tất cả API keys sẽ bị ngưng.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSuspendTarget(null)}
                  className="px-5 py-2.5 text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSuspend(suspendTarget.id)}
                  className="px-6 py-2.5 bg-[#ba1a1a] text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg shadow-[#ba1a1a]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[14px]">block</span>
                  Suspend
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
