'use client';

import { useEffect, useState } from 'react';
import { Icon, StatPill, Sparkline } from '@/components/deepguard/shared';
import { DG, fmtInt } from '@/lib/dg';

/* ──────────────────────────────────────────────
   DeepGuard — Models & Thresholds
   Ported from prototype models.jsx. Light mode only, Vietnamese.
   ────────────────────────────────────────────── */

interface ModelItem {
  id: string;
  name: string;
  version: string;
  arch: string;
  status: 'active' | 'canary';
  accuracy: number;
  auc: number;
  latency: number;
  deployed: string;
  drift: number[];
}

interface PolicyItem {
  id: string;
  name: string;
  threshold: number;
  action: string;
  target: string;
  enabled: boolean;
}

// TODO: backend — no endpoint yet, data ported inline from prototype data-saas.jsx (MODELS).
const MODELS: ModelItem[] = [
  { id: 'm1', name: 'DeepGuard Image', version: 'v2.1.3', arch: 'EfficientNet-B4 · Dual-Stream', status: 'active', accuracy: 97.8, auc: 0.991, latency: 132, deployed: '3 giờ trước', drift: [97.9, 97.7, 97.8, 97.6, 97.8, 97.9, 97.8] },
  { id: 'm2', name: 'DeepGuard Video', version: 'v2.0.1', arch: 'TimeSformer + DCT', status: 'active', accuracy: 95.4, auc: 0.978, latency: 412, deployed: '5 ngày trước', drift: [95.6, 95.2, 95.5, 95.3, 95.4, 95.1, 95.4] },
  { id: 'm3', name: 'DeepGuard Liveness', version: 'v1.4.0', arch: 'Anti-Spoof CNN', status: 'active', accuracy: 98.9, auc: 0.995, latency: 88, deployed: '12 ngày trước', drift: [98.9, 99.0, 98.8, 98.9, 98.9, 98.8, 98.9] },
  { id: 'm4', name: 'DeepGuard Image', version: 'v2.2.0-rc', arch: 'EfficientNet-B5 · Dual-Stream', status: 'canary', accuracy: 98.3, auc: 0.994, latency: 156, deployed: 'canary 5%', drift: [98.2, 98.4, 98.3, 98.1, 98.3, 98.4, 98.3] },
];

