'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';
import { canEdit, type Role } from '@/lib/rbac';
import { Icon, VerdictBadge, Gauge, ScoreBar } from '@/components/deepguard/shared';
import { verdictStyle, timeAgo } from '@/lib/dg';
import {
  detectionsGet,
  detectionsAddNote,
  detectionsList,
  type DetectionDetail,
  type DetectionListItem,
} from '@/lib/api';

type ViewMode = 'overlay' | 'split' | 'original';

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function DetailPage() {
  const { selectedRequestId, navigate, setSelectedRequestId } = useNavigation();
  const [detection, setDetection] = useState<DetectionDetail | null>(null);
  const [related, setRelated] = useState<DetectionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewMode, setViewMode] = useState<ViewMode>('overlay');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const role = useAuthStore((s) => s.user?.role) as Role | undefined;
  const canNote = canEdit(role, 'detail'); // admin + compliance only

  useEffect(() => {
    if (!selectedRequestId) {
      setError('Chưa chọn request — vào trang Lịch sử để chọn một bản ghi.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    detectionsGet(selectedRequestId)
      .then((d) => {
        setDetection(d);
        setShowHeatmap(d.verdict !== 'REAL');
        const end = new Date();
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        return detectionsList({
          api_key_id: d.api_key_id,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          limit: 4,
        });
      })
      .then((page) => {
        if (page) setRelated(page.items.filter((it) => it.request_id !== selectedRequestId).slice(0, 3));
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, [selectedRequestId]);

  const handleSaveNote = async () => {
    if (!detection || !noteText.trim()) return;
    setSavingNote(true);
    try {
      const updated = await detectionsAddNote(detection.request_id, noteText.trim());
      setDetection(updated);
      setNoteText('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lưu ghi chú thất bại');
    } finally {
      setSavingNote(false);
    }
  };

  const s = useMemo(() => verdictStyle(detection?.verdict ?? 'UNCERTAIN'), [detection]);

  const dimensionsLabel = useMemo(() => {
    if (!detection || !detection.image_width || !detection.image_height) return '—';
    return `${detection.image_width}×${detection.image_height}`;
  }, [detection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Icon name="progress_activity" className="text-[18px] animate-spin" />
          Đang tải chi tiết phát hiện…
        </div>
      </div>
    );
  }

  if (error || !detection) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-white/60 flex flex-col items-center text-center max-w-md mx-auto mt-10">
        <span className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <Icon name="touch_app" className="text-[28px] text-slate-400" />
        </span>
        <h3 className="text-sm font-black text-slate-800 mb-1">Không thể hiển thị</h3>
        <p className="text-xs text-slate-500 mb-5">{error || 'Không tìm thấy detection.'}</p>
        <button
          onClick={() => navigate('history')}
          className="px-5 py-2 bg-dgblue text-white rounded-xl text-xs font-bold shadow-lg shadow-dgblue/25 hover:bg-dgblue/90 transition-all"
        >
          Quay lại Lịch sử
        </button>
      </div>
    );
  }

  const isFake = detection.verdict !== 'REAL';
  const freqRaw = detection.frequency_score ?? detection.spatial_score ?? 0;
  const hasImage = Boolean(detection.image_thumb);

  return (
    <div className="space-y-5">
      {/* Breadcrumb header */}
      <div className="flex flex-wrap items-center justify-between gap-3 dg-rise">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('history')}
            className="w-9 h-9 rounded-full hover:bg-white flex items-center justify-center text-slate-500 transition-colors shrink-0"
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black tracking-tight text-slate-900">Chi tiết phát hiện</h1>
              <VerdictBadge verdict={detection.verdict} size="lg" />
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              {detection.request_id} · {fmtDateTime(detection.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard?.writeText(detection.request_id)}
            className="flex items-center gap-2 px-4 h-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Icon name="content_copy" className="text-[16px]" /> Copy ID
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT — forensic visualizer */}
        <div className="lg:col-span-5 space-y-5">
          <section className="glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Forensic Visualizer</h3>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500 font-mono">{dimensionsLabel}</span>
            </div>

            {/* view mode tabs */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-white mb-4">
              {([['overlay', 'Overlay'], ['split', 'Split'], ['original', 'Gốc']] as const).map(([m, l]) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    viewMode === m ? 'bg-white text-dgblue shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-900 shadow-inner flex items-center justify-center">
              {!hasImage ? (
                <div className="text-center px-6">
                  <Icon name="image_not_supported" className="text-[60px] text-slate-600" />
                  <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                    Bản ghi này không có ảnh lưu (tạo trước khi bật lưu thumbnail).
                    <br />Hash SHA-256 vẫn được giữ làm chứng cứ audit.
                  </p>
                </div>
              ) : viewMode === 'split' ? (
                <div className="grid grid-cols-2 h-full w-full">
                  <div className="relative border-r-2 border-white/40">
                    <img src={detection.image_thumb!} className="w-full h-full object-cover" alt="Ảnh gốc" />
                    <span className="absolute bottom-2 left-2 text-[9px] font-black text-white bg-black/60 px-2 py-0.5 rounded">GỐC</span>
                  </div>
                  <div className="relative">
                    <img src={detection.heatmap_url ?? detection.image_thumb!} className="w-full h-full object-cover" alt="Heatmap" />
                    {isFake && !detection.heatmap_url && <div className="absolute inset-0 heatmap-overlay" style={{ opacity: 0.85 }} />}
                    <span className="absolute bottom-2 right-2 text-[9px] font-black text-white bg-black/60 px-2 py-0.5 rounded">HEATMAP</span>
                  </div>
                </div>
              ) : (
                <>
                  <img src={detection.image_thumb!} className="w-full h-full object-cover" alt="Ảnh gốc" />
                  {viewMode === 'overlay' && showHeatmap && (
                    detection.heatmap_url ? (
                      <img
                        src={detection.heatmap_url}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-screen pointer-events-none"
                        style={{ opacity: 0.8 }}
                        alt="Heatmap overlay"
                      />
                    ) : isFake ? (
                      <div className="absolute inset-0 heatmap-overlay pointer-events-none" style={{ opacity: 0.7 }} />
                    ) : null
                  )}
                  {viewMode === 'overlay' && showHeatmap && <div className="absolute inset-0 scan-line pointer-events-none" />}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5">
                    <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                      {viewMode === 'original' ? 'Original' : 'Overlay'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* controls */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-100">
                <div className="flex items-center gap-3">
                  <Icon name="layers" className="text-[20px] text-dgblue" fill />
                  <div>
                    <p className="text-xs font-bold text-slate-700">DCT Heatmap Overlay</p>
                    <p className="text-[10px] text-slate-400">
                      {detection.heatmap_url ? 'Heatmap thật từ model' : isFake ? 'Mô phỏng vùng artifact' : 'Không có artifact'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    disabled={viewMode !== 'overlay'}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-dgblue peer-disabled:opacity-40 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Artifact intensity</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-blue-500 font-bold uppercase">Cold</span>
                  <div className="w-24 h-2 rounded-full" style={{ background: 'linear-gradient(to right,#3b82f6,#f59e0b,#dc2626)' }} />
                  <span className="text-[9px] text-red-600 font-bold uppercase">Hot</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT — verdict + breakdown + meta */}
        <div className="lg:col-span-7 space-y-5">
          <section className="glass-panel rounded-2xl p-7 shadow-sm border border-white/60" style={{ borderTop: `4px solid ${s.color}` }}>
            <div className="flex items-start justify-between gap-4 mb-7">
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagnostic verdict</h3>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black tracking-tighter" style={{ color: s.color, textShadow: `0 0 18px ${s.color}28` }}>
                    {detection.verdict}
                  </span>
                  <div className="h-10 w-px bg-slate-200" />
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Prob fake</p>
                    <p className="text-2xl font-black text-slate-800 tabular-nums leading-none">{(detection.prob_fake * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              <Gauge value={detection.confidence} color={s.color} />
            </div>

            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Explainable AI · Score breakdown</p>
            <div className="space-y-4 mb-6">
              <ScoreBar label="Spatial feature (CNN)" value={detection.prob_cnn * 100} raw={detection.prob_cnn} color="#0050cb" />
              <ScoreBar label="Frequency artifact (DCT)" value={freqRaw * 100} raw={freqRaw} color="#ed6c02" />
              <ScoreBar label="Final combined (prob_fake)" value={detection.prob_fake * 100} raw={detection.prob_fake} color={s.color} />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-slate-100">
              {([
                ['Threshold', detection.threshold_used.toFixed(2)],
                ['Latency', `${detection.processing_time_ms}ms`],
                ['Model', detection.model_version],
              ] as const).map(([k, v]) => (
                <div key={k}>
                  <p className="text-[9px] font-black text-slate-400 uppercase">{k}</p>
                  <p className="text-sm font-bold text-slate-700 tabular-nums truncate">{v}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Metadata + notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 shadow-sm border border-white/60">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5">Request metadata</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            {([
              ['Tenant', detection.tenant_name ?? '—'],
              ['API Key', detection.api_key_name ?? '—'],
              ['Model', detection.model_version],
              ['IP Address', detection.ip_address ?? '—'],
              ['Created', fmtDateTime(detection.created_at)],
              ['Key prefix', detection.api_key_prefix ?? '—'],
            ] as const).map(([k, v]) => (
              <div key={k}>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{k}</p>
                <p className="text-xs font-bold text-slate-700 font-mono truncate" title={String(v)}>{v}</p>
              </div>
            ))}
            <div className="col-span-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase">User Agent</p>
              <p className="text-[11px] font-bold text-slate-600 truncate" title={detection.user_agent ?? ''}>{detection.user_agent ?? '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Image SHA-256</p>
              <p className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 p-2 rounded-lg mt-1 break-all">{detection.image_hash}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 shadow-sm border border-white/60 flex flex-col">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Audit &amp; review notes <span className="text-slate-400 font-mono">({detection.audit_notes.length})</span>
          </h3>
          {detection.audit_notes.length > 0 ? (
            <div className="mb-4 space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
              {detection.audit_notes.map((n, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 dg-fade">
                  <p className="text-xs text-slate-700 leading-relaxed">{n.note}</p>
                  <p className="text-[9px] text-slate-400 mt-1.5 font-mono flex items-center gap-1">
                    <Icon name="person" className="text-[12px]" />
                    {n.author_email} · {timeAgo(n.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4 flex flex-col items-center justify-center py-6 text-slate-300">
              <Icon name="rate_review" className="text-[32px]" />
              <p className="text-[11px] text-slate-400 mt-1">Chưa có ghi chú review</p>
            </div>
          )}
          {canNote ? (
            <>
              <textarea
                maxLength={500}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ghi chú kết quả review (VD: Ảnh có dấu hiệu face-swap quanh vùng mắt)…"
                className="flex-1 w-full bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-dgblue/20 focus:border-dgblue transition-all resize-none custom-scrollbar min-h-[90px]"
              />
              <div className="mt-3 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tabular-nums">{noteText.length}/500</span>
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote || !noteText.trim()}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {savingNote ? 'Đang lưu…' : 'Lưu ghi chú'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
              <Icon name="lock" className="text-[14px]" /> Chỉ admin/compliance được thêm ghi chú review.
            </p>
          )}
        </div>
      </div>

      {/* Related */}
      <section className="dg-rise">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
          Sự kiện liên quan · cùng API key trong 24h
        </h3>
        {related.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Không có sự kiện liên quan trong 24h gần nhất.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((it) => {
              const rs = verdictStyle(it.verdict);
              return (
                <button
                  key={it.request_id}
                  onClick={() => setSelectedRequestId(it.request_id)}
                  className="glass-panel p-4 rounded-2xl border border-white/60 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all text-left shadow-sm"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0"
                    style={{ color: rs.color, background: rs.bg }}
                  >
                    {it.verdict}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono text-slate-400 truncate uppercase">
                      {it.request_id.slice(0, 8)}…{it.request_id.slice(-4)}
                    </p>
                    <p className="text-xs font-black mt-0.5" style={{ color: rs.color }}>
                      {it.verdict} · {it.confidence.toFixed(1)}%
                    </p>
                  </div>
                  <Icon name="chevron_right" className="text-[18px] text-slate-300 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
