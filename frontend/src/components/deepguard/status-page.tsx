'use client';

/**
 * DeepGuard — Status & Compliance page.
 * Ported from the frontend-claude prototype (status.jsx + data-saas.jsx).
 * Shows: overall status banner, per-service uptime list with a 30-day bar
 * strip, incident timeline, certifications and data-retention settings.
 *
 * Light mode only · Vietnamese copy · no backend wiring.
 */
import React, { useState, type ReactNode } from 'react';
import { Icon, StatPill } from '@/components/deepguard/shared';
import { DG, minsAgo, timeAgo } from '@/lib/dg';

/* ────────────────────────────────────────────────────────────
   LOCAL MOCK DATA — ported inline from data-saas.jsx.
   TODO: backend — replace with a /status endpoint + retention API.
   ──────────────────────────────────────────────────────────── */

type ServiceStatus = 'operational' | 'degraded' | 'down';

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: number;
}

interface Incident {
  id: string;
  sev: 'major' | 'minor' | 'resolved';
  title: string;
  status: string;
  at: string;
  desc: string;
}

interface Cert {
  name: string;
  icon: string;
  status: string;
}

interface StatusStyle {
  color: string;
  label: string;
  icon: string;
}

const SERVICES: readonly Service[] = [
  { name: 'Detection API', status: 'operational', uptime: 99.98 },
  { name: 'Liveness API', status: 'operational', uptime: 99.97 },
  { name: 'Webhooks', status: 'operational', uptime: 99.95 },
  { name: 'Dashboard', status: 'operational', uptime: 100 },
  { name: 'Inference Cluster', status: 'degraded', uptime: 99.82 },
];

const INCIDENTS: readonly Incident[] = [
  {
    id: 'i1',
    sev: 'minor',
    title: 'Độ trễ inference tăng nhẹ',
    status: 'monitoring',
    at: minsAgo(95),
    desc: 'P95 latency tăng ~15% do tải cao. Đã scale thêm node, đang theo dõi.',
  },
  {
    id: 'i2',
    sev: 'resolved',
    title: 'Webhook delivery chậm',
    status: 'resolved',
    at: minsAgo(2880),
    desc: 'Hàng đợi webhook bị nghẽn 12 phút. Đã xử lý, gửi lại toàn bộ event.',
  },
  {
    id: 'i3',
    sev: 'resolved',
    title: 'Bảo trì theo lịch',
    status: 'resolved',
    at: minsAgo(7200),
    desc: 'Nâng cấp model serving, hoàn tất không gián đoạn.',
  },
];

const SEV_INC: Record<Incident['sev'], string> = {
  major: '#ba1a1a',
  minor: '#ed6c02',
  resolved: '#2e7d32',
};

const CERTS: readonly Cert[] = [
  { name: 'SOC 2 Type II', icon: 'verified_user', status: 'Đạt chứng nhận' },
  { name: 'ISO 27001', icon: 'shield', status: 'Đạt chứng nhận' },
  { name: 'PCI DSS', icon: 'credit_score', status: 'Đạt chứng nhận' },
  { name: 'GDPR / PDPA', icon: 'policy', status: 'Tuân thủ' },
];

const STATUS_STYLE: Record<ServiceStatus, StatusStyle> = {
  operational: { color: '#2e7d32', label: 'Hoạt động', icon: 'check_circle' },
  degraded: { color: '#ed6c02', label: 'Suy giảm', icon: 'warning' },
  down: { color: '#ba1a1a', label: 'Gián đoạn', icon: 'error' },
};

/* ── Local helpers (Switch + SettingRow lived in the prototype's shared file) ── */

