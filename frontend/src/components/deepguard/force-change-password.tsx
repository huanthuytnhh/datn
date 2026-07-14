'use client';

import { useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';
import { authChangePassword, authMe } from '@/lib/api';
import { Icon } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';

/* ──────────────────────────────────────────────
   Scoped CSS (light-only, shared visual language with login-page V3)
   ────────────────────────────────────────────── */
const FCP_CSS = `
.fcp-aurora{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 90% 65% at 82% 8%,rgba(99,102,241,.16) 0%,transparent 55%),radial-gradient(ellipse 65% 55% at 8% 92%,rgba(6,182,212,.13) 0%,transparent 55%),radial-gradient(ellipse 55% 70% at 48% 52%,rgba(0,80,203,.07) 0%,transparent 62%),#EBF3FF}
.fcp-blob{position:absolute;border-radius:50%;filter:blur(100px)}
.fcp-ba{animation:fcpda 22s ease-in-out infinite}
.fcp-bb{animation:fcpdb 28s ease-in-out infinite;animation-delay:-10s}
@keyframes fcpda{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(28px,-40px)scale(1.06)}66%{transform:translate(-20px,22px)scale(.96)}}
@keyframes fcpdb{0%,100%{transform:translate(0,0)scale(1.02)}45%{transform:translate(-30px,20px)scale(.96)}72%{transform:translate(18px,-24px)scale(1.05)}}
.fcp-lg{background:linear-gradient(155deg,rgba(255,255,255,.88) 0%,rgba(255,255,255,.70) 100%);backdrop-filter:blur(52px) saturate(210%) brightness(1.04);-webkit-backdrop-filter:blur(52px) saturate(210%) brightness(1.04);border:1px solid rgba(255,255,255,.72);box-shadow:inset 0 1.5px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(0,0,0,.04),inset 1px 0 0 rgba(255,255,255,.55),0 12px 48px rgba(0,0,0,.09),0 3px 10px rgba(0,0,0,.05)}
@keyframes fcpshake{0%,100%{transform:translateX(0)}15%{transform:translateX(-7px)}30%{transform:translateX(7px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}75%{transform:translateX(-3px)}90%{transform:translateX(3px)}}
.fcp-shake{animation:fcpshake .5s cubic-bezier(.36,.07,.19,.97)}
@keyframes fcpspin{to{transform:rotate(360deg)}}
.fcp-spin{animation:fcpspin .75s linear infinite}
@keyframes fcpappear{from{transform:scale(.78);opacity:0}to{transform:scale(1);opacity:1}}
.fcp-appear{animation:fcpappear .4s cubic-bezier(.22,1,.36,1)}
@keyframes fcppin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.fcp-pin{animation:fcppin .3s cubic-bezier(.22,1,.36,1) both}
.fcp-btp{display:inline-flex;align-items:center;gap:8px;background:#0050cb;color:#fff;border:none;border-radius:14px;font-weight:800;font-size:13px;letter-spacing:.04em;cursor:pointer;box-shadow:0 4px 20px rgba(0,80,203,.3),inset 0 1px 0 rgba(255,255,255,.2);transition:all .22s cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden}
.fcp-btp:hover{background:#0040a8;transform:translateY(-2px) scale(1.02);box-shadow:0 10px 32px rgba(0,80,203,.42)}
.fcp-btp:active{transform:scale(.97)}
.fcp-btp:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
.fcp-inp{width:100%;padding:13px 44px 13px 44px;background:rgba(255,255,255,.65);border:1.5px solid rgba(255,255,255,.8);border-radius:12px;font-size:14px;font-weight:500;color:#08142a;transition:all .2s ease;outline:none;font-family:inherit;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
.fcp-inp::placeholder{color:#8498b4}
.fcp-inp:focus{background:rgba(255,255,255,.97);border-color:#0050cb;box-shadow:0 0 0 4px rgba(0,80,203,.1),inset 0 1px 0 rgba(255,255,255,1)}
.fcp-inp.fcp-err{border-color:#ba1a1a;box-shadow:0 0 0 4px rgba(186,26,26,.09)}
@media(prefers-reduced-motion:reduce){.fcp-ba,.fcp-bb{animation:none!important}}
`;

function FcpBg() {
  return (
    <>
      <div className="fcp-aurora" />
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div
          className="fcp-ba fcp-blob"
          style={{ position: 'absolute', width: 680, height: 680, top: -260, right: -160, background: 'radial-gradient(circle at 40% 40%,rgba(99,102,241,.28),rgba(0,80,203,.14) 50%,transparent 75%)' }}
        />
        <div
          className="fcp-bb fcp-blob"
          style={{ position: 'absolute', width: 540, height: 540, bottom: -160, left: -120, background: 'radial-gradient(circle at 60% 60%,rgba(6,182,212,.22),rgba(0,80,203,.12) 50%,transparent 75%)' }}
        />
      </div>
    </>
  );
}

/* ── Reusable password field with show/hide toggle ── */
function PwField({
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
  error,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
  error?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#8498b4', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon name="lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 17, color: '#8498b4' }} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="new-password"
          className={`fcp-inp${error ? ' fcp-err' : ''}`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#8498b4', display: 'flex' }}
          aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          <Icon name={show ? 'visibility_off' : 'visibility'} style={{ fontSize: 17 }} />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   FORCE CHANGE PASSWORD — blocking gate after login
   ────────────────────────────────────────────── */
export default function ForceChangePassword() {
  const navigate = useNavigation((s) => s.navigate);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const isLoading = status === 'loading';
  const isError = status === 'error';

  const triggerError = (msg: string) => {
    setError(msg);
    setStatus('error');
    setShaking(true);
    setTimeout(() => setShaking(false), 520);
  };

  // New-password strength (visual only)
  const pwStage = next.length === 0 ? 0 : next.length < 4 ? 1 : next.length < 8 ? 2 : 3;
  const pwColor = pwStage === 1 ? '#ef4444' : pwStage === 2 ? '#f59e0b' : '#22c55e';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!current) {
      triggerError('Vui lòng nhập mật khẩu hiện tại (tạm).');
      return;
    }
    if (next.length < 8) {
      triggerError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (next !== confirm) {
      triggerError('Xác nhận mật khẩu không khớp.');
      return;
    }
    if (next === current) {
      triggerError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }
    setError('');
    setStatus('loading');
    try {
      await authChangePassword(current, next);
      // Re-fetch identity so the must_change_password flag clears, then refresh the store.
      const token = useAuthStore.getState().token ?? localStorage.getItem('dg_token');
      const { user, tenant } = await authMe();
      if (token) setAuth(token, user, tenant);
      setStatus('success');
      // The gate in page.tsx re-renders once the flag clears — no full reload needed.
    } catch (err: unknown) {
      triggerError(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('login');
  };

  return (
    <div className="fcp-pin" style={{ background: '#EBF3FF', minHeight: '100vh', position: 'relative', fontFamily: "'Inter',system-ui,sans-serif", color: '#08142a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowX: 'hidden' }}>
      <style>{FCP_CSS}</style>
      <FcpBg />
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Header / brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: DG.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,80,203,.36),inset 0 1px 0 rgba(255,255,255,.25)' }}>
            <Icon name="lock_reset" style={{ fontSize: 28, color: 'white' }} fill />
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: DG.primary, fontStyle: 'italic', letterSpacing: '-0.045em' }}>DeepGuard</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#8498b4', textTransform: 'uppercase', letterSpacing: '.3em', marginTop: 3 }}>Bảo mật tài khoản</div>
          </div>
        </div>

        {/* Card */}
        <div
          className={`fcp-lg${shaking ? ' fcp-shake' : ''}`}
          style={{ borderRadius: 24, padding: '32px 32px', border: isError ? '1px solid rgba(186,26,26,.22)' : '1px solid rgba(255,255,255,.72)' }}
        >
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#08142a', letterSpacing: '-0.035em', marginBottom: 6 }}>Đổi mật khẩu bắt buộc</h2>
            <p style={{ fontSize: 13, color: '#3d5070', lineHeight: 1.5 }}>
              Tài khoản của bạn đang dùng mật khẩu tạm. Hãy đặt mật khẩu mới để tiếp tục sử dụng hệ thống.
            </p>
          </div>

          {status === 'success' ? (
            <div className="fcp-appear" style={{ textAlign: 'center', padding: '20px 0 8px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(46,125,50,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', border: '2px solid rgba(46,125,50,.2)' }}>
                <Icon name="check_circle" fill style={{ fontSize: 36, color: DG.real }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#08142a', marginBottom: 6 }}>Đã đổi mật khẩu!</div>
              <div style={{ fontSize: 13, color: '#3d5070' }}>Đang mở lại hệ thống…</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <PwField
                label="Mật khẩu hiện tại (tạm)"
                value={current}
                onChange={setCurrent}
                placeholder="Nhập mật khẩu tạm"
                show={showCurrent}
                onToggleShow={() => setShowCurrent((v) => !v)}
                error={isError}
                autoFocus
              />

              <div>
                <PwField
                  label="Mật khẩu mới"
                  value={next}
                  onChange={setNext}
                  placeholder="Tối thiểu 8 ký tự"
                  show={showNext}
                  onToggleShow={() => setShowNext((v) => !v)}
                  error={isError}
                />
                {next.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[1, 2, 3, 4].map((l) => (
                      <div key={l} style={{ flex: 1, height: 3, borderRadius: 99, background: next.length >= l * 2 ? pwColor : 'rgba(0,0,0,.1)', transition: 'all .2s ease' }} />
                    ))}
                    <span style={{ fontSize: 10, color: pwColor, fontWeight: 700, marginLeft: 4, minWidth: 54 }}>
                      {next.length < 4 ? 'Yếu' : next.length < 8 ? 'Trung bình' : 'Mạnh'}
                    </span>
                  </div>
                )}
              </div>

              <PwField
                label="Xác nhận mật khẩu mới"
                value={confirm}
                onChange={setConfirm}
                placeholder="Nhập lại mật khẩu mới"
                show={showConfirm}
                onToggleShow={() => setShowConfirm((v) => !v)}
                error={isError}
              />

              {isError && (
                <div className="fcp-appear" style={{ background: 'rgba(186,26,26,.07)', border: '1px solid rgba(186,26,26,.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="error" fill style={{ fontSize: 16, color: DG.fake }} />
                  <span style={{ fontSize: 13, color: DG.fake, fontWeight: 600 }}>{error}</span>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="fcp-btp" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 13, letterSpacing: '.08em', borderRadius: 14, marginTop: 2 }}>
                {isLoading ? (
                  <>
                    <span className="fcp-spin" style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                    ĐANG CẬP NHẬT…
                  </>
                ) : (
                  <>
                    <Icon name="lock_reset" style={{ fontSize: 18, color: 'white' }} />
                    ĐỔI MẬT KHẨU
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Logout */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#3d5070', padding: 6 }}
          >
            <Icon name="logout" style={{ fontSize: 16 }} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
