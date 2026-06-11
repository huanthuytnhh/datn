'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigation } from '@/store/navigation';
import { Icon } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';

/* ── Scoped CSS ─────────────────────────────────────────── */
const V3_CSS = `
.v3-grain{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.022;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:220px 220px}
.v3-aurora{position:fixed;inset:0;z-index:0;pointer-events:none;background:
  radial-gradient(ellipse 110% 72% at 88% -4%,rgba(79,145,255,.24) 0%,transparent 52%),
  radial-gradient(ellipse 72% 62% at 4% 98%,rgba(6,182,212,.16) 0%,transparent 52%),
  radial-gradient(ellipse 58% 78% at 52% 48%,rgba(0,80,203,.08) 0%,transparent 62%),
  #EBF3FF}
.v3-blob{position:absolute;border-radius:50%;filter:blur(90px);will-change:transform}
.v3-ba{animation:v3da 24s ease-in-out infinite}
.v3-bb{animation:v3db 30s ease-in-out infinite;animation-delay:-12s}
.v3-bc{animation:v3dc 20s ease-in-out infinite;animation-delay:-7s}
@keyframes v3da{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(34px,-52px)scale(1.08)}66%{transform:translate(-26px,28px)scale(.94)}}
@keyframes v3db{0%,100%{transform:translate(0,0)scale(1.02)}45%{transform:translate(-38px,26px)scale(.94)}72%{transform:translate(22px,-30px)scale(1.07)}}
@keyframes v3dc{0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(28px,34px)scale(1.11)}}
.v3-nav{
  position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:500;
  background:rgba(255,255,255,.74);
  backdrop-filter:blur(32px) saturate(210%);-webkit-backdrop-filter:blur(32px) saturate(210%);
  border:1px solid rgba(255,255,255,.92);
  border-radius:999px;
  box-shadow:0 4px 28px rgba(0,0,0,.08),0 1px 4px rgba(0,0,0,.05),inset 0 1px 0 rgba(255,255,255,.97);
  transition:all .4s cubic-bezier(.32,.72,0,1);
  padding:7px 8px 7px 18px;
  display:flex;align-items:center;gap:6px;white-space:nowrap}
.v3-nav.sc{background:rgba(255,255,255,.96);box-shadow:0 10px 48px rgba(0,0,0,.11),inset 0 1px 0 rgba(255,255,255,1)}
.v3-nav-link{display:flex;align-items:center;gap:5px;padding:7px 12px;border:none;background:transparent;color:#3d5070;font-size:13px;font-weight:600;cursor:pointer;border-radius:999px;transition:all .24s cubic-bezier(.32,.72,0,1);letter-spacing:.01em;font-family:inherit}
.v3-nav-link:hover{color:#0050cb;background:rgba(0,80,203,.08)}
.v3-lg{
  background:linear-gradient(155deg,rgba(255,255,255,.96) 0%,rgba(255,255,255,.82) 100%);
  backdrop-filter:blur(52px) saturate(220%) brightness(1.01);-webkit-backdrop-filter:blur(52px) saturate(220%) brightness(1.01);
  border:1px solid rgba(255,255,255,.88);
  box-shadow:inset 0 1.5px 0 rgba(255,255,255,.98),inset 0 -1px 0 rgba(0,0,0,.04),inset 1px 0 0 rgba(255,255,255,.55),0 8px 32px rgba(0,80,203,.08),0 2px 8px rgba(0,0,0,.04)}
.v3-dbl-outer{background:rgba(0,80,203,.045);border:1px solid rgba(255,255,255,.72);border-radius:2rem;padding:6px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.v3-dbl-inner{background:linear-gradient(155deg,rgba(255,255,255,.97) 0%,rgba(255,255,255,.84) 100%);border:1px solid rgba(255,255,255,.92);border-radius:calc(2rem - 6px);box-shadow:inset 0 2px 0 rgba(255,255,255,1),inset 0 -1px 0 rgba(0,0,0,.04),0 12px 40px rgba(0,80,203,.1),0 4px 12px rgba(0,0,0,.05);overflow:hidden}
.v3-lg-h{transition:transform .36s cubic-bezier(.32,.72,0,1),box-shadow .36s cubic-bezier(.32,.72,0,1)}
.v3-lg-h:hover{transform:translateY(-8px);box-shadow:inset 0 2px 0 rgba(255,255,255,1),inset 1px 0 0 rgba(255,255,255,.7),0 32px 80px rgba(0,80,203,.15),0 8px 24px rgba(0,0,0,.07)}
.v3-gt{background:linear-gradient(130deg,#0050cb 0%,#4f91ff 55%,#06b6d4 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.v3-btp{display:inline-flex;align-items:center;gap:8px;background:#0050cb;color:#fff;border:none;border-radius:999px;font-weight:800;font-size:13.5px;letter-spacing:.03em;cursor:pointer;
  box-shadow:0 4px 20px rgba(0,80,203,.38),inset 0 1px 0 rgba(255,255,255,.24);
  transition:all .32s cubic-bezier(.32,.72,0,1)}
.v3-btp:hover{background:#003da8;transform:translateY(-2px) scale(1.02);box-shadow:0 16px 48px rgba(0,80,203,.5)}
.v3-btp:active{transform:scale(.97)}
.v3-btp:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
.v3-btic{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.2);display:inline-flex;align-items:center;justify-content:center;transition:all .32s cubic-bezier(.32,.72,0,1);flex-shrink:0}
.v3-btp:hover .v3-btic{transform:translate(2px,-1px) scale(1.12);background:rgba(255,255,255,.3)}
.v3-btg{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.84);color:#1e3050;border:1px solid rgba(255,255,255,.96);border-radius:999px;font-weight:700;font-size:13.5px;letter-spacing:.03em;cursor:pointer;
  backdrop-filter:blur(16px);box-shadow:inset 0 1px 0 rgba(255,255,255,.98),0 2px 10px rgba(0,0,0,.08);
  transition:all .32s cubic-bezier(.32,.72,0,1)}
.v3-btg:hover{background:rgba(255,255,255,1);transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,1),0 12px 36px rgba(0,0,0,.12)}
.v3-btg:active{transform:scale(.97)}
.v3-btg-ic{width:28px;height:28px;border-radius:50%;background:rgba(0,80,203,.1);display:inline-flex;align-items:center;justify-content:center;transition:all .32s cubic-bezier(.32,.72,0,1);flex-shrink:0}
.v3-btg:hover .v3-btg-ic{transform:translate(2px,-1px) scale(1.12);background:rgba(0,80,203,.18)}
.v3-dotbg{background-image:radial-gradient(rgba(0,80,203,.06) 1px,transparent 1px);background-size:24px 24px}
@keyframes v3bpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.38;transform:scale(1.7)}}
.v3-bp{animation:v3bpulse 2.4s ease-in-out infinite}
@keyframes v3spin{to{transform:rotate(360deg)}}
.v3-spin{animation:v3spin .75s linear infinite}
@keyframes v3appear{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}
.v3-appear{animation:v3appear .38s cubic-bezier(.22,1,.36,1)}
@keyframes v3bgrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.v3-bgrow{transform-origin:left;animation:v3bgrow 1.9s cubic-bezier(.22,1,.36,1) forwards}
@keyframes v3scanv{0%{top:0;opacity:0}20%{opacity:1}80%{opacity:1}100%{top:100%;opacity:0}}
.v3-scanl{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#0050cb,transparent);box-shadow:0 0 16px rgba(0,80,203,.8);animation:v3scanv 1.2s ease-in-out infinite;pointer-events:none}
@keyframes v3kp{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.6);opacity:.32}}
@keyframes v3ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes v3arcin{from{stroke-dasharray:0 188}to{stroke-dasharray:171 188}}
.v3-arc{animation:v3arcin 1.4s cubic-bezier(.22,1,.36,1) .3s both}
@media(max-width:1024px){.v3-hmd{display:none!important}.v3-g1{grid-template-columns:1fr!important}.v3-g1r{grid-template-areas:unset!important;grid-template-columns:1fr!important;grid-template-rows:unset!important}}
@media(max-width:768px){.v3-nav{left:12px!important;right:12px!important;transform:none!important;border-radius:18px;padding:6px 8px 6px 14px}}
@media(prefers-reduced-motion:reduce){.v3-ba,.v3-bb,.v3-bc,.v3-scanl,.v3-arc{animation:none!important}}
`;

