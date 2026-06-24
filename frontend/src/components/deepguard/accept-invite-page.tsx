'use client';

/* accept-invite-page.tsx — người được mời mở link /?invite=<token>. Validate token → đặt tên + mật khẩu
   → POST /auth/accept-invite → auto-login → vào dashboard đúng role. */
import { useState, useEffect } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';
import { authInviteInfo, authAcceptInvite, authMe, type InviteInfo } from '@/lib/api';
import { defaultPageFor, ROLE_LABEL, type Role } from '@/lib/rbac';
import { Icon } from '@/components/deepguard/shared';
import { DG } from '@/lib/dg';
import { AuthShell, AuthInput } from '@/components/deepguard/auth-ui';
import { useT } from '@/lib/i18n';

function readInviteToken(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('invite') ?? '';
}

export default function AcceptInvitePage() {
  const t = useT();
  const navigate = useNavigation((s) => s.navigate);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [token] = useState(readInviteToken);
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'checking' | 'idle' | 'loading'>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) { if (alive) { setInfo({ valid: false, reason: t('invite.no_token') }); setStatus('idle'); } return; }
      try {
        const res = await authInviteInfo(token);
        if (alive) { setInfo(res); setStatus('idle'); }
      } catch {
        if (alive) { setInfo({ valid: false, reason: t('invite.check_failed') }); setStatus('idle'); }
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) { setError(t('invite.error_required')); return; }
    if (password.length < 8) { setError(t('invite.error_pwd_min')); return; }
    setError(''); setStatus('loading');
    try {
      const { access_token } = await authAcceptInvite(token, name, password);
      localStorage.setItem('dg_token', access_token);
      const { user, tenant } = await authMe();
      setAuth(access_token, user, tenant);
      // Xoá ?invite khỏi URL để không kích hoạt lại
      if (typeof window !== 'undefined') window.history.replaceState({}, '', '/');
      navigate(defaultPageFor(user.role as Role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('invite.error_failed'));
      setStatus('idle');
    }
  };

  if (status === 'checking') {
    return (
      <AuthShell title={t('invite.checking_title')} subtitle={t('invite.checking_sub')}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <span className="v3-spin" style={{ width: 28, height: 28, border: '3px solid rgba(0,80,203,.2)', borderTopColor: DG.primary, borderRadius: '50%', display: 'inline-block' }} />
        </div>
      </AuthShell>
    );
  }

  if (!info?.valid) {
    return (
      <AuthShell title={t('invite.invalid_title')} subtitle={t('invite.invalid_sub')}>
        <div className="v3-appear" style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(186,26,26,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', border: '2px solid rgba(186,26,26,.18)' }}>
            <Icon name="link_off" fill style={{ fontSize: 34, color: DG.fake }} />
          </div>
          <p style={{ fontSize: 14, color: '#3d5070', marginBottom: 22 }}>{info?.reason ?? t('invite.invalid_fallback')}. {t('invite.invalid_contact')}</p>
          <button onClick={() => navigate('login')} className="v3-btp" style={{ width: '100%', padding: 14 }}>
            <Icon name="login" style={{ fontSize: 18, color: 'white' }} /> {t('invite.back_to_login')}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('invite.accept_title')} subtitle={t('invite.accept_sub').replace('{tenant}', info.tenant_name ?? t('invite.org_placeholder')).replace('{role}', info.role ? ROLE_LABEL[info.role as Role] : '')}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'rgba(0,80,203,.05)', border: '1px solid rgba(0,80,203,.12)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#1e3050' }}>
          <Icon name="mail" style={{ fontSize: 15, color: DG.primary, verticalAlign: 'middle', marginRight: 6 }} />
          {info.email}
        </div>
        <AuthInput icon="person" label={t('invite.field_name')} value={name} onChange={setName} placeholder={t('invite.placeholder_name')} />
        <AuthInput icon="lock" type="password" label={t('invite.field_pwd')} value={password} onChange={setPassword} placeholder="••••••••" />
        {error && (
          <div className="v3-appear" style={{ background: 'rgba(186,26,26,.07)', border: '1px solid rgba(186,26,26,.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="error" fill style={{ fontSize: 16, color: DG.fake }} />
            <span style={{ fontSize: 13, color: DG.fake, fontWeight: 600 }}>{error}</span>
          </div>
        )}
        <button type="submit" disabled={status === 'loading'} className="v3-btp" style={{ width: '100%', padding: 14, marginTop: 2 }}>
          {status === 'loading' ? (
            <><span className="v3-spin" style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> {t('invite.submit_loading')}</>
          ) : (
            <><Icon name="how_to_reg" style={{ fontSize: 18, color: 'white' }} /> {t('invite.submit_btn')}</>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
