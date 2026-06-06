'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  detectImage,
  detectVideo,
  type DetectionResponse,
  type VideoDetectionResponse,
} from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Icon, ScoreBar, Gauge, CodeBlock } from '@/components/deepguard/shared';
import { DG, verdictStyle } from '@/lib/dg';

/* ────────────────────────────────────────────────────────────────
   Sample presets — wired as real file inputs to detectImage when the
   asset can be fetched from /samples/*.jpg, else used as visual presets.
   ──────────────────────────────────────────────────────────────── */
const SAMPLES = [
  { id: 'real_face', label: 'ẢNH THẬT', src: '/samples/real_01.jpg' },
  { id: 'gan_fake', label: 'GAN FAKE', src: '/samples/fake_03.jpg' },
  { id: 'swap_fake', label: 'SWAP FAKE', src: '/samples/fake_01.jpg' },
] as const;

/* Build the canonical JSON payload from the real DetectionResponse. */
function resultToJSON(r: DetectionResponse): string {
  return JSON.stringify(
    {
      request_id: r.request_id,
      verdict: r.verdict,
      confidence: r.confidence,
      prob_fake: +(r.prob_fake ?? 0).toFixed(4),
      prob_cnn: +(r.prob_cnn ?? 0).toFixed(4),
      spatial_score: r.spatial_score != null ? +r.spatial_score.toFixed(4) : null,
      frequency_score: r.frequency_score != null ? +r.frequency_score.toFixed(4) : null,
      threshold_used: r.threshold_used,
      face_detected: r.face_detected,
      processing_time_ms: r.processing_time_ms,
      model_version: r.model_version,
      image_width: r.image_width,
      image_height: r.image_height,
      created_at: r.created_at,
    },
    null,
    2,
  );
}

function videoToJSON(r: VideoDetectionResponse): string {
  return JSON.stringify(
    {
      job_id: r.job_id,
      verdict: r.verdict,
      confidence: r.confidence,
      prob_fake: +(r.prob_fake ?? 0).toFixed(4),
      frames_analyzed: r.frames_analyzed,
      frames_fake: r.frames_fake,
      model_version: r.model_version,
      processing_time_ms: r.processing_time_ms,
      created_at: r.created_at,
    },
    null,
    2,
  );
}

/* Client-side video frame thumbnail extraction (fallback when the server
   doesn't return base64 thumbs). Preserved from the original implementation. */
async function extractFrameThumbs(
  videoFile: File,
  frameIds: number[],
  fps = 30,
  onProgress?: (done: number, total: number) => void,
): Promise<Record<number, string>> {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.style.cssText =
    'position:fixed;left:-10000px;top:-10000px;width:320px;height:240px;opacity:0;pointer-events:none';
  document.body.appendChild(video);

  const objectUrl = URL.createObjectURL(videoFile);
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onErr = () => {
        cleanup();
        reject(new Error(`video load error (code ${video.error?.code})`));
      };
      const cleanup = () => {
        video.removeEventListener('loadeddata', onReady);
        video.removeEventListener('canplay', onReady);
        video.removeEventListener('error', onErr);
      };
      video.addEventListener('loadeddata', onReady);
      video.addEventListener('canplay', onReady);
      video.addEventListener('error', onErr);
      video.load();
    });

    const W = video.videoWidth || 320;
    const H = video.videoHeight || 240;
    const maxDim = 240;
    const scale = Math.min(maxDim / W, maxDim / H, 1);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(W * scale));
    canvas.height = Math.max(1, Math.round(H * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d context unavailable');

    const thumbs: Record<number, string> = {};
    const total = frameIds.length;
    let done = 0;

    for (const id of frameIds) {
      const t = Math.min(id / fps, Math.max(0, (video.duration || 0) - 0.01));
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
        video.currentTime = t;
      });
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      thumbs[id] = canvas.toDataURL('image/jpeg', 0.8);
      done++;
      onProgress?.(done, total);
    }

    return thumbs;
  } finally {
    URL.revokeObjectURL(objectUrl);
    if (video.parentNode) video.parentNode.removeChild(video);
  }
}