/* ── Hooks ──────────────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return scrolled;
}

/* ── Motion ─────────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const;

function SectionReveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.72, delay, ease }}
      style={style}
    >{children}</motion.div>
  );
}

/* ── Bank monograms ─────────────────────────────────────── */
const BANKS = [
  { name: 'VietBank', abbr: 'VB', bg: '#0050cb', fg: '#fff' },
  { name: 'MB Bank',  abbr: 'MB', bg: '#0f766e', fg: '#fff' },
  { name: 'TPBank',   abbr: 'TP', bg: '#7c3aed', fg: '#fff' },
  { name: 'VPBank',   abbr: 'VP', bg: '#16a34a', fg: '#fff' },
];

function BankMonogram({ bank }: { bank: typeof BANKS[0] }) {
  return (
    <div title={bank.name} style={{ display:'flex',alignItems:'center',gap:7,padding:'7px 15px',borderRadius:12,background:'rgba(255,255,255,.68)',border:'1px solid rgba(255,255,255,.9)',backdropFilter:'blur(12px)' }}>
      <svg width={22} height={22} viewBox="0 0 22 22" style={{ flexShrink:0 }}>
        <rect width={22} height={22} rx={5} fill={bank.bg} />
        <text x={11} y={15} textAnchor="middle" fontSize={8.5} fontWeight={900} fill={bank.fg} fontFamily="system-ui,sans-serif">{bank.abbr}</text>
      </svg>
      <span style={{ fontSize:12,fontWeight:700,color:'#3d5070',whiteSpace:'nowrap' }}>{bank.name}</span>
    </div>
  );
}

/* ── Background ─────────────────────────────────────────── */
function V3Bg() {
  return (
    <>
      <div className="v3-grain" />
      <div className="v3-aurora" />
      <div style={{ position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0 }}>
        <div className="v3-ba v3-blob" style={{ position:'absolute',width:800,height:800,top:-320,right:-200,background:'radial-gradient(circle at 40% 40%,rgba(79,145,255,.3),rgba(0,80,203,.14) 50%,transparent 75%)' }} />
        <div className="v3-bb v3-blob" style={{ position:'absolute',width:600,height:600,bottom:-200,left:-150,background:'radial-gradient(circle at 60% 60%,rgba(6,182,212,.22),rgba(0,80,203,.1) 50%,transparent 75%)' }} />
        <div style={{ position:'absolute',top:'44%',left:'48%',transform:'translate(-50%,-50%)' }}>
          <div className="v3-bc v3-blob" style={{ width:440,height:440,background:'radial-gradient(circle,rgba(139,92,246,.1),rgba(0,80,203,.06) 50%,transparent 75%)' }} />
        </div>
      </div>
    </>
  );
}

/* ── Floating island navbar ─────────────────────────────── */
function V3Navbar({ onLogin, onDocs, onLanding }: { onLogin:()=>void; onDocs:()=>void; onLanding:()=>void }) {
  const sc = useScrolled();
  return (
    <nav className={`v3-nav${sc ? ' sc' : ''}`}>
      <button onClick={onLanding} style={{ display:'flex',alignItems:'center',gap:9,border:'none',background:'transparent',cursor:'pointer',padding:'2px 6px 2px 0',borderRadius:999 }}>
        <div style={{ width:32,height:32,borderRadius:9,background:'linear-gradient(145deg,#0040b0,#1e6fff)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(0,64,176,.38),inset 0 1px 0 rgba(255,255,255,.24)',flexShrink:0 }}>
          <Icon name="security" style={{ fontSize:16,color:'white' }} />
        </div>
        <span style={{ fontSize:17,fontWeight:900,color:DG.primary,letterSpacing:'-0.04em' }}>DeepGuard</span>
      </button>

      <div style={{ width:1,height:18,background:'rgba(0,0,0,.1)',margin:'0 4px',flexShrink:0 }} />

      <button onClick={onDocs} className="v3-nav-link">
        <Icon name="menu_book" style={{ fontSize:14 }} />
        Docs
      </button>
      <button className="v3-nav-link" style={{ color:'#3d5070' }}>
        Giá cả
      </button>

      <button onClick={onLogin} className="v3-btp" style={{ padding:'9px 8px 9px 18px',fontSize:13 }}>
        Đăng nhập
        <span className="v3-btic"><Icon name="arrow_forward" style={{ fontSize:14,color:'white' }} /></span>
      </button>
    </nav>
  );
}

