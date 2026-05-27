'use client';

import { useState, useMemo, useRef } from 'react';
import { detectImage, type DetectionResponse } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

function highlightCode(code: string, language: string): string {
  // Tokenize first, then colorize — avoids overlapping regex on HTML attributes
  type Token = { type: string; value: string };
  const tokens: Token[] = [];

  if (language === 'python') {
    const patterns: [RegExp, string][] = [
      [/^(\s*#.*)$/gm, 'comment'],
      [/\b(import|from|as|print|open|True|False|None)\b/g, 'keyword1'],
      [/\b(def|class|return|if|else|elif|for|in|while|with|try|except|finally|raise|pass|break|continue|lambda|yield|global|nonlocal|assert|del|not|and|or|is)\b/g, 'keyword2'],
      [/\b(\d+\.?\d*)\b/g, 'number'],
    ];
    // Extract strings first (single & double quoted)
    const stringRe = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
    const stringRanges: [number, number][] = [];
    let m: RegExpExecArray | null;
    while ((m = stringRe.exec(code)) !== null) {
      stringRanges.push([m.index, m.index + m[0].length]);
    }

    // Build character classification map
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

    // Build output
    let result = '';
    let i = 0;
    while (i < code.length) {
      const cls = charClass[i];
      if (cls) {
        let j = i;
        while (j < code.length && charClass[j] === cls) j++;
        const text = code.slice(i, j);
        const color = cls === 'string' ? 'text-orange-300'
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

  if (language === 'curl') {
    const patterns: [RegExp, string][] = [
      [/\b(curl|POST|GET|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/g, 'keyword2'],
      [/(-[A-Z])\b/g, 'keyword1'],
      [/(\\)\s*$/gm, 'comment'],
    ];
    const stringRe = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
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
        const color = cls === 'string' ? 'text-orange-300'
          : cls === 'keyword1' ? 'text-emerald-400'
          : cls === 'keyword2' ? 'text-purple-400'
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

  if (language === 'js') {
    const patterns: [RegExp, string][] = [
      [/\b(const|let|var|await|async|function|return|new|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|typeof|instanceof|class|extends|import|from|export|default)\b/g, 'keyword2'],
      [/\b(console|fetch|FormData|append|log|json|response|document|window|Array|Object|Map|Set|Promise|Error|Math|Date|Number|String|Boolean|Symbol|RegExp)\b/g, 'keyword1'],
      [/\b(true|false|null|undefined|NaN|Infinity)\b/g, 'number'],
      [/^\s*(\/\/.*)$/gm, 'comment'],
    ];
    const stringRe = /(`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
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
        const color = cls === 'string' ? 'text-orange-300'
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

  return escapeHtml(code);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const highlighted = useMemo(() => highlightCode(code, language), [code, language]);

  return (
    <pre className="whitespace-pre-wrap leading-relaxed">
      <code dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  );
}

const FACE_IMAGES = [
  'AB6AXuAdyskTO_iZmH8_oKYMsW5vyZSM-fRAbpfADiFMBA_QLFpxo5H87f2mWroGqBMWvaDIvFkNN3aXF2hGIgVfWmRLICO7HQ3ijKnhCbvD9Z2R-EE_2sVxMo5BKAQJT5OPnXLB1QhRLZao_Wc1SIfK5ez8D0bvrTN1HO7PWQ5I7nS4C8Du9zoJ9Uiy19WfMwMB0Lys1T_c9qBoLnhFGvxyZ3Yjh2a5V1uoIX_An3rg8mDbBkyiY1EyNmW9HMjOLJHaTX-3rykIVgYBiSM8',
  'AB6AXuDN8F_p4Rz_SAxXqepDm-vDNMTAc6VFhRFPjQOof1dfXBtNWLMq_GhzH-kxRYDqEJk88Ie6P4XkJZ-qlazECGVtIjgMg8EZLyLprbiNgSiBSgKJdxXXmJ06B0S-TAY8KhJgba6mCup6ZaK3yYmGfm5uHAIHvsOE4EKAAx6t8Ou8NDFGF60E-EsA9Jnta-PqYOPljQQ3axLnfEVNebukih54qiqh525Ycz8xeKlmAFhOmvtn5JnYwxLV35fRMArVeR1PSoKhf1LDZU3l',
  'AB6AXuDWSyQctkQZYRytRgPftcDFqJcGHpkEu2qs_5DAEz2W4sV0QWgWfhESQnpf22yFaRhJ0kWk1sWfoHJdVLIm6ASFzE1EtzWiTTP5wnwFuO3CMHZBm4oXA9C-ahN8HzKziAQyljtsqg_eaLsImw6hI_3Clv49uBQnQQH5LkwXTFPqlgspoyRjMeiWMTTwkWw8aVEIwVCmCwbvnuLMwyrXkiYpmcLHq-iD-UWwqhh4bVol6Tzt5de_2vXbHYC2oTy1Q3zXlYcnzY9f_FJ7',
  'AB6AXuAvxOkHN83_Q9gDvXzlid68cUr9oWbui14eKFkafZrZEiWPV-3-OPdqUD2s1zOl8fK95R6mGiC2plvwyFp9zwBV-OXIS22942r7HexbmtAVzCKXD6JL_QUb5_ee0YLDyCt-z1zUMQqz6rrtMa37Wt-Syz1BhN2Y_vb94grjwHW3Q8SZQ_7GzODqSuKjWrw0nhX4NxiWiR9iz7a9hiS9LICGFJrY0D59slnGVH00GH7DBGlBrUOh8RF6IQD1P-O5IdKCvKvViRmDFsyg',
  'AB6AXuCTtF3n6WHYAKwBPLumwdUlIPv88CwIBcgyFVSa2r9IgoDdR2QHEZcFr-Wavcj7C4h2lyIJ1ddyU4l4sZk1UrYmRiZFfFyVryPSbCVNpabIAbt0LF2kPW60eXPqDkF5RTgMXJrbQwe1Aqw0VuRPLKB_KdNNBr1VmfHBPBlN1m01gnt-6d9Bl4UOGNwOT9K3DOeNS6U1Hmjwr78fz-XJE9D5XxhZSSbJpVMn5qWaS60xhRl4QvAiLV0dc1lkH7Efxvi3uJEMQt_Mfn7N',
  'AB6AXuDUujfp-z1vSGKaz6f4PAALsUB_ibwkGyQf-kOqgJ6QmWLq7rBVdl7Ib42q4BddwUAsbqxisOidc0icte0BgTlTFNOxeFXW_rTciNR1Te__1CeXoEAGfx04Xq3UpP-7D3Nwjd4sIEs3YG2hBXvEOTxW6MNo3BKpCNwjUnI7X0TyRVQhjGVLhKN-fIniTDxu8TPSyy7hGZ73gnTlXWmR48cegh3LOgf82IT9X1iuEuY6lBo9NfwX5Xn5yvPET3DZWKomEJDtM_xgGr4J',
  'AB6AXuDAW_9gxZBs9OrMYbOer0XQJvxQwlUTptGycuP7cYHCReE5kDNmaO86_WwHC_b8Oh0ytanH-sO5pR9DJRxeMktkBlOvJgLrfQcHyKbuQJKH3OktTVdX77Cb9_XtOyMVjaSEJLPpXFsf6JZn8W7KmLzmYLgwNgi1QB6SAd7CNU-DaH1tej_r7yLCxaR4_4IrUWVTjTaWxDEpK2z650cpCpdI8TqGmGEN1f6VmFFFfpL6FEUqYvKelEWZczn5sQaxgRgHyEcJZ4UUo-gs',
  'AB6AXuCsloJFVYL11zuxeKgMjagQlzgG4_JoVmwLsAUdY-DvHGEw-iMyiXlP0Mry-Oa7AGvUTAD8P5NgCdnGhTatNnG6GHR-DEaTW8SDePh5hHPsSTHhZQEkqXrTMK7kCCLXnpMmcilKAphEwx-D-AcXGV7nytw2UkoC7Fo6HKpaZYkS6qyclOFo9PwoxAoF5K8TuPkFU7wD0AJGa5-FQCyrxiRf4GSNUoxxEqS7Xl--OJ8ooX1plMn6rnfSgRqhumT3RmbqOUo9s0QOPMk-',
];

const FACE_SCORES = [98, 87, 91, 76, 94, 82, 89, 95];

export default function PlaygroundPage() {
  const apiKey = useAuthStore((s) => s.apiKey);
  const [threshold, setThreshold] = useState(0.35);
  const [includeHeatmap, setIncludeHeatmap] = useState(true);
  const [codeTab, setCodeTab] = useState<'python' | 'curl' | 'js'>('python');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!selectedFile) { setError('Vui lòng chọn ảnh trước'); return; }
    if (!apiKey) { setError('Chưa có API Key. Vào API Keys → tạo key → key sẽ tự lưu'); return; }
    setError('');
    setIsAnalyzing(true);
    try {
      const res = await detectImage(selectedFile, apiKey, threshold);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Detect thất bại');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pythonCode = `import requests

url = "https://api.deepguard.io/v1/detect/image"
headers = {'x-api-key': 'demo-key-vietbank-2024'}
payload = {'threshold': ${threshold.toFixed(4)}, 'include_heatmap': ${includeHeatmap}}
files = [('image', open('target_media.mp4','rb'))]

response = requests.post(url, headers=headers, data=payload, files=files)
print(response.json())`;

  const curlCode = `curl -X POST "https://api.deepguard.io/v1/detect/image" \\
  -H "x-api-key: demo-key-vietbank-2024" \\
  -F "threshold=${threshold.toFixed(4)}" \\
  -F "include_heatmap=${includeHeatmap}" \\
  -F "image=@target_media.mp4"`;

  const jsCode = `const formData = new FormData();
formData.append('threshold', '${threshold.toFixed(4)}');
formData.append('include_heatmap', '${includeHeatmap}');
formData.append('image', fileInput.files[0]);

const response = await fetch('https://api.deepguard.io/v1/detect/image', {
  method: 'POST',
  headers: { 'x-api-key': 'demo-key-vietbank-2024' },
  body: formData
});
const data = await response.json();
console.log(data);`;

  const getCodeContent = () => {
    switch (codeTab) {
      case 'python': return pythonCode;
      case 'curl': return curlCode;
      case 'js': return jsCode;
    }
  };

  const getCodeLanguage = () => {
    switch (codeTab) {
      case 'python': return 'python';
      case 'curl': return 'curl';
      case 'js': return 'js';
    }
  };

  return (
    <>
      {/* TOP GRID: Input + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: INPUT & CONFIG */}
        <div className="lg:col-span-4 space-y-6">
          <section className="glass-panel rounded-2xl p-6 shadow-sm border border-white">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" /> 01. Media Input
            </h3>

            {/* Upload Zone */}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/bmp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }} />
            <div
              className="upload-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-white/30 group mb-6"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full bg-[#0050cb]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl text-[#0050cb]/40 group-hover:text-[#0050cb] transition-colors">upload_file</span>
              </div>
              {selectedFile ? (
                <p className="text-sm font-bold text-[#0050cb]">{selectedFile.name}</p>
              ) : (
                <p className="text-sm font-bold text-slate-700">Kéo tệp vào đây hoặc click chọn</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ JPG, PNG, WEBP, BMP (Max 10MB)</p>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4 border border-red-200">{error}</p>}

            {/* Sample Buttons */}
            <div className="space-y-3 mb-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sample Presets</p>
              <div className="grid grid-cols-3 gap-2">
                <button className="py-2 text-[10px] font-bold bg-white border border-slate-200 rounded-lg hover:border-[#0050cb] hover:text-[#0050cb] transition-all">ẢNH THẬT</button>
                <button className="py-2 text-[10px] font-bold bg-white border border-slate-200 rounded-lg hover:border-[#0050cb] hover:text-[#0050cb] transition-all">GAN FAKE</button>
                <button className="py-2 text-[10px] font-bold bg-white border border-slate-200 rounded-lg hover:border-[#0050cb] hover:text-[#0050cb] transition-all">SWAP FAKE</button>
              </div>
            </div>

            <hr className="border-slate-100 mb-6" />

            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" /> 02. Parameters
            </h3>

            {/* Threshold Slider */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600">Threshold</label>
                <span className="text-xs font-mono font-bold text-[#0050cb] bg-[#0050cb]/5 px-2 py-0.5 rounded border border-[#0050cb]/10">{threshold.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.0001"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0050cb]"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3 mb-8">
              <label className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white cursor-pointer hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#0050cb]">analytics</span>
                  <span className="text-xs font-bold text-slate-700">Include DCT Heatmap</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeHeatmap}
                  onChange={(e) => setIncludeHeatmap(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0050cb] focus:ring-[#0050cb] accent-[#0050cb]"
                />
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-4 bg-[#0050cb] text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-[#0050cb]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  ĐANG PHÂN TÍCH...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">rocket_launch</span>
                  PHÂN TÍCH LIVE
                </>
              )}
            </button>
          </section>
        </div>

        {/* RIGHT: ANALYSIS RESULTS */}
        <div className="lg:col-span-8 space-y-6">
          {/* Final Verdict Card */}
          {(() => {
            const v = result?.verdict ?? 'FAKE';
            const verdictColor = v === 'FAKE' ? '#ba1a1a' : v === 'REAL' ? '#2e7d32' : '#ed6c02';
            const conf = result ? result.confidence.toFixed(1) : '94.1';
            const probFake = result ? (result.prob_fake * 100).toFixed(1) : '94.12';
            return (
              <div className="glass-panel rounded-2xl p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row gap-8 items-center" style={{ borderTop: `4px solid ${verdictColor}` }}>
                {/* Status Badge */}
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                  {result && (
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-bold">{result.processing_time_ms}ms</span>
                  )}
                </div>

                {/* Preview */}
                <div className="relative w-full max-w-[340px] aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-2xl group shrink-0 flex items-center justify-center">
                  {selectedFile ? (
                    <img
                      className="w-full h-full object-cover"
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[80px] text-slate-300">image</span>
                  )}
                  {result && <div className="scan-line" />}
                </div>

                {/* Analysis Score */}
                <div className="flex-1 space-y-6 min-w-0">
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Kết quả chẩn đoán</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black tracking-tighter" style={{ color: verdictColor }}>
                        {result ? result.verdict : '—'}
                      </span>
                      {result && <span className="text-xl font-bold text-slate-400">/ {conf}%</span>}
                    </div>
                    {result && (
                      <p className="text-xs text-slate-500 mt-2">
                        Face detected: {result.face_detected ? 'Yes' : 'No'} · Model: {result.model_version}
                      </p>
                    )}
                    {!result && !isAnalyzing && (
                      <p className="text-xs text-slate-400 mt-2">Chọn ảnh và bấm Phân Tích để xem kết quả</p>
                    )}
                  </div>

                  {result && (
                    <div className="space-y-4">
                      {[
                        { label: 'Prob Fake (combined)', value: parseFloat(probFake), color: verdictColor },
                        { label: 'CNN Score', value: result.prob_cnn * 100, color: '#0050cb' },
                        { label: 'Spatial Score', value: (result.spatial_score ?? 0) * 100, color: '#ed6c02' },
                      ].map((bar) => (
                        <div key={bar.label} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span className="text-slate-400">{bar.label}</span>
                            <span style={{ color: bar.color }}>{bar.value.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(bar.value, 100)}%`, backgroundColor: bar.color }} />
                          </div>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Latency</p>
                          <p className="text-sm font-bold text-slate-700">{result.processing_time_ms}ms</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Threshold</p>
                          <p className="text-sm font-bold text-slate-700">{result.threshold_used}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Face Tiles Grid */}
          <section className="glass-panel rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#0050cb] rounded-full" /> 03. Face Extraction (Lưới 16 khung hình)
              </h3>
              <button className="text-[10px] font-bold text-[#0050cb] hover:underline">Xem tất cả</button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {FACE_IMAGES.map((img, i) => (
                <div
                  key={i}
                  className="group relative rounded-xl overflow-hidden aspect-square border border-slate-100 bg-slate-50 hover:border-[#ba1a1a] transition-all cursor-crosshair"
                >
                  <img
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    src={`https://lh3.googleusercontent.com/aida-public/${img}`}
                    alt={`Frame ${i + 1}`}
                  />
                  <div className="absolute inset-0 bg-[#ba1a1a]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[8px] text-white font-black italic">{FACE_SCORES[i]}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* BOTTOM SECTION: CODE & TECHNICAL SPECS — Separate grid like original HTML */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Technical Details */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 shadow-sm border-l-4 border-[#0050cb]">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Technical Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-[#0050cb] text-[28px]">memory</span>
              <div>
                <p className="text-xs font-bold text-slate-800">Architecture: EfficientNet-B4</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Spatial-Frequency Dual Stream Network.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-[#0050cb] text-[28px]">hub</span>
              <div>
                <p className="text-xs font-bold text-slate-800">Processing Engine: DeepDetect v2.1</p>
                <p className="text-[10px] text-slate-500">Optimized for VietBank Cloud Inference.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Snippet with Syntax Highlighting */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden shadow-sm flex flex-col bg-slate-900">
          <div className="flex items-center justify-between px-6 py-3 bg-slate-800/50 border-b border-slate-700">
            <div className="flex gap-6">
              {(['python', 'curl', 'js'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCodeTab(tab)}
                  className={`text-[11px] font-bold pb-1 transition-colors ${
                    codeTab === tab
                      ? 'text-white border-b-2 border-[#0050cb]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'python' ? 'PYTHON' : tab === 'curl' ? 'cURL' : 'JS FETCH'}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Đã sao chép!' : 'Copy Code'}
            </button>
          </div>
          <div className="p-6 text-[12px] font-mono leading-relaxed overflow-x-auto text-blue-100 custom-scrollbar">
            <CodeBlock code={getCodeContent()} language={getCodeLanguage()} />
          </div>
        </div>
      </div>
    </>
  );
}