/* ── Numbered section divider (V2) ── */
function SectionDivider({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-[9px] font-black text-dgblue tracking-[0.14em] uppercase tabular-nums">{n}</span>
      <div className="flex-1 h-px bg-slate-200/80" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">{title}</span>
    </div>
  );
}

export default function PlaygroundPage() {
  const apiKey = useAuthStore((s) => s.apiKey);
  const [threshold, setThreshold] = useState(0.35);
  const [includeHeatmap, setIncludeHeatmap] = useState(true);
  const [codeTab, setCodeTab] = useState<'python' | 'curl' | 'js'>('python');
  const [outTab, setOutTab] = useState<'visual' | 'json'>('visual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [videoResult, setVideoResult] = useState<VideoDetectionResponse | null>(null);
  const [frameThumbs, setFrameThumbs] = useState<Record<number, string>>({});
  const [extracting, setExtracting] = useState<{ done: number; total: number } | null>(null);
  const [videoCanPlay, setVideoCanPlay] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [runs, setRuns] = useState<
    { name: string; src: string; verdict: string; confidence: number }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = selectedFile?.type.startsWith('video/') ?? false;

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setVideoCanPlay(true);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const firstThumb = useMemo(() => {
    if (!videoResult) return null;
    for (const fr of videoResult.frame_results) {
      if (frameThumbs[fr.frame_id]) return frameThumbs[fr.frame_id];
    }
    return null;
  }, [videoResult, frameThumbs]);

  const resetOutputs = () => {
    setResult(null);
    setVideoResult(null);
    setFrameThumbs({});
    setError('');
  };

  const pickFile = (f: File) => {
    setSelectedFile(f);
    setActiveSample(null);
    resetOutputs();
  };

  const pickSample = async (s: (typeof SAMPLES)[number]) => {
    setActiveSample(s.id);
    resetOutputs();
    try {
      const res = await fetch(s.src);
      if (!res.ok) throw new Error('not found');
      const blob = await res.blob();
      const file = new File([blob], `${s.id}.jpg`, { type: blob.type || 'image/jpeg' });
      setSelectedFile(file);
    } catch {
      // Asset not available — keep it as a visual preset (preview the path only).
      setSelectedFile(null);
      setPreviewUrl(s.src);
      setError('Không tải được sample asset — đây là preset hiển thị.');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file hoặc sample trước');
      return;
    }
    if (!apiKey) {
      setError('Chưa có API Key. Vào API Keys → tạo key → key sẽ tự lưu');
      return;
    }
    setError('');
    setResult(null);
    setVideoResult(null);
    setIsAnalyzing(true);
    try {
      if (isVideo) {
        const res = await detectVideo(selectedFile, apiKey, 3);
        setVideoResult(res);
        const thumbs: Record<number, string> = {};
        for (const fr of res.frame_results) {
          if (fr.thumb) thumbs[fr.frame_id] = fr.thumb;
        }
        setFrameThumbs(thumbs);

        const missing = res.frame_results.filter((f) => !f.thumb).map((f) => f.frame_id);
        if (missing.length > 0) {
          setExtracting({ done: 0, total: missing.length });
          try {
            const clientThumbs = await extractFrameThumbs(selectedFile, missing, 30, (done, total) =>
              setExtracting({ done, total }),
            );
            setFrameThumbs((prev) => ({ ...prev, ...clientThumbs }));
          } catch (err) {
            console.warn('client-side frame extraction failed:', err);
          } finally {
            setExtracting(null);
          }
        }
        setRuns((p) =>
          [{ name: selectedFile.name, src: previewUrl ?? '', verdict: res.verdict, confidence: res.confidence }, ...p].slice(0, 5),
        );
      } else {
        const res = await detectImage(selectedFile, apiKey, threshold);
        setResult(res);
        setRuns((p) =>
          [{ name: selectedFile.name, src: previewUrl ?? '', verdict: res.verdict, confidence: res.confidence }, ...p].slice(0, 5),
        );
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Detect thất bại');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ── Code snippets ── */
  const pythonCode = `import requests

url = "https://api.deepguard.io/v1/detect/image"
headers = {'x-api-key': 'demo-key-vietbank-2024'}
payload = {'threshold': ${threshold.toFixed(4)}, 'include_heatmap': ${includeHeatmap}}
files = [('file', open('${selectedFile?.name ?? 'target_media.jpg'}','rb'))]

response = requests.post(url, headers=headers, data=payload, files=files)
print(response.json())`;

  const curlCode = `curl -X POST "https://api.deepguard.io/v1/detect/image?threshold=${threshold.toFixed(4)}" \\
  -H "x-api-key: demo-key-vietbank-2024" \\
  -F "include_heatmap=${includeHeatmap}" \\
  -F "file=@${selectedFile?.name ?? 'target_media.jpg'}"`;

  const jsCode = `const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(
  'https://api.deepguard.io/v1/detect/image?threshold=${threshold.toFixed(4)}',
  {
    method: 'POST',
    headers: { 'x-api-key': 'demo-key-vietbank-2024' },
    body: formData
  }
);
const data = await response.json();
console.log(data);`;

  const codeContent = codeTab === 'python' ? pythonCode : codeTab === 'curl' ? curlCode : jsCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Derived verdict state ── */
  const v = result?.verdict ?? videoResult?.verdict ?? null;
  const vStyle = v ? verdictStyle(v) : null;
  const accentColor = vStyle?.color ?? '#94a3b8';
  const activeResult = result ?? videoResult;
  const jsonOutput = result ? resultToJSON(result) : videoResult ? videoToJSON(videoResult) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
      {/* ════════════════ LEFT COLUMN ════════════════ */}
      <div className="space-y-4">
        {/* 01 — Media Input */}
        <section className="glass-panel rounded-2xl p-5 shadow-sm border border-white">
          <SectionDivider n="01" title="Media Input" />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/bmp,video/mp4,video/webm,video/quicktime,video/mpeg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
            }}
          />

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) pickFile(f);
            }}
            className={`upload-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer mb-4 group transition-all ${
              dragOver ? 'bg-dgblue/5 border-dgblue' : 'bg-white/30'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-dgblue/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Icon name="upload_file" className="text-[26px] text-dgblue/50 group-hover:text-dgblue transition-colors" />
            </div>
            {selectedFile ? (
              <p className="text-xs font-bold text-dgblue max-w-full truncate">{selectedFile.name}</p>
            ) : (
              <p className="text-xs font-bold text-slate-700">Kéo file hoặc click để chọn</p>
            )}
            <p className="text-[10px] text-slate-400 mt-1">JPG · PNG · WEBP · MP4 (Ảnh 10MB / Video 200MB)</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-dgfake/5 border border-dgfake/20">
              <Icon name="error" className="text-[15px] text-dgfake shrink-0" />
              <span className="text-xs font-semibold text-dgfake">{error}</span>
            </div>
          )}

          {/* Sample presets */}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.14em] mb-2">Sample Presets</p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {SAMPLES.map((s) => {
              const sel = activeSample === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => pickSample(s)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-colors aspect-square ${
                    sel ? 'border-dgblue' : 'border-slate-200 hover:border-dgblue/50'
                  }`}
                >
                  <img
                    src={s.src}
                    alt={s.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                    <span className="text-[8px] font-black text-white tracking-wide">{s.label}</span>
                  </div>
                  {sel && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-dgblue flex items-center justify-center">
                      <Icon name="check" className="text-[10px] text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 02-inline — Parameters */}
          <SectionDivider n="02" title="Parameters" />

          {/* Threshold slider */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-600">Threshold</label>
              <span className="text-xs font-mono font-bold text-dgblue bg-dgblue/5 px-2 py-0.5 rounded border border-dgblue/10 tabular-nums">
                {threshold.toFixed(4)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.0001"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-dgblue"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Nhạy (Real)</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Chặt (Fake)</span>
            </div>
          </div>

          {/* Heatmap toggle */}
          <label className="flex items-center justify-between p-3 mb-5 bg-white/40 rounded-xl border border-white cursor-pointer hover:bg-white transition-colors">
            <span className="flex items-center gap-2.5">
              <Icon name="blur_on" className="text-[18px] text-dgblue" />
              <span>
                <span className="block text-xs font-bold text-slate-700 leading-tight">DCT Heatmap</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{includeHeatmap ? 'Bật' : 'Tắt'}</span>
              </span>
            </span>
            <span
              className="relative inline-block w-9 h-5 rounded-full shrink-0 transition-colors"
              style={{ background: includeHeatmap ? DG.primary : '#e2e8f0' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: includeHeatmap ? 18 : 2 }}
              />
            </span>
            <input
              type="checkbox"
              checked={includeHeatmap}
              onChange={(e) => setIncludeHeatmap(e.target.checked)}
              className="sr-only"
            />
          </label>

          {/* Analyze CTA */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3.5 bg-dgblue text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-dgblue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                ĐANG PHÂN TÍCH…
              </>
            ) : (
              <>
                <Icon name={isVideo ? 'video_search' : 'rocket_launch'} className="text-[18px] group-hover:rotate-12 transition-transform" />
                {isVideo ? 'PHÂN TÍCH VIDEO' : 'PHÂN TÍCH'}
              </>
            )}
          </button>
        </section>

        {/* 03 — Recent runs */}
        {runs.length > 0 && (
          <section className="glass-panel rounded-2xl px-4 py-4 shadow-sm border border-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">Recent runs</span>
              <button
                onClick={() => setRuns([])}
                className="text-[10px] font-bold text-dgfake hover:opacity-80 transition-opacity"
              >
                Xoá
              </button>
            </div>
            <div className="space-y-1.5">
              {runs.map((r, i) => {
                const rs = verdictStyle(r.verdict);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    {r.src ? (
                      <img src={r.src} alt="" className="w-7 h-7 rounded-md object-cover shrink-0" />
                    ) : (
                      <span className="w-7 h-7 rounded-md bg-slate-200 flex items-center justify-center shrink-0">
                        <Icon name="image" className="text-[14px] text-slate-400" />
                      </span>
                    )}
                    <span className="flex-1 text-[11px] font-semibold text-slate-600 truncate">{r.name}</span>
                    <span className="text-[10px] font-black shrink-0 tabular-nums" style={{ color: rs.color }}>
                      {r.verdict}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* ════════════════ RIGHT COLUMN ════════════════ */}
      <div className="space-y-4">
        {/* Verdict hero card */}
        <div
          className="glass-panel rounded-2xl shadow-md relative overflow-hidden"
          style={{ borderTop: `4px solid ${accentColor}` }}
        >
          <div className="p-6 flex flex-col md:flex-row gap-7 items-start">
            {/* Preview */}
            <div
              className={`relative bg-slate-100 rounded-2xl overflow-hidden shadow-inner shrink-0 flex items-center justify-center border border-slate-200 ${
                isVideo && previewUrl ? 'w-full max-w-[340px] aspect-video' : 'w-[300px] h-[300px]'
              }`}
            >
              {previewUrl && isVideo && videoCanPlay ? (
                <video
                  key={previewUrl}
                  className="w-full h-full object-contain bg-black"
                  src={previewUrl}
                  controls
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  onError={() => setVideoCanPlay(false)}
                >
                  Browser không hỗ trợ định dạng video này.
                </video>
              ) : previewUrl && isVideo ? (
                <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                  {firstThumb ? (
                    <img src={firstThumb} alt="Video frame" className="w-full h-full object-contain" />
                  ) : (
                    <Icon name="movie" className="text-[60px] text-slate-500" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[10px] font-bold px-3 py-2 text-center">
                    Browser không decode được codec — xem frame bên dưới
                  </div>
                </div>
              ) : previewUrl ? (
                <img className="w-full h-full object-cover" src={previewUrl} alt="Preview" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Icon name="image" className="text-[56px] text-slate-300" />
                  <span className="text-xs font-semibold text-slate-400">Chưa có media</span>
                </div>
              )}

              {/* Grad-CAM THẬT từ model SFDCT; fallback gradient minh hoạ nếu response chưa có heatmap */}
              {result && includeHeatmap && result.heatmap ? (
                <img
                  src={result.heatmap}
                  alt="Grad-CAM"
                  title="Grad-CAM (SFDCT) — vùng model tập trung"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : result && includeHeatmap && v && v !== 'REAL' ? (
                <div
                  className="heatmap-overlay absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 42% 45%, ${accentColor}cc 0%, ${accentColor}55 32%, transparent 65%), radial-gradient(ellipse at 66% 58%, ${accentColor}88 0%, transparent 48%)`,
                    mixBlendMode: 'multiply',
                    opacity: 0.65,
                  }}
                />
              ) : null}

              {/* Scan line while analyzing */}
              {isAnalyzing && <div className="scan-line" />}
            </div>

            {/* Result panel */}
            <div className="flex-1 min-w-0 w-full">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Kết quả chẩn đoán
              </h4>

              <div className="flex items-baseline gap-3 flex-wrap mb-1">
                <span className="text-5xl font-black tracking-tighter leading-none" style={{ color: accentColor }}>
                  {v ?? '—'}
                </span>
                {activeResult ? (
                  <span className="text-xl font-bold text-slate-400 font-mono tabular-nums">
                    {activeResult.confidence.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-sm font-medium text-slate-400 self-center">Chọn media &amp; bấm Phân Tích</span>
                )}
                {activeResult && (
                  <span className="ml-auto text-[10px] font-bold text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md tabular-nums">
                    {activeResult.processing_time_ms}ms
                  </span>
                )}
              </div>

              {result && (
                <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">
                  Face: {result.face_detected ? 'Phát hiện' : 'Không rõ'} · {result.model_version}
                  {result.image_width && result.image_height
                    ? ` · ${result.image_width}×${result.image_height}px`
                    : ''}
                </p>
              )}
              {videoResult && (
                <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">
                  {videoResult.frames_analyzed} frame phân tích · {videoResult.frames_fake} fake · {videoResult.model_version}
                </p>
              )}

              {/* Image breakdown */}
              {result && (
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 w-full space-y-3.5">
                    <ScoreBar label="Prob Fake" value={result.prob_fake * 100} color={accentColor} />
                    <ScoreBar label="CNN Score" value={result.prob_cnn * 100} color={DG.primary} />
                    <ScoreBar label="Spatial" value={(result.spatial_score ?? 0) * 100} color={DG.uncertain} />
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        ['Latency', `${result.processing_time_ms}ms`],
                        ['Threshold', result.threshold_used.toFixed(2)],
                        ['Frequency', `${((result.frequency_score ?? 0) * 100).toFixed(0)}%`],
                      ].map(([l, val]) => (
                        <div key={l} className="px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{l}</p>
                          <p className="text-[13px] font-black text-slate-700 font-mono tabular-nums">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 self-center md:self-start">
                    <Gauge value={result.confidence} color={accentColor} size={120} />
                  </div>
                </div>
              )}

              {/* Video breakdown */}
              {videoResult && (
                <div className="space-y-3.5">
                  <ScoreBar label="Prob Fake (avg)" value={videoResult.prob_fake * 100} color={accentColor} />
                  <ScoreBar
                    label="Frames Fake"
                    value={(videoResult.frames_fake / Math.max(videoResult.frames_analyzed, 1)) * 100}
                    color={DG.primary}
                  />
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      ['Frames', String(videoResult.frames_analyzed)],
                      ['Fake', String(videoResult.frames_fake)],
                      ['Latency', `${videoResult.processing_time_ms}ms`],
                    ].map(([l, val], i) => (
                      <div key={l} className="px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{l}</p>
                        <p
                          className={`text-[13px] font-black font-mono tabular-nums ${
                            i === 1 ? 'text-dgfake' : 'text-slate-700'
                          }`}
                        >
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty placeholder */}
              {!activeResult && !isAnalyzing && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-[52px] rounded-xl border border-dashed border-slate-200 bg-slate-50"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Output tabs: Visual / JSON */}
        <div className="glass-panel rounded-2xl shadow-sm border border-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex gap-1">
              {(
                [
                  ['visual', 'Phân tích', 'insights'],
                  ['json', 'Response JSON', 'data_object'],
                ] as const
              ).map(([id, label, ic]) => (
                <button
                  key={id}
                  onClick={() => setOutTab(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    outTab === id ? 'bg-dgblue/10 text-dgblue' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon name={ic} className="text-[15px]" />
                  {label}
                </button>
              ))}
            </div>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full tabular-nums"
              style={
                activeResult
                  ? { background: '#f0fdf4', color: DG.real }
                  : { background: '#f1f5f9', color: '#94a3b8' }
              }
            >
              {activeResult ? 'HTTP 200' : 'No request yet'}
            </span>
          </div>

          {outTab === 'json' ? (
            jsonOutput ? (
              <div className="p-4">
                <CodeBlock code={jsonOutput} language="json" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-11 px-6 text-center">
                <Icon name="data_object" className="text-[38px] text-slate-300 mb-2.5" />
                <p className="text-xs font-medium text-slate-400">Response JSON sẽ hiện sau khi phân tích</p>
              </div>
            )
          ) : activeResult ? (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: 'memory', title: 'EfficientNet-B4', sub: 'Spatial-Frequency dual-stream' },
                { icon: 'blur_on', title: 'DCT Analysis', sub: includeHeatmap ? 'Heatmap bật' : 'Heatmap tắt' },
                {
                  icon: 'verified',
                  title: v === 'FAKE' ? 'Dấu hiệu giả mạo' : v === 'REAL' ? 'Không phát hiện' : 'Cần xem xét',
                  sub: result ? `Ngưỡng ${result.threshold_used.toFixed(2)}` : 'Phân tích video',
                },
              ].map((b) => (
                <div key={b.title} className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 items-start">
                  <Icon name={b.icon} className="text-[22px] text-dgblue shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 mb-0.5">{b.title}</p>
                    <p className="text-[10px] text-slate-400 leading-snug">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-11 px-6 text-center">
              <Icon name="insights" className="text-[38px] text-slate-300 mb-2.5" />
              <p className="text-xs font-medium text-slate-400">Chi tiết phân tích kỹ thuật sẽ hiện ở đây</p>
            </div>
          )}
        </div>

        {/* Frame analysis grid (video only) */}
        {videoResult && (
          <section className="glass-panel rounded-2xl p-5 shadow-sm border border-white">
            <div className="flex justify-between items-center mb-4">
              <SectionDivider n="03" title={`Frame Analysis · ${videoResult.frame_results.length} frames`} />
            </div>
            {extracting && (
              <p className="text-[10px] font-bold text-slate-500 italic mb-3">
                Đang trích frame {extracting.done}/{extracting.total}…
              </p>
            )}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {videoResult.frame_results.map((fr) => {
                const pct = (fr.prob_fake * 100).toFixed(0);
                const fake = fr.prob_fake >= 0.5;
                const thumb = frameThumbs[fr.frame_id];
                return (
                  <div
                    key={fr.frame_id}
                    className={`group relative rounded-xl aspect-square border overflow-hidden bg-slate-100 ${
                      fake ? 'border-dgfake/40' : 'border-dgreal/40'
                    }`}
                  >
                    {thumb ? (
                      <img src={thumb} alt={`Frame ${fr.frame_id}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="image" className="text-[20px] text-slate-300 animate-pulse" />
                      </div>
                    )}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 ${
                        fake ? 'bg-dgfake/60' : 'bg-dgreal/50'
                      }`}
                    >
                      <span className="text-[9px] text-white font-black">#{fr.frame_id}</span>
                      <span className="text-[8px] text-white font-bold tabular-nums">{pct}%</span>
                    </div>
                    <div
                      className={`absolute bottom-0 inset-x-0 py-0.5 text-center text-[8px] font-black text-white tabular-nums ${
                        fake ? 'bg-dgfake/80' : 'bg-dgreal/80'
                      }`}
                    >
                      {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Code snippet */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-800/50 border-b border-slate-700">
            <div className="flex gap-5">
              {(
                [
                  ['python', 'PYTHON'],
                  ['curl', 'cURL'],
                  ['js', 'JS FETCH'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setCodeTab(id)}
                  className={`text-[11px] font-bold pb-1 transition-colors ${
                    codeTab === id ? 'text-white border-b-2 border-dgblue' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              <Icon name={copied ? 'check' : 'content_copy'} className="text-[14px]" />
              {copied ? 'Đã sao chép!' : 'Copy'}
            </button>
          </div>
          <pre className="p-5 text-[12px] font-mono leading-relaxed overflow-x-auto text-blue-100 custom-scrollbar whitespace-pre">
            <code>{codeContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
