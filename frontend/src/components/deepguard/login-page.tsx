'use client';

import { useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';
import { authLogin, authMe } from '@/lib/api';
import { defaultPageFor, type Role } from '@/lib/rbac';
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
@keyframes v3shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-7px)}30%{transform:translateX(7px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}75%{transform:translateX(-3px)}90%{transform:translateX(3px)}}
.v3-shake{animation:v3shake .5s cubic-bezier(.36,.07,.19,.97)}
@keyframes v3bpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(1.6)}}
.v3-bp{animation:v3bpulse 2.4s ease-in-out infinite}
@keyframes v3spin{to{transform:rotate(360deg)}}
.v3-spin{animation:v3spin .75s linear infinite}
@keyframes v3appear{from{transform:scale(.78);opacity:0}to{transform:scale(1);opacity:1}}
.v3-appear{animation:v3appear .4s cubic-bezier(.22,1,.36,1)}
@keyframes v3bgrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.v3-bgrow{transform-origin:left;animation:v3bgrow 1.9s cubic-bezier(.22,1,.36,1) forwards}
@keyframes v3pin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.v3-pin{animation:v3pin .3s cubic-bezier(.22,1,.36,1) both}
.v3-gt{background:linear-gradient(130deg,#0050cb 0%,#4f91ff 50%,#06b6d4 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.v3-btp{display:inline-flex;align-items:center;gap:8px;background:#0050cb;color:#fff;border:none;border-radius:14px;font-weight:800;font-size:13px;letter-spacing:.04em;cursor:pointer;box-shadow:0 4px 20px rgba(0,80,203,.3),inset 0 1px 0 rgba(255,255,255,.2);transition:all .22s cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden}
.v3-btp:hover{background:#0040a8;transform:translateY(-2px) scale(1.02);box-shadow:0 10px 32px rgba(0,80,203,.42)}
.v3-btp:active{transform:scale(.97)}
.v3-btp:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
.v3-btg{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.78);color:#1e3050;border:1px solid rgba(255,255,255,.9);border-radius:14px;font-weight:700;font-size:13px;letter-spacing:.04em;cursor:pointer;backdrop-filter:blur(16px);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 2px 8px rgba(0,0,0,.07);transition:all .22s cubic-bezier(.22,1,.36,1)}
.v3-btg:hover{background:rgba(255,255,255,.97);transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,1),0 8px 24px rgba(0,0,0,.1)}
.v3-btg:active{transform:scale(.97)}
.v3-inp{width:100%;padding:13px 14px 13px 44px;background:rgba(255,255,255,.65);border:1.5px solid rgba(255,255,255,.8);border-radius:12px;font-size:14px;font-weight:500;color:#08142a;transition:all .2s ease;outline:none;font-family:inherit;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
.v3-inp::placeholder{color:#8498b4}
.v3-inp:focus{background:rgba(255,255,255,.97);border-color:#0050cb;box-shadow:0 0 0 4px rgba(0,80,203,.1),inset 0 1px 0 rgba(255,255,255,1)}
.v3-inp.v3-err{border-color:#ba1a1a;box-shadow:0 0 0 4px rgba(186,26,26,.09)}
@media(prefers-reduced-motion:reduce){.v3-ba,.v3-bb,.v3-bc{animation:none!important}}
`;

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
          style={{ position: 'absolute', width: 680, height: 680, top: -260, right: -160, background: 'radial-gradient(circle at 40% 40%,rgba(99,102,241,.28),rgba(0,80,203,.14) 50%,transparent 75%)' }}
        />
        <div
          className="v3-bb v3-blob"
          style={{ position: 'absolute', width: 540, height: 540, bottom: -160, left: -120, background: 'radial-gradient(circle at 60% 60%,rgba(6,182,212,.22),rgba(0,80,203,.12) 50%,transparent 75%)' }}
        />
        <div style={{ position: 'absolute', top: '40%', left: '46%', transform: 'translate(-50%,-50%)' }}>
          <div className="v3-bc v3-blob" style={{ width: 380, height: 380, background: 'radial-gradient(circle,rgba(139,92,246,.14),rgba(0,80,203,.08) 50%,transparent 75%)' }} />
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────
   LOGIN PAGE
   ────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigation((s) => s.navigate);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const [shaking, setShaking] = useState(false);
  /** idle | loading | success | error */
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
    if (!email || !password) {
      triggerError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setError('');
    setStatus('loading');
    try {
      // Real auth flow — DO NOT mock.
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

  // Password strength (visual only)
  const pwStage = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 8 ? 2 : 3;
  const pwColor = pwStage === 1 ? '#ef4444' : pwStage === 2 ? '#f59e0b' : '#22c55e';

  const successView = (
    <div className="v3-appear" style={{ textAlign: 'center', padding: '28px 0' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(46,125,50,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid rgba(46,125,50,.2)' }}>
        <Icon name="check_circle" fill style={{ fontSize: 36, color: DG.real }} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: '#08142a', marginBottom: 8 }}>Đăng nhập thành công!</div>
      <div style={{ fontSize: 14, color: '#3d5070', marginBottom: 24 }}>Đang chuyển hướng đến Dashboard…</div>
      <div style={{ height: 3, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
        <div className="v3-bgrow" style={{ height: '100%', background: 'linear-gradient(90deg,#2e7d32,#4ade80)', borderRadius: 99 }} />
      </div>
    </div>
  );

  const formView = (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Email */}
      <div>
        <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#8498b4', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8 }}>Email</label>
        <div style={{ position: 'relative' }}>
          <Icon name="mail" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 17, color: '#8498b4' }} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dev@vietbank.vn"
            className={`v3-inp${isError ? ' v3-err' : ''}`}
          />
        </div>
      </div>
      {/* Password */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 10, fontWeight: 800, color: '#8498b4', textTransform: 'uppercase', letterSpacing: '.12em' }}>Mật khẩu</label>
          <button type="button" style={{ fontSize: 11, fontWeight: 700, color: DG.primary, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Quên mật khẩu?</button>
        </div>
        <div style={{ position: 'relative' }}>
          <Icon name="lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 17, color: '#8498b4' }} />
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className={`v3-inp${isError ? ' v3-err' : ''}`}
            style={{ paddingRight: 44 }}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#8498b4', display: 'flex', transition: 'color .18s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#3d5070'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8498b4'; }}
          >
            <Icon name={showPass ? 'visibility_off' : 'visibility'} style={{ fontSize: 17 }} />
          </button>
        </div>
        {password.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
            {[1, 2, 3, 4].map((l) => (
              <div key={l} style={{ flex: 1, height: 3, borderRadius: 99, background: password.length >= l * 2 ? pwColor : 'rgba(0,0,0,.1)', transition: 'all .2s ease' }} />
            ))}
            <span style={{ fontSize: 10, color: pwColor, fontWeight: 700, marginLeft: 4, minWidth: 54 }}>
              {password.length < 4 ? 'Yếu' : password.length < 8 ? 'Trung bình' : 'Mạnh'}
            </span>
          </div>
        )}
      </div>
      {/* Remember */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" id="v3rem" style={{ width: 15, height: 15, accentColor: DG.primary, cursor: 'pointer' }} />
        <label htmlFor="v3rem" style={{ fontSize: 13, color: '#3d5070', cursor: 'pointer' }}>Ghi nhớ đăng nhập</label>
      </div>
      {/* Error */}
      {isError && (
        <div className="v3-appear" style={{ background: 'rgba(186,26,26,.07)', border: '1px solid rgba(186,26,26,.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="error" fill style={{ fontSize: 16, color: DG.fake }} />
          <span style={{ fontSize: 13, color: DG.fake, fontWeight: 600 }}>{error}</span>
        </div>
      )}
      {/* Submit */}
      <button type="submit" disabled={isLoading} className="v3-btp" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 13, letterSpacing: '.08em', borderRadius: 14, marginTop: 2 }}>
        {isLoading ? (
          <>
            <span className="v3-spin" style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
            ĐANG XÁC THỰC…
          </>
        ) : (
          <>
            <Icon name="login" style={{ fontSize: 18, color: 'white' }} />
            ĐĂNG NHẬP
          </>
        )}
      </button>
      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.08)' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#8498b4', textTransform: 'uppercase', letterSpacing: '.1em' }}>hoặc</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.08)' }} />
      </div>
      {/* SSO */}
      <button type="button" className="v3-btg" style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 13, borderRadius: 14 }}>
        <Icon name="badge" style={{ fontSize: 18, color: DG.primary }} />
        Đăng nhập bằng VietBank SSO
      </button>
    </form>
  );

  return (
    <div className="v3-pin" style={{ background: '#EBF3FF', minHeight: '100vh', position: 'relative', fontFamily: "'Inter',system-ui,sans-serif", color: '#08142a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowX: 'hidden' }}>
      <style>{V3_CSS}</style>
      <V3Bg />
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <button onClick={() => navigate('landing')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
              onMouseEnter={() => setLogoHover(true)}
              onMouseLeave={() => setLogoHover(false)}
              style={{ width: 60, height: 60, borderRadius: 18, background: DG.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,80,203,.36),inset 0 1px 0 rgba(255,255,255,.25)', transition: 'transform .22s ease', transform: logoHover ? 'scale(1.09) rotate(-5deg)' : 'scale(1)' }}
            >
              <Icon name="security" style={{ fontSize: 28, color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: DG.primary, fontStyle: 'italic', letterSpacing: '-0.045em' }}>DeepGuard</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#8498b4', textTransform: 'uppercase', letterSpacing: '.3em', marginTop: 3 }}>VietBank Workspace</div>
            </div>
          </button>
        </div>
        {/* Card */}
        <div
          className={`v3-lg${shaking ? ' v3-shake' : ''}`}
          style={{ borderRadius: 24, padding: '36px 32px', boxShadow: '0 24px 72px rgba(0,0,0,.1),inset 0 1.5px 0 rgba(255,255,255,.95)', border: isError ? '1px solid rgba(186,26,26,.22)' : '1px solid rgba(255,255,255,.72)' }}
        >
          {status !== 'success' && (
            <div style={{ marginBottom: 26 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#08142a', letterSpacing: '-0.035em', marginBottom: 5 }}>Đăng nhập</h2>
              <p style={{ fontSize: 13, color: '#3d5070' }}>Truy cập hệ thống phát hiện deepfake</p>
            </div>
          )}
          {status === 'success' ? successView : formView}
        </div>
        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <div style={{ fontSize: 10, color: '#8498b4', marginBottom: 8 }}>© 2025 VietBank DeepGuard v2.1</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span className="v3-bp" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '.06em' }}>Hệ thống hoạt động bình thường</span>
          </div>
        </div>
      </div>
    </div>
  );
}
