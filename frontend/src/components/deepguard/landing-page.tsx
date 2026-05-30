'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigation } from '@/store/navigation';
import { Icon } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';

/* ──────────────────────────────────────────────
   Scoped CSS (light-only, ported from landing-v3)
   ────────────────────────────────────────────── */
const V3_CSS = `
.v3-aurora{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 90% 65% at 82% 8%,rgba(99,102,241,.16) 0%,transparent 55%),radial-gradient(ellipse 65% 55% at 8% 92%,rgba(6,182,212,.13) 0%,transparent 55%),radial-gradient(ellipse 55% 70% at 48% 52%,rgba(0,80,203,.07) 0%,transparent 62%),#EBF3FF}
.v3-blob{position:absolute;border-radius:50%;filter:blur(100px)}
.v3-ba{animation:v3da 22s ease-in-out infinite}
.v3-bb{animation:v3db 28s ease-in-out infinite;animation-delay:-10s}
.v3-bc{animation:v3dc 18s ease-in-out infinite;animation-delay:-6s}
@keyframes v3da{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(28px,-40px)scale(1.06)}66%{transform:translate(-20px,22px)scale(.96)}}
@keyframes v3db{0%,100%{transform:translate(0,0)scale(1.02)}45%{transform:translate(-30px,20px)scale(.96)}72%{transform:translate(18px,-24px)scale(1.05)}}
@keyframes v3dc{0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(22px,28px)scale(1.08)}}
.v3-lg{background:linear-gradient(155deg,rgba(255,255,255,.88) 0%,rgba(255,255,255,.70) 100%);backdrop-filter:blur(52px) saturate(210%) brightness(1.04);-webkit-backdrop-filter:blur(52px) saturate(210%) brightness(1.04);border:1px solid rgba(255,255,255,.72);box-shadow:inset 0 1.5px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(0,0,0,.04),inset 1px 0 0 rgba(255,255,255,.55),0 12px 48px rgba(0,0,0,.09),0 3px 10px rgba(0,0,0,.05)}
.v3-lg-h{transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s cubic-bezier(.22,1,.36,1),background .28s ease}
.v3-lg-h:hover{background:linear-gradient(155deg,rgba(255,255,255,.95) 0%,rgba(255,255,255,.82) 100%);box-shadow:inset 0 2px 0 rgba(255,255,255,1),0 22px 64px rgba(0,0,0,.12),0 6px 18px rgba(0,0,0,.06);transform:translateY(-5px)}
.v3-nav{position:fixed;top:0;left:0;right:0;z-index:500;height:62px;background:rgba(235,243,255,.75);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.55);transition:all .3s ease}
.v3-nav.sc{background:rgba(255,255,255,.95);box-shadow:0 1px 28px rgba(0,0,0,.08)}
.v3-rev{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1)}
.v3-rev.on{opacity:1;transform:translateY(0)}
.v3-d1{transition-delay:.1s}.v3-d2{transition-delay:.2s}.v3-d3{transition-delay:.3s}
@keyframes v3bpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(1.6)}}
.v3-bp{animation:v3bpulse 2.4s ease-in-out infinite}
@keyframes v3spin{to{transform:rotate(360deg)}}
.v3-spin{animation:v3spin .75s linear infinite}
@keyframes v3appear{from{transform:scale(.78);opacity:0}to{transform:scale(1);opacity:1}}
.v3-appear{animation:v3appear .4s cubic-bezier(.22,1,.36,1)}
@keyframes v3bgrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.v3-bgrow{transform-origin:left;animation:v3bgrow 1.9s cubic-bezier(.22,1,.36,1) forwards}
@keyframes v3scanv{0%{top:0;opacity:0}20%{opacity:1}80%{opacity:1}100%{top:100%;opacity:0}}
.v3-scanl{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#0050cb,transparent);box-shadow:0 0 16px rgba(0,80,203,.8);animation:v3scanv 1.2s ease-in-out infinite;pointer-events:none}
@keyframes v3kp{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.5);opacity:.4}}
@keyframes v3ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.v3-gt{background:linear-gradient(130deg,#0050cb 0%,#4f91ff 50%,#06b6d4 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.v3-btp{display:inline-flex;align-items:center;gap:8px;background:#0050cb;color:#fff;border:none;border-radius:14px;font-weight:800;font-size:13px;letter-spacing:.04em;cursor:pointer;box-shadow:0 4px 20px rgba(0,80,203,.3),inset 0 1px 0 rgba(255,255,255,.2);transition:all .22s cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden}
.v3-btp:hover{background:#0040a8;transform:translateY(-2px) scale(1.02);box-shadow:0 10px 32px rgba(0,80,203,.42)}
.v3-btp:active{transform:scale(.97)}
.v3-btp:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
.v3-btg{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.78);color:#1e3050;border:1px solid rgba(255,255,255,.9);border-radius:14px;font-weight:700;font-size:13px;letter-spacing:.04em;cursor:pointer;backdrop-filter:blur(16px);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 2px 8px rgba(0,0,0,.07);transition:all .22s cubic-bezier(.22,1,.36,1)}
.v3-btg:hover{background:rgba(255,255,255,.97);transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,1),0 8px 24px rgba(0,0,0,.1)}
.v3-btg:active{transform:scale(.97)}
.v3-sbar{height:4px;border-radius:99px;background:rgba(0,0,0,.07);overflow:hidden}
.v3-sbf{height:100%;border-radius:99px;transform-origin:left;transform:scaleX(0);transition:transform 1.3s cubic-bezier(.22,1,.36,1)}
@media(max-width:1024px){.v3-hmd{display:none!important}.v3-g1{grid-template-columns:1fr!important}.v3-g1r{grid-template-areas:unset!important;grid-template-columns:1fr!important;grid-template-rows:unset!important}}
@media(prefers-reduced-motion:reduce){.v3-ba,.v3-bb,.v3-bc,.v3-scanl{animation:none!important}.v3-rev{opacity:1!important;transform:none!important;transition:none!important}}
`;

