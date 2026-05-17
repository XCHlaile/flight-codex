import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Database, LayoutDashboard, LogOut, Radar, ScrollText, ShieldCheck, UserRound } from 'lucide-react';
import CompareDock from '@/components/CompareDock';
import { logout } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function SiteShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const links = [
    { to: '/', label: '首页' },
    { to: '/catalog', label: '知识库' },
    { to: '/timeline', label: '时间线' },
    { to: '/compare', label: '飞行器对比' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: '管理后台' }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(104,225,253,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(243,201,105,0.12),_transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(151,214,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(151,214,255,0.08)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-cyan-300/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
              <Radar className="h-6 w-6" />
            </div>
            <div>
              <p className="font-['Orbitron'] text-lg uppercase tracking-[0.32em] text-cyan-200">Flight Codex</p>
              <p className="text-sm text-slate-400">飞行者图鉴 · 开放型航空科普知识平台</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap items-center gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm transition ${
                      isActive
                        ? 'bg-cyan-300 text-slate-950'
                        : 'border border-transparent text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {user ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  {user.role === 'admin' ? <ShieldCheck className="h-4 w-4 text-cyan-200" /> : <UserRound className="h-4 w-4 text-cyan-200" />}
                  <span>{user.displayName}</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await logout();
                    } finally {
                      clearSession();
                      navigate('/login', { replace: true });
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8">{children}</main>

      <footer className="relative z-10 border-t border-cyan-300/10 px-5 py-6 text-sm text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>为航空爱好者、科普讲师与中文学习者打造的结构化航空知识中枢。</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <Database className="h-4 w-4" />
              结构化图鉴
            </span>
            <span className="inline-flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              事件与人物关联
            </span>
            <span className="inline-flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              后台即时发布
            </span>
          </div>
        </div>
      </footer>

      <CompareDock />
    </div>
  );
}
