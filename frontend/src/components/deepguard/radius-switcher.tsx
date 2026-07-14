'use client';

/* ──────────────────────────────────────────────
   Radius mode switcher — two presentations:
     · RadiusModeSelector — full card selector for the Settings → Appearance tab
     · RadiusQuickToggle  — compact dropdown for the top header
   Both drive the same appearance store (persisted to localStorage).
   ────────────────────────────────────────────── */

import { Icon } from '@/components/deepguard/shared';
import {
  useAppearanceStore,
  RADIUS_MODES,
  type RadiusMode,
} from '@/store/appearance';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/* literal preview radius (px) per mode for the mini mockups */
const PREVIEW_PX: Record<RadiusMode, number> = { slight: 8, sharp: 4, geometric: 0 };

/* ── full card selector (Settings) ── */
export function RadiusModeSelector() {
  const radius = useAppearanceStore((s) => s.radius);
  const setRadius = useAppearanceStore((s) => s.setRadius);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {RADIUS_MODES.map((m) => {
        const active = radius === m.value;
        return (
          <button
            key={m.value}
            type="button"
            aria-pressed={active}
            onClick={() => setRadius(m.value)}
            className={`text-left p-4 rounded-xl border transition-all ${
              active
                ? 'border-dgblue ring-2 ring-dgblue/20 bg-blue-50/40'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {/* mini preview: a panel + a "button" rendered at this mode's radius */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-10 h-10 bg-dgblue/10 border-2 border-dgblue/50"
                style={{ borderRadius: PREVIEW_PX[m.value] }}
              />
              <div
                className="h-7 px-3 flex items-center bg-dgblue text-white text-[10px] font-bold"
                style={{ borderRadius: PREVIEW_PX[m.value] }}
              >
                Aa
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-slate-800">{m.label}</p>
              {active ? (
                <Icon name="check_circle" className="text-[18px] text-dgblue" fill />
              ) : (
                <span className="text-[10px] font-bold text-slate-300 tabular-nums">{m.px}</span>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
              {m.en} · {m.px}
            </p>
            <p className="text-[11px] text-slate-400 leading-snug mt-1.5">{m.desc}</p>
          </button>
        );
      })}
    </div>
  );
}

/* ── compact header dropdown ── */
export function RadiusQuickToggle() {
  const radius = useAppearanceStore((s) => s.radius);
  const setRadius = useAppearanceStore((s) => s.setRadius);
  const current = RADIUS_MODES.find((m) => m.value === radius) ?? RADIUS_MODES[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={`Bo góc giao diện: ${current.label} (${current.px})`}
          aria-label="Đổi độ bo góc giao diện"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 border border-slate-200 text-slate-500 hover:text-dgblue transition-colors"
        >
          <Icon name="rounded_corner" className="text-[19px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-[11px] font-bold text-slate-400">
          Độ bo góc giao diện
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {RADIUS_MODES.map((m) => {
          const active = radius === m.value;
          return (
            <DropdownMenuItem
              key={m.value}
              onClick={() => setRadius(m.value)}
              className="gap-3 cursor-pointer py-2"
            >
              <div
                className="w-7 h-7 shrink-0 bg-dgblue/15 border-2 border-dgblue/60"
                style={{ borderRadius: PREVIEW_PX[m.value] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-700">
                  {m.label}{' '}
                  <span className="font-medium text-slate-400">· {m.px}</span>
                </p>
                <p className="text-[10px] text-slate-400 truncate">{m.en}</p>
              </div>
              {active && <Icon name="check" className="text-[16px] text-dgblue shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
