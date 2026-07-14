import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* onboarding.ts — Teaching Tips & Tours (kiểu Business Central) + chế độ "đi một vòng" tự động.
   • welcomed[uid]  : đã hiện modal chào mừng lần đầu.
   • autoWalk[uid]  : người dùng đã đồng ý đi một vòng → mỗi lần VÀO TRANG LẦN ĐẦU tự chạy tour.
   • seenPages[uid::page] : trang đã được dẫn (auto hoặc thủ công) → không tự chạy lại.
   phase: 'closed' | 'welcome' (modal) | 'tip' (page teaching tip) | 'tour' (control tips). */
type Phase = 'closed' | 'welcome' | 'tip' | 'tour';

interface OnboardingState {
  welcomed: Record<string, boolean>;
  autoWalk: Record<string, boolean>;
  seenPages: Record<string, boolean>;
  phase: Phase;
  step: number;
  showWelcome: () => void;
  acceptWalk: (uid: string) => void;   // đồng ý đi một vòng
  declineWalk: (uid: string) => void;  // để sau
  openTip: () => void;
  startTour: () => void;
  next: () => void;
  prev: () => void;
  close: () => void;                    // đóng tạm (không đánh dấu)
  finishPage: (pageKey: string) => void; // đóng + đánh dấu trang đã dẫn (Đã hiểu / Bỏ qua / Hoàn tất / X)
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      welcomed: {},
      autoWalk: {},
      seenPages: {},
      phase: 'closed',
      step: 0,
      showWelcome: () => set({ phase: 'welcome', step: 0 }),
      acceptWalk: (uid) => set((s) => ({ phase: 'closed', step: 0, welcomed: { ...s.welcomed, [uid]: true }, autoWalk: { ...s.autoWalk, [uid]: true } })),
      declineWalk: (uid) => set((s) => ({ phase: 'closed', step: 0, welcomed: { ...s.welcomed, [uid]: true }, autoWalk: { ...s.autoWalk, [uid]: false } })),
      openTip: () => set({ phase: 'tip', step: 0 }),
      startTour: () => set({ phase: 'tour', step: 0 }),
      next: () => set((s) => ({ step: s.step + 1 })),
      prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
      close: () => set({ phase: 'closed', step: 0 }),
      finishPage: (pageKey) => set((s) => ({ phase: 'closed', step: 0, seenPages: { ...s.seenPages, [pageKey]: true } })),
    }),
    { name: 'dg-onboarding-v2' },
  ),
);
