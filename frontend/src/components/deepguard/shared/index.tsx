'use client';

/**
 * DeepGuard shared UI primitives — ported to TSX from the frontend-claude
 * prototype's components.jsx (window globals → ES exports). Light mode only.
 */
import React, { useState, useEffect, useRef, useMemo, type CSSProperties, type ReactNode } from 'react';
import { DG, verdictStyle, fmtInt, niceStep } from '@/lib/dg';

/* ── Material icon wrapper ── */
export function Icon({
  name,
  className = '',
  style,
  fill,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
  fill?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ ...(fill ? { fontVariationSettings: `'FILL' 1, 'wght' 500` } : {}), ...style }}
    >
      {name}
    </span>
  );
}

/* ── Verdict badge ── */
export function VerdictBadge({ verdict, size = 'sm' }: { verdict: string; size?: 'sm' | 'lg' }) {
  const s = verdictStyle(verdict);
  const pad = size === 'lg' ? 'px-3 py-1 text-[11px]' : 'px-2.5 py-0.5 text-[10px]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-black tracking-wider border ${pad}`}
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {verdict}
    </span>
  );
}

/* ── Count-up hook + animated number ── */
export function useCountUp(target: number, deps: React.DependencyList = [], dur = 700): number {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    const to = target;
    prev.current = target;
    if (from === to) {
      setVal(to);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
     
  }, deps);
  return val;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const v = useCountUp(value, [value]);
  return (
    <span className="tabular-nums">
      {prefix}
      {v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/* ── Sparkline ── */
export function Sparkline({
  data,
  color = DG.primary,
  w = 80,
  h = 28,
  fill = true,
}: {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - 3 - ((v - min) / range) * (h - 6)] as [number, number]);
  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `${pts[0][0]},${h} ${line} ${pts[pts.length - 1][0]},${h}`;
  const gid = useMemo(() => 'spk' + Math.random().toString(36).slice(2, 7), []);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <polygon points={area} fill={`url(#${gid})`} />}
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
}

/* ── Donut chart ── */
export interface DonutSegment {
  value: number;
  color: string;
}
export function Donut({
  segments,
  size = 132,
  stroke = 16,
  children,
}: {
  segments: DonutSegment[];
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  // precompute cumulative offsets (avoid reassigning a var during the render map)
  const arcs: { color: string; len: number; offset: number }[] = [];
  let acc = 0;
  for (const seg of segments) {
    const len = (seg.value / total) * c;
    arcs.push({ color: seg.color, len, offset: acc });
    acc += len;
  }
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(a.len - 3, 0)} ${c}`}
            strokeDashoffset={-a.offset}
            style={{ transition: 'stroke-dasharray .9s cubic-bezier(.22,1,.36,1), stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)' }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/* ── Circular confidence gauge ── */
export function Gauge({ value, color, size = 120, label = 'Confidence' }: { value: number; color: string; size?: number; label?: string }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const v = useCountUp(value, [value]);
  const off = c - (v / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={7} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset .2s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black tabular-nums" style={{ color }}>
          {v.toFixed(0)}%
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

/* ── Score bar (animated) ── */
export function ScoreBar({ label, value, raw, color }: { label: string; value: number; raw?: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(Math.min(value, 100)), 100);
    return () => clearTimeout(id);
  }, [value]);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-slate-600">{label}</span>
        <span className="font-mono font-bold tabular-nums" style={{ color }}>
          {raw != null ? raw.toFixed(4) : `${value.toFixed(1)}%`}
        </span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${w}%`, background: color, boxShadow: `0 0 10px ${color}44`, transition: 'width 1s cubic-bezier(.22,1,.36,1)' }}
        />
      </div>
    </div>
  );
}

