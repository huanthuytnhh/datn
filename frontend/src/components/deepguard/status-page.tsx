'use client';

/**
 * DeepGuard — Status & Compliance (bản TRUNG THỰC).
 * Chỉ hiển thị dữ liệu THẬT: health từ GET /health, phiên bản API, và các "khả năng tuân thủ"
 * mà hệ thống thực sự có (audit log bất biến, che PII theo vai trò, ISO/IEC 30107-3, TT17/ND13).
 * KHÔNG dùng badge uptime/chứng nhận giả (SOC2/ISO27001/PCI…) hay sự cố mock. Link sang Audit Logs.
 */
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { Icon, StatPill } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';
import { apiHealth } from '@/lib/api';

/* Khả năng tuân thủ THẬT của hệ thống (không phải chứng nhận bên thứ ba). */
const COMPLIANCE = [
  { icon: 'gpp_good', title: 'Audit log bất biến', desc: 'Login, API-key, người dùng, tenant… đều được ghi nhật ký + truy vết.' },
  { icon: 'visibility_off', title: 'Che PII theo vai trò', desc: 'Ảnh/IP/user-agent chỉ admin & compliance xem; developer/viewer bị che.' },
  { icon: 'fact_check', title: 'ISO/IEC 30107-3', desc: 'Đánh giá chống giả mạo theo APCER/BPCER/ACER tại điểm vận hành.' },
  { icon: 'account_balance', title: 'TT17/2024 · ND13/2023', desc: 'Hỗ trợ xác thực sinh trắc cho eKYC (yêu cầu định tính).' },
];

/* Chính sách lưu trữ (mô tả — cấu hình thực thi là roadmap). */
const RETENTION: [string, string][] = [
  ['Ảnh phát hiện (thumbnail)', '90 ngày'],
  ['Audit log (bất biến)', '1 năm'],
  ['Xoá tự động khi hết hạn', 'Bật'],
];

export default function StatusPage() {
  const navigate = useNavigation((s) => s.navigate);
  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    apiHealth().then(setHealth).catch(() => setHealth(null)).finally(() => setChecked(true));
  }, []);

  const ok = !!health && health.status === 'ok';
  const color = ok ? DG.real : checked ? DG.fake : DG.uncertain;
  const label = !checked ? 'Đang kiểm tra…' : ok ? 'Hoạt động bình thường' : 'Không kết nối được API';

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="dg-rise flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Status &amp; Compliance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tình trạng hệ thống &amp; tuân thủ (dữ liệu thật)</p>
        </div>
        <StatPill icon="dns" label="API" value={ok ? 'OK' : checked ? 'DOWN' : '…'} color={color} />
      </div>

      {/* overall banner — từ /health thật */}
      <div
        className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise flex flex-wrap items-center gap-4"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
          <Icon name={ok ? 'check_circle' : checked ? 'error' : 'sync'} className="text-[28px]" style={{ color }} fill />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black text-slate-900">{label}</p>
          <p className="text-sm text-slate-500">Kiểm tra trực tiếp qua <span className="font-mono">GET /health</span></p>
        </div>
        {health?.version && (
          <div className="text-right">
            <p className="text-xl font-black text-slate-700 font-mono">{health.version}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phiên bản API</p>
          </div>
        )}
      </div>

      {/* thành phần (thật) */}
      <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-rise">
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-base font-black text-slate-900">Thành phần</h2></div>
        <div className="divide-y divide-slate-50">
          <div className="px-6 py-4 flex items-center gap-4">
            <Icon name={ok ? 'check_circle' : 'error'} className="text-[20px] shrink-0" style={{ color }} fill />
            <div className="flex-1"><p className="text-[13px] font-bold text-slate-800">API Gateway (FastAPI)</p><p className="text-[11px] font-semibold" style={{ color }}>{label}</p></div>
          </div>
          <button onClick={() => navigate('models')} className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 text-left">
            <Icon name="model_training" className="text-[20px] shrink-0 text-dgblue" />
            <div className="flex-1"><p className="text-[13px] font-bold text-slate-800">Model phục vụ (SFDCT)</p><p className="text-[11px] text-slate-500">Xem phiên bản &amp; ngưỡng ở Models &amp; Thresholds →</p></div>
          </button>
        </div>
      </div>

      {/* tuân thủ + lưu trữ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 dg-rise">
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <h2 className="text-base font-black text-slate-900 mb-1">Khả năng tuân thủ</h2>
          <p className="text-[11px] text-slate-400 mb-4">Khả năng &amp; định hướng của hệ thống — <b>không phải</b> chứng nhận bên thứ ba.</p>
          <div className="grid grid-cols-1 gap-3">
            {COMPLIANCE.map((c) => (
              <div key={c.title} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-dgreal/10 flex items-center justify-center shrink-0"><Icon name={c.icon} className="text-[18px] text-dgreal" fill /></div>
                <div className="min-w-0"><p className="text-[12.5px] font-bold text-slate-800">{c.title}</p><p className="text-[11px] text-slate-500 leading-relaxed">{c.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <h2 className="text-base font-black text-slate-900 mb-4">Lưu trữ &amp; quyền riêng tư</h2>
            <div className="divide-y divide-slate-50">
              {RETENTION.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2.5">
                  <span className="text-[12.5px] text-slate-600">{k}</span>
                  <span className="text-[12.5px] font-bold text-slate-800 tabular-nums">{v}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Cấu hình thực thi chính sách lưu trữ: roadmap.</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <h2 className="text-base font-black text-slate-900 mb-2">Nhật ký truy vết</h2>
            <p className="text-[12px] text-slate-500 mb-4">Mọi hành vi quản trị (đăng nhập, tạo/thu hồi khoá, đổi vai trò, duyệt/tạm ngưng tenant…) được ghi bất biến.</p>
            <button onClick={() => navigate('audit')} className="w-full py-2.5 bg-dgblue text-white rounded-xl font-bold text-xs hover:bg-dgblue/90 transition-all flex items-center justify-center gap-2">
              <Icon name="gavel" className="text-[16px]" /> Mở Audit Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
