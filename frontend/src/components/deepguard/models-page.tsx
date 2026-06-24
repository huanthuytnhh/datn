'use client';

import { useEffect, useState, useCallback } from 'react';
import { Icon, StatPill } from '@/components/deepguard/shared';
import { DG, fmtInt, timeAgo } from '@/lib/dg';
import { modelsList, modelUpdate, type ModelOut } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { canEdit, type Role } from '@/lib/rbac';

/* ──────────────────────────────────────────────
   DeepGuard — Models & Thresholds
   Wired to the real backend (model_versions table) via:
     • modelsList()         → ModelOut[]
     • modelUpdate(id, …)   → ModelOut   (admin / sysadmin only)
   Light mode only, Vietnamese.
   ────────────────────────────────────────────── */

/* ── Display helpers for a ModelOut ── */
function modelStatus(m: ModelOut): 'active' | 'canary' | 'inactive' {
  if (!m.is_active) return 'inactive';
  return m.traffic_percent < 100 ? 'canary' : 'active';
}

/** AUC (0–1) → percentage string, "—" when null. */
function aucPct(v: number | null): string {
  return v == null ? '—' : `${(v * 100).toFixed(1)}%`;
}

/** Best-effort relative deploy label. */
function deployLabel(m: ModelOut): string {
  const iso = m.deployed_at ?? m.created_at;
  return iso ? timeAgo(iso) : 'chưa deploy';
}