// TODO: backend — no endpoint yet, data ported inline from prototype data-saas.jsx (POLICIES).
const POLICIES: PolicyItem[] = [
  { id: 'p1', name: 'KYC Onboarding', threshold: 0.35, action: 'Chặn nếu FAKE', target: 'prod-web', enabled: true },
  { id: 'p2', name: 'Video Call Verify', threshold: 0.5, action: 'Cảnh báo + review', target: 'prod-mobile', enabled: true },
  { id: 'p3', name: 'Batch Re-scan', threshold: 0.4, action: 'Gắn cờ', target: 'kyc-batch', enabled: false },
];

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/* ── Local toggle switch (prototype Switch) ── */
function Switch({ on, onToggle }: { on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onToggle(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-dgblue' : 'bg-slate-200'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-5' : ''}`}
      />
    </button>
  );
}

/* ── Local radial gauge (prototype Gauge) ── */
function Gauge({ value, color, size = 130 }: { value: number; color: string; size?: number }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-900 tabular-nums" style={{ color }}>
          {(value / 100).toFixed(2)}
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ngưỡng</span>
      </div>
    </div>
  );
}

/* ── Drift line chart (prototype MultiLine, single series) ── */
function DriftChart({ data, color, height = 160 }: { data: number[]; color: string; height?: number }) {
  const w = 100;
  const pad = 6;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = height - 24 - ((v - min) / range) * (height - 48);
    return [x, y] as [number, number];
  });
  const line = pts.map((p) => p.join(',')).join(' ');
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad} x2={w - pad} y1={(height - 24) * g + 6} y2={(height - 24) * g + 6} stroke="#f1f5f9" strokeWidth="0.4" />
        ))}
        <polyline points={line} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1.4" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between px-1 mt-1">
        {DAYS.map((d) => (
          <span key={d} className="text-[9px] font-bold text-slate-400">{d}</span>
        ))}
      </div>
    </div>
  );
}

export default function ModelsPage() {
  const [models] = useState<ModelItem[]>(MODELS);
  const [policies, setPolicies] = useState<PolicyItem[]>(POLICIES);
  const [loading, setLoading] = useState(true);
  const [globalThreshold, setGlobalThreshold] = useState(0.35);
  const [selected, setSelected] = useState<string>(MODELS[0].id);
  const [checking, setChecking] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  const active = models.find((m) => m.id === selected) ?? models[0];

  const checkUpdate = () => {
    setChecking(true);
    setUpdateMsg(null);
    setTimeout(() => {
      setChecking(false);
      setUpdateMsg('Tất cả model đang ở phiên bản mới nhất.');
    }, 1200);
  };

  const thresholdHint =
    globalThreshold < 0.35
      ? 'Bắt nhiều fake hơn, có thể tăng báo nhầm (false positive).'
      : globalThreshold > 0.55
        ? 'Giảm báo nhầm nhưng có thể bỏ sót fake tinh vi.'
        : 'Cân bằng giữa độ nhạy và độ chính xác.';

  const activeCount = models.filter((m) => m.status === 'active').length;

  return (
    <div className="space-y-5 dg-fade">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 dg-rise">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Models &amp; Thresholds</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý phiên bản model, hiệu năng &amp; chính sách phát hiện</p>
        </div>
        <div className="flex items-center gap-3">
          <StatPill icon="hub" label="Đang chạy" value={`${activeCount}/${fmtInt(models.length)}`} />
          <button
            onClick={checkUpdate}
            disabled={checking}
            className="flex items-center gap-2 px-4 h-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-60"
          >
            <Icon name="sync" className={`text-[18px] ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Đang kiểm tra…' : 'Kiểm tra cập nhật'}
          </button>
        </div>
      </div>

      {updateMsg && (
        <div className="dg-fade flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[12px] font-semibold text-dgreal">
          <Icon name="check_circle" className="text-[16px]" fill />
          {updateMsg}
        </div>
      )}

      {/* model cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 dg-rise">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 border border-white/60">
                <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse mb-3" />
                <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse mb-2" />
                <div className="h-6 w-1/2 rounded bg-slate-100 animate-pulse" />
              </div>
            ))
          : models.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`glass-panel rounded-2xl p-5 shadow-sm border text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${selected === m.id ? 'border-dgblue/40 ring-2 ring-dgblue/10' : 'border-white/60'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-dgblue/8 flex items-center justify-center">
                    <Icon name="model_training" className="text-[19px] text-dgblue" fill />
                  </div>
                  {m.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-dgreal bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-dgreal animate-pulse" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-dgwarn bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                      <Icon name="science" className="text-[11px]" />
                      CANARY
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-black text-slate-800">{m.name}</p>
                <p className="text-[10px] font-mono text-slate-400 mb-2">{m.version}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Accuracy</p>
                    <p className="text-lg font-black text-slate-900 tabular-nums">{m.accuracy}%</p>
                  </div>
                  <Sparkline data={m.drift} color={DG.primary} w={70} h={28} />
                </div>
              </button>
            ))}
      </div>

      {/* selected model detail + global threshold */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 dg-rise">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-slate-900">
                {active.name} <span className="text-slate-400 font-mono text-sm">{active.version}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{active.arch}</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Deploy: {active.deployed}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {([
              ['Accuracy', active.accuracy + '%', DG.real],
              ['AUC', active.auc.toFixed(3), DG.primary],
              ['Latency', active.latency + 'ms', DG.uncertain],
              ['Drift', '±0.3%', DG.real],
            ] as const).map(([l, v, c]) => (
              <div key={l} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase">{l}</p>
                <p className="text-base font-black tabular-nums" style={{ color: c }}>{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Accuracy 7 ngày (drift monitor)</p>
              <span className="text-[10px] font-bold text-dgreal flex items-center gap-1">
                <Icon name="trending_flat" className="text-[14px]" />
                Ổn định
              </span>
            </div>
            <DriftChart data={active.drift} color={DG.primary} height={160} />
          </div>
        </div>

        {/* global threshold */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <h2 className="text-base font-black text-slate-900 mb-1">Ngưỡng toàn cục</h2>
          <p className="text-xs text-slate-400 mb-5">Áp dụng mặc định khi không có policy riêng</p>
          <div className="flex flex-col items-center mb-5">
            <Gauge value={globalThreshold * 100} color={DG.primary} size={130} />
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={globalThreshold}
            onChange={(e) => setGlobalThreshold(parseFloat(e.target.value))}
            aria-label="Ngưỡng toàn cục"
            className="w-full mb-2 accent-dgblue"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wide mb-4">
            <span>Nhạy (ít bỏ sót)</span>
            <span>Chặt (ít báo nhầm)</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <b className="text-dgblue">{globalThreshold.toFixed(2)}</b> — {thresholdHint}
            </p>
          </div>
          <button
            onClick={() => setUpdateMsg(`Đã lưu ngưỡng ${globalThreshold.toFixed(2)}`)}
            className="w-full mt-4 py-2.5 bg-dgblue text-white rounded-xl font-bold text-xs shadow-lg shadow-dgblue/25 hover:scale-[1.02] transition-all"
          >
            Lưu ngưỡng
          </button>
        </div>
      </div>

      {/* detection policies */}
      <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-rise">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">Chính sách phát hiện</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Ngưỡng &amp; hành động theo từng use-case / API key</p>
          </div>
          <button className="px-3 py-1.5 text-[11px] font-bold text-dgblue bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1">
            <Icon name="add" className="text-[14px]" />
            Thêm policy
          </button>
        </div>
        <div className="divide-y divide-slate-50 custom-scrollbar">
          {policies.map((p) => (
            <div key={p.id} className="px-6 py-4 flex flex-wrap items-center gap-4 hover:bg-slate-50/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-dgblue/8 flex items-center justify-center shrink-0">
                <Icon name="policy" className="text-[18px] text-dgblue" fill />
              </div>
              <div className="min-w-[140px]">
                <p className="text-[13px] font-bold text-slate-800">{p.name}</p>
                <p className="text-[10px] font-mono text-slate-400">{p.target}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">Ngưỡng</span>
                <span className="text-[12px] font-mono font-bold text-dgblue bg-dgblue/5 px-2 py-0.5 rounded border border-dgblue/10 tabular-nums">
                  {p.threshold.toFixed(2)}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <Icon
                  name={p.action.includes('Chặn') ? 'block' : p.action.includes('Cảnh báo') ? 'notifications' : 'flag'}
                  className="text-[15px] text-slate-400"
                />
                {p.action}
              </span>
              <div className="ml-auto flex items-center gap-3">
                <Switch
                  on={p.enabled}
                  onToggle={(v) => setPolicies((pr) => pr.map((x) => (x.id === p.id ? { ...x, enabled: v } : x)))}
                />
                <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                  <Icon name="more_vert" className="text-[18px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
