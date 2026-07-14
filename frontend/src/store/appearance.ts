import { create } from 'zustand';

/* ──────────────────────────────────────────────
   Appearance store — UI corner-radius mode.
   Three modes, applied globally via <html data-radius="...">:
     · slight     — Slightly Rounded (8px)  → soft, modern-SaaS standard
     · sharp      — Sharp & Modern   (4px)  → crisp, developer-tool feel  (DEFAULT)
     · geometric  — Strictly Geometric (0px) → flat / square, high-system
   The actual radius values live in globals.css (:root[data-radius="…"]).
   Persistence mirrors the auth store: a plain localStorage key (dg_radius)
   so the no-FOUC inline script in layout.tsx can read it before paint.
   ────────────────────────────────────────────── */

export type RadiusMode = 'slight' | 'sharp' | 'geometric';

export const RADIUS_MODES: {
  value: RadiusMode;
  label: string; // Vietnamese label (app UI is Vietnamese)
  en: string; // original English name
  px: string;
  desc: string;
}[] = [
  {
    value: 'slight',
    label: 'Bo nhẹ',
    en: 'Slightly Rounded',
    px: '8px',
    desc: 'Mềm mại nhưng gọn gàng — tiêu chuẩn của các ứng dụng SaaS hiện đại.',
  },
  {
    value: 'sharp',
    label: 'Sắc nét',
    en: 'Sharp & Modern',
    px: '4px',
    desc: 'Sắc sảo, kỹ thuật, đáng tin cậy — phổ biến trong developer tools.',
  },
  {
    value: 'geometric',
    label: 'Vuông góc',
    en: 'Strictly Geometric',
    px: '0px',
    desc: 'Phẳng và vuông vức hoàn toàn — nghiêm túc, tối giản, tính hệ thống cao.',
  },
];

export const DEFAULT_RADIUS: RadiusMode = 'sharp';
const STORAGE_KEY = 'dg_radius';

/* ── Bố cục Dashboard: 'classic' (mặc định) ↔ 'focus' (bố cục mới kiểu LoopAI) ── */
export type DashboardLayout = 'classic' | 'focus';
export const DEFAULT_LAYOUT: DashboardLayout = 'classic';
const LAYOUT_KEY = 'dg_dash_layout';
const isLayout = (v: unknown): v is DashboardLayout => v === 'classic' || v === 'focus';

const isRadiusMode = (v: unknown): v is RadiusMode =>
  v === 'slight' || v === 'sharp' || v === 'geometric';

function applyRadius(mode: RadiusMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-radius', mode);
  }
}

interface AppearanceState {
  radius: RadiusMode;
  setRadius: (mode: RadiusMode) => void;
  dashboardLayout: DashboardLayout;
  setDashboardLayout: (l: DashboardLayout) => void;
  /** Sync store + <html> from localStorage. Call once on client mount. */
  hydrate: () => void;
}

export const useAppearanceStore = create<AppearanceState>((set) => ({
  radius: DEFAULT_RADIUS,
  setRadius: (mode) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, mode);
    applyRadius(mode);
    set({ radius: mode });
  },
  dashboardLayout: DEFAULT_LAYOUT,
  setDashboardLayout: (l) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(LAYOUT_KEY, l);
    set({ dashboardLayout: l });
  },
  hydrate: () => {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const mode = isRadiusMode(stored) ? stored : DEFAULT_RADIUS;
    applyRadius(mode);
    const storedLayout = localStorage.getItem(LAYOUT_KEY);
    const layout = isLayout(storedLayout) ? storedLayout : DEFAULT_LAYOUT;
    set({ radius: mode, dashboardLayout: layout });
  },
}));