/* ── Stat pill ── */
export function StatPill({
  icon,
  label,
  value,
  color = DG.primary,
}: {
  icon: string;
  label: string;
  value: ReactNode;
  color?: string;
}) {
  return (
    <div className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/60">
      <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}14`, color }}>
        <Icon name={icon} className="text-[20px]" fill />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-black text-slate-800 tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  );
}

/* ── Segmented range toggle ── */
export interface ToggleOption {
  id: string;
  label: string;
}
export function RangeToggle({ value, onChange, options }: { value: string; onChange: (id: string) => void; options: ToggleOption[] }) {
  return (
    <div className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-slate-100/80 border border-white">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            value === o.id ? 'bg-white text-dgblue shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Interactive multi-series area/bar chart with hover crosshair + tooltip ── */
export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  on: boolean;
  values: number[];
}
export function InteractiveChart({
  axis,
  points = '',
  series,
  mode = 'area',
}: {
  axis: string[];
  points?: string;
  series: ChartSeries[];
  mode?: 'area' | 'bar';
}) {
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<SVGSVGElement>(null);
  const W = 720;
  const H = 300;
  const pad = { t: 16, r: 18, b: 34, l: 46 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const n = axis.length;

  const active = series.filter((s) => s.on);
  const allVals = active.flatMap((s) => s.values);
  const maxVal = Math.max(...allVals, 1);
  const yMax = Math.max(1, Math.ceil(maxVal / niceStep(maxVal)) * niceStep(maxVal));

  const xAt = (i: number) => pad.l + (n === 1 ? cw / 2 : (i * cw) / (n - 1));
  const yAt = (v: number) => pad.t + ch - (v / yMax) * ch;
  const ticks = 4;
  const yticks = Array.from({ length: ticks + 1 }, (_, i) => Math.round((yMax / ticks) * i));

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let idx = Math.round(((x - pad.l) / cw) * (n - 1));
    idx = Math.max(0, Math.min(n - 1, idx));
    setHover(idx);
  };

  return (
    <div className="relative">
      <svg
        ref={wrapRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto select-none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {active.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {yticks.map((tk, ti) => (
          <g key={`y${ti}`}>
            <line x1={pad.l} y1={yAt(tk)} x2={W - pad.r} y2={yAt(tk)} stroke="#e8eef5" strokeWidth="1" strokeDasharray={tk === 0 ? '0' : '4 5'} />
            <text x={pad.l - 10} y={yAt(tk) + 4} textAnchor="end" fontSize="10" fill="#94a3b8" className="tabular-nums">
              {tk >= 1000 ? (tk / 1000).toFixed(tk % 1000 ? 1 : 0) + 'k' : tk}
            </text>
          </g>
        ))}
        {axis.map((d, i) => (
          <text key={d + i} x={xAt(i)} y={H - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#94a3b8">
            {d}
          </text>
        ))}

        {active.map((s) => {
          const pts = s.values.map((v, i) => [xAt(i), yAt(v)] as [number, number]);
          const line = pts.map((p) => p.join(',')).join(' ');
          const area = `${pad.l},${pad.t + ch} ${line} ${xAt(n - 1)},${pad.t + ch}`;
          if (mode === 'bar') {
            const bw = Math.min(18, cw / n / active.length - 3);
            const gi = active.indexOf(s);
            return s.values.map((v, i) => (
              <rect
                key={s.key + i}
                x={xAt(i) - (active.length * bw) / 2 + gi * bw}
                y={yAt(v)}
                width={bw - 2}
                height={pad.t + ch - yAt(v)}
                rx="3"
                fill={s.color}
                opacity="0.88"
              />
            ));
          }
          return (
            <g key={s.key}>
              <polygon points={area} fill={`url(#grad-${s.key})`} />
              <polyline points={line} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={hover === i ? 5 : 3} fill={s.color} stroke="#fff" strokeWidth="2" style={{ transition: 'r .15s ease' }} />
              ))}
            </g>
          );
        })}

        {hover != null && (
          <line x1={xAt(hover)} y1={pad.t} x2={xAt(hover)} y2={pad.t + ch} stroke={DG.primary} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        )}
      </svg>

      {hover != null && (
        <div
          className="absolute pointer-events-none z-20 dg-fade"
          style={{
            left: `${(xAt(hover) / W) * 100}%`,
            top: 4,
            transform: `translateX(${hover > n / 2 ? 'calc(-100% - 10px)' : '10px'})`,
          }}
        >
          <div className="glass-panel rounded-xl shadow-lg px-3.5 py-2.5 border border-white min-w-[140px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              {points} · {axis[hover]}
            </p>
            <div className="space-y-1">
              {active.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <span className="text-[12px] font-black tabular-nums" style={{ color: s.color }}>
                    {fmtInt(s.values[hover])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Code block with copy + light JSON syntax coloring ── */
export function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const html =
    language === 'json'
      ? code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?/g, (m, _g, colon) =>
            colon ? `<span style="color:#7dd3fc">${m}</span>` : `<span style="color:#bef264">${m}</span>`,
          )
          .replace(/\b(true|false|null)\b/g, '<span style="color:#fca5a5">$1</span>')
          .replace(/\b(-?\d+\.?\d*)\b/g, '<span style="color:#fdba74">$1</span>')
      : code.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return (
    <div className="relative rounded-xl bg-slate-900 text-slate-200 overflow-hidden">
      <button
        onClick={copy}
        className="absolute top-2.5 right-2.5 z-10 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-bold flex items-center gap-1 transition-colors"
      >
        <Icon name={copied ? 'check' : 'content_copy'} className="text-[13px]" />
        {copied ? 'Đã chép' : 'Copy'}
      </button>
      <pre className="p-4 text-[12px] leading-relaxed overflow-x-auto custom-scrollbar" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
