'use client';

import { useState } from 'react';

export default function DetailPage() {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [noteText, setNoteText] = useState('');

  return (
    <div className="space-y-8">
      {/* Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: IMAGES & HEATMAP */}
        <div className="lg:col-span-5 space-y-6">
          <section className="glass-panel rounded-3xl p-6 shadow-sm border border-white relative">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              Forensic Visualizer
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">Original: 720p</span>
            </h3>

            <div className="relative rounded-2xl overflow-hidden aspect-square bg-black shadow-inner group">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6Xh2fYZG4IUwmUpI4pT5YJRx9D1v6chYCGcPepIK_rp1mQZ55fCj04pmjn_johA0YSCzjObWAkfpkdkXmel_hccliR6celubPESRvMQp2z6Hev3dwd9oRrMKrhLN_VyfJrm-DNaqjzejarANOI50Iq3sGPNUEucFjaQBASrdqbi0MtXiuKzP7pX1COdwO7lwdNhCzQHCNx9kCZ0iO7DUtA_kfIWQqafQlrdO3IwTy2dlftU5dDm9jvMYTVereT_gpbO-gUzS5xLb7"
                alt="Phân tích chi tiết"
              />
              {/* Heatmap Overlay */}
              {showHeatmap && (
                <div className="absolute inset-0 heatmap-overlay" />
              )}
            </div>

            {/* Controls */}
            <div className="mt-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#0050cb]">layers</span>
                  <div>
                    <p className="text-xs font-bold text-slate-700">DCT Heatmap Overlay</p>
                    <p className="text-[10px] text-slate-400">Hiển thị vùng artifact tần số nghi vấn</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0050cb]"></div>
                </label>
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Artifact Intensity:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-blue-500 font-bold uppercase">Cold</span>
                  <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-500 via-orange-400 to-red-600" />
                  <span className="text-[9px] text-red-600 font-bold uppercase">Hot</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: VERDICT & SCORES */}
        <div className="lg:col-span-7 space-y-6">
          <section className="glass-panel rounded-3xl p-8 shadow-sm border border-white">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagnostic Verdict</h3>
                <div className="flex items-center gap-4">
                  <span className="text-6xl font-black text-[#ba1a1a] tracking-tighter text-glow-red">FAKE</span>
                  <div className="h-12 w-[1px] bg-slate-200" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-slate-800 leading-none">87.3%</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Confidence</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm">
                  <span className="material-symbols-outlined">flag</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                  <span className="material-symbols-outlined">verified</span>
                </button>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-6 mb-8">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Explainable AI - Score Breakdown</p>

              {/* Spatial Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-600">Spatial Feature Score (CNN)</span>
                  <span className="font-mono text-[#0050cb] font-bold">0.91</span>
                </div>
                <div className="score-bar">
                  <div className="score-fill bg-[#0050cb] w-[91%]" style={{ boxShadow: '0 0 10px rgba(0, 80, 203, 0.3)' }} />
                </div>
              </div>

              {/* Frequency Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-600">Frequency Artifact Score (DCT)</span>
                  <span className="font-mono text-orange-500 font-bold">0.83</span>
                </div>
                <div className="score-bar">
                  <div className="score-fill bg-orange-500 w-[83%]" style={{ boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)' }} />
                </div>
              </div>

              {/* Combined */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-600">Final Combined Score</span>
                  <span className="font-mono text-[#ba1a1a] font-bold">0.87</span>
                </div>
                <div className="score-bar">
                  <div className="score-fill bg-[#ba1a1a] w-[87%]" style={{ boxShadow: '0 0 10px rgba(186, 26, 26, 0.3)' }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-t border-slate-100">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Threshold Used</p>
                <p className="text-sm font-bold text-slate-700">0.6197</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Processing Latency</p>
                <p className="text-sm font-bold text-slate-700">142ms</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* METADATA & NOTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Metadata */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-8 shadow-sm border border-white">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Request Metadata</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Tenant Owner</p>
              <p className="text-xs font-bold text-slate-700">VietBank Demo Environment</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">API Key Prefix</p>
              <p className="text-xs font-mono font-bold text-slate-700">sk_vbk_8af3...</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Model Version</p>
              <p className="text-xs font-bold text-slate-700">b4-baseline-v1.0.2</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Created Timestamp</p>
              <p className="text-xs font-bold text-slate-700">2025-05-24 14:32:18 UTC+7</p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Image SHA-256 Hash</p>
              <p className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 p-2 rounded-lg mt-1 break-all">7a8f3e2d1c0b9a87f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a2</p>
            </div>
          </div>
        </div>

        {/* Audit Notes */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-8 shadow-sm border border-white flex flex-col">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Audit &amp; Review Notes</h3>
          <textarea
            maxLength={500}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Ghi chú kết quả review tại đây (VD: Ảnh có dấu hiệu face-swap quanh vùng mắt)..."
            className="flex-1 w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-[#0050cb] focus:border-[#0050cb] transition-all resize-none custom-scrollbar min-h-[120px]"
          />
          <div className="mt-4 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">{noteText.length} / 500 ký tự</span>
            <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">Lưu ghi chú</button>
          </div>
        </div>
      </div>

      {/* Related Events */}
      <section className="mt-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Sự kiện liên quan (Cùng API Key trong 24h)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-white flex items-center gap-4 hover:scale-[1.02] transition-all cursor-pointer shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-black text-[10px]">FAKE</div>
            <div className="flex-1">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">req_23c...8f1</p>
              <p className="text-xs font-bold text-slate-700">Confidence: 91.2%</p>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white flex items-center gap-4 hover:scale-[1.02] transition-all cursor-pointer shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-[10px]">REAL</div>
            <div className="flex-1">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">req_92a...x4z</p>
              <p className="text-xs font-bold text-slate-700">Confidence: 96.5%</p>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white flex items-center gap-4 hover:scale-[1.02] transition-all cursor-pointer shadow-sm opacity-60">
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px]">UNC</div>
            <div className="flex-1">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">req_0b1...2m7</p>
              <p className="text-xs font-bold text-slate-700">Confidence: 51.0%</p>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </div>
        </div>
      </section>
    </div>
  );
}