/* ──────────────────────────────────────────────
   Hooks
   ────────────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(to: number, active: boolean, ms = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let t0 = 0;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / ms, 1);
      setV(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setV(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, active, ms]);
  return v;
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return scrolled;
}

/* ──────────────────────────────────────────────
   Background
   ────────────────────────────────────────────── */
function V3Bg() {
  return (
    <>
      <div className="v3-aurora" />
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div
          className="v3-ba v3-blob"
          style={{
            position: 'absolute', width: 680, height: 680, top: -260, right: -160,
            background: 'radial-gradient(circle at 40% 40%,rgba(99,102,241,.28),rgba(0,80,203,.14) 50%,transparent 75%)',
          }}
        />
        <div
          className="v3-bb v3-blob"
          style={{
            position: 'absolute', width: 540, height: 540, bottom: -160, left: -120,
            background: 'radial-gradient(circle at 60% 60%,rgba(6,182,212,.22),rgba(0,80,203,.12) 50%,transparent 75%)',
          }}
        />
        <div style={{ position: 'absolute', top: '40%', left: '46%', transform: 'translate(-50%,-50%)' }}>
          <div
            className="v3-bc v3-blob"
            style={{ width: 380, height: 380, background: 'radial-gradient(circle,rgba(139,92,246,.14),rgba(0,80,203,.08) 50%,transparent 75%)' }}
          />
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────
   Navbar
   ────────────────────────────────────────────── */
function V3Navbar({ onLogin, onDocs, onLanding }: { onLogin: () => void; onDocs: () => void; onLanding: () => void }) {
  const sc = useScrolled();
  const [logoHover, setLogoHover] = useState(false);
  const navLinks: [string, string][] = [['local_offer', 'Pricing'], ['menu_book', 'Docs']];
  return (
    <nav className={`v3-nav${sc ? ' sc' : ''}`}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 28px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onLanding} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 8px', borderRadius: 12 }}>
          <div
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
            style={{
              width: 36, height: 36, borderRadius: 10, background: DG.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,80,203,.32),inset 0 1px 0 rgba(255,255,255,.2)', transition: 'transform .22s ease',
              transform: logoHover ? 'scale(1.1) rotate(-6deg)' : 'scale(1)',
            }}
          >
            <Icon name="security" style={{ fontSize: 18, color: 'white' }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, color: DG.primary, fontStyle: 'italic', letterSpacing: '-0.045em' }}>DeepGuard</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map(([icon, label]) => (
            <button
              key={label}
              onClick={onDocs}
              className="v3-hmd"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: 'none', background: 'transparent', color: '#3d5070', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 10, transition: 'all .18s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = DG.primary; e.currentTarget.style.background = 'rgba(0,80,203,.07)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#3d5070'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon name={icon} style={{ fontSize: 16 }} />
              {label}
            </button>
          ))}
          <button onClick={onLogin} className="v3-btp" style={{ padding: '9px 22px', fontSize: 13, borderRadius: 12 }}>
            <Icon name="login" style={{ fontSize: 16, color: 'white' }} />
            Đăng nhập
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ──────────────────────────────────────────────
   Detection preview (animated mock)
   ────────────────────────────────────────────── */
