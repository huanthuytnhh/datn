'use client';

/* register-page.tsx — đăng ký B2B tự phục vụ. Gọi POST /auth/register → tạo tổ chức SUSPENDED,
   CHỜ sysadmin duyệt (không auto-login). Hiển thị màn "chờ duyệt" sau khi tạo. */
import { useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { authRegister } from '@/lib/api';
import { Icon } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';
import { AuthShell, AuthInput } from '@/components/deepguard/auth-ui';

export default function RegisterPage() {
  const navigate = useNavigation((s) => s.navigate);
  const [tenantName, setTenantName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !name || !email || !password) { setError('Vui lòng điền đầy đủ thông tin.'); return; }
    if (password.length < 8) { setError('Mật khẩu tối thiểu 8 ký tự.'); return; }
    setError(''); setStatus('loading');
    try {
      await authRegister(tenantName, email, password, name);
      setStatus('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <AuthShell title="Đã gửi đăng ký" subtitle="Tổ chức của bạn đang chờ phê duyệt">
        <div className="v3-appear" style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(237,108,2,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', border: '2px solid rgba(237,108,2,.2)' }}>
            <Icon name="hourglass_top" fill style={{ fontSize: 34, color: DG.uncertain }} />
          </div>
          <p style={{ fontSize: 14, color: '#3d5070', lineHeight: 1.6, marginBottom: 22 }}>
            Tổ chức <b>{tenantName}</b> đã được tạo và đang ở trạng thái <b>chờ duyệt</b>. Quản trị nền tảng (sysadmin)
            sẽ kích hoạt; sau đó bạn đăng nhập bằng email <b>{email}</b>.
          </p>
          <button onClick={() => navigate('login')} className="v3-btp" style={{ width: '100%', padding: 14 }}>
            <Icon name="login" style={{ fontSize: 18, color: 'white' }} /> Về trang đăng nhập
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Đăng ký dùng thử" subtitle="Tạo tổ chức để tích hợp DeepGuard vào eKYC của bạn">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AuthInput icon="business" label="Tên tổ chức" value={tenantName} onChange={setTenantName} placeholder="VD: FPT eKYC" />
        <AuthInput icon="person" label="Họ tên người quản trị" value={name} onChange={setName} placeholder="Nguyễn Văn A" />
        <AuthInput icon="mail" type="email" label="Email công việc" value={email} onChange={setEmail} placeholder="admin@congty.vn" />
        <AuthInput icon="lock" type="password" label="Mật khẩu (≥ 8 ký tự)" value={password} onChange={setPassword} placeholder="••••••••" />
        {error && (
          <div className="v3-appear" style={{ background: 'rgba(186,26,26,.07)', border: '1px solid rgba(186,26,26,.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="error" fill style={{ fontSize: 16, color: DG.fake }} />
            <span style={{ fontSize: 13, color: DG.fake, fontWeight: 600 }}>{error}</span>
          </div>
        )}
        <button type="submit" disabled={status === 'loading'} className="v3-btp" style={{ width: '100%', padding: 14, marginTop: 2 }}>
          {status === 'loading' ? (
            <><span className="v3-spin" style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> ĐANG GỬI…</>
          ) : (
            <><Icon name="rocket_launch" style={{ fontSize: 18, color: 'white' }} /> TẠO TỔ CHỨC</>
          )}
        </button>
        <div style={{ textAlign: 'center', fontSize: 13, color: '#3d5070' }}>
          Đã có tài khoản?{' '}
          <button type="button" onClick={() => navigate('login')} style={{ color: DG.primary, fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Đăng nhập</button>
        </div>
      </form>
    </AuthShell>
  );
}
