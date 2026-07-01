'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  playgroundDetectLiveness,
  type LivenessResponse,
} from '@/lib/api';
import { useT } from '@/lib/i18n';

const VERDICT_COLOR: Record<string, string> = {
  LIVE:      '#2e7d32',
  SPOOF:     '#ba1a1a',
  UNCERTAIN: '#ed6c02',
};

const SPOOF_KEYS: Record<string, string> = {
  print:    'liveness.spoof_print',
  screen:   'liveness.spoof_screen',
  mask_3d:  'liveness.spoof_mask_3d',
  deepfake: 'liveness.spoof_deepfake',
  unknown:  'liveness.spoof_unknown',
};

// Hai cách lấy ảnh, cùng đưa vào ĐÚNG một endpoint passive (1 ảnh → live/spoof).
type Source = 'upload' | 'webcam';

export default function LivenessPage() {
  const t = useT();
  const [source, setSource] = useState<Source>('upload');

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ngưỡng LIVE/SPOOF tùy chỉnh: P(live) < threshold => SPOOF. Mặc định 0.125 (12.5%).
  const [threshold, setThreshold] = useState(0.125);

  // Webcam state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streamActive, setStreamActive] = useState(false);

  // Result
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<LivenessResponse | null>(null);
  const [error, setError] = useState('');

  // Preview URL lifecycle (upload)
  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Webcam lifecycle
  const startCamera = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreamActive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Không truy cập được webcam');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreamActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Chụp 1 khung từ webcam → File
  const captureFrame = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return resolve(null);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], `frame-${Date.now()}.jpg`, { type: 'image/jpeg' }) : null),
        'image/jpeg',
        0.9,
      );
    });
  }, []);

  // Cả upload và webcam đều chấm bằng passive (1 ảnh) — không challenge, không gesture.
  const runCheck = async () => {
    let target: File | null = file;
    if (source === 'webcam') {
      if (!streamActive) { setError(t('liveness.err_webcam_inactive')); return; }
      target = await captureFrame();
      if (!target) { setError(t('liveness.err_capture_failed')); return; }
    }
    if (!target) { setError(t('liveness.err_no_image')); return; }
    setError(''); setResult(null); setRunning(true);
    try {
      const res = await playgroundDetectLiveness(target, threshold);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('liveness.err_check_failed'));
    } finally {
      setRunning(false);
    }
  };

  const verdictColor = result ? VERDICT_COLOR[result.verdict] ?? '#94a3b8' : '#94a3b8';
  const canRun = source === 'upload' ? !!file : streamActive;

  return (
    <div className="space-y-8">
      {/* Source selector */}
      <div className="glass-panel rounded-2xl p-4 shadow-sm border border-white flex items-center gap-4">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('liveness.source_label')}</span>
        <div className="flex gap-2">
          {(['upload', 'webcam'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setSource(m); setResult(null); setError(''); if (m === 'upload') stopCamera(); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                source === m
                  ? 'bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m === 'upload' ? t('liveness.source_upload') : t('liveness.source_webcam')}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 ml-auto italic">
          {t('liveness.source_hint')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Input */}
        <div className="lg:col-span-5 space-y-6">
          <section className="glass-panel rounded-2xl p-6 shadow-sm border border-white">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" />
              {source === 'upload' ? t('liveness.input_media') : t('liveness.input_camera')}
            </h3>

            {source === 'upload' ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/bmp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setFile(f); setResult(null); setError(''); }
                  }}
                />
                <div
                  className="upload-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-white/30 group mb-6 aspect-[4/3]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-[#0050cb]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-4xl text-[#0050cb]/40 group-hover:text-[#0050cb] transition-colors">face</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">{t('liveness.select_portrait')}</p>
                      <p className="text-[11px] text-slate-400 mt-1">JPG, PNG, WEBP, BMP (Max 10MB)</p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] mb-4">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {!streamActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                      <span className="material-symbols-outlined text-[48px] text-slate-400">videocam_off</span>
                      <p className="text-xs mt-2">{t('liveness.webcam_off')}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!streamActive ? (
                    <button
                      onClick={startCamera}
                      className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">videocam</span> {t('liveness.btn_webcam_on')}
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">videocam_off</span> {t('liveness.btn_webcam_off')}
                    </button>
                  )}
                </div>
              </>
            )}

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t('liveness.threshold_label')}</label>
                <span className="text-xs font-bold text-[#0050cb]">{(threshold * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.005} value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#0050cb] cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {t('liveness.threshold_desc').replace('{val}', (threshold * 100).toFixed(1))}
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4 mt-4 border border-red-200">{error}</p>
            )}

            <button
              onClick={runCheck}
              disabled={running || !canRun}
              className="w-full mt-6 py-4 bg-[#0050cb] text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-[#0050cb]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {running ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('liveness.checking')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">verified_user</span>
                  {source === 'upload' ? t('liveness.btn_check') : t('liveness.btn_capture_check')}
                </>
              )}
            </button>
          </section>
        </div>

        {/* RIGHT: Result */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-3xl p-8 shadow-md relative overflow-hidden">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">{t('liveness.result_title')}</h3>

            {!result && !running && (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[64px] text-slate-200">face_retouching_natural</span>
                <p className="text-sm text-slate-400 mt-4">{t('liveness.empty_hint')}</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Verdict header */}
                <div className="flex items-baseline gap-4">
                  <span className="text-7xl font-black tracking-tighter" style={{ color: verdictColor, textShadow: `0 0 20px ${verdictColor}44` }}>
                    {result.verdict}
                  </span>
                  <div>
                    <p className="text-2xl font-black text-slate-800 leading-none">{result.confidence.toFixed(1)}%</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Confidence</p>
                  </div>
                </div>

                {/* Spoof type alert */}
                {result.spoof_type && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-600">warning</span>
                    <div>
                      <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-1">{t('liveness.spoof_detected_alert')}</p>
                      <p className="text-sm font-bold text-red-900">{t(SPOOF_KEYS[result.spoof_type] ?? 'liveness.spoof_unknown')}</p>
                    </div>
                  </div>
                )}

                {/* Score bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-slate-400">Liveness Score</span>
                    <span style={{ color: verdictColor }}>{(result.liveness_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(result.liveness_score * 100, 100)}%`,
                        backgroundColor: verdictColor,
                        boxShadow: `0 0 12px ${verdictColor}66`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    {t('liveness.threshold_hint').replace('{val}', String(result.threshold_used))}
                  </p>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Mode</p>
                    <p className="text-xs font-bold text-slate-700 uppercase">{result.mode}</p>
                  </div>
                  {result.mode !== 'passive' && (
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Frames</p>
                      <p className="text-xs font-bold text-slate-700">{result.frame_count}</p>
                    </div>
                  )}
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Latency</p>
                    <p className="text-xs font-bold text-slate-700">{result.processing_time_ms}ms</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Model</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{result.model_version}</p>
                  </div>
                </div>

                <p className="text-[10px] font-mono text-slate-400 break-all">
                  check_id: {result.check_id}
                </p>
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="glass-panel rounded-2xl p-6 border-l-4 border-[#0050cb] shadow-sm">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('liveness.faq_title')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('liveness.faq_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
