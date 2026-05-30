'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import {
  detectLivenessPassive,
  detectLivenessActive,
  livenessGetChallenge,
  type LivenessResponse,
  type LivenessChallenge,
} from '@/lib/api';

const VERDICT_COLOR: Record<string, string> = {
  LIVE:      '#2e7d32',
  SPOOF:     '#ba1a1a',
  UNCERTAIN: '#ed6c02',
};

const SPOOF_LABEL: Record<string, string> = {
  print:    'Ảnh in giấy',
  screen:   'Phát lại qua màn hình',
  mask_3d:  'Mặt nạ 3D / silicone',
  deepfake: 'Video deepfake',
  unknown:  'Không xác định',
};

type Mode = 'passive' | 'active';

export default function LivenessPage() {
  const apiKey = useAuthStore((s) => s.apiKey);
  const [mode, setMode] = useState<Mode>('passive');

  // Passive state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active state — webcam
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [challenge, setChallenge] = useState<LivenessChallenge | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>('');

  // Result
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<LivenessResponse | null>(null);
  const [error, setError] = useState('');

  // Preview URL lifecycle
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

  // Capture single frame from webcam
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

  // Passive: upload single image
  const runPassive = async () => {
    if (!apiKey) { setError('Chưa có API Key. Vào API Keys → tạo key'); return; }
    if (!file) { setError('Chưa chọn ảnh'); return; }
    setError(''); setResult(null); setRunning(true);
    try {
      const res = await detectLivenessPassive(file, apiKey);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Liveness check thất bại');
    } finally {
      setRunning(false);
    }
  };

  // Active: get challenge → countdown → capture 5 frames → submit
  const runActive = async () => {
    if (!apiKey) { setError('Chưa có API Key. Vào API Keys → tạo key'); return; }
    if (!streamActive) { setError('Hãy bật webcam trước'); return; }
    setError(''); setResult(null); setRunning(true);

    try {
      const ch = await livenessGetChallenge(apiKey);
      setChallenge(ch);
      setActiveStatus(`Chuẩn bị: ${ch.instructions}`);

      // 3-second prep countdown
      for (let s = 3; s > 0; s--) {
        setCountdown(s);
        await new Promise((r) => setTimeout(r, 1000));
      }
      setCountdown(null);
      setActiveStatus('Thực hiện hành động...');

      // Capture 5 frames over ~2 seconds
      const frames: File[] = [];
      for (let i = 0; i < 5; i++) {
        const f = await captureFrame();
        if (f) frames.push(f);
        await new Promise((r) => setTimeout(r, 400));
      }
      setActiveStatus('Đang phân tích...');

      // For demo we mark challenge_passed=true. A real client would run a small
      // on-device model (e.g. face landmark detection) to verify the gesture.
      const res = await detectLivenessActive(frames, ch.challenge_type, true, apiKey);
      setResult(res);
      setActiveStatus('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Active liveness thất bại');
      setActiveStatus('');
    } finally {
      setRunning(false);
      setChallenge(null);
    }
  };

  const verdictColor = result ? VERDICT_COLOR[result.verdict] ?? '#94a3b8' : '#94a3b8';

  return (
    <div className="space-y-8">
      {/* Mode selector */}
      <div className="glass-panel rounded-2xl p-4 shadow-sm border border-white flex items-center gap-4">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mode</span>
        <div className="flex gap-2">
          {(['passive', 'active'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); setError(''); if (m === 'passive') stopCamera(); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === m
                  ? 'bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m === 'passive' ? '01. Passive (1 ảnh)' : '02. Active (webcam + challenge)'}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 ml-auto italic">
          {mode === 'passive'
            ? 'Upload 1 ảnh chân dung → phân loại live/spoof'
            : 'Yêu cầu user thực hiện gesture → capture 5 frame → aggregate verdict'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Input */}
        <div className="lg:col-span-5 space-y-6">
          <section className="glass-panel rounded-2xl p-6 shadow-sm border border-white">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" />
              {mode === 'passive' ? '01. Media Input' : '01. Camera Feed'}
            </h3>

            {mode === 'passive' ? (
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
                      <p className="text-sm font-bold text-slate-700">Chọn ảnh chân dung</p>
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
                      <p className="text-xs mt-2">Webcam chưa bật</p>
                    </div>
                  )}

                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-9xl font-black text-white" style={{ textShadow: '0 0 30px rgba(0,80,203,0.8)' }}>
                        {countdown}
                      </span>
                    </div>
                  )}

                  {challenge && countdown === null && (
                    <div className="absolute top-0 left-0 right-0 bg-[#0050cb] text-white p-3 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest">Challenge</p>
                      <p className="text-sm font-black">{challenge.instructions}</p>
                    </div>
                  )}

                  {activeStatus && challenge === null && (
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 text-white p-3 text-center text-xs font-bold">
                      {activeStatus}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!streamActive ? (
                    <button
                      onClick={startCamera}
                      className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">videocam</span> Bật webcam
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">videocam_off</span> Tắt webcam
                    </button>
                  )}
                </div>
              </>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4 mt-4 border border-red-200">{error}</p>
            )}

            <button
              onClick={mode === 'passive' ? runPassive : runActive}
              disabled={running || (mode === 'passive' ? !file : !streamActive)}
              className="w-full mt-6 py-4 bg-[#0050cb] text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-[#0050cb]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {running ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  ĐANG KIỂM TRA...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                    {mode === 'passive' ? 'verified_user' : 'rocket_launch'}
                  </span>
                  {mode === 'passive' ? 'CHECK LIVENESS' : 'BẮT ĐẦU CHALLENGE'}
                </>
              )}
            </button>
          </section>
        </div>

        {/* RIGHT: Result */}
        <div className="lg:col-span-7 space-y-6">
          <div
            className="glass-panel rounded-3xl p-8 shadow-md relative overflow-hidden"
            style={{ borderTop: `4px solid ${verdictColor}` }}
          >
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Kết quả Liveness</h3>

            {!result && !running && (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[64px] text-slate-200">face_retouching_natural</span>
                <p className="text-sm text-slate-400 mt-4">Chọn ảnh hoặc bật webcam → nhấn nút để kiểm tra</p>
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
                      <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-1">Phát hiện Spoof Attack</p>
                      <p className="text-sm font-bold text-red-900">{SPOOF_LABEL[result.spoof_type] ?? result.spoof_type}</p>
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
                    Threshold: {result.threshold_used} · 1.0 = chắc chắn người thật, 0.0 = chắc chắn spoof
                  </p>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Mode</p>
                    <p className="text-xs font-bold text-slate-700 uppercase">{result.mode}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Frames</p>
                    <p className="text-xs font-bold text-slate-700">{result.frame_count}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Latency</p>
                    <p className="text-xs font-bold text-slate-700">{result.processing_time_ms}ms</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Model</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{result.model_version}</p>
                  </div>
                </div>

                {result.mode === 'active' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Challenge</p>
                      <p className="text-xs font-bold text-slate-700">{result.challenge_type ?? '—'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Passed</p>
                      <p className={`text-xs font-bold ${result.challenge_passed ? 'text-emerald-600' : 'text-red-600'}`}>
                        {result.challenge_passed ? 'YES' : 'NO'}
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-[10px] font-mono text-slate-400 break-all">
                  check_id: {result.check_id}
                </p>
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="glass-panel rounded-2xl p-6 border-l-4 border-[#0050cb] shadow-sm">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Liveness vs Deepfake Detection</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Liveness</strong> trả lời: <em>&quot;Camera có đang nhìn người thật không?&quot;</em> — chống ảnh in, replay màn hình, mặt nạ 3D.
              Khác với <strong>Deepfake Detection</strong> (Playground) trả lời: <em>&quot;Media này có bị AI sinh ra không?&quot;</em>
              Hai pipeline bổ sung cho nhau trong luồng KYC: liveness chặn presentation attack trước, deepfake check media được upload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
