'use client';

import { useNavigation } from '@/store/navigation';

/* ──────────────────────────────────────────────
   Code highlighter (reuse playground pattern)
   ────────────────────────────────────────────── */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightPython(code: string): string {
  type Token = { type: string; value: string };
  const tokens: Token[] = [];

  const patterns: [RegExp, string][] = [
    [/^(\s*#.*)$/gm, 'comment'],
    [/\b(import|from|as|print|open|True|False|None)\b/g, 'keyword1'],
    [/\b(def|class|return|if|else|elif|for|in|while|with|try|except|finally|raise|pass|break|continue|lambda|yield|global|nonlocal|assert|del|not|and|or|is)\b/g, 'keyword2'],
    [/\b(\d+\.?\d*)\b/g, 'number'],
  ];

  const stringRe = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  const stringRanges: [number, number][] = [];
  let m: RegExpExecArray | null;
  while ((m = stringRe.exec(code)) !== null) {
    stringRanges.push([m.index, m.index + m[0].length]);
  }

  const charClass: (string | null)[] = new Array(code.length).fill(null);
  for (const [start, end] of stringRanges) {
    for (let i = start; i < end; i++) charClass[i] = 'string';
  }
  for (const [re, cls] of patterns) {
    re.lastIndex = 0;
    while ((m = re.exec(code)) !== null) {
      if (charClass.slice(m.index, m.index + m[0].length).every(c => c === null)) {
        for (let i = m.index; i < m.index + m[0].length; i++) charClass[i] = cls;
      }
    }
  }

  let result = '';
  let i = 0;
  while (i < code.length) {
    const cls = charClass[i];
    if (cls) {
      let j = i;
      while (j < code.length && charClass[j] === cls) j++;
      const text = code.slice(i, j);
      const color =
        cls === 'string' ? 'text-orange-300'
          : cls === 'keyword1' ? 'text-emerald-400'
          : cls === 'keyword2' ? 'text-purple-400'
          : cls === 'number' ? 'text-indigo-300'
          : cls === 'comment' ? 'text-slate-500'
          : '';
      result += `<span class="${color}">${escapeHtml(text)}</span>`;
      i = j;
    } else {
      result += escapeHtml(code[i]);
      i++;
    }
  }
  return result;
}

/* ──────────────────────────────────────────────
   PYTHON CODE SAMPLE
   ────────────────────────────────────────────── */
const PYTHON_CODE = `import requests

response = requests.post(
    "https://api.deepguard.io/v1/detect/image",
    headers={"X-API-Key": "YOUR_API_KEY"},
    files={"image": open("face.jpg", "rb")},
    params={"include_heatmap": True, "threshold": 0.6197}
)
result = response.json()
print(f"Verdict: {result['verdict']}")
print(f"Confidence: {result['confidence']}%")`;

/* ──────────────────────────────────────────────
   LANDING PAGE
   ────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigation((s) => s.navigate);

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-[#F0F9FF] text-[#0b1c30] font-sans">
      {/* ── Background Blobs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-blob bg-blue-200 w-[700px] h-[700px] -top-[250px] -right-[150px]" />
        <div className="bg-blob bg-indigo-100 w-[550px] h-[550px] -bottom-[150px] -left-[120px]" />
        <div className="bg-blob bg-cyan-100 w-[400px] h-[400px] top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* ══════════════════════════════════════
          1. NAVBAR
          ══════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0050cb] flex items-center justify-center text-white shadow-lg shadow-[#0050cb]/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-[#0050cb] italic">DeepGuard</span>
          </button>

          {/* Right buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('docs')}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#0050cb] transition-colors px-3 py-2 rounded-xl hover:bg-white/50"
            >
              <span className="material-symbols-outlined text-[18px]">local_offer</span>
              Pricing
            </button>
            <button
              onClick={() => navigate('docs')}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#0050cb] transition-colors px-3 py-2 rounded-xl hover:bg-white/50"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              Docs
            </button>
            <button
              onClick={() => navigate('login')}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#0050cb] px-5 py-2 rounded-xl shadow-lg shadow-[#0050cb]/20 hover:bg-[#0045b3] hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Đăng nhập
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          2. HERO SECTION
          ══════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-20 pb-16 px-4">
        {/* Floating decorative icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[18%] left-[8%] animate-float opacity-15">
            <span className="material-symbols-outlined text-[56px] text-blue-400">fingerprint</span>
          </div>
          <div className="absolute top-[28%] right-[10%] animate-float opacity-10" style={{ animationDelay: '1s' }}>
            <span className="material-symbols-outlined text-[48px] text-indigo-400">shield</span>
          </div>
          <div className="absolute bottom-[22%] left-[12%] animate-float opacity-10" style={{ animationDelay: '2s' }}>
            <span className="material-symbols-outlined text-[44px] text-cyan-400">visibility</span>
          </div>
          <div className="absolute bottom-[30%] right-[7%] animate-float opacity-10" style={{ animationDelay: '0.5s' }}>
            <span className="material-symbols-outlined text-[52px] text-blue-300">lock</span>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0050cb]/10 border border-[#0050cb]/20 text-[#0050cb] text-xs font-bold mb-8">
            <span className="w-2 h-2 bg-[#2e7d32] rounded-full animate-pulse" />
            v2.1 — Mô hình sẵn sàng vận hành
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-slate-900 mb-6">
            Phát hiện Deepfake
            <br />
            <span className="text-[#0050cb]">cho eKYC</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            API bảo mật sinh trắc học cho ngân hàng và fintech Việt Nam.
            Tích hợp 1 dòng code — bảo vệ hàng triệu giao dịch.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('login')}
              className="w-full sm:w-auto px-8 py-4 bg-[#0050cb] text-white rounded-2xl font-black text-sm tracking-wider shadow-xl shadow-[#0050cb]/25 hover:bg-[#0045b3] hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              Dùng thử miễn phí
            </button>
            <button
              onClick={() => navigate('docs')}
              className="w-full sm:w-auto px-8 py-4 bg-white/70 backdrop-blur text-slate-700 border border-slate-200 rounded-2xl font-bold text-sm tracking-wider shadow-md hover:bg-white hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-[20px] text-[#0050cb]">code</span>
              Xem API Docs
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3. STATS BAR
          ══════════════════════════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 -mt-4 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { value: 'AUC 0.91', label: 'Độ chính xác mô hình', icon: 'analytics', color: '#0050cb' },
            { value: 'Latency <150ms', label: 'Thời gian phản hồi', icon: 'speed', color: '#2e7d32' },
            { value: 'FPR ≤5%', label: 'False Positive Rate', icon: 'verified_user', color: '#ed6c02' },
          ].map((stat) => (
            <div
              key={stat.value}
              className="glass-panel rounded-2xl p-6 shadow-md border border-white/60 text-center hover:scale-[1.03] transition-transform cursor-default"
            >
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${stat.color}10` }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          4. FEATURE CARDS
          ══════════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3">Tại sao chọn DeepGuard?</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Ba trụ cột công nghệ làm nên sự khác biệt cho giải pháp eKYC của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: 'api',
              title: 'Detection API',
              description: 'Phát hiện deepfake 1 API call — trả về verdict, confidence và metadata trong cùng một response.',
              color: '#0050cb',
            },
            {
              icon: 'local_fire_department',
              title: 'DCT Heatmap',
              description: 'Explainable AI — biết model nhìn vào đâu. Visualise vùng anomalous qua DCT frequency map.',
              color: '#ed6c02',
            },
            {
              icon: 'shield',
              title: 'eKYC Ready',
              description: 'Threshold calibrated cho FPR≤5% — tối ưu cho luồng onboarding ngân hàng, giảm thiểu friction.',
              color: '#2e7d32',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass-panel rounded-2xl p-8 shadow-md border border-white/60 hover:scale-[1.03] hover:shadow-xl transition-all group cursor-default"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${feature.color}10` }}
              >
                <span className="material-symbols-outlined text-[28px]" style={{ color: feature.color }}>{feature.icon}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. HOW IT WORKS
          ══════════════════════════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3">Cách hoạt động</h2>
          <p className="text-slate-500">Tích hợp chỉ 3 bước đơn giản.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[33%] w-[34%] h-[2px] bg-gradient-to-r from-[#0050cb]/30 via-[#0050cb]/15 to-[#0050cb]/30" />
          <div className="hidden md:block absolute top-12 left-[66%] w-[34%] h-[2px] bg-gradient-to-r from-[#0050cb]/30 via-[#0050cb]/15 to-[#0050cb]/30" />

          {[
            {
              step: 1,
              icon: 'upload_file',
              title: 'Upload ảnh',
              description: 'Gửi ảnh chân dung qua REST API — hỗ trợ JPG, PNG, WebP.',
              color: '#0050cb',
            },
            {
              step: 2,
              icon: 'psychology',
              title: 'AI phân tích',
              description: 'EfficientNet-B4 + DCT Stream chẩn đoán trong <150ms.',
              color: '#ed6c02',
            },
            {
              step: 3,
              icon: 'verified',
              title: 'Nhận verdict',
              description: 'REAL / FAKE + confidence score + heatmap (tuỳ chọn).',
              color: '#2e7d32',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="glass-panel rounded-2xl p-8 shadow-md border border-white/60 text-center hover:scale-[1.03] transition-all relative"
            >
              {/* Step number */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 text-white font-black text-lg shadow-lg"
                style={{ backgroundColor: item.color, boxShadow: `0 8px 20px ${item.color}30` }}
              >
                {item.step}
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${item.color}10` }}
              >
                <span className="material-symbols-outlined text-[28px]" style={{ color: item.color }}>{item.icon}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>

              {/* Arrow between steps (mobile) */}
              {item.step < 3 && (
                <div className="md:hidden flex justify-center my-2">
                  <span className="material-symbols-outlined text-[#0050cb]/40 text-[28px]">arrow_downward</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          6. CODE EXAMPLE
          ══════════════════════════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3">Tích hợp trong 30 giây</h2>
          <p className="text-slate-500">Chỉ cần API key — không cần SDK, không cần on-prem model.</p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-800">
          {/* Tab bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-slate-800/80 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-bold text-slate-400 ml-2">main.py</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(PYTHON_CODE);
              }}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Copy
            </button>
          </div>

          {/* Code block */}
          <div className="p-6 bg-slate-900 text-[13px] font-mono leading-relaxed overflow-x-auto custom-scrollbar text-blue-100">
            <pre
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: highlightPython(PYTHON_CODE) }}
            />
          </div>
        </div>

        {/* Response preview */}
        <div className="mt-6 glass-panel rounded-2xl p-6 shadow-md border border-white/60">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-[#2e7d32]">check_circle</span>
            <span className="text-xs font-black text-[#2e7d32] uppercase tracking-wider">Response Sample</span>
          </div>
          <pre className="text-xs sm:text-sm font-mono text-slate-600 leading-relaxed overflow-x-auto">{`{
  "verdict": "FAKE",
  "confidence": 94.12,
  "latency_ms": 142,
  "heatmap_url": "https://api.deepguard.io/v1/heatmap/abc123.png"
}`}</pre>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7. PRICING
          ══════════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3">Bảng giá</h2>
          <p className="text-slate-500">Bắt đầu miễn phí — mở rộng khi sản phẩm scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter */}
          <div className="glass-panel rounded-2xl p-8 shadow-md border border-white/60 hover:scale-[1.03] transition-all flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900 mb-1">Starter</h3>
              <p className="text-sm text-slate-500">Dùng thử, tích hợp ban đầu</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-slate-900">Miễn phí</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                '100 requests / tháng',
                'Detection API',
                'Verdict + Confidence',
                'Email support',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-[#2e7d32] mt-0.5 shrink-0">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('login')}
              className="w-full py-3 rounded-xl border-2 border-[#0050cb] text-[#0050cb] font-bold text-sm hover:bg-[#0050cb] hover:text-white transition-all"
            >
              Bắt đầu miễn phí
            </button>
          </div>

          {/* Pro (highlighted) */}
          <div className="relative glass-panel rounded-2xl p-8 shadow-xl border-2 border-[#0050cb] hover:scale-[1.03] transition-all flex flex-col">
            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0050cb] text-white text-[10px] font-black tracking-widest rounded-full shadow-lg shadow-[#0050cb]/30 uppercase">
              Phổ biến nhất
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900 mb-1">Pro</h3>
              <p className="text-sm text-slate-500">Sản phẩm đang vận hành</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-slate-900">$99</span>
              <span className="text-sm text-slate-500 font-medium"> / tháng</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                '10,000 requests / tháng',
                'Detection API',
                'DCT Heatmap',
                'Priority support',
                'SLA 99.9%',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-[#2e7d32] mt-0.5 shrink-0">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('login')}
              className="w-full py-3 rounded-xl bg-[#0050cb] text-white font-bold text-sm shadow-lg shadow-[#0050cb]/20 hover:bg-[#0045b3] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Chọn Pro
            </button>
          </div>

          {/* Enterprise */}
          <div className="glass-panel rounded-2xl p-8 shadow-md border border-white/60 hover:scale-[1.03] transition-all flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900 mb-1">Enterprise</h3>
              <p className="text-sm text-slate-500">Ngân hàng & tổ chức lớn</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-slate-900">Custom</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Unlimited requests',
                'On-prem deployment',
                'Custom threshold tuning',
                'Dedicated account manager',
                'Audit log & compliance',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-[#2e7d32] mt-0.5 shrink-0">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('login')}
              className="w-full py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-sm hover:border-[#0050cb] hover:text-[#0050cb] transition-all"
            >
              Liên hệ sales
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          8. CTA BOTTOM
          ══════════════════════════════════════ */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 mb-24">
        <div className="glass-panel rounded-3xl p-10 sm:p-14 shadow-xl border border-white/60 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0050cb] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#0050cb]/25">
            <span className="material-symbols-outlined text-[32px] text-white">rocket_launch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
            Bắt đầu tích hợp ngay
          </h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto leading-relaxed">
            Đăng ký tài khoản miễn phí — nhận API key trong 30 giây.
            Không cần thẻ tín dụng.
          </p>
          <button
            onClick={() => navigate('login')}
            className="px-10 py-4 bg-[#0050cb] text-white rounded-2xl font-black text-sm tracking-wider shadow-xl shadow-[#0050cb]/25 hover:bg-[#0045b3] hover:scale-[1.03] active:scale-[0.98] transition-all inline-flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            Dùng thử miễn phí
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          9. FOOTER
          ══════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            © 2025 DeepGuard. Bảo mật bởi AI.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('docs'); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0050cb] transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">code</span>
              GitHub
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('docs'); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0050cb] transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              Docs
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('login'); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0050cb] transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
