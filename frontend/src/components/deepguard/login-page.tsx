'use client';

import { useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';
import { authLogin, authMe } from '@/lib/api';
import { defaultPageFor, type Role } from '@/lib/rbac';
import { Icon } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';

/* ── Scoped CSS ─────────────────────────────────────────── */
const V3_CSS = `
/* ── Premium inputs ── */
.lg-inp{width:100%;padding:13px 14px 13px 44px;background:#f8fafc;border:1.5px solid rgba(0,0,0,.08);border-radius:13px;font-size:14.5px;font-weight:500;color:#08142a;transition:all .32s cubic-bezier(.32,.72,0,1);outline:none;font-family:inherit}
.lg-inp::placeholder{color:#b0bfd1}
.lg-inp:focus{background:#fff;border-color:#0050cb;box-shadow:0 0 0 5px rgba(0,80,203,.09)}
.lg-inp.lg-err{border-color:#ba1a1a;box-shadow:0 0 0 5px rgba(186,26,26,.08)}

/* ── Submit — pill + button-in-button ── */
.lg-btn{display:inline-flex;align-items:center;gap:10px;background:#0050cb;color:#fff;border:none;border-radius:999px;font-weight:800;font-size:14.5px;letter-spacing:.025em;cursor:pointer;box-shadow:0 4px 20px rgba(0,80,203,.4),inset 0 1px 0 rgba(255,255,255,.24);transition:all .32s cubic-bezier(.32,.72,0,1);font-family:inherit}
.lg-btn:hover{background:#003da8;transform:translateY(-2px) scale(1.015);box-shadow:0 16px 48px rgba(0,80,203,.52)}
.lg-btn:active{transform:scale(.97)}
.lg-btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
.lg-btn-ic{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.2);display:inline-flex;align-items:center;justify-content:center;transition:all .32s cubic-bezier(.32,.72,0,1);flex-shrink:0}
.lg-btn:hover .lg-btn-ic{transform:translate(2px,-1px) scale(1.12);background:rgba(255,255,255,.3)}

/* ── SSO ghost — pill ── */
.lg-sso{display:inline-flex;align-items:center;gap:9px;background:rgba(0,0,0,.03);color:#1e3050;border:1.5px solid rgba(0,0,0,.09);border-radius:999px;font-weight:700;font-size:14px;cursor:pointer;transition:all .32s cubic-bezier(.32,.72,0,1);font-family:inherit}
.lg-sso:hover{background:rgba(0,0,0,.06);transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.08)}
.lg-sso:active{transform:scale(.97)}

/* ── Left panel blob animations ── */
.lg-ba{animation:lgda 22s ease-in-out infinite}
.lg-bb{animation:lgdb 28s ease-in-out infinite;animation-delay:-11s}
.lg-bc{animation:lgdc 16s ease-in-out infinite;animation-delay:-5s}
@keyframes lgda{0%,100%{transform:translate(0,0)scale(1)}40%{transform:translate(24px,-36px)scale(1.07)}70%{transform:translate(-18px,22px)scale(.95)}}
@keyframes lgdb{0%,100%{transform:translate(0,0)scale(1.02)}45%{transform:translate(-22px,18px)scale(.95)}75%{transform:translate(16px,-20px)scale(1.06)}}
@keyframes lgdc{0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(18px,24px)scale(1.1)}}

/* ── Staggered entry ── */
@keyframes lgfade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.lg-s0{animation:lgfade .52s cubic-bezier(.22,1,.36,1) .08s both}
.lg-s1{animation:lgfade .52s cubic-bezier(.22,1,.36,1) .18s both}
.lg-s2{animation:lgfade .52s cubic-bezier(.22,1,.36,1) .28s both}
.lg-s3{animation:lgfade .52s cubic-bezier(.22,1,.36,1) .38s both}
.lg-s4{animation:lgfade .52s cubic-bezier(.22,1,.36,1) .46s both}

/* ── Shake on error ── */
@keyframes lgshake{0%,100%{transform:translateX(0)}15%{transform:translateX(-7px)}30%{transform:translateX(7px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}75%{transform:translateX(-3px)}90%{transform:translateX(3px)}}
.lg-shake{animation:lgshake .5s cubic-bezier(.36,.07,.19,.97)}

/* ── Misc ── */
@keyframes v3spin{to{transform:rotate(360deg)}}
.v3-spin{animation:v3spin .75s linear infinite}
@keyframes v3appear{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}
.v3-appear{animation:v3appear .38s cubic-bezier(.22,1,.36,1)}
@keyframes v3bgrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.v3-bgrow{transform-origin:left;animation:v3bgrow 1.9s cubic-bezier(.22,1,.36,1) forwards}
@keyframes v3bpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.38;transform:scale(1.7)}}
.v3-bp{animation:v3bpulse 2.4s ease-in-out infinite}
@keyframes lgfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.lg-float{animation:lgfloat 4s ease-in-out infinite}

/* ── Mobile ── */
@media(max-width:768px){.lg-left{display:none!important}.lg-mobile-logo{display:flex!important}}
`;

export default function LoginPage() {
  const navigate = useNavigation((s) => s.navigate);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const triggerError = (msg: string) => {
    setError(msg);
    setStatus('error');
    setShaking(true);
    setTimeout(() => setShaking(false), 520);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { triggerError('Vui lòng nhập email và mật khẩu.'); return; }
    setError('');
    setStatus('loading');
    try {
      const { access_token } = await authLogin(email, password);
      localStorage.setItem('dg_token', access_token);
      const { user, tenant } = await authMe();
      setAuth(access_token, user, tenant);
      setStatus('success');
      setTimeout(() => navigate(defaultPageFor(user.role as Role)), 900);
    } catch (err: unknown) {
      triggerError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    }
  };

  const isLoading = status === 'loading';
  const isError = status === 'error';
  const pwStage = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 8 ? 2 : 3;
  const pwColor = pwStage === 1 ? '#ef4444' : pwStage === 2 ? '#f59e0b' : '#22c55e';

  const successView = (
    <div className="v3-appear" style={{ textAlign:'center',padding:'32px 0' }}>
      <div style={{ width:72,height:72,borderRadius:'50%',background:'rgba(46,125,50,.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',border:'2px solid rgba(46,125,50,.2)' }}>
        <Icon name="check_circle" fill style={{ fontSize:36,color:DG.real }} />
      </div>
      <div style={{ fontSize:20,fontWeight:900,color:'#08142a',marginBottom:8,letterSpacing:'-0.03em' }}>Đăng nhập thành công</div>
      <div style={{ fontSize:14,color:'#64748b',marginBottom:24 }}>Đang chuyển hướng đến Dashboard...</div>
      <div style={{ height:3,borderRadius:99,background:'#e2e8f0',overflow:'hidden' }}>
        <div className="v3-bgrow" style={{ height:'100%',background:'linear-gradient(90deg,#2e7d32,#4ade80)',borderRadius:99 }} />
      </div>
    </div>
  );

  const formView = (
    <form onSubmit={handleLogin} style={{ display:'flex',flexDirection:'column',gap:16 }}>
      {/* Email */}
      <div className="lg-s0">
        <label style={{ display:'block',fontSize:10,fontWeight:800,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.13em',marginBottom:8 }}>Email</label>
        <div style={{ position:'relative' }}>
          <Icon name="mail" style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',fontSize:17,color:'#b0bfd1' }} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`lg-inp${isError ? ' lg-err' : ''}`}
          />
        </div>
      </div>

      {/* Password */}
      <div className="lg-s1">
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
          <label style={{ fontSize:10,fontWeight:800,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.13em' }}>Mật khẩu</label>
          <button type="button" style={{ fontSize:11,fontWeight:700,color:DG.primary,background:'transparent',border:'none',cursor:'pointer',padding:0,transition:'opacity .2s ease',fontFamily:'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity='.72'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity='1'; }}
          >Quên mật khẩu?</button>
        </div>
        <div style={{ position:'relative' }}>
          <Icon name="lock" style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',fontSize:17,color:'#b0bfd1' }} />
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className={`lg-inp${isError ? ' lg-err' : ''}`}
            style={{ paddingRight:44 }}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{ position:'absolute',right:13,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',color:'#b0bfd1',display:'flex',transition:'color .24s cubic-bezier(.32,.72,0,1)',padding:2 }}
            onMouseEnter={(e) => { e.currentTarget.style.color='#475569'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color='#b0bfd1'; }}
          >
            <Icon name={showPass ? 'visibility_off' : 'visibility'} style={{ fontSize:17 }} />
          </button>
        </div>
        {password.length > 0 && (
          <div style={{ marginTop:8,display:'flex',gap:4,alignItems:'center' }}>
            {[1,2,3,4].map((l) => (
              <div key={l} style={{ flex:1,height:3,borderRadius:99,background:password.length >= l*2 ? pwColor : 'rgba(0,0,0,.09)',transition:'all .28s cubic-bezier(.32,.72,0,1)' }} />
            ))}
            <span style={{ fontSize:10,color:pwColor,fontWeight:800,marginLeft:5,minWidth:52,transition:'color .28s ease' }}>
              {password.length < 4 ? 'Yếu' : password.length < 8 ? 'Trung bình' : 'Mạnh'}
            </span>
          </div>
        )}
      </div>

      {/* Remember */}
      <div className="lg-s2" style={{ display:'flex',alignItems:'center',gap:8 }}>
        <input type="checkbox" id="lg-rem" style={{ width:15,height:15,accentColor:DG.primary,cursor:'pointer' }} />
        <label htmlFor="lg-rem" style={{ fontSize:13.5,color:'#475569',cursor:'pointer' }}>Ghi nhớ đăng nhập</label>
      </div>

      {/* Error message */}
      {isError && (
        <div className="v3-appear" style={{ background:'rgba(186,26,26,.07)',border:'1px solid rgba(186,26,26,.2)',borderRadius:11,padding:'10px 14px',display:'flex',alignItems:'center',gap:9 }}>
          <Icon name="error" fill style={{ fontSize:16,color:DG.fake }} />
          <span style={{ fontSize:13.5,color:DG.fake,fontWeight:600 }}>{error}</span>
        </div>
      )}

      {/* Submit — button-in-button */}
      <div className="lg-s3">
        <button type="submit" disabled={isLoading} className="lg-btn" style={{ width:'100%',justifyContent:'center',padding:'14px 12px 14px 24px',marginTop:2 }}>
          {isLoading ? (
            <>
              <span className="v3-spin" style={{ width:17,height:17,border:'2.5px solid rgba(255,255,255,.28)',borderTopColor:'white',borderRadius:'50%',display:'inline-block' }} />
              Đang xác thực...
            </>
          ) : (
            <>
              Đăng nhập
              <span className="lg-btn-ic">
                <Icon name="arrow_forward" style={{ fontSize:16,color:'white' }} />
              </span>
            </>
          )}
        </button>
      </div>


      {/* Register link */}
      <div style={{ textAlign:'center',fontSize:13.5,color:'#64748b' }}>
        Chưa có tổ chức?{' '}
        <button type="button" onClick={() => navigate('register')} style={{ color:DG.primary,fontWeight:700,background:'transparent',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit',transition:'opacity .2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity='.7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity='1'; }}
        >
          Đăng ký dùng thử
        </button>
      </div>
    </form>
  );

  return (
    <div style={{ background:'#f0f7ff',minHeight:'100dvh',display:'flex',fontFamily:"system-ui,'Segoe UI',sans-serif" }}>
      <style>{V3_CSS}</style>

      {/* ── Left brand panel ── */}
      <div
        className="lg-left"
        style={{
          width:480,minHeight:'100dvh',flexShrink:0,position:'relative',overflow:'hidden',
          background:'linear-gradient(155deg,#001a5c 0%,#0038a8 45%,#0050cb 100%)',
          display:'flex',flexDirection:'column',padding:'44px 44px',
        }}
      >
        {/* Grain overlay */}
        <div style={{ position:'absolute',inset:0,zIndex:1,pointerEvents:'none',opacity:.025,
          backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.88\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize:'220px 220px',
        }} />

        {/* Animated orbs */}
        <div className="lg-ba" style={{ position:'absolute',width:560,height:560,top:-240,right:-180,borderRadius:'50%',background:'radial-gradient(circle at 40% 40%,rgba(79,145,255,.24),transparent 70%)',filter:'blur(72px)',pointerEvents:'none',zIndex:0 }} />
        <div className="lg-bb" style={{ position:'absolute',width:440,height:440,bottom:-180,left:-120,borderRadius:'50%',background:'radial-gradient(circle at 60% 60%,rgba(6,182,212,.2),transparent 70%)',filter:'blur(72px)',pointerEvents:'none',zIndex:0 }} />
        <div className="lg-bc" style={{ position:'absolute',width:280,height:280,top:'50%',left:'55%',transform:'translate(-50%,-50%)',borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,.12),transparent 75%)',filter:'blur(60px)',pointerEvents:'none',zIndex:0 }} />

        {/* Floating latency badge */}
        <div className="lg-float" style={{ position:'absolute',top:88,right:28,zIndex:3,padding:'8px 14px',borderRadius:12,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',gap:7,boxShadow:'inset 0 1px 0 rgba(255,255,255,.2)' }}>
          <Icon name="speed" style={{ fontSize:14,color:'rgba(255,255,255,.88)' }} />
          <span style={{ fontSize:12,fontWeight:800,color:'white' }}>142ms</span>
        </div>

        {/* Content container */}
        <div style={{ position:'relative',zIndex:2,display:'flex',flexDirection:'column',height:'100%' }}>
          {/* Logo */}
          <button onClick={() => navigate('landing')} style={{ display:'flex',alignItems:'center',gap:10,background:'transparent',border:'none',cursor:'pointer',padding:0,marginBottom:'auto',alignSelf:'flex-start' }}>
            <div style={{ width:38,height:38,borderRadius:11,background:'rgba(255,255,255,.17)',border:'1px solid rgba(255,255,255,.28)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'inset 0 1px 0 rgba(255,255,255,.24)' }}>
              <Icon name="security" fill style={{ fontSize:19,color:'white' }} />
            </div>
            <span style={{ fontSize:20,fontWeight:900,color:'white',letterSpacing:'-0.04em' }}>DeepGuard</span>
          </button>

          {/* Main brand content */}
          <div style={{ flex:1,display:'flex',flexDirection:'column',justifyContent:'center',paddingTop:44 }}>
            {/* Eyebrow */}
            <div style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'4px 12px',borderRadius:999,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.18)',marginBottom:22,alignSelf:'flex-start' }}>
              <span className="v3-bp" style={{ width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block' }} />
              <span style={{ fontSize:10,fontWeight:800,color:'rgba(255,255,255,.82)',textTransform:'uppercase',letterSpacing:'.12em' }}>v2.1 · Live Production</span>
            </div>

            {/* Headline */}
            <h2 style={{ fontSize:'clamp(30px,3vw,44px)',fontWeight:900,color:'white',letterSpacing:'-0.055em',lineHeight:1.1,marginBottom:14 }}>
              Bảo mật<br />sinh trắc học<br />
              <span style={{ opacity:.6 }}>cho eKYC</span>
            </h2>
            <p style={{ fontSize:14,color:'rgba(255,255,255,.62)',lineHeight:1.78,marginBottom:36,maxWidth:'32ch' }}>
              API phát hiện deepfake cho ngân hàng và fintech Việt Nam. Tuân thủ TT17/2024.
            </p>

            {/* Stats — double-bezel tiles */}
            <div style={{ display:'flex',flexDirection:'column',gap:9,marginBottom:28 }}>
              {[
                { icon:'monitoring', label:'AUC cross-dataset', value:'0.77' },
                { icon:'verified_user', label:'FPR eKYC', value:'≤5%' },
                { icon:'speed', label:'Tốc độ/ảnh (CPU)', value:'~1s' },
              ].map((s) => (
                <div key={s.label} style={{ padding:'2px',borderRadius:16,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.14)' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:14,background:'rgba(255,255,255,.08)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.18)' }}>
                    <div style={{ width:34,height:34,borderRadius:10,background:'rgba(255,255,255,.14)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'inset 0 1px 0 rgba(255,255,255,.22)' }}>
                      <Icon name={s.icon} style={{ fontSize:17,color:'rgba(255,255,255,.92)' }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:10,fontWeight:600,color:'rgba(255,255,255,.48)',textTransform:'uppercase',letterSpacing:'.09em' }}>{s.label}</div>
                      <div style={{ fontSize:18,fontWeight:900,color:'white',letterSpacing:'-0.04em',marginTop:1 }}>{s.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial card */}
            <div style={{ padding:'3px',borderRadius:18,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)' }}>
              <div style={{ padding:'16px 18px',borderRadius:16,background:'rgba(255,255,255,.07)',boxShadow:'inset 0 1px 0 rgba(255,255,255,.12)' }}>
                <div style={{ display:'flex',gap:3,marginBottom:10 }}>
                  {[1,2,3,4,5].map((i) => <Icon key={i} name="star" fill style={{ fontSize:12,color:'#fbbf24' }} />)}
                </div>
                <p style={{ fontSize:13,color:'rgba(255,255,255,.72)',lineHeight:1.7,marginBottom:14,fontStyle:'italic' }}>
                  "DeepGuard giúp chúng tôi giảm 94% gian lận eKYC trong Q1 2025."
                </p>
                <div style={{ display:'flex',alignItems:'center',gap:9 }}>
                  <div style={{ width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,.18)',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,.24)',flexShrink:0 }}>
                    <span style={{ fontSize:10,fontWeight:900,color:'white' }}>VB</span>
                  </div>
                  <div>
                    <div style={{ fontSize:11.5,fontWeight:700,color:'rgba(255,255,255,.88)' }}>VietBank Security</div>
                    <div style={{ fontSize:10,color:'rgba(255,255,255,.44)' }}>Head of eKYC</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop:32,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <span style={{ fontSize:11,color:'rgba(255,255,255,.34)' }}>© 2025 DeepGuard · VietBank eKYC</span>
            <span style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,.5)',padding:'3px 9px',borderRadius:7,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.16)',letterSpacing:'.06em' }}>TT17/2024</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex:1,display:'flex',alignItems:'center',justifyContent:'center',
        padding:'40px 48px',background:'#fafbff',position:'relative',
        backgroundImage:'radial-gradient(rgba(0,80,203,.048) 1px,transparent 1px)',
        backgroundSize:'24px 24px',
      }}>
        <div style={{ width:'100%',maxWidth:400,position:'relative',zIndex:1 }}>

          {/* Mobile logo */}
          <div style={{ display:'none',textAlign:'center',marginBottom:36,alignItems:'center',justifyContent:'center' }} className="lg-mobile-logo">
            <button onClick={() => navigate('landing')} style={{ border:'none',background:'transparent',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,fontFamily:'inherit' }}>
              <div style={{ width:36,height:36,borderRadius:10,background:DG.primary,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Icon name="security" fill style={{ fontSize:18,color:'white' }} />
              </div>
              <span style={{ fontSize:18,fontWeight:900,color:DG.primary,letterSpacing:'-0.04em' }}>DeepGuard</span>
            </button>
          </div>

          {/* Form header */}
          {status !== 'success' && (
            <div className="lg-s0" style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:24,fontWeight:900,color:'#08142a',letterSpacing:'-0.042em',marginBottom:6 }}>Đăng nhập</h2>
              <p style={{ fontSize:14,color:'#64748b' }}>Truy cập hệ thống phát hiện deepfake</p>
            </div>
          )}

          {/* ── Double-bezel form card ── */}
          <div
            className={shaking ? 'lg-shake' : ''}
            style={{
              padding:'6px',borderRadius:28,
              background:`rgba(0,80,203,${isError ? '.06' : '.04'})`,
              border:`1px solid rgba(${isError ? '186,26,26' : '0,80,203'},.12)`,
              boxShadow:`0 2px 16px rgba(${isError ? '186,26,26' : '0,80,203'},.08)`,
              transition:'all .32s cubic-bezier(.32,.72,0,1)',
            }}
          >
            <div style={{
              background:'white',borderRadius:23,padding:'30px 28px',
              boxShadow:'inset 0 2px 0 rgba(255,255,255,1),inset 0 -1px 0 rgba(0,0,0,.03),0 12px 40px rgba(0,0,0,.07)',
              border:'1px solid rgba(255,255,255,.92)',
            }}>
              {status === 'success' ? successView : formView}
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ marginTop:22 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:18,marginBottom:10 }}>
              {([['shield','RBAC'],['verified_user','TT17/2024'],['lock','TLS 1.3']] as [string,string][]).map(([icon,label]) => (
                <div key={label} style={{ display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:'#94a3b8' }}>
                  <Icon name={icon} style={{ fontSize:12,color:'#b0bfd1' }} />
                  {label}
                </div>
              ))}
            </div>
            <div style={{ textAlign:'center',fontSize:11,color:'#b0bfd1',marginBottom:6 }}>© 2025 VietBank DeepGuard v2.1</div>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
              <span className="v3-bp" style={{ width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block' }} />
              <span style={{ fontSize:10,fontWeight:700,color:'#22c55e',textTransform:'uppercase',letterSpacing:'.06em' }}>Hệ thống hoạt động bình thường</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
