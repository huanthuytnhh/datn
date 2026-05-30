/**
 * DeepGuard design constants + small formatting helpers.
 * Ported from the frontend-claude prototype (mockdata.jsx) so the restyled
 * pages share one source of truth for verdict colors / number + time formatting.
 */

export const DG = {
  primary: '#0050cb',
  fake: '#ba1a1a',
  real: '#2e7d32',
  uncertain: '#ed6c02',
} as const;

export type Verdict = 'FAKE' | 'REAL' | 'UNCERTAIN' | 'LIVE' | 'SPOOF';

export interface VerdictStyle {
  color: string;
  bg: string;
  border: string;
  dot: string;
}

export const VERDICT_STYLE: Record<string, VerdictStyle> = {
  FAKE: { color: DG.fake, bg: '#fef2f2', border: '#fecaca', dot: DG.fake },
  REAL: { color: DG.real, bg: '#f0fdf4', border: '#bbf7d0', dot: DG.real },
  UNCERTAIN: { color: DG.uncertain, bg: '#fff7ed', border: '#fed7aa', dot: DG.uncertain },
  LIVE: { color: DG.real, bg: '#f0fdf4', border: '#bbf7d0', dot: DG.real },
  SPOOF: { color: DG.fake, bg: '#fef2f2', border: '#fecaca', dot: DG.fake },
};

export const verdictStyle = (v: string): VerdictStyle => VERDICT_STYLE[v] ?? VERDICT_STYLE.UNCERTAIN;

/** Integer with thousands separators (vi-VN style grouping). */
export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** ISO timestamp N minutes ago (for mock/demo rows). */
export function minsAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}

/** Relative time in Vietnamese: "x phút trước" / "x giờ trước" / "x ngày trước". */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

/** Y-axis step rounding for charts. */
export function niceStep(max: number): number {
  if (max <= 10) return 2;
  if (max <= 100) return 20;
  if (max <= 500) return 100;
  if (max <= 2500) return 500;
  if (max <= 15000) return 2500;
  return 5000;
}