function V3DetectionPreview() {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  useEffect(() => {
    const t = setTimeout(() => setPhase('scanning'), 900);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (phase !== 'scanning') return;
    const t = setTimeout(() => setPhase('done'), 2200);
    return () => clearTimeout(t);
  }, [phase]);
  const isDone = phase === 'done';
  const kps: [number, number][] = [[64, 46], [96, 46], [80, 62], [70, 72], [90, 72], [80, 36], [80, 90]];
  return (
    <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse 70% 60% at 50% 50%,rgba(0,80,203,.14),transparent)', borderRadius: '50%', filter: 'blur(20px)', zIndex: 0 }} />
      <div className="v3-lg" style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* Chrome */}
        <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.5)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#ff5f57', '#ffbd2e', '#28c840'].map((c) => (
              <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, display: 'block' }} />
            ))}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#8498b4', letterSpacing: '.1em', textTransform: 'uppercase' }}>DeepGuard · Detection</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="v3-bp" style={{ width: 6, height: 6, borderRadius: '50%', background: isDone ? '#22c55e' : '#fbbf24', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: isDone ? '#22c55e' : '#8498b4' }}>{isDone ? 'DONE' : 'PROCESSING'}</span>
          </div>
        </div>
        {/* Face area */}
        <div style={{ position: 'relative', background: 'linear-gradient(155deg,rgba(224,242,254,.6),rgba(221,214,254,.4))', margin: 16, borderRadius: 16, overflow: 'hidden', aspectRatio: '4 / 3' }}>
          <svg viewBox="0 0 160 120" fill="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <ellipse cx={80} cy={52} rx={34} ry={40} stroke="rgba(0,80,203,.25)" strokeWidth={1.5} fill="rgba(0,80,203,.04)" />
            <ellipse cx={64} cy={46} rx={7} ry={4.5} stroke="rgba(0,80,203,.3)" strokeWidth={1} fill="rgba(0,80,203,.08)" />
            <ellipse cx={96} cy={46} rx={7} ry={4.5} stroke="rgba(0,80,203,.3)" strokeWidth={1} fill="rgba(0,80,203,.08)" />
            <circle cx={64} cy={46} r={2} fill="rgba(0,80,203,.25)" />
            <circle cx={96} cy={46} r={2} fill="rgba(0,80,203,.25)" />
            <path d="M80 50 L76 62 Q80 65 84 62 Z" stroke="rgba(0,80,203,.18)" strokeWidth={1} fill="none" />
            <path d="M70 72 Q80 80 90 72" stroke="rgba(0,80,203,.22)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            <path d="M20 120 Q28 100 46 94 L80 90 L114 94 Q132 100 140 120" stroke="rgba(0,80,203,.14)" strokeWidth={1.5} fill="rgba(0,80,203,.03)" />
            {kps.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={2} fill="rgba(0,80,203,.5)" style={{ animation: `v3kp ${1.8 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
            ))}
            <path d="M28 16 L16 16 L16 28" stroke="rgba(0,80,203,.5)" strokeWidth={2} strokeLinecap="round" fill="none" />
            <path d="M132 16 L144 16 L144 28" stroke="rgba(0,80,203,.5)" strokeWidth={2} strokeLinecap="round" fill="none" />
            <path d="M28 104 L16 104 L16 92" stroke="rgba(0,80,203,.5)" strokeWidth={2} strokeLinecap="round" fill="none" />
            <path d="M132 104 L144 104 L144 92" stroke="rgba(0,80,203,.5)" strokeWidth={2} strokeLinecap="round" fill="none" />
            <line x1={0} y1={60} x2={160} y2={60} stroke="rgba(0,80,203,.06)" strokeWidth={1} strokeDasharray="4 6" />
            <line x1={80} y1={0} x2={80} y2={120} stroke="rgba(0,80,203,.06)" strokeWidth={1} strokeDasharray="4 6" />
          </svg>
          {phase === 'scanning' && <div className="v3-scanl" />}
          {isDone && (
            <div className="v3-appear" style={{ position: 'absolute', inset: 0, background: 'rgba(186,26,26,.82)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name="dangerous" fill style={{ fontSize: 40, color: 'white' }} />
              <span style={{ color: 'white', fontSize: 15, fontWeight: 900, letterSpacing: '.14em' }}>DEEPFAKE</span>
              <span style={{ color: 'rgba(255,255,255,.75)', fontSize: 11, fontWeight: 600 }}>EfficientNet-B4 · DCT</span>
            </div>
          )}
        </div>
        {/* Result bar */}
        <div style={{ padding: '0 16px 16px' }}>
          {isDone ? (
            <div className="v3-appear" style={{ background: 'rgba(186,26,26,.07)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(186,26,26,.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="dangerous" fill style={{ fontSize: 14, color: DG.fake }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: DG.fake, textTransform: 'uppercase', letterSpacing: '.08em' }}>Verdict: FAKE</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color: DG.fake, letterSpacing: '-0.03em' }}>94.12%</span>
              </div>
              <div style={{ height: 5, background: 'rgba(0,0,0,.08)', borderRadius: 99, overflow: 'hidden' }}>
                <div className="v3-bgrow" style={{ height: '100%', width: '94%', background: 'linear-gradient(90deg,#ba1a1a,#ef4444)', borderRadius: 99 }} />
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(0,80,203,.06)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(0,80,203,.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="v3-spin" style={{ width: 16, height: 16, border: '2px solid rgba(0,80,203,.2)', borderTopColor: DG.primary, borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: DG.primary }}>{phase === 'idle' ? 'Khởi tạo model…' : 'Đang phân tích tần số DCT…'}</span>
            </div>
          )}
        </div>
      </div>
      {/* Floating verdict */}
      {isDone && (
        <div className="v3-lg v3-appear" style={{ position: 'absolute', bottom: -18, right: -28, borderRadius: 14, padding: '10px 14px', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 28px rgba(186,26,26,.2),inset 0 1px 0 rgba(255,255,255,.9)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: DG.fake }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: DG.fake, letterSpacing: '.04em' }}>FAKE</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#8498b4', marginLeft: 2 }}>94.12%</span>
        </div>
      )}
      {/* Floating latency */}
      <div className="v3-lg" style={{ position: 'absolute', top: 28, left: -32, borderRadius: 12, padding: '8px 13px', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 6px 20px rgba(0,0,0,.09),inset 0 1px 0 rgba(255,255,255,.9)' }}>
        <Icon name="speed" style={{ fontSize: 14, color: DG.real }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: DG.real }}>142ms</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Hero
   ────────────────────────────────────────────── */
function V3Hero({ onLogin, onDocs }: { onLogin: () => void; onDocs: () => void }) {
  return (
    <section style={{ minHeight: '96vh', display: 'flex', alignItems: 'center', paddingTop: 62, position: 'relative' }}>
      <div className="v3-g1" style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center', width: '100%' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(0,80,203,.09)', border: '1px solid rgba(0,80,203,.18)', marginBottom: 28 }}>
            <span className="v3-bp" style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: DG.primary, letterSpacing: '.09em', textTransform: 'uppercase' }}>v2.1 · Sẵn sàng vận hành</span>
          </div>
          <h1 style={{ fontSize: 'clamp(46px,5.6vw,80px)', fontWeight: 900, letterSpacing: '-0.055em', lineHeight: 1.04, color: '#08142a', marginBottom: 22, textWrap: 'balance' }}>
            Phát hiện<br />Deepfake<br />
            <span className="v3-gt">cho eKYC</span>
          </h1>
          <p style={{ fontSize: 17, color: '#3d5070', lineHeight: 1.78, marginBottom: 36, maxWidth: 480, textWrap: 'pretty' }}>
            API bảo mật sinh trắc học cho ngân hàng và fintech Việt Nam. Tích hợp 1 dòng code, bảo vệ hàng triệu giao dịch.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
            <button onClick={onLogin} className="v3-btp" style={{ padding: '14px 30px', fontSize: 14 }}>
              <Icon name="rocket_launch" style={{ fontSize: 19, color: 'white' }} />
              Dùng thử miễn phí
            </button>
            <button onClick={onDocs} className="v3-btg" style={{ padding: '14px 28px', fontSize: 14 }}>
              <Icon name="code" style={{ fontSize: 19, color: DG.primary }} />
              API Docs
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8498b4', textTransform: 'uppercase', letterSpacing: '.1em', marginRight: 8 }}>Đối tác</span>
            {['VietBank', 'MB Bank', 'TPBank', 'VPBank'].map((n) => (
              <span key={n} style={{ padding: '5px 12px', borderRadius: 99, background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.8)', fontSize: 12, fontWeight: 700, color: '#3d5070', backdropFilter: 'blur(10px)' }}>{n}</span>
            ))}
          </div>
        </div>
        <div className="v3-hmd" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <V3DetectionPreview />
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   Ticker
   ────────────────────────────────────────────── */
function V3Ticker() {
  const items = [
    { label: 'AUC Score', value: '0.91', icon: 'analytics' },
    { label: 'Latency', value: '<150ms', icon: 'speed' },
    { label: 'FPR', value: '≤5%', icon: 'verified_user' },
    { label: 'API Uptime', value: '99.9%', icon: 'cloud_done' },
    { label: 'Requests/ngày', value: '1M+', icon: 'bolt' },
    { label: 'Model', value: 'EfficientNet-B4', icon: 'psychology' },
    { label: 'Format', value: 'JSON · REST', icon: 'code' },
    { label: 'Heatmap', value: 'DCT', icon: 'local_fire_department' },
  ];
  const all = [...items, ...items];
  return (
    <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,.6)', borderBottom: '1px solid rgba(255,255,255,.6)', background: 'rgba(255,255,255,.38)', backdropFilter: 'blur(20px)', marginBottom: 96 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(90deg,rgba(235,243,255,1),transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(-90deg,rgba(235,243,255,1),transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', width: 'max-content', animation: 'v3ticker 32s linear infinite' }}>
        {all.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRight: '1px solid rgba(255,255,255,.5)', whiteSpace: 'nowrap' }}>
            <Icon name={item.icon} style={{ fontSize: 15, color: DG.primary }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#8498b4', textTransform: 'uppercase', letterSpacing: '.08em' }}>{item.label}</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: DG.primary, letterSpacing: '-0.02em', marginLeft: 4 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Features bento
   ────────────────────────────────────────────── */
const CODE_SNIP = `response = requests.post(
  "https://api.deepguard.io/v1/detect",
  headers={"X-API-Key": "dg_***"},
  files={"image": open("face.jpg","rb")}
)`;

function V3Features() {
  const { ref, inView } = useInView(0.08);
  return (
    <section ref={ref} style={{ position: 'relative', zIndex: 1, maxWidth: 1320, margin: '0 auto', padding: '0 28px 96px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <h2 style={{ fontSize: 'clamp(28px,3.8vw,46px)', fontWeight: 900, letterSpacing: '-0.045em', color: '#08142a', marginBottom: 12, textWrap: 'balance' }}>Tại sao chọn DeepGuard?</h2>
        <p style={{ color: '#3d5070', maxWidth: 480, margin: '0 auto', fontSize: 16, lineHeight: 1.7 }}>Công nghệ phát hiện deepfake tốc độ cao, giải thích được, production-ready.</p>
      </div>
      <div className="v3-g1r" style={{ display: 'grid', gridTemplateAreas: '"api api heat" "ekyc stat heat"', gridTemplateColumns: '1fr 1fr 1.15fr', gridTemplateRows: 'auto auto', gap: 16 }}>
        {/* API */}
        <div className={`v3-lg v3-rev${inView ? ' on' : ''}`} style={{ gridArea: 'api', borderRadius: 22, padding: 36, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 220, height: 220, background: 'radial-gradient(circle at 80% 20%,rgba(0,80,203,.08),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,80,203,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.8)' }}>
            <Icon name="api" style={{ fontSize: 26, color: DG.primary }} />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 900, color: '#08142a', marginBottom: 10, letterSpacing: '-0.03em' }}>Detection API</h3>
          <p style={{ fontSize: 14, color: '#3d5070', lineHeight: 1.7, marginBottom: 24, maxWidth: 400 }}>1 API call — trả về verdict, confidence score và metadata. Không cần SDK, không cần on-prem.</p>
          <div style={{ background: 'rgba(14,17,23,.92)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,.18)' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', gap: 5, alignItems: 'center' }}>
              {['#ff5f57', '#ffbd2e', '#28c840'].map((c) => (
                <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'block' }} />
              ))}
              <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'Fira Code,monospace', marginLeft: 6 }}>main.py</span>
            </div>
            <pre style={{ padding: 16, fontSize: 12, fontFamily: 'Fira Code,monospace', lineHeight: 1.75, color: '#e2e8f0', margin: 0, overflowX: 'auto' }}>{CODE_SNIP}</pre>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {['REST · JSON', '<150ms', 'JPG·PNG·WebP'].map((t) => (
              <span key={t} style={{ padding: '4px 10px', borderRadius: 99, background: 'rgba(0,80,203,.09)', border: '1px solid rgba(0,80,203,.14)', fontSize: 11, fontWeight: 700, color: DG.primary }}>{t}</span>
            ))}
          </div>
        </div>
        {/* Heatmap */}
        <div className={`v3-lg v3-rev v3-d1${inView ? ' on' : ''}`} style={{ gridArea: 'heat', borderRadius: 22, padding: '36px 32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(237,108,2,.04) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(237,108,2,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.8)' }}>
            <Icon name="local_fire_department" style={{ fontSize: 26, color: DG.uncertain }} />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 900, color: '#08142a', marginBottom: 10, letterSpacing: '-0.03em' }}>DCT Heatmap</h3>
          <p style={{ fontSize: 14, color: '#3d5070', lineHeight: 1.7, marginBottom: 24 }}>Explainable AI — visualise vùng ảnh mà model phát hiện bất thường qua phân tích tần số DCT.</p>
          <div style={{ flex: 1, borderRadius: 14, overflow: 'hidden', position: 'relative', minHeight: 160, background: 'linear-gradient(135deg,#e0f2fe,#fef3c7)' }}>
            <svg viewBox="0 0 200 160" fill="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <defs>
                <radialGradient id="v3h1" cx="42%" cy="44%" r="35%">
                  <stop offset="0%" stopColor="rgba(186,26,26,.85)" />
                  <stop offset="50%" stopColor="rgba(237,108,2,.5)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="v3h2" cx="63%" cy="58%" r="28%">
                  <stop offset="0%" stopColor="rgba(186,26,26,.65)" />
                  <stop offset="60%" stopColor="rgba(237,108,2,.3)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <ellipse cx={80} cy={62} rx={30} ry={38} stroke="rgba(0,80,203,.2)" strokeWidth={1} fill="rgba(0,80,203,.03)" />
              <rect x={0} y={0} width={200} height={160} fill="url(#v3h1)" style={{ mixBlendMode: 'multiply' }} />
              <rect x={0} y={0} width={200} height={160} fill="url(#v3h2)" style={{ mixBlendMode: 'multiply' }} />
            </svg>
            <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {([['#ba1a1a', 'High'], ['#ed6c02', 'Mid'], ['#93c5fd', 'Low']] as [string, string][]).map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(8px)', borderRadius: 6, padding: '3px 7px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'block' }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* eKYC */}
        <div className={`v3-lg v3-rev v3-d2${inView ? ' on' : ''}`} style={{ gridArea: 'ekyc', borderRadius: 22, padding: '28px 30px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg,rgba(46,125,50,.04) 0%,transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(46,125,50,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.8)' }}>
            <Icon name="shield" style={{ fontSize: 24, color: DG.real }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#08142a', marginBottom: 8, letterSpacing: '-0.025em' }}>eKYC Ready</h3>
          <p style={{ fontSize: 13.5, color: '#3d5070', lineHeight: 1.65 }}>Threshold calibrated cho FPR≤5% — tối ưu cho luồng onboarding ngân hàng.</p>
          <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['FPR ≤5%', 'AML ready', 'FATF'].map((t) => (
              <span key={t} style={{ padding: '3px 9px', borderRadius: 99, background: 'rgba(46,125,50,.09)', border: '1px solid rgba(46,125,50,.18)', fontSize: 11, fontWeight: 700, color: DG.real }}>{t}</span>
            ))}
          </div>
        </div>
        {/* Stats mini */}
        <div className={`v3-lg v3-rev v3-d3${inView ? ' on' : ''}`} style={{ gridArea: 'stat', borderRadius: 22, padding: '28px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(145deg,rgba(0,80,203,.06) 0%,rgba(255,255,255,.7) 100%)' }}>
          {[{ v: '0.91', l: 'AUC Score', c: DG.primary }, { v: '<150', l: 'ms latency', c: DG.real }].map((s) => (
            <div key={s.l} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.055em', color: s.c, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8498b4', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
          <div style={{ height: 1, background: 'rgba(0,0,0,.07)', margin: '4px 0 16px' }} />
          <div style={{ fontSize: 12, color: '#3d5070', lineHeight: 1.6, fontWeight: 500 }}>EfficientNet-B4 + DCT Stream</div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   How it works
   ────────────────────────────────────────────── */
function V3HowItWorks() {
  const { ref, inView } = useInView(0.1);
  const steps = [
    { n: 1, icon: 'upload_file', title: 'Upload ảnh', desc: 'Gửi ảnh chân dung qua REST API — JPG, PNG, WebP.', color: DG.primary },
    { n: 2, icon: 'psychology', title: 'AI phân tích', desc: 'EfficientNet-B4 + DCT Stream chẩn đoán trong <150ms.', color: DG.uncertain },
    { n: 3, icon: 'verified', title: 'Nhận verdict', desc: 'REAL / FAKE + confidence score + heatmap tuỳ chọn.', color: DG.real },
  ];
  return (
    <section ref={ref} style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 28px 96px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <h2 style={{ fontSize: 'clamp(28px,3.8vw,46px)', fontWeight: 900, letterSpacing: '-0.045em', color: '#08142a', marginBottom: 12 }}>3 bước, 1 API call</h2>
        <p style={{ color: '#3d5070', maxWidth: 400, margin: '0 auto', fontSize: 16, lineHeight: 1.7 }}>Tích hợp trong 30 giây — không SDK, không cấu hình.</p>
      </div>
      <div className="v3-g1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, position: 'relative' }}>
        <div className="v3-hmd" style={{ position: 'absolute', top: 48, left: '34%', right: '34%', height: 1, background: 'linear-gradient(90deg,rgba(0,80,203,.3),rgba(0,80,203,.1),rgba(0,80,203,.3))', zIndex: -1 }} />
        {steps.map((s, i) => {
          const dc = i === 1 ? ' v3-d1' : i === 2 ? ' v3-d2' : '';
          return (
            <div key={s.n} className={`v3-lg v3-lg-h v3-rev${dc}${inView ? ' on' : ''}`} style={{ borderRadius: 20, padding: '32px 26px', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 8px 24px ${s.color}30,inset 0 1px 0 rgba(255,255,255,.3)`, color: 'white', fontWeight: 900, fontSize: 18 }}>{s.n}</div>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <Icon name={s.icon} style={{ fontSize: 24, color: s.color }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#08142a', marginBottom: 10, letterSpacing: '-0.025em' }}>{s.title}</h3>
              <p style={{ fontSize: 13.5, color: '#3d5070', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   Pricing
   ────────────────────────────────────────────── */
interface Plan {
  name: string;
  sub: string;
  price: string;
  per?: string;
  feats: string[];
  cta: string;
  star: boolean;
}

function V3Pricing({ onLogin }: { onLogin: () => void }) {
  const { ref, inView } = useInView(0.08);
  const plans: Plan[] = [
    { name: 'Starter', sub: 'Dùng thử & tích hợp', price: 'Miễn phí', feats: ['100 req/tháng', 'Detection API', 'Verdict + Confidence', 'Email support'], cta: 'Bắt đầu', star: false },
    { name: 'Pro', sub: 'Production workload', price: '$99', per: '/tháng', feats: ['10,000 req/tháng', 'Detection + DCT Heatmap', 'Priority support', 'SLA 99.9%', 'Webhooks'], cta: 'Chọn Pro', star: true },
    { name: 'Enterprise', sub: 'Ngân hàng & tổ chức', price: 'Custom', feats: ['Unlimited requests', 'On-prem deployment', 'Custom threshold', 'Dedicated manager', 'Audit log'], cta: 'Liên hệ sales', star: false },
  ];
  return (
    <section ref={ref} style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 28px 96px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <h2 style={{ fontSize: 'clamp(28px,3.8vw,46px)', fontWeight: 900, letterSpacing: '-0.045em', color: '#08142a', marginBottom: 12 }}>Bảng giá</h2>
        <p style={{ color: '#3d5070', maxWidth: 420, margin: '0 auto', fontSize: 16, lineHeight: 1.7 }}>Bắt đầu miễn phí, mở rộng khi scale.</p>
      </div>
      <div className="v3-g1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'start' }}>
        {plans.map((p, i) => {
          const dc = i === 1 ? ' v3-d1' : i === 2 ? ' v3-d2' : '';
          const btnExtra: CSSProperties = !p.star ? { border: '1.5px solid rgba(0,80,203,.22)', color: DG.primary, background: 'rgba(255,255,255,.65)' } : {};
          return (
            <div
              key={p.name}
              className={`v3-lg v3-lg-h v3-rev${dc}${inView ? ' on' : ''}`}
              style={{
                borderRadius: 22, padding: '32px 28px', display: 'flex', flexDirection: 'column', position: 'relative',
                border: p.star ? '1.5px solid rgba(0,80,203,.35)' : '1px solid rgba(255,255,255,.72)',
                boxShadow: p.star ? '0 16px 56px rgba(0,80,203,.15),inset 0 1.5px 0 rgba(255,255,255,.95)' : '0 12px 48px rgba(0,0,0,.09),inset 0 1.5px 0 rgba(255,255,255,.95)',
              }}
            >
              {p.star && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: DG.primary, color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', padding: '5px 16px', borderRadius: 99, boxShadow: '0 4px 16px rgba(0,80,203,.36)', whiteSpace: 'nowrap' }}>Phổ biến nhất</div>
              )}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#08142a', letterSpacing: '-0.03em', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: '#3d5070' }}>{p.sub}</div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: '#08142a', letterSpacing: '-0.05em', lineHeight: 1 }}>{p.price}</span>
                {p.per && <span style={{ fontSize: 14, color: '#8498b4', fontWeight: 500 }}>{p.per}</span>}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {p.feats.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#3d5070' }}>
                    <Icon name="check_circle" fill style={{ fontSize: 17, color: DG.real, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={onLogin} className={p.star ? 'v3-btp' : 'v3-btg'} style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 13, borderRadius: 13, ...btnExtra }}>{p.cta}</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   CTA bottom
   ────────────────────────────────────────────── */
function V3CTABottom({ onLogin }: { onLogin: () => void }) {
  return (
    <section style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto', padding: '0 28px 100px' }}>
      <div className="v3-lg" style={{ borderRadius: 30, padding: '60px 52px', textAlign: 'center', border: '1px solid rgba(0,80,203,.18)', boxShadow: '0 24px 80px rgba(0,80,203,.12),inset 0 2px 0 rgba(255,255,255,.95)', background: 'linear-gradient(155deg,rgba(255,255,255,.92) 0%,rgba(235,243,255,.82) 100%)' }}>
        <div style={{ width: 68, height: 68, borderRadius: 20, background: DG.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 14px 40px rgba(0,80,203,.34),inset 0 1px 0 rgba(255,255,255,.25)' }}>
          <Icon name="rocket_launch" style={{ fontSize: 32, color: 'white' }} />
        </div>
        <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.045em', color: '#08142a', marginBottom: 16 }}>Bắt đầu tích hợp ngay</h2>
        <p style={{ color: '#3d5070', maxWidth: 460, margin: '0 auto 36px', fontSize: 16, lineHeight: 1.75 }}>Nhận API key trong 30 giây. Không cần thẻ tín dụng.</p>
        <button onClick={onLogin} className="v3-btp" style={{ padding: '16px 40px', fontSize: 14 }}>
          <Icon name="arrow_forward" style={{ fontSize: 20, color: 'white' }} />
          Dùng thử miễn phí
        </button>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   Footer
   ────────────────────────────────────────────── */
function V3Footer({ onDocs, onLogin }: { onDocs: () => void; onLogin: () => void }) {
  const links: [string, string, () => void][] = [['code', 'GitHub', onDocs], ['menu_book', 'Docs', onDocs], ['mail', 'Contact', onLogin]];
  return (
    <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,.55)', background: 'rgba(255,255,255,.44)', backdropFilter: 'blur(20px)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '28px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: DG.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="security" style={{ fontSize: 14, color: 'white' }} />
          </div>
          <span style={{ fontSize: 13, color: '#3d5070', fontWeight: 500 }}>© 2025 DeepGuard. Bảo mật bởi AI.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {links.map(([icon, label, fn]) => (
            <button
              key={label}
              onClick={fn}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#3d5070', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'color .18s ease', padding: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = DG.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#3d5070'; }}
            >
              <Icon name={icon} style={{ fontSize: 16 }} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────
   LANDING PAGE
   ────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigation((s) => s.navigate);
  const onLogin = () => navigate('login');
  const onDocs = () => navigate('docs');
  const onLanding = () => navigate('landing');

  return (
    <div style={{ background: '#EBF3FF', minHeight: '100vh', position: 'relative', fontFamily: "'Inter',system-ui,sans-serif", color: '#08142a', overflowX: 'hidden' }}>
      <style>{V3_CSS}</style>
      <V3Bg />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <V3Navbar onLogin={onLogin} onDocs={onDocs} onLanding={onLanding} />
        <V3Hero onLogin={onLogin} onDocs={onDocs} />
        <V3Ticker />
        <V3Features />
        <V3HowItWorks />
        <V3Pricing onLogin={onLogin} />
        <V3CTABottom onLogin={onLogin} />
        <V3Footer onDocs={onDocs} onLogin={onLogin} />
      </div>
    </div>
  );
}
