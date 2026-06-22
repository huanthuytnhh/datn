'use client';

/* auth-ui.tsx — split-screen shell dùng chung cho register, accept-invite. */
import { useNavigation } from '@/store/navigation';
import { Icon } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';

export const V3_CSS = `
.v3-inp{width:100%;padding:12px 14px 12px 42px;background:#f8fafc;border:1.5px solid rgba(0,0,0,.1);border-radius:10px;font-size:14px;font-weight:500;color:#08142a;transition:all .2s ease;outline:none;font-family:inherit}
.v3-inp::placeholder{color:#94a3b8}
.v3-inp:focus{background:#fff;border-color:#0050cb;box-shadow:0 0 0 4px rgba(0,80,203,.1)}
.v3-inp.v3-err{border-color:#ba1a1a;box-shadow:0 0 0 4px rgba(186,26,26,.09)}
.v3-btp{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#0050cb;color:#fff;border:none;border-radius:10px;font-weight:800;font-size:13px;letter-spacing:.06em;cursor:pointer;box-shadow:0 4px 18px rgba(0,80,203,.32);transition:all .22s cubic-bezier(.22,1,.36,1)}
.v3-btp:hover{background:#0040a8;transform:translateY(-2px) scale(1.02)}
.v3-btp:active{transform:scale(.97)}
.v3-btp:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
@keyframes v3pin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.v3-pin{animation:v3pin .32s cubic-bezier(.22,1,.36,1) both}
@keyframes v3appear{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}
.v3-appear{animation:v3appear .4s cubic-bezier(.22,1,.36,1)}
@keyframes v3spin{to{transform:rotate(360deg)}}
.v3-spin{animation:v3spin .75s linear infinite}
@media(max-width:768px){.v3-auth-left{display:none!important}}
`;

/** Split-screen khung xác thực: xanh trái (brand) + trắng phải (form). */
export function AuthShell({
  title, subtitle, children,
}: { title: string; subtitle: string; children: React.ReactNode }) {
  const navigate = useNavigation((s) => s.navigate);
  return (
    <div className="v3-pin" style={{ background: '#fafbff', minHeight: '100vh', display: 'flex', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{V3_CSS}</style>

      {/* Left brand panel */}
      <div
        className="v3-auth-left"
        style={{
          width: 400, minHeight: '100vh', flexShrink: 0, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(155deg,#0047cc 0%,#0050cb 40%,#1a5fd4 100%)',
          display: 'flex', flexDirection: 'column', padding: '48px 40px',
        }}
      >
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.12),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -60, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)', pointerEvents: 'none' }} />

        <button
          onClick={() => navigate('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 'auto' }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.3)' }}>
            <Icon name="security" fill style={{ fontSize: 18, color: 'white' }} />
          </div>
          <span style={{ fontSize: 19, fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>DeepGuard</span>
        </button>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 36 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.3, marginBottom: 12 }}>
              Bảo mật sinh trắc học<br />cho eKYC
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', lineHeight: 1.7 }}>
              API deepfake detection cho ngân hàng và fintech Việt Nam.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: 'analytics', label: 'AUC cross-dataset', value: '0.77' },
              { icon: 'verified_user', label: 'FPR eKYC', value: '≤5%' },
              { icon: 'speed', label: 'Tốc độ/ảnh (CPU)', value: '~1s' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', borderRadius: 11, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} style={{ fontSize: 16, color: 'rgba(255,255,255,.9)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.58)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 36, fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
          © 2025 DeepGuard · VietBank eKYC
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', background: '#fafbff' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 21, fontWeight: 900, color: '#08142a', letterSpacing: '-0.035em', marginBottom: 5 }}>{title}</h2>
            <p style={{ fontSize: 13.5, color: '#64748b' }}>{subtitle}</p>
          </div>
          <div style={{ background: 'white', borderRadius: 18, padding: '28px 26px', border: '1px solid rgba(0,0,0,.08)', boxShadow: '0 4px 24px rgba(0,0,0,.07),0 1px 4px rgba(0,0,0,.04)' }}>
            {children}
          </div>
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: '#94a3b8' }}>
            © 2025 VietBank DeepGuard
          </div>
        </div>
      </div>
    </div>
  );
}

/** Input có icon trái, dùng class v3-inp. */
export function AuthInput({
  icon, type = 'text', value, onChange, placeholder, label,
}: { icon: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; label: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 7 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon name={icon} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 16, color: '#94a3b8' }} />
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="v3-inp" />
      </div>
    </div>
  );
}
