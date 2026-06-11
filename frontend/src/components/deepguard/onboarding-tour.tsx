'use client';

/* onboarding-tour.tsx — Teaching Tips & Tours kiểu Business Central + "đi một vòng" tự động.
   • phase 'welcome' : modal giữa màn hỏi có muốn đi một vòng quanh app không (lần đầu đăng nhập).
   • phase 'tip'     : page teaching tip GÓC DƯỚI-TRÁI (không chặn), mời "Xem hướng dẫn".
   • phase 'tour'    : control teaching tips trỏ vào button/section bằng callout có MŨI TÊN (beak).
                       Tự lật sang TRÁI nếu target sát mép phải (beak đổi cạnh tương ứng). */
import { useEffect, useLayoutEffect, useState, useCallback, type ReactNode } from 'react';
import { useOnboardingStore } from '@/store/onboarding';
import { useAuthStore } from '@/store/auth';
import { useNavigation } from '@/store/navigation';
import { PAGE_TIPS, PAGE_TOURS, ROLE_TOURS } from '@/lib/onboarding';
import { ROLE_LABEL, type Role } from '@/lib/rbac';
import { Icon } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';

interface Rect { top: number; left: number; width: number; height: number }
const CARD_W = 360;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

/* Rich text tối giản: **bold**, *italic*, `code` (theo guideline BC). */
function rich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**')) out.push(<b key={k++} className="font-bold text-slate-800">{t.slice(2, -2)}</b>);
    else if (t.startsWith('`')) out.push(<code key={k++} className="px-1 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-700">{t.slice(1, -1)}</code>);
    else out.push(<i key={k++} className="italic">{t.slice(1, -1)}</i>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function OnboardingTour() {
  const phase = useOnboardingStore((s) => s.phase);
  const step = useOnboardingStore((s) => s.step);
  const startTour = useOnboardingStore((s) => s.startTour);
  const next = useOnboardingStore((s) => s.next);
  const prev = useOnboardingStore((s) => s.prev);
  const close = useOnboardingStore((s) => s.close);
  const finishPage = useOnboardingStore((s) => s.finishPage);
  const acceptWalk = useOnboardingStore((s) => s.acceptWalk);
  const declineWalk = useOnboardingStore((s) => s.declineWalk);

  const user = useAuthStore((s) => s.user);
  const role = (user?.role as Role | undefined) ?? undefined;
  const uid = user?.id ?? role ?? 'anon';
  const currentPage = useNavigation((s) => s.currentPage);
  const pageKey = `${uid}::${currentPage}`;
  const done = () => finishPage(pageKey);

  const tour = PAGE_TOURS[currentPage] ?? (currentPage === 'dashboard' && role ? ROLE_TOURS[role] : undefined);
  const tourStep = tour?.[step];
  const [rect, setRect] = useState<Rect | null>(null);

  const recompute = useCallback(() => {
    if (phase !== 'tour' || !tourStep?.target) { setRect(null); return; }
    const el = document.querySelector(tourStep.target);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [phase, tourStep]);

  useLayoutEffect(() => {
    if (phase !== 'tour') return;
    recompute();
    const id = requestAnimationFrame(recompute);
    return () => cancelAnimationFrame(id);
  }, [phase, step, recompute]);

  useEffect(() => {
    if (phase !== 'tour') return;
    const onResize = () => recompute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [phase, recompute]);

  // Đang ở tour nhưng không có bước hợp lệ (đổi trang/role) → đóng an toàn (không gọi setState trong render).
  useEffect(() => {
    if (phase === 'tour' && (!tour || !tour[step])) close();
  }, [phase, tour, step, close]);

  if (phase === 'closed') return null;

  // ── WELCOME MODAL (giữa màn, lần đầu đăng nhập) ──
  if (phase === 'welcome') {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6" style={{ background: 'rgba(2,6,23,.5)', animation: 'dgfade .2s ease' }}>
        <style>{`@keyframes dgfade{from{opacity:0}to{opacity:1}}@keyframes dgpop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{ width: 420, animation: 'dgpop .26s cubic-bezier(.22,1,.36,1)' }} className="rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
          <div className="px-7 pt-7 pb-5 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(0,80,203,.08)' }}>
              <Icon name="explore" className="text-[34px]" style={{ color: DG.primary }} />
            </div>
            <h2 className="text-[19px] font-black text-slate-800 mb-2">Chào mừng đến DeepGuard 👋</h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Bạn có muốn <b>đi một vòng quanh app</b> không? Mỗi khi bạn mở một trang lần đầu,
              chúng tôi sẽ dẫn bạn qua các nút và khu vực chính của trang đó{role ? ` (theo vai trò ${ROLE_LABEL[role]})` : ''}.
            </p>
          </div>
          <div className="px-7 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-3">
            <button onClick={() => declineWalk(uid)} className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-white border border-slate-200">
              Để sau
            </button>
            <button onClick={() => acceptWalk(uid)} className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center gap-2" style={{ background: DG.primary, boxShadow: '0 4px 16px rgba(0,80,203,.32)' }}>
              <Icon name="tour" className="text-[17px]" /> Có, dẫn tôi đi một vòng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PAGE TEACHING TIP (góc dưới-trái, không chặn) ──
  if (phase === 'tip') {
    const tip = PAGE_TIPS[currentPage] ?? { title: 'Về trang này', body: 'Khu vực làm việc của DeepGuard.', icon: 'lightbulb' };
    const hasTour = !!tour?.length;
    return (
      <div style={{ position: 'fixed', left: 24, bottom: 24, width: CARD_W, zIndex: 1002 }} className="dgtip-in">
        <style>{`@keyframes dgtipin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.dgtip-in{animation:dgtipin .26s cubic-bezier(.22,1,.36,1)}`}</style>
        <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start gap-3 mb-2.5">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,80,203,.08)' }}>
                <Icon name={tip.icon} className="text-[22px]" style={{ color: DG.primary }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Mẹo · {role ? ROLE_LABEL[role] : ''}</p>
                <h3 className="text-[15px] font-black text-slate-800 leading-tight">{tip.title}</h3>
              </div>
              <button onClick={done} className="text-slate-300 hover:text-slate-500 shrink-0" title="Đóng">
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <p className="text-[12.5px] text-slate-600 leading-relaxed">{rich(tip.body)}</p>
          </div>
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            <button onClick={done} className="text-[12px] font-semibold text-slate-400 hover:text-slate-600 px-2 py-1.5">Đã hiểu</button>
            {hasTour && (
              <button onClick={startTour} className="px-4 py-1.5 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5" style={{ background: DG.primary, boxShadow: '0 3px 12px rgba(0,80,203,.3)' }}>
                <Icon name="tour" className="text-[15px]" /> Xem hướng dẫn
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── TOUR (control teaching tip có beak, lật trái/phải) ──
  if (!tour || !tourStep) return null;
  const isLast = step >= tour.length - 1;
  const total = tour.length;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  let cardTop = vh / 2 - 90, cardLeft = 40, beakTop = 70;
  let placement: 'right' | 'left' = 'right';
  if (rect) {
    const centerY = rect.top + rect.height / 2;
    const rectRight = rect.left + rect.width;
    cardTop = clamp(centerY - 78, 16, vh - 196);
    placement = rectRight + 18 + CARD_W <= vw - 16 ? 'right' : 'left';
    cardLeft = placement === 'right' ? rectRight + 18 : Math.max(16, rect.left - 18 - CARD_W);
    beakTop = clamp(centerY - cardTop, 18, 140);
  }
  const beakStyle: React.CSSProperties = placement === 'right'
    ? { left: -7, top: beakTop, borderLeft: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }
    : { right: -7, top: beakTop, borderRight: '1px solid #f1f5f9', borderTop: '1px solid #f1f5f9' };

  return (
    <div className="fixed inset-0 z-[1000]" style={{ animation: 'dgfade .2s ease' }}>
      <style>{`@keyframes dgfade{from{opacity:0}to{opacity:1}}`}</style>

      {rect ? (
        <div
          onClick={done}
          style={{
            position: 'fixed', top: rect.top - 6, left: rect.left - 6,
            width: rect.width + 12, height: rect.height + 12, borderRadius: 12, zIndex: 1001,
            boxShadow: '0 0 0 9999px rgba(2,6,23,.42)', outline: `2px solid ${DG.primary}`, outlineOffset: 2,
            transition: 'all .25s cubic-bezier(.22,1,.36,1)',
          }}
        />
      ) : (
        <div onClick={done} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,.42)', zIndex: 1001 }} />
      )}

      <div style={{ position: 'fixed', top: cardTop, left: cardLeft, width: CARD_W, zIndex: 1002 }}>
        {rect && (
          <span style={{ position: 'absolute', width: 14, height: 14, background: '#fff', transform: 'rotate(45deg)', borderRadius: 2, ...beakStyle }} />
        )}
        <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden relative">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-3 mb-2.5">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,80,203,.08)' }}>
                <Icon name={tourStep.icon} className="text-[20px]" style={{ color: DG.primary }} />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Bước {step + 1}/{total}</p>
                <h3 className="text-[15px] font-black text-slate-800 leading-tight">{tourStep.title}</h3>
              </div>
            </div>
            <p className="text-[12.5px] text-slate-600 leading-relaxed">{rich(tourStep.body)}</p>
          </div>
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {tour.map((_, i) => (
                <span key={i} className="rounded-full transition-all" style={{ width: i === step ? 18 : 6, height: 6, background: i === step ? DG.primary : '#cbd5e1' }} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {step === 0 ? (
                <button onClick={done} className="text-[12px] font-semibold text-slate-400 hover:text-slate-600 px-2 py-1.5">Bỏ qua</button>
              ) : (
                <button onClick={prev} className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5">Quay lại</button>
              )}
              <button
                onClick={() => (isLast ? done() : next())}
                className="px-4 py-1.5 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5"
                style={{ background: DG.primary, boxShadow: '0 3px 12px rgba(0,80,203,.3)' }}
              >
                {isLast ? (<><Icon name="check" className="text-[14px]" /> Đã hiểu</>) : (<>Tiếp <Icon name="arrow_forward" className="text-[14px]" /></>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
