'use client';

import { useNavigation } from '@/store/navigation';
import { motion } from 'framer-motion';

/* ──────────────────────────────────────────────
   MOCK DATA
   ────────────────────────────────────────────── */
const endpoints = [
  {
    method: 'POST',
    path: '/v1/detect/image',
    description: 'Phát hiện deepfake trong ảnh',
    methodColor: '#2e7d32',
    methodBg: 'bg-green-50',
    methodBorder: 'border-green-200',
  },
  {
    method: 'GET',
    path: '/v1/detections',
    description: 'Lịch sử phát hiện',
    methodColor: '#0050cb',
    methodBg: 'bg-blue-50',
    methodBorder: 'border-blue-200',
  },
  {
    method: 'GET',
    path: '/v1/analytics/overview',
    description: 'Tổng quan analytics',
    methodColor: '#0050cb',
    methodBg: 'bg-blue-50',
    methodBorder: 'border-blue-200',
  },
  {
    method: 'POST',
    path: '/v1/api-keys',
    description: 'Tạo API key mới',
    methodColor: '#2e7d32',
    methodBg: 'bg-green-50',
    methodBorder: 'border-green-200',
  },
];

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
   DOCS PAGE
   ────────────────────────────────────────────── */
export default function DocsPage() {
  const navigate = useNavigation((s) => s.navigate);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ── Page Header ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-[#0050cb]">description</span>
            API Documentation
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-blue-50 text-[#0050cb] border border-blue-200">
              v2.1
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tài liệu tham khảo API DeepGuard Detection</p>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          1. ENDPOINT CARDS
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" />
          Endpoints
        </h2>

        <div className="space-y-3">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="glass-panel rounded-2xl p-5 shadow-md border border-white/60 hover:shadow-lg hover:scale-[1.005] transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-black tracking-wider border ${ep.methodBg} ${ep.methodBorder} shrink-0`}
                  style={{ color: ep.methodColor }}
                >
                  {ep.method}
                </span>
                <code className="text-[13px] font-mono font-bold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 break-all">
                  {ep.path}
                </code>
                <p className="text-[12px] text-slate-500 font-medium flex-1 min-w-0">
                  {ep.description}
                </p>
                <button className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0050cb] hover:underline shrink-0 group-hover:translate-x-1 transition-transform">
                  Chi tiết
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          2. QUICK REFERENCE CARD
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 shadow-md border border-white/60">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" />
          <h2 className="text-base font-black text-slate-900">Quick Reference</h2>
        </div>

        <div className="space-y-4">
          {/* Base URL */}
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Base URL</p>
            <div className="bg-slate-900 rounded-xl px-5 py-3.5 border border-slate-700">
              <code className="text-[13px] font-mono font-bold text-green-400 select-all">
                https://api.deepguard.io
              </code>
            </div>
          </div>

          {/* Authentication */}
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Authentication</p>
            <div className="bg-slate-900 rounded-xl px-5 py-3.5 border border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Header:</span>
                <code className="text-[13px] font-mono font-bold text-orange-400 select-all">
                  X-API-Key: your-key-here
                </code>
              </div>
            </div>
          </div>

          {/* Content-Type */}
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Content-Type</p>
            <div className="bg-slate-900 rounded-xl px-5 py-3.5 border border-slate-700">
              <code className="text-[13px] font-mono font-bold text-blue-400 select-all">
                multipart/form-data
              </code>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          3. INTERACTIVE TRY-OUT SECTION
          ══════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Try API */}
        <div className="glass-panel rounded-2xl p-6 shadow-md border border-white/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#0050cb]/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] text-[#0050cb]">terminal</span>
            </div>
            <div>
              <h3 className="text-[14px] font-black text-slate-900">Thử API ngay</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Test trực tiếp trong Playground</p>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed mb-5">
            Sử dụng Playground để gửi request trực tiếp đến DeepGuard API và xem kết quả real-time.
          </p>
          <button
            onClick={() => navigate('playground')}
            className="w-full px-5 py-3 bg-[#0050cb] text-white rounded-xl font-bold text-[12px] tracking-wide shadow-lg shadow-[#0050cb]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            Mở Playground
          </button>
        </div>

        {/* Swagger UI */}
        <div className="glass-panel rounded-2xl p-6 shadow-md border border-white/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#2e7d32]/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] text-[#2e7d32]">menu_book</span>
            </div>
            <div>
              <h3 className="text-[14px] font-black text-slate-900">Xem Swagger UI</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Tài liệu OpenAPI tương tác</p>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed mb-5">
            Swagger UI available tại endpoint <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">/docs</code> — cho phép duyệt và thử tất cả endpoints với schema validation đầy đủ.
          </p>
          <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">link</span>
              <code className="text-[12px] font-mono font-semibold text-slate-500">
                https://api.deepguard.io/docs
              </code>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
