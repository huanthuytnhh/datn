'use client';

import { useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuthStore } from '@/store/auth';
import { authLogin, authMe } from '@/lib/api';

export default function LoginPage() {
  const navigate = useNavigation((s) => s.navigate);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { access_token } = await authLogin(email, password);
      localStorage.setItem('dg_token', access_token);
      const { user, tenant } = await authMe();
      setAuth(access_token, user, tenant);
      navigate('dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#F0F9FF]">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-blob bg-blue-200 w-[600px] h-[600px] top-[-200px] right-[-100px]" />
        <div className="bg-blob bg-indigo-100 w-[500px] h-[500px] bottom-[-100px] left-[-100px]" />
        <div className="bg-blob bg-cyan-100 w-[400px] h-[400px] top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Floating security elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] animate-float opacity-20">
          <span className="material-symbols-outlined text-[60px] text-blue-400">fingerprint</span>
        </div>
        <div className="absolute top-[25%] right-[12%] animate-float opacity-15" style={{ animationDelay: '1s' }}>
          <span className="material-symbols-outlined text-[50px] text-indigo-400">shield</span>
        </div>
        <div className="absolute bottom-[20%] left-[15%] animate-float opacity-15" style={{ animationDelay: '2s' }}>
          <span className="material-symbols-outlined text-[45px] text-cyan-400">visibility</span>
        </div>
        <div className="absolute bottom-[30%] right-[8%] animate-float opacity-10" style={{ animationDelay: '0.5s' }}>
          <span className="material-symbols-outlined text-[55px] text-blue-300">lock</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[440px] mx-4">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0050cb] shadow-xl shadow-[#0050cb]/30 mb-4">
            <span className="material-symbols-outlined text-white text-[32px]">security</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-[#0050cb] italic">DeepGuard</h1>
          <p className="text-[11px] uppercase font-bold tracking-[0.3em] text-slate-400 mt-1">VietBank Workspace</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-xl border border-white/60">
          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-800">Đăng nhập</h2>
            <p className="text-xs text-slate-500 mt-1">Truy cập hệ thống phát hiện deepfake</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dev@vietbank.vn"
                  className="w-full bg-white/60 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#0050cb] focus:ring-4 focus:ring-[#0050cb]/10 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mật khẩu</label>
                <button type="button" className="text-[10px] font-bold text-[#0050cb] hover:underline">Quên mật khẩu?</button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full bg-white/60 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-[#0050cb] focus:ring-4 focus:ring-[#0050cb]/10 transition-all placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-[#0050cb] focus:ring-[#0050cb] accent-[#0050cb]"
              />
              <label htmlFor="remember" className="text-xs text-slate-500 cursor-pointer">Ghi nhớ đăng nhập</label>
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#0050cb] text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-[#0050cb]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  ĐANG XÁC THỰC...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  ĐĂNG NHẬP
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">hoặc</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* SSO */}
          <button className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-blue-600">badge</span>
            Đăng nhập bằng VietBank SSO
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-slate-400">
            © 2024 VietBank DeepGuard v2.1 — Bảo mật bởi AI
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-600 uppercase">Hệ thống hoạt động bình thường</span>
          </div>
        </div>
      </div>
    </div>
  );
}