function Switch({ on, onToggle }: { on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onToggle(!on)}
      className="relative w-11 h-6 rounded-full transition-colors shrink-0"
      style={{ background: on ? DG.primary : '#cbd5e1' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function SettingRow({
  icon,
  title,
  desc,
  children,
}: {
  icon: string;
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
      <span className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 text-slate-500">
        <Icon name={icon} className="text-[18px]" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-800">{title}</p>
        <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ── 30-day mini uptime bar strip (deterministic, seeded by uptime) ── */
function UptimeBars({ uptime }: { uptime: number }) {
  const col: Record<'op' | 'deg' | 'down', string> = {
    op: '#2e7d32',
    deg: '#ed6c02',
    down: '#ba1a1a',
  };
  const days: Array<'op' | 'deg' | 'down'> = Array.from({ length: 30 }, (_, i) => {
    const r = ((i * 73 + uptime * 100) % 100) / 100;
    return r > 0.94 ? 'op' : r > 0.88 ? 'deg' : 'op';
  });
  return (
    <div className="flex items-end gap-[2px] h-6">
      {days.map((d, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: '100%', background: col[d], opacity: 0.85 }}
          title={`Ngày ${i + 1}`}
        />
      ))}
    </div>
  );
}

const selectCls =
  'w-28 py-2 px-3 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-dgblue/30 focus:border-dgblue transition-all tabular-nums';

/* ────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────── */
export default function StatusPage() {
  const [retention, setRetention] = useState({ images: '90', logs: '365', auto: true });

  const allOp = SERVICES.every((s) => s.status === 'operational');
  const overall: ServiceStatus = allOp ? 'operational' : 'degraded';
  const ov = STATUS_STYLE[overall];

  const opCount = SERVICES.filter((s) => s.status === 'operational').length;

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="dg-rise flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Status &amp; Compliance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tình trạng hệ thống, sự cố &amp; tuân thủ</p>
        </div>
        <div className="flex items-center gap-3">
          <StatPill icon="dns" label="Dịch vụ hoạt động" value={`${opCount}/${SERVICES.length}`} color={DG.real} />
          <StatPill icon="trending_up" label="Uptime 90 ngày" value="99.96%" color={DG.primary} />
        </div>
      </div>

      {/* overall banner */}
      <div
        className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60 dg-rise flex flex-wrap items-center gap-4"
        style={{ borderLeft: `4px solid ${ov.color}` }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${ov.color}12` }}
        >
          <Icon name={ov.icon} className="text-[28px]" style={{ color: ov.color }} fill />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black text-slate-900">
            {allOp ? 'Tất cả hệ thống hoạt động bình thường' : 'Một số dịch vụ đang suy giảm'}
          </p>
          <p className="text-sm text-slate-500">
            Cập nhật {timeAgo(minsAgo(2))} · Uptime 90 ngày: 99.96%
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black tabular-nums" style={{ color: DG.real }}>
            99.96%
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uptime 90 ngày</p>
        </div>
      </div>

      {/* services */}
      <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-rise">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">Dịch vụ</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {SERVICES.map((s) => {
            const st = STATUS_STYLE[s.status];
            return (
              <div key={s.name} className="px-6 py-4 flex items-center gap-4">
                <Icon name={st.icon} className="text-[20px] shrink-0" style={{ color: st.color }} fill />
                <div className="w-44 shrink-0">
                  <p className="text-[13px] font-bold text-slate-800">{s.name}</p>
                  <p className="text-[11px] font-semibold" style={{ color: st.color }}>
                    {st.label}
                  </p>
                </div>
                <div className="flex-1 hidden sm:block">
                  <UptimeBars uptime={s.uptime} />
                </div>
                <span className="text-[12px] font-black text-slate-700 tabular-nums w-16 text-right">
                  {s.uptime}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* incidents + compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 dg-rise">
        {/* incidents timeline */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <h2 className="text-base font-black text-slate-900 mb-5">Lịch sử sự cố</h2>
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200" />
            <div className="space-y-5">
              {INCIDENTS.map((inc) => (
                <div key={inc.id} className="relative">
                  <span
                    className="absolute -left-[22px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                    style={{ background: SEV_INC[inc.sev], boxShadow: `0 0 0 3px ${SEV_INC[inc.sev]}22` }}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-bold text-slate-800">{inc.title}</p>
                    <span
                      className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                      style={{ color: SEV_INC[inc.sev], background: `${SEV_INC[inc.sev]}14` }}
                    >
                      {inc.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{inc.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{timeAgo(inc.at)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* compliance + retention */}
        <div className="space-y-5">
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <h2 className="text-base font-black text-slate-900 mb-4">Chứng nhận &amp; tuân thủ</h2>
            <div className="grid grid-cols-2 gap-3">
              {CERTS.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-dgreal/10 flex items-center justify-center shrink-0">
                    <Icon name={c.icon} className="text-[18px] text-dgreal" fill />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 truncate">{c.name}</p>
                    <p className="text-[10px] text-dgreal font-semibold">{c.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <h2 className="text-base font-black text-slate-900 mb-4">Lưu trữ &amp; quyền riêng tư</h2>
            <SettingRow
              icon="image"
              title="Lưu ảnh phát hiện"
              desc="Thời gian giữ thumbnail trước khi xoá tự động."
            >
              <select
                value={retention.images}
                onChange={(e) => setRetention({ ...retention, images: e.target.value })}
                className={selectCls}
              >
                <option value="30">30 ngày</option>
                <option value="90">90 ngày</option>
                <option value="180">180 ngày</option>
              </select>
            </SettingRow>
            <SettingRow
              icon="receipt_long"
              title="Lưu audit logs"
              desc="Nhật ký tuân thủ (bất biến) giữ trong:"
            >
              <select
                value={retention.logs}
                onChange={(e) => setRetention({ ...retention, logs: e.target.value })}
                className={selectCls}
              >
                <option value="365">1 năm</option>
                <option value="730">2 năm</option>
                <option value="1825">5 năm</option>
              </select>
            </SettingRow>
            <SettingRow
              icon="auto_delete"
              title="Tự động xoá theo lịch"
              desc="Xoá dữ liệu hết hạn lưu trữ tự động."
            >
              <Switch on={retention.auto} onToggle={(v) => setRetention({ ...retention, auto: v })} />
            </SettingRow>
            <div className="mt-3 flex items-center gap-2">
              <button className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <Icon name="download" className="text-[16px]" />
                Xuất dữ liệu (GDPR)
              </button>
              <button className="flex-1 py-2.5 bg-red-50 text-dgfake border border-red-200 rounded-xl font-bold text-xs hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                <Icon name="delete_forever" className="text-[16px]" />
                Yêu cầu xoá
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