/* ── Local toggle switch (prototype Switch) ── */
function Switch({
  on,
  onToggle,
  disabled,
}: {
  on: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onToggle(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${on ? 'bg-dgblue' : 'bg-slate-200'}`}
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

export default function ModelsPage() {
  const role = useAuthStore((s) => s.user?.role) as Role | undefined;
  const editable = canEdit(role, 'models');

  const [models, setModels] = useState<ModelOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  // per-model "saving" flag (id → true while a PATCH is in flight)
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  // local draft of the threshold slider per model (committed on release)
  const [draftThreshold, setDraftThreshold] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    modelsList()
      .then((rows) => {
        setModels(rows);
        setSelected((prev) => prev ?? rows[0]?.id ?? null);
        setDraftThreshold(Object.fromEntries(rows.map((m) => [m.id, m.threshold])));
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Lỗi tải danh sách model'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* Patch one model in local state from a fresh ModelOut. */
  const patchLocal = useCallback((m: ModelOut) => {
    setModels((rows) => rows.map((x) => (x.id === m.id ? m : x)));
    setDraftThreshold((d) => ({ ...d, [m.id]: m.threshold }));
  }, []);

  /* Generic field update → modelUpdate(id, …). Handles 403 gracefully. */
  const saveModel = useCallback(
    async (id: string, data: { threshold?: number; is_active?: boolean; traffic_percent?: number }) => {
      setActionError(null);
      setSaving((s) => ({ ...s, [id]: true }));
      try {
        const updated = await modelUpdate(id, data);
        patchLocal(updated);
        setUpdateMsg('Đã lưu thay đổi model.');
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Không thể cập nhật model';
        // Backend returns 403 for non-admin/sysadmin — surface a clear note.
        setActionError(/403|forbidden|permission|quyền/i.test(msg) ? 'Chỉ admin / sysadmin mới được chỉnh model.' : msg);
        // re-sync draft from server-known value (revert optimistic slider)
        setDraftThreshold((d) => {
          const m = models.find((x) => x.id === id);
          return m ? { ...d, [id]: m.threshold } : d;
        });
      } finally {
        setSaving((s) => ({ ...s, [id]: false }));
      }
    },
    [models, patchLocal],
  );

  const active = models.find((m) => m.id === selected) ?? models[0] ?? null;
  const activeCount = models.filter((m) => m.is_active).length;

  const activeDraft = active ? (draftThreshold[active.id] ?? active.threshold) : 0.5;
  const thresholdHint =
    activeDraft < 0.35
      ? 'Bắt nhiều fake hơn, có thể tăng báo nhầm (false positive).'
      : activeDraft > 0.55
        ? 'Giảm báo nhầm nhưng có thể bỏ sót fake tinh vi.'
        : 'Cân bằng giữa độ nhạy và độ chính xác.';

  return (
    <div className="space-y-5 dg-fade">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 dg-rise">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Models &amp; Thresholds</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý phiên bản model, hiệu năng &amp; ngưỡng phát hiện</p>
        </div>
        <div className="flex items-center gap-3">
          <StatPill icon="hub" label="Đang chạy" value={`${activeCount}/${fmtInt(models.length)}`} />
        </div>
      </div>

      {/* read-only banner for non-editors */}
      {!editable && (
        <div className="dg-fade flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[12px] font-semibold text-slate-500">
          <Icon name="lock" className="text-[16px]" />
          Chế độ chỉ xem — chỉ admin / sysadmin mới chỉnh được ngưỡng &amp; trạng thái model.
        </div>
      )}

      {updateMsg && (
        <div className="dg-fade flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[12px] font-semibold text-dgreal">
          <Icon name="check_circle" className="text-[16px]" fill />
          {updateMsg}
        </div>
      )}

      {actionError && (
        <div className="dg-fade flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-[12px] font-semibold text-dgfake">
          <Icon name="error" className="text-[16px]" fill />
          {actionError}
        </div>
      )}

      {/* model cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 dg-rise">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 border border-white/60">
              <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse mb-3" />
              <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse mb-2" />
              <div className="h-6 w-1/2 rounded bg-slate-100 animate-pulse" />
            </div>
          ))
        ) : error ? (
          <div className="md:col-span-2 xl:col-span-4 glass-panel rounded-2xl p-10 border border-white/60 flex flex-col items-center gap-3 text-center">
            <Icon name="error" className="text-[40px] text-dgfake" />
            <p className="text-sm font-bold text-slate-700">{error}</p>
            <button
              onClick={load}
              className="px-4 h-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Thử lại
            </button>
          </div>
        ) : models.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-4 glass-panel rounded-2xl p-10 border border-white/60 flex flex-col items-center gap-2 text-center">
            <Icon name="model_training" className="text-[40px] text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Chưa có model nào</p>
            <p className="text-xs text-slate-400">Danh sách phiên bản model sẽ hiển thị ở đây khi được triển khai.</p>
          </div>
        ) : (
          models.map((m) => {
            const status = modelStatus(m);
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`glass-panel rounded-2xl p-5 shadow-sm border text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${selected === m.id ? 'border-dgblue/40 ring-2 ring-dgblue/10' : 'border-white/60'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-dgblue/8 flex items-center justify-center">
                    <Icon name="model_training" className="text-[19px] text-dgblue" fill />
                  </div>
                  {status === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-dgreal bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-dgreal animate-pulse" />
                      ACTIVE
                    </span>
                  ) : status === 'canary' ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-dgwarn bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                      <Icon name="science" className="text-[11px]" />
                      CANARY {m.traffic_percent}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      INACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-black text-slate-800">{m.architecture}</p>
                <p className="text-[10px] font-mono text-slate-400 mb-2">{m.version}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">AUC (Celeb-DF)</p>
                    <p className="text-lg font-black text-slate-900 tabular-nums">{aucPct(m.auc_celeb)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Ngưỡng</p>
                    <p className="text-lg font-black tabular-nums" style={{ color: DG.primary }}>
                      {m.threshold.toFixed(2)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* selected model detail + per-model threshold control */}
      {!loading && !error && active && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 dg-rise">
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {active.architecture} <span className="text-slate-400 font-mono text-sm">{active.version}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {active.training_dataset ? `Tập huấn luyện: ${active.training_dataset}` : 'Tập huấn luyện: —'}
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Deploy: {deployLabel(active)}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {([
                ['AUC Celeb-DF', aucPct(active.auc_celeb), DG.real],
                ['AUC FF++', aucPct(active.auc_ffpp), DG.primary],
                ['Ngưỡng', active.threshold.toFixed(2), DG.uncertain],
                ['Traffic', `${active.traffic_percent}%`, DG.real],
              ] as const).map(([l, v, c]) => (
                <div key={l} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">{l}</p>
                  <p className="text-base font-black tabular-nums" style={{ color: c }}>{v}</p>
                </div>
              ))}
            </div>

            {/* status + traffic (A/B) controls */}
            <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-slate-700">Kích hoạt model</p>
                  <p className="text-[10px] text-slate-400">Bật để đưa phiên bản này vào phục vụ traffic.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">{active.is_active ? 'Đang bật' : 'Đang tắt'}</span>
                  <Switch
                    on={active.is_active}
                    disabled={!editable || !!saving[active.id]}
                    onToggle={(v) => saveModel(active.id, { is_active: v })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-black text-slate-700">Phân bổ traffic (A/B)</p>
                  <span className="text-[12px] font-mono font-bold text-dgblue bg-dgblue/5 px-2 py-0.5 rounded border border-dgblue/10 tabular-nums">
                    {active.traffic_percent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={active.traffic_percent}
                  disabled={!editable || !!saving[active.id]}
                  onChange={(e) =>
                    // optimistic local update; committed on release
                    patchLocal({ ...active, traffic_percent: parseInt(e.target.value, 10) })
                  }
                  onMouseUp={(e) => saveModel(active.id, { traffic_percent: parseInt((e.target as HTMLInputElement).value, 10) })}
                  onTouchEnd={(e) => saveModel(active.id, { traffic_percent: parseInt((e.target as HTMLInputElement).value, 10) })}
                  aria-label="Phân bổ traffic"
                  className="w-full accent-dgblue disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                  <span>0% (canary tắt)</span>
                  <span>100% (toàn bộ)</span>
                </div>
              </div>

              {!editable && (
                <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Icon name="lock" className="text-[13px]" />
                  Chỉ admin chỉnh được
                </p>
              )}
            </div>
          </div>

          {/* per-model threshold gauge + slider */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <h2 className="text-base font-black text-slate-900 mb-1">Ngưỡng của model</h2>
            <p className="text-xs text-slate-400 mb-5">Áp dụng cho phiên bản đang chọn</p>
            <div className="flex flex-col items-center mb-5">
              <Gauge value={activeDraft * 100} color={DG.primary} size={130} />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={activeDraft}
              disabled={!editable || !!saving[active.id]}
              onChange={(e) =>
                setDraftThreshold((d) => ({ ...d, [active.id]: parseFloat(e.target.value) }))
              }
              onMouseUp={(e) => saveModel(active.id, { threshold: parseFloat((e.target as HTMLInputElement).value) })}
              onTouchEnd={(e) => saveModel(active.id, { threshold: parseFloat((e.target as HTMLInputElement).value) })}
              aria-label="Ngưỡng của model"
              className="w-full mb-2 accent-dgblue disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wide mb-4">
              <span>Nhạy (ít bỏ sót)</span>
              <span>Chặt (ít báo nhầm)</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <b className="text-dgblue">{activeDraft.toFixed(2)}</b> — {thresholdHint}
              </p>
            </div>
            <button
              onClick={() => saveModel(active.id, { threshold: activeDraft })}
              disabled={!editable || !!saving[active.id] || activeDraft === active.threshold}
              className="w-full mt-4 py-2.5 bg-dgblue text-white rounded-xl font-bold text-xs shadow-lg shadow-dgblue/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {saving[active.id] ? (
                <>
                  <Icon name="sync" className="text-[15px] animate-spin" />
                  Đang lưu…
                </>
              ) : (
                'Lưu ngưỡng'
              )}
            </button>
            {!editable && (
              <p className="text-[10px] font-semibold text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
                <Icon name="lock" className="text-[13px]" />
                Chỉ admin chỉnh được
              </p>
            )}
          </div>
        </div>
      )}

      {/* per-model threshold overview table (real data, replaces fake policies) */}
      {!loading && !error && models.length > 0 && (
        <div className="glass-panel rounded-2xl shadow-sm border border-white/60 overflow-hidden dg-rise">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900">Ngưỡng theo từng model</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Tổng quan ngưỡng &amp; trạng thái của các phiên bản model</p>
          </div>
          <div className="divide-y divide-slate-50 custom-scrollbar">
            {models.map((m) => {
              const status = modelStatus(m);
              return (
                <div
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`px-6 py-4 flex flex-wrap items-center gap-4 cursor-pointer transition-colors ${selected === m.id ? 'bg-dgblue/5' : 'hover:bg-slate-50/40'}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-dgblue/8 flex items-center justify-center shrink-0">
                    <Icon name="model_training" className="text-[18px] text-dgblue" fill />
                  </div>
                  <div className="min-w-[160px]">
                    <p className="text-[13px] font-bold text-slate-800">{m.architecture}</p>
                    <p className="text-[10px] font-mono text-slate-400">{m.version}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Ngưỡng</span>
                    <span className="text-[12px] font-mono font-bold text-dgblue bg-dgblue/5 px-2 py-0.5 rounded border border-dgblue/10 tabular-nums">
                      {m.threshold.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                    <Icon name="speed" className="text-[15px] text-slate-400" />
                    AUC {aucPct(m.auc_celeb)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                    <Icon name="alt_route" className="text-[15px] text-slate-400" />
                    Traffic {m.traffic_percent}%
                  </span>
                  <div className="ml-auto flex items-center gap-3">
                    {status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-dgreal bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-dgreal" />
                        ACTIVE
                      </span>
                    ) : status === 'canary' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-dgwarn bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                        <Icon name="science" className="text-[11px]" />
                        CANARY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        INACTIVE
                      </span>
                    )}
                    <Switch
                      on={m.is_active}
                      disabled={!editable || !!saving[m.id]}
                      onToggle={(v) => saveModel(m.id, { is_active: v })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
