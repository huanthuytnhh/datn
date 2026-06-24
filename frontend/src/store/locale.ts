import { create } from 'zustand';

/* ──────────────────────────────────────────────
   Locale store — UI language (vi / en).
   Default: 'vi'. Persisted in localStorage key
   'dg-locale' so it survives reloads.
   Mirrors the appearance.ts persist pattern:
   manual localStorage + hydrate() called on mount.
   ────────────────────────────────────────────── */

export type Locale = 'vi' | 'en';

const STORAGE_KEY = 'dg-locale';

const isLocale = (v: unknown): v is Locale => v === 'vi' || v === 'en';

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Sync store from localStorage. Call once on client mount. */
  hydrate: () => void;
}

export const useLocale = create<LocaleState>((set) => ({
  locale: 'vi',
  setLocale: (l) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, l);
    set({ locale: l });
  },
  hydrate: () => {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const locale = isLocale(stored) ? stored : 'vi';
    set({ locale });
  },
}));