/* ── Detection preview (double-bezel) ───────────────────── */
function V3DetectionPreview() {
  const [phase, setPhase] = useState<'idle'|'scanning'|'done'>('idle');
  useEffect(() => { const t = setTimeout(() => setPhase('scanning'),900); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (phase !== 'scanning') return;
    const t = setTimeout(() => setPhase('done'),2200);
    return () => clearTimeout(t);
  }, [phase]);
  const isDone = phase === 'done';
  const kps: [number,number][] = [[64,46],[96,46],[80,62],[70,72],[90,72],[80,36],[80,90]];
  return (
    <div style={{ position:'relative',maxWidth:440,margin:'0 auto' }}>
      <div style={{ position:'absolute',inset:-60,background:'radial-gradient(ellipse 72% 62% at 50% 50%,rgba(0,80,203,.16),transparent)',borderRadius:'50%',filter:'blur(32px)',zIndex:0 }} />
      {/* double-bezel wrapper */}
      <div className="v3-dbl-outer" style={{ position:'relative',zIndex:1 }}>
        <div className="v3-dbl-inner">
          {/* title bar */}
          <div style={{ padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,.55)' }}>
            <div style={{ display:'flex',gap:6 }}>
              {['#ff5f57','#ffbd2e','#28c840'].map((c) => <span key={c} style={{ width:10,height:10,borderRadius:'50%',background:c,display:'block' }} />)}
            </div>
            <span style={{ fontSize:10,fontWeight:700,color:'#8498b4',letterSpacing:'.1em',textTransform:'uppercase' }}>DeepGuard · Detection</span>
            <div style={{ display:'flex',alignItems:'center',gap:5 }}>
              <span className="v3-bp" style={{ width:6,height:6,borderRadius:'50%',background:isDone ? '#22c55e' : '#fbbf24',display:'inline-block' }} />
              <span style={{ fontSize:10,fontWeight:700,color:isDone ? '#22c55e' : '#8498b4' }}>{isDone ? 'DONE' : 'PROCESSING'}</span>
            </div>
          </div>
          {/* face canvas */}
          <div style={{ position:'relative',background:'linear-gradient(155deg,rgba(224,242,254,.65),rgba(221,214,254,.45))',margin:12,borderRadius:14,overflow:'hidden',aspectRatio:'4/3' }}>
            <svg viewBox="0 0 160 120" fill="none" style={{ position:'absolute',inset:0,width:'100%',height:'100%' }}>
              <ellipse cx={80} cy={52} rx={34} ry={40} stroke="rgba(0,80,203,.25)" strokeWidth={1.5} fill="rgba(0,80,203,.04)" />
              <ellipse cx={64} cy={46} rx={7} ry={4.5} stroke="rgba(0,80,203,.3)" strokeWidth={1} fill="rgba(0,80,203,.08)" />
              <ellipse cx={96} cy={46} rx={7} ry={4.5} stroke="rgba(0,80,203,.3)" strokeWidth={1} fill="rgba(0,80,203,.08)" />
              <circle cx={64} cy={46} r={2} fill="rgba(0,80,203,.25)" />
              <circle cx={96} cy={46} r={2} fill="rgba(0,80,203,.25)" />
              <path d="M80 50 L76 62 Q80 65 84 62 Z" stroke="rgba(0,80,203,.18)" strokeWidth={1} fill="none" />
              <path d="M70 72 Q80 80 90 72" stroke="rgba(0,80,203,.22)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
              <path d="M20 120 Q28 100 46 94 L80 90 L114 94 Q132 100 140 120" stroke="rgba(0,80,203,.14)" strokeWidth={1.5} fill="rgba(0,80,203,.03)" />
              {kps.map(([x,y],i) => <circle key={i} cx={x} cy={y} r={2} fill="rgba(0,80,203,.5)" style={{ animation:`v3kp ${1.8+i*.2}s ease-in-out infinite`,animationDelay:`${i*.15}s` }} />)}
              <path d="M28 16 L16 16 L16 28" stroke="rgba(0,80,203,.5)" strokeWidth={2} strokeLinecap="round" fill="none" />
              <path d="M132 16 L144 16 L144 28" stroke="rgba(0,80,203,.5)" strokeWidth={2} strokeLinecap="round" fill="none" />
              <path d="M28 104 L16 104 L16 92" stroke="rgba(0,80,203,.5)" strokeWidth={2} strokeLinecap="round" fill="none" />
              <path d="M132 104 L144 104 L144 92" stroke="rgba(0,80,203,.5)" strokeWidth={2} strokeLinecap="round" fill="none" />
              <line x1={0} y1={60} x2={160} y2={60} stroke="rgba(0,80,203,.06)" strokeWidth={1} strokeDasharray="4 6" />
              <line x1={80} y1={0} x2={80} y2={120} stroke="rgba(0,80,203,.06)" strokeWidth={1} strokeDasharray="4 6" />
            </svg>
            {phase === 'scanning' && <div className="v3-scanl" />}
            {isDone && (
              <div className="v3-appear" style={{ position:'absolute',inset:0,background:'rgba(186,26,26,.82)',backdropFilter:'blur(4px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8 }}>
                <Icon name="dangerous" fill style={{ fontSize:40,color:'white' }} />
                <span style={{ color:'white',fontSize:15,fontWeight:900,letterSpacing:'.14em' }}>DEEPFAKE</span>
                <span style={{ color:'rgba(255,255,255,.75)',fontSize:11,fontWeight:600 }}>EfficientNet-B4 · DCT</span>
              </div>
            )}
          </div>
          {/* result row */}
          <div style={{ padding:'0 12px 12px' }}>
            {isDone ? (
              <div className="v3-appear" style={{ background:'rgba(186,26,26,.07)',borderRadius:11,padding:'11px 13px',border:'1px solid rgba(186,26,26,.15)' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                    <Icon name="dangerous" fill style={{ fontSize:13,color:DG.fake }} />
                    <span style={{ fontSize:11,fontWeight:800,color:DG.fake,textTransform:'uppercase',letterSpacing:'.08em' }}>Verdict: FAKE</span>
                  </div>
                  <span style={{ fontSize:17,fontWeight:900,color:DG.fake,letterSpacing:'-0.03em' }}>94.12%</span>
                </div>
                <div style={{ height:4,background:'rgba(0,0,0,.08)',borderRadius:99,overflow:'hidden' }}>
                  <div className="v3-bgrow" style={{ height:'100%',width:'94%',background:'linear-gradient(90deg,#ba1a1a,#ef4444)',borderRadius:99 }} />
                </div>
              </div>
            ) : (
              <div style={{ background:'rgba(0,80,203,.07)',borderRadius:11,padding:'11px 13px',border:'1px solid rgba(0,80,203,.12)',display:'flex',alignItems:'center',gap:10 }}>
                <span className="v3-spin" style={{ width:15,height:15,border:'2px solid rgba(0,80,203,.2)',borderTopColor:DG.primary,borderRadius:'50%',display:'inline-block' }} />
                <span style={{ fontSize:12,fontWeight:700,color:DG.primary }}>{phase==='idle' ? 'Khởi tạo model...' : 'Đang phân tích tần số DCT...'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* floating badges */}
      {isDone && (
        <div className="v3-lg v3-appear" style={{ position:'absolute',bottom:-16,right:-28,borderRadius:12,padding:'8px 14px',zIndex:2,display:'flex',alignItems:'center',gap:7,boxShadow:'0 8px 28px rgba(186,26,26,.2),inset 0 1px 0 rgba(255,255,255,.9)' }}>
          <div style={{ width:7,height:7,borderRadius:'50%',background:DG.fake }} />
          <span style={{ fontSize:12,fontWeight:800,color:DG.fake }}>FAKE</span>
          <span style={{ fontSize:12,fontWeight:500,color:'#8498b4',marginLeft:2 }}>94.12%</span>
        </div>
      )}
      <div className="v3-lg" style={{ position:'absolute',top:28,left:-32,borderRadius:12,padding:'7px 13px',zIndex:2,display:'flex',alignItems:'center',gap:6,boxShadow:'0 6px 22px rgba(0,0,0,.09),inset 0 1px 0 rgba(255,255,255,.9)' }}>
        <Icon name="speed" style={{ fontSize:13,color:DG.real }} />
        <span style={{ fontSize:12,fontWeight:800,color:DG.real }}>142ms</span>
      </div>
    </div>
  );
}

/* ── Hero ───────────────────────────────────────────────── */
function V3Hero({ onLogin, onDocs }: { onLogin:()=>void; onDocs:()=>void }) {
  const reduce = useReducedMotion();
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
  };
  return (
    <section style={{ minHeight:'100dvh',display:'flex',alignItems:'center',paddingTop:80,position:'relative' }}>
      <div className="v3-g1" style={{ maxWidth:1340,margin:'0 auto',padding:'64px 32px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center',width:'100%' }}>

        {/* Left: editorial text */}
        <motion.div variants={heroVariants} initial={reduce ? false : 'hidden'} animate="visible">
          {/* eyebrow badge */}
          <motion.div variants={itemVariants} style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'5px 13px',borderRadius:999,background:'rgba(0,80,203,.09)',border:'1px solid rgba(0,80,203,.2)',marginBottom:32 }}>
            <span className="v3-bp" style={{ width:7,height:7,borderRadius:'50%',background:'#22c55e',display:'inline-block' }} />
            <span style={{ fontSize:11,fontWeight:800,color:DG.primary,letterSpacing:'.1em',textTransform:'uppercase' }}>v2.1 · Sẵn sàng vận hành</span>
          </motion.div>

          {/* headline — massive display type */}
          <motion.h1 variants={itemVariants} style={{ fontSize:'clamp(64px,7.5vw,112px)',fontWeight:900,letterSpacing:'-0.065em',lineHeight:.98,color:'#08142a',marginBottom:28,textWrap:'balance' } as CSSProperties}>
            Phát hiện<br />Deepfake<br />
            <span className="v3-gt">cho eKYC</span>
          </motion.h1>

          {/* subtext */}
          <motion.p variants={itemVariants} style={{ fontSize:17.5,color:'#3d5070',lineHeight:1.78,marginBottom:40,maxWidth:'52ch',textWrap:'pretty' } as CSSProperties}>
            API bảo mật sinh trắc học cho ngân hàng Việt Nam. Tích hợp 1 dòng code, bảo vệ hàng triệu giao dịch.
          </motion.p>

          {/* CTAs — button-in-button pattern */}
          <motion.div variants={itemVariants} style={{ display:'flex',gap:12,flexWrap:'wrap',alignItems:'center' }}>
            <button onClick={onLogin} className="v3-btp" style={{ padding:'14px 10px 14px 26px',fontSize:14.5 }}>
              Dùng thử miễn phí
              <span className="v3-btic"><Icon name="arrow_forward" style={{ fontSize:16,color:'white' }} /></span>
            </button>
            <button onClick={onDocs} className="v3-btg" style={{ padding:'14px 10px 14px 24px',fontSize:14.5 }}>
              API Docs
              <span className="v3-btg-ic"><Icon name="code" style={{ fontSize:16,color:DG.primary }} /></span>
            </button>
          </motion.div>

          {/* social proof line */}
          <motion.div variants={itemVariants} style={{ display:'flex',alignItems:'center',gap:10,marginTop:32,flexWrap:'wrap' }}>
            <div style={{ display:'flex',alignItems:'center',gap:-6 }}>
              {['#0050cb','#0f766e','#7c3aed','#16a34a'].map((c,i) => (
                <div key={c} style={{ width:26,height:26,borderRadius:'50%',background:c,border:'2px solid white',display:'flex',alignItems:'center',justifyContent:'center',marginLeft:i>0?-8:0,zIndex:4-i,position:'relative' }}>
                  <span style={{ fontSize:8,fontWeight:900,color:'white' }}>{['VB','MB','TP','VP'][i]}</span>
                </div>
              ))}
            </div>
            <span style={{ fontSize:12.5,color:'#8498b4',fontWeight:600 }}>Được tin dùng bởi 4 ngân hàng hàng đầu</span>
          </motion.div>
        </motion.div>

        {/* Right: detection preview */}
        <div className="v3-hmd" style={{ display:'flex',justifyContent:'center',alignItems:'center' }}>
          <V3DetectionPreview />
        </div>
      </div>
    </section>
  );
}

/* ── Trust strip — raw horizontal numbers ───────────────── */
function V3TrustStrip() {
  const stats = [
    { value:'1M+', label:'Requests mỗi ngày' },
    { value:'99.9%', label:'Uptime SLA' },
    { value:'<150ms', label:'Latency P99' },
    { value:'0.91', label:'AUC Score' },
  ];
  return (
    <SectionReveal>
      <section style={{ position:'relative',zIndex:1,maxWidth:1200,margin:'0 auto',padding:'0 32px 88px' }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,borderTop:'1px solid rgba(0,80,203,.1)',borderBottom:'1px solid rgba(0,80,203,.1)',padding:'36px 0' }}>
          {stats.map((s,i) => (
            <div key={s.label} style={{ textAlign:'center',padding:'0 20px',borderRight:i<stats.length-1?'1px solid rgba(0,80,203,.09)':'none' }}>
              <div style={{ fontSize:'clamp(34px,4vw,52px)',fontWeight:900,color:DG.primary,letterSpacing:'-0.06em',lineHeight:1,fontVariantNumeric:'tabular-nums' } as CSSProperties}>{s.value}</div>
              <div style={{ fontSize:11.5,color:'#8498b4',fontWeight:700,marginTop:8,textTransform:'uppercase',letterSpacing:'.09em' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:12,justifyContent:'center',marginTop:28,flexWrap:'wrap' }}>
          <span style={{ fontSize:10.5,fontWeight:700,color:'#b0bfd1',textTransform:'uppercase',letterSpacing:'.12em' }}>Tích hợp tại</span>
          {BANKS.map((bank) => <BankMonogram key={bank.name} bank={bank} />)}
        </div>
      </section>
    </SectionReveal>
  );
}

/* ── Ticker ─────────────────────────────────────────────── */
function V3Ticker() {
  const items = [
    { label:'AUC Score', value:'0.91', icon:'analytics' },
    { label:'Latency', value:'<150ms', icon:'speed' },
    { label:'FPR', value:'≤5%', icon:'verified_user' },
    { label:'API Uptime', value:'99.9%', icon:'cloud_done' },
    { label:'Requests/ngày', value:'1M+', icon:'bolt' },
    { label:'Model', value:'EfficientNet-B4', icon:'psychology' },
    { label:'Format', value:'JSON REST', icon:'code' },
    { label:'Heatmap', value:'DCT', icon:'local_fire_department' },
  ];
  const all = [...items, ...items];
  return (
    <div style={{ position:'relative',zIndex:1,overflow:'hidden',borderTop:'1px solid rgba(255,255,255,.62)',borderBottom:'1px solid rgba(255,255,255,.62)',background:'rgba(255,255,255,.4)',backdropFilter:'blur(20px)',marginBottom:96 }}>
      <div style={{ position:'absolute',left:0,top:0,bottom:0,width:120,background:'linear-gradient(90deg,rgba(235,243,255,1),transparent)',zIndex:2,pointerEvents:'none' }} />
      <div style={{ position:'absolute',right:0,top:0,bottom:0,width:120,background:'linear-gradient(-90deg,rgba(235,243,255,1),transparent)',zIndex:2,pointerEvents:'none' }} />
      <div style={{ display:'flex',width:'max-content',animation:'v3ticker 36s linear infinite' }}>
        {all.map((item,i) => (
          <div key={i} style={{ display:'flex',alignItems:'center',gap:8,padding:'13px 30px',borderRight:'1px solid rgba(255,255,255,.55)',whiteSpace:'nowrap' }}>
            <Icon name={item.icon} style={{ fontSize:14,color:DG.primary }} />
            <span style={{ fontSize:11,fontWeight:700,color:'#8498b4',textTransform:'uppercase',letterSpacing:'.08em' }}>{item.label}</span>
            <span style={{ fontSize:14,fontWeight:900,color:DG.primary,letterSpacing:'-0.02em',marginLeft:4 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Features bento ─────────────────────────────────────── */
const CODE_SNIP = `response = requests.post(
  "https://api.deepguard.io/v1/detect",
  headers={"X-API-Key": "dg_***"},
  files={"image": open("face.jpg","rb")}
)`;

function V3Features() {
  const { ref, inView } = useInView(0.08);
  return (
    <section ref={ref} style={{ position:'relative',zIndex:1,maxWidth:1340,margin:'0 auto',padding:'0 32px 100px' }}>
      <SectionReveal>
        <div style={{ marginBottom:56 }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'4px 12px',borderRadius:999,background:'rgba(0,80,203,.08)',border:'1px solid rgba(0,80,203,.16)',marginBottom:16 }}>
            <span style={{ fontSize:10,fontWeight:800,color:DG.primary,textTransform:'uppercase',letterSpacing:'.12em' }}>Tính năng</span>
          </div>
          <h2 style={{ fontSize:'clamp(30px,3.8vw,52px)',fontWeight:900,letterSpacing:'-0.05em',color:'#08142a',marginBottom:12,textWrap:'balance',lineHeight:1.05 } as CSSProperties}>Tại sao chọn DeepGuard?</h2>
          <p style={{ color:'#3d5070',maxWidth:480,fontSize:16.5,lineHeight:1.72 }}>Công nghệ phát hiện deepfake tốc độ cao, giải thích được, production-ready.</p>
        </div>
      </SectionReveal>

      <div className="v3-g1r" style={{ display:'grid',gridTemplateAreas:'"api api heat" "ekyc stat heat"',gridTemplateColumns:'1fr 1fr 1.15fr',gridTemplateRows:'auto auto',gap:16 }}>
        {/* API cell */}
        <motion.div initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true,amount:0.1 }} transition={{ duration:0.6,ease }}
          className="v3-lg v3-lg-h" style={{ gridArea:'api',borderRadius:22,padding:36,overflow:'hidden',position:'relative' }}>
          <div style={{ position:'absolute',top:0,right:0,width:240,height:240,background:'radial-gradient(circle at 80% 20%,rgba(0,80,203,.08),transparent 72%)',pointerEvents:'none' }} />
          <div style={{ width:52,height:52,borderRadius:14,background:'rgba(0,80,203,.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,boxShadow:'inset 0 1px 0 rgba(255,255,255,.8)' }}>
            <Icon name="api" style={{ fontSize:26,color:DG.primary }} />
          </div>
          <h3 style={{ fontSize:22,fontWeight:900,color:'#08142a',marginBottom:9,letterSpacing:'-0.032em' }}>Detection API</h3>
          <p style={{ fontSize:14.5,color:'#3d5070',lineHeight:1.7,marginBottom:22,maxWidth:400 }}>1 API call trả về verdict, confidence score và metadata. Không cần SDK, không cần on-prem.</p>
          <div style={{ background:'rgba(14,17,23,.93)',borderRadius:14,overflow:'hidden',boxShadow:'0 10px 28px rgba(0,0,0,.2)' }}>
            <div style={{ padding:'9px 13px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',gap:5,alignItems:'center' }}>
              {['#ff5f57','#ffbd2e','#28c840'].map((c) => <span key={c} style={{ width:9,height:9,borderRadius:'50%',background:c,display:'block' }} />)}
              <span style={{ fontSize:11,color:'#64748b',fontFamily:'Fira Code,monospace',marginLeft:6 }}>main.py</span>
            </div>
            <pre style={{ padding:15,fontSize:12,fontFamily:'Fira Code,monospace',lineHeight:1.75,color:'#e2e8f0',margin:0,overflowX:'auto' }}>{CODE_SNIP}</pre>
          </div>
          <div style={{ display:'flex',gap:7,marginTop:14,flexWrap:'wrap' }}>
            {['REST · JSON','<150ms','JPG · PNG · WebP'].map((t) => (
              <span key={t} style={{ padding:'4px 10px',borderRadius:999,background:'rgba(0,80,203,.09)',border:'1px solid rgba(0,80,203,.15)',fontSize:11,fontWeight:700,color:DG.primary }}>{t}</span>
            ))}
          </div>
        </motion.div>

        {/* DCT Heatmap cell */}
        <motion.div initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true,amount:0.1 }} transition={{ duration:0.6,delay:0.08,ease }}
          className="v3-lg" style={{ gridArea:'heat',borderRadius:22,padding:'34px 30px',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative' }}>
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(160deg,rgba(237,108,2,.04) 0%,transparent 60%)',pointerEvents:'none' }} />
          <div style={{ width:52,height:52,borderRadius:14,background:'rgba(237,108,2,.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,boxShadow:'inset 0 1px 0 rgba(255,255,255,.8)' }}>
            <Icon name="local_fire_department" style={{ fontSize:26,color:DG.uncertain }} />
          </div>
          <h3 style={{ fontSize:22,fontWeight:900,color:'#08142a',marginBottom:9,letterSpacing:'-0.032em' }}>DCT Heatmap</h3>
          <p style={{ fontSize:14.5,color:'#3d5070',lineHeight:1.7,marginBottom:22 }}>Explainable AI — visualise vùng ảnh mà model phát hiện bất thường qua phân tích tần số DCT.</p>
          <div style={{ flex:1,borderRadius:14,overflow:'hidden',position:'relative',minHeight:180,background:'linear-gradient(135deg,#e0f2fe,#fef3c7)' }}>
            <svg viewBox="0 0 200 160" fill="none" style={{ position:'absolute',inset:0,width:'100%',height:'100%' }}>
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
              <rect x={0} y={0} width={200} height={160} fill="url(#v3h1)" style={{ mixBlendMode:'multiply' }} />
              <rect x={0} y={0} width={200} height={160} fill="url(#v3h2)" style={{ mixBlendMode:'multiply' }} />
            </svg>
            <div style={{ position:'absolute',bottom:10,right:10,display:'flex',flexDirection:'column',gap:3 }}>
              {([['#ba1a1a','High'],['#ed6c02','Mid'],['#93c5fd','Low']] as [string,string][]).map(([c,l]) => (
                <div key={l} style={{ display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,.88)',backdropFilter:'blur(8px)',borderRadius:5,padding:'2px 7px' }}>
                  <span style={{ width:7,height:7,borderRadius:2,background:c,display:'block' }} />
                  <span style={{ fontSize:9,fontWeight:700,color:'#475569' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* eKYC cell */}
        <motion.div initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true,amount:0.1 }} transition={{ duration:0.6,delay:0.16,ease }}
          className="v3-lg v3-lg-h" style={{ gridArea:'ekyc',borderRadius:22,padding:'28px 28px',position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(145deg,rgba(46,125,50,.04) 0%,transparent 60%)',pointerEvents:'none' }} />
          <div style={{ width:48,height:48,borderRadius:13,background:'rgba(46,125,50,.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:15,boxShadow:'inset 0 1px 0 rgba(255,255,255,.8)' }}>
            <Icon name="shield" style={{ fontSize:24,color:DG.real }} />
          </div>
          <h3 style={{ fontSize:18,fontWeight:900,color:'#08142a',marginBottom:8,letterSpacing:'-0.028em' }}>eKYC Ready</h3>
          <p style={{ fontSize:14,color:'#3d5070',lineHeight:1.65 }}>Threshold calibrated FPR &lt;= 5% theo TT17/2024/TT-NHNN.</p>
          <div style={{ marginTop:13,display:'flex',gap:6,flexWrap:'wrap' }}>
            {['FPR ≤5%','AML ready','FATF'].map((t) => (
              <span key={t} style={{ padding:'4px 9px',borderRadius:999,background:'rgba(46,125,50,.09)',border:'1px solid rgba(46,125,50,.18)',fontSize:11,fontWeight:700,color:DG.real }}>{t}</span>
            ))}
          </div>
        </motion.div>

        {/* AUC stat cell */}
        <motion.div initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true,amount:0.1 }} transition={{ duration:0.6,delay:0.24,ease }}
          className="v3-lg" style={{ gridArea:'stat',borderRadius:22,padding:'24px 26px',display:'flex',flexDirection:'column',justifyContent:'center',background:'linear-gradient(145deg,rgba(0,80,203,.07) 0%,rgba(255,255,255,.72) 100%)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:14 }}>
            <div style={{ position:'relative',flexShrink:0 }}>
              <svg viewBox="0 0 80 80" width={72} height={72}>
                <circle cx={40} cy={40} r={30} stroke="rgba(0,80,203,.1)" strokeWidth={6} fill="none" />
                <circle className={inView ? 'v3-arc' : ''} cx={40} cy={40} r={30} stroke={DG.primary} strokeWidth={6} fill="none" strokeDasharray="0 188" strokeLinecap="round" transform="rotate(-90 40 40)" />
              </svg>
              <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <span style={{ fontSize:14,fontWeight:900,color:DG.primary,letterSpacing:'-0.04em' }}>0.91</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:'#8498b4',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3 }}>AUC Score</div>
              <div style={{ fontSize:11.5,color:'#3d5070',lineHeight:1.55 }}>EfficientNet-B4<br />+ DCT Stream</div>
            </div>
          </div>
          <div style={{ height:1,background:'rgba(0,0,0,.07)',marginBottom:14 }} />
          <div>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
              <span style={{ fontSize:10,fontWeight:700,color:'#8498b4',textTransform:'uppercase',letterSpacing:'.07em' }}>Latency</span>
              <span style={{ fontSize:12,fontWeight:900,color:DG.real,letterSpacing:'-0.03em' }}>&lt;150ms</span>
            </div>
            <div style={{ height:4,background:'rgba(0,0,0,.07)',borderRadius:99,overflow:'hidden' }}>
              <div style={{ height:'100%',width:'72%',background:`linear-gradient(90deg,${DG.real},#4ade80)`,borderRadius:99 }} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── How it works ───────────────────────────────────────── */
function V3HowItWorks() {
  const steps = [
    { n:'01', icon:'upload_file', title:'Upload ảnh', desc:'Gửi ảnh chân dung qua REST API. Hỗ trợ JPG, PNG, WebP ở mọi độ phân giải.', tags:['REST · JSON','JPG · PNG · WebP'], color:DG.primary },
    { n:'02', icon:'psychology', title:'AI phân tích', desc:'EfficientNet-B4 + DCT Stream phân tích tần số không gian trong dưới 150ms.', tags:['DCT Frequency','<150ms'], color:DG.uncertain },
    { n:'03', icon:'verified', title:'Nhận verdict', desc:'REAL / FAKE + confidence score chi tiết. DCT heatmap tuỳ chọn cho forensics.', tags:['Confidence Score','Heatmap'], color:DG.real },
  ];
  return (
    <section style={{ position:'relative',zIndex:1,maxWidth:1040,margin:'0 auto',padding:'0 32px 100px' }}>
      <SectionReveal>
        <div style={{ marginBottom:60 }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'4px 12px',borderRadius:999,background:'rgba(0,80,203,.08)',border:'1px solid rgba(0,80,203,.16)',marginBottom:16 }}>
            <span style={{ fontSize:10,fontWeight:800,color:DG.primary,textTransform:'uppercase',letterSpacing:'.12em' }}>Tích hợp</span>
          </div>
          <h2 style={{ fontSize:'clamp(30px,3.8vw,52px)',fontWeight:900,letterSpacing:'-0.05em',color:'#08142a',marginBottom:12,lineHeight:1.05 }}>3 bước, 1 API call</h2>
          <p style={{ color:'#3d5070',maxWidth:400,fontSize:16.5,lineHeight:1.72 }}>Tích hợp trong 30 giây. Không SDK, không cấu hình phức tạp.</p>
        </div>
      </SectionReveal>
      <div style={{ display:'flex',flexDirection:'column',position:'relative' }}>
        {/* vertical accent line */}
        <div style={{ position:'absolute',left:29,top:0,bottom:0,width:2,background:'linear-gradient(180deg,rgba(0,80,203,.12),rgba(0,80,203,.04))',borderRadius:99 }} />
        {steps.map((step,i) => (
          <motion.div key={step.n}
            initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true,amount:0.2 }}
            transition={{ duration:0.62,delay:i*.12,ease }}
            style={{ display:'flex',alignItems:'flex-start',gap:28,padding:'36px 0',borderBottom:i<steps.length-1 ? '1px solid rgba(0,80,203,.09)' : 'none' }}
          >
            <div style={{ flexShrink:0,width:60,textAlign:'right' }}>
              <span style={{ fontSize:48,fontWeight:900,color:step.color,opacity:.18,letterSpacing:'-0.05em',lineHeight:1,fontVariantNumeric:'tabular-nums',display:'block' } as CSSProperties}>{step.n}</span>
            </div>
            <div style={{ flexShrink:0,width:52,height:52,borderRadius:15,background:`${step.color}14`,border:`1px solid ${step.color}24`,display:'flex',alignItems:'center',justifyContent:'center',marginTop:4 }}>
              <Icon name={step.icon} style={{ fontSize:24,color:step.color }} />
            </div>
            <div style={{ flex:1,paddingTop:6 }}>
              <h3 style={{ fontSize:20,fontWeight:900,color:'#08142a',marginBottom:8,letterSpacing:'-0.032em' }}>{step.title}</h3>
              <p style={{ fontSize:15,color:'#3d5070',lineHeight:1.72,marginBottom:14,maxWidth:'58ch' }}>{step.desc}</p>
              <div style={{ display:'flex',gap:7,flexWrap:'wrap' }}>
                {step.tags.map((tag) => (
                  <span key={tag} style={{ padding:'4px 11px',borderRadius:999,background:`${step.color}09`,border:`1px solid ${step.color}1a`,fontSize:11,fontWeight:700,color:step.color }}>{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Pricing ─────────────────────────────────────────────── */
interface Plan { name:string; sub:string; price:string; per?:string; feats:string[]; cta:string; star:boolean }

function V3Pricing({ onLogin }: { onLogin:()=>void }) {
  const plans: Plan[] = [
    { name:'Starter', sub:'Dùng thử và tích hợp', price:'Miễn phí', feats:['100 req/tháng','Detection API','Verdict + Confidence','Email support'], cta:'Bắt đầu', star:false },
    { name:'Pro', sub:'Production workload', price:'$99', per:'/tháng', feats:['10,000 req/tháng','Detection + DCT Heatmap','Priority support','SLA 99.9%','Webhooks'], cta:'Chọn Pro', star:true },
    { name:'Enterprise', sub:'Ngân hàng và tổ chức', price:'Custom', feats:['Unlimited requests','On-prem deployment','Custom threshold','Dedicated manager','Audit log'], cta:'Liên hệ sales', star:false },
  ];
  return (
    <section style={{ position:'relative',zIndex:1,maxWidth:1200,margin:'0 auto',padding:'0 32px 100px' }}>
      <SectionReveal>
        <div style={{ marginBottom:56 }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'4px 12px',borderRadius:999,background:'rgba(0,80,203,.08)',border:'1px solid rgba(0,80,203,.16)',marginBottom:16 }}>
            <span style={{ fontSize:10,fontWeight:800,color:DG.primary,textTransform:'uppercase',letterSpacing:'.12em' }}>Bảng giá</span>
          </div>
          <h2 style={{ fontSize:'clamp(30px,3.8vw,52px)',fontWeight:900,letterSpacing:'-0.05em',color:'#08142a',marginBottom:12,lineHeight:1.05 }}>Bắt đầu miễn phí, mở rộng khi scale.</h2>
        </div>
      </SectionReveal>
      <div className="v3-g1" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,alignItems:'start' }}>
        {plans.map((p,i) => {
          const isStar = p.star;
          return (
            <motion.div key={p.name}
              initial={{ opacity:0,y:32 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true,amount:0.14 }}
              transition={{ duration:0.65,delay:i*.1,ease }}
              className={!isStar ? 'v3-lg v3-lg-h' : ''}
              style={{
                borderRadius:22, padding:'32px 28px', display:'flex', flexDirection:'column', position:'relative',
                ...(isStar ? {
                  background:'linear-gradient(155deg,#0040b0 0%,#0050cb 55%,#1a6ee8 100%)',
                  boxShadow:'0 24px 72px rgba(0,80,203,.4),0 8px 28px rgba(0,80,203,.24),inset 0 1.5px 0 rgba(255,255,255,.24)',
                  border:'1px solid rgba(255,255,255,.22)',
                  transform:'translateY(-10px)',
                } : {}),
              }}
            >
              {isStar && (
                <div style={{ position:'absolute',top:-13,left:'50%',transform:'translateX(-50%)',background:'white',color:DG.primary,fontSize:10,fontWeight:900,letterSpacing:'.12em',textTransform:'uppercase',padding:'4px 15px',borderRadius:999,boxShadow:'0 4px 16px rgba(0,0,0,.13)',whiteSpace:'nowrap' }}>Phổ biến nhất</div>
              )}
              <div style={{ marginBottom:22 }}>
                <div style={{ fontSize:18,fontWeight:900,color:isStar?'white':'#08142a',letterSpacing:'-0.03em',marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:13.5,color:isStar?'rgba(255,255,255,.62)':'#3d5070' }}>{p.sub}</div>
              </div>
              <div style={{ marginBottom:24 }}>
                <span style={{ fontSize:44,fontWeight:900,color:isStar?'white':'#08142a',letterSpacing:'-0.055em',lineHeight:1 }}>{p.price}</span>
                {p.per && <span style={{ fontSize:14,color:isStar?'rgba(255,255,255,.58)':'#8498b4',fontWeight:500 }}>{p.per}</span>}
              </div>
              <ul style={{ listStyle:'none',padding:0,margin:'0 0 28px',flex:1,display:'flex',flexDirection:'column',gap:10 }}>
                {p.feats.map((f) => (
                  <li key={f} style={{ display:'flex',alignItems:'flex-start',gap:9,fontSize:14,color:isStar?'rgba(255,255,255,.84)':'#3d5070' }}>
                    <Icon name="check_circle" fill style={{ fontSize:16,color:isStar?'rgba(255,255,255,.68)':DG.real,flexShrink:0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={onLogin}
                style={isStar ? {
                  width:'100%',justifyContent:'center',padding:'13px 16px',fontSize:13.5,display:'inline-flex',alignItems:'center',gap:8,
                  background:'rgba(255,255,255,.94)',color:DG.primary,border:'none',borderRadius:999,fontWeight:800,cursor:'pointer',
                  boxShadow:'0 4px 18px rgba(0,0,0,.14)',transition:'all .32s cubic-bezier(.32,.72,0,1)',
                } : {
                  width:'100%',justifyContent:'center',padding:'13px 16px',fontSize:13.5,display:'inline-flex',alignItems:'center',gap:8,
                  borderRadius:999,border:'1.5px solid rgba(0,80,203,.22)',color:DG.primary,background:'rgba(255,255,255,.7)',fontWeight:700,cursor:'pointer',
                  transition:'all .32s cubic-bezier(.32,.72,0,1)',
                }}
              >{p.cta}</button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ── CTA bottom — inverted dark blue section ─────────────── */
function V3CTABottom({ onLogin }: { onLogin:()=>void }) {
  return (
    <SectionReveal>
      <section style={{ position:'relative',zIndex:1,overflow:'hidden',background:'linear-gradient(155deg,#001a5c 0%,#003db5 45%,#0050cb 100%)' }}>
        {/* dot grid overlay */}
        <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(255,255,255,.06) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none' }} />
        {/* ambient orbs */}
        <div style={{ position:'absolute',top:-140,right:-120,width:480,height:480,borderRadius:'50%',background:'radial-gradient(circle,rgba(79,145,255,.22),transparent 70%)',filter:'blur(60px)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:-100,left:-80,width:360,height:360,borderRadius:'50%',background:'radial-gradient(circle,rgba(6,182,212,.18),transparent 70%)',filter:'blur(60px)',pointerEvents:'none' }} />

        <div style={{ position:'relative',maxWidth:820,margin:'0 auto',padding:'108px 32px',textAlign:'center',zIndex:1 }}>
          {/* icon */}
          <div style={{ width:68,height:68,borderRadius:20,background:'rgba(255,255,255,.14)',border:'1px solid rgba(255,255,255,.24)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 32px',boxShadow:'inset 0 1px 0 rgba(255,255,255,.3)' }}>
            <Icon name="rocket_launch" style={{ fontSize:32,color:'white' }} />
          </div>

          <h2 style={{ fontSize:'clamp(32px,4.5vw,56px)',fontWeight:900,letterSpacing:'-0.055em',color:'white',marginBottom:16,lineHeight:1.04,textWrap:'balance' } as CSSProperties}>
            Bắt đầu tích hợp ngay
          </h2>
          <p style={{ color:'rgba(255,255,255,.68)',maxWidth:480,margin:'0 auto 44px',fontSize:17,lineHeight:1.75 }}>
            Nhận API key trong 30 giây. Không cần thẻ tín dụng.
          </p>

          {/* button-in-button on dark bg */}
          <div style={{ display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap' }}>
            <button onClick={onLogin} style={{
              display:'inline-flex',alignItems:'center',gap:8,padding:'15px 12px 15px 28px',
              background:'white',color:DG.primary,border:'none',borderRadius:999,
              fontWeight:900,fontSize:15,cursor:'pointer',letterSpacing:'.01em',
              boxShadow:'0 8px 32px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,1)',
              transition:'all .32s cubic-bezier(.32,.72,0,1)',fontFamily:'inherit',
            }}
              onMouseEnter={(e)=>{ e.currentTarget.style.transform='translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow='0 16px 48px rgba(0,0,0,.28)'; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,1)'; }}
            >
              Dùng thử miễn phí
              <span style={{ width:32,height:32,borderRadius:'50%',background:'rgba(0,80,203,.12)',display:'inline-flex',alignItems:'center',justifyContent:'center' }}>
                <Icon name="arrow_forward" style={{ fontSize:17,color:DG.primary }} />
              </span>
            </button>
            <button onClick={()=>{}} style={{
              display:'inline-flex',alignItems:'center',gap:8,padding:'15px 24px',
              background:'rgba(255,255,255,.12)',color:'white',border:'1px solid rgba(255,255,255,.24)',borderRadius:999,
              fontWeight:700,fontSize:15,cursor:'pointer',letterSpacing:'.01em',backdropFilter:'blur(12px)',
              transition:'all .32s cubic-bezier(.32,.72,0,1)',fontFamily:'inherit',
            }}
              onMouseEnter={(e)=>{ e.currentTarget.style.background='rgba(255,255,255,.2)'; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.background='rgba(255,255,255,.12)'; }}
            >
              <Icon name="calendar_today" style={{ fontSize:17,color:'rgba(255,255,255,.8)' }} />
              Đặt demo
            </button>
          </div>

          {/* trust badges */}
          <div style={{ display:'flex',justifyContent:'center',gap:28,marginTop:36,flexWrap:'wrap' }}>
            {([['verified_user','TT17/2024'],['lock','SOC2 Ready'],['speed','99.9% SLA']] as [string,string][]).map(([icon,label]) => (
              <div key={label} style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:700,color:'rgba(255,255,255,.5)' }}>
                <Icon name={icon} style={{ fontSize:14,color:'rgba(255,255,255,.4)' }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}

/* ── Footer ──────────────────────────────────────────────── */
function V3Footer({ onDocs, onLogin }: { onDocs:()=>void; onLogin:()=>void }) {
  return (
    <footer style={{ position:'relative',zIndex:1,background:'rgba(255,255,255,.5)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,.62)' }}>
      <div style={{ maxWidth:1340,margin:'0 auto',padding:'20px 32px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ width:28,height:28,borderRadius:8,background:DG.primary,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Icon name="security" style={{ fontSize:14,color:'white' }} />
          </div>
          <span style={{ fontSize:13,color:'#64748b',fontWeight:600 }}>© 2025 DeepGuard</span>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:4 }}>
          {([['Tính năng',onDocs],['Giá cả',onLogin],['API Docs',onDocs],['Liên hệ',onLogin]] as [string,()=>void][]).map(([label,fn]) => (
            <button key={label} onClick={fn} style={{ background:'transparent',border:'none',color:'#64748b',fontSize:13,fontWeight:500,cursor:'pointer',padding:'4px 10px',borderRadius:8,transition:'color .18s ease',fontFamily:'inherit' }}
              onMouseEnter={(e)=>{ e.currentTarget.style.color=DG.primary; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.color='#64748b'; }}
            >{label}</button>
          ))}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          {(['TT17/2024','SOC2','FATF'] as string[]).map((tag) => (
            <span key={tag} style={{ padding:'2px 8px',borderRadius:6,background:'rgba(0,80,203,.07)',border:'1px solid rgba(0,80,203,.12)',fontSize:10,fontWeight:700,color:DG.primary,letterSpacing:'.06em' }}>{tag}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ── LANDING PAGE ────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigation((s) => s.navigate);
  const onLogin   = () => navigate('login');
  const onRegister = () => navigate('register');
  const onDocs    = () => navigate('docs');
  const onLanding = () => navigate('landing');

  return (
    <div style={{ background:'#EBF3FF',minHeight:'100vh',position:'relative',fontFamily:"system-ui,'Segoe UI',sans-serif",color:'#08142a',overflowX:'hidden' }}>
      <style>{V3_CSS}</style>
      <V3Bg />
      <div style={{ position:'relative',zIndex:2 }}>
        <V3Navbar onLogin={onLogin} onDocs={onDocs} onLanding={onLanding} />
        <V3Hero onLogin={onRegister} onDocs={onDocs} />
        <V3TrustStrip />
        <V3Ticker />
        <V3Features />
        <V3HowItWorks />
        <V3Pricing onLogin={onRegister} />
        <V3CTABottom onLogin={onRegister} />
        <V3Footer onDocs={onDocs} onLogin={onLogin} />
      </div>
    </div>
  );
}
