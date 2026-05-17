import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import type { UserRole } from '../../shared/auth';
import { login, registerUser } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const demoAccounts: Record<UserRole, { username: string; password: string; title: string; description: string }> = {
  user: {
    username: 'viewer',
    password: 'viewer123',
    title: '普通用户',
    description: '可浏览飞行器、事件、人物和飞行器对比功能，但不可进入后台。',
  },
  admin: {
    username: 'admin',
    password: 'admin123',
    title: '管理员',
    description: '拥有普通用户能力，并可进入后台发布与维护飞行器数据。',
  },
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ready = useAuthStore((state) => state.ready);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const [role, setRole] = useState<UserRole>('user');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState(demoAccounts.user.username);
  const [password, setPassword] = useState(demoAccounts.user.password);
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = useMemo(() => searchParams.get('redirect') || '/', [searchParams]);

  if (ready && user) {
    return <Navigate to={user.role === 'admin' ? redirectTo : '/'} replace />;
  }

  function switchRole(nextRole: UserRole) {
    setRole(nextRole);
    setMode('login');
    setError('');
    setDisplayName('');
    setConfirmPassword('');
    setUsername(demoAccounts[nextRole].username);
    setPassword(demoAccounts[nextRole].password);
  }

  function openRegister() {
    setRole('user');
    setMode('register');
    setError('');
    setDisplayName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }

  function backToLogin() {
    setMode('login');
    setError('');
    setDisplayName('');
    setConfirmPassword('');
    setUsername(demoAccounts.user.username);
    setPassword(demoAccounts.user.password);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const session = await login({ username, password, role });
      setSession(session);
      navigate(role === 'admin' ? redirectTo : '/', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '登录失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致，请重新确认。');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = await registerUser({
        username,
        password,
        displayName,
      });
      setSession(session);
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '注册失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07111F] px-5 py-10 text-slate-100">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[36px] border border-cyan-300/15 bg-white/5 p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100">
            <LockKeyhole className="h-4 w-4" />
            角色登录入口
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-white">飞行者图鉴</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            本次 Demo 采用普通用户与管理员分离的登录机制。普通用户负责浏览学习，管理员负责维护知识库内容与后台发布。
          </p>

          <div className="mt-8 space-y-4">
            {(['user', 'admin'] as UserRole[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  switchRole(item);
                }}
                className={`w-full rounded-[28px] border p-5 text-left transition ${
                  role === item
                    ? 'border-cyan-300/40 bg-cyan-300/10'
                    : 'border-white/8 bg-slate-950/50 hover:border-cyan-300/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                    {item === 'admin' ? <ShieldCheck className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{demoAccounts[item].title}</p>
                    <p className="mt-1 text-sm text-slate-400">{demoAccounts[item].description}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  演示账号：`{demoAccounts[item].username}` / `{demoAccounts[item].password}`
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[36px] border border-white/8 bg-slate-950/75 p-8 shadow-2xl shadow-cyan-500/10">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">
            {mode === 'register' ? '普通用户注册' : '登录表单'}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            {mode === 'register' ? '注册普通用户账号' : `${demoAccounts[role].title}登录`}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            {mode === 'register'
              ? '注册入口仅面向普通用户。注册成功后会自动登录，并可立即浏览飞行器、事件、人物与对比功能。'
              : `当前将按“${demoAccounts[role].title}”身份校验账号，账号与角色不匹配时会被拒绝登录。`}
          </p>

          <form onSubmit={mode === 'register' ? handleRegister : handleSubmit} className="mt-8 space-y-5">
            {mode === 'register' ? (
              <Field label="昵称">
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="如：航空爱好者小林"
                  className={inputClassName}
                />
              </Field>
            ) : null}
            <Field label="账号">
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={mode === 'register' ? '请设置登录账号' : ''}
                className={inputClassName}
              />
            </Field>
            <Field label="密码">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === 'register' ? '至少 6 位密码' : ''}
                className={inputClassName}
              />
            </Field>
            {mode === 'register' ? (
              <Field label="确认密码">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="请再次输入密码"
                  className={inputClassName}
                />
              </Field>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? mode === 'register'
                  ? '正在注册...'
                  : '正在登录...'
                : mode === 'register'
                  ? '注册并进入普通用户界面'
                  : `以${demoAccounts[role].title}身份进入`}
            </button>

            {role === 'user' ? (
              <button
                type="button"
                onClick={mode === 'register' ? backToLogin : openRegister}
                className="w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
              >
                {mode === 'register' ? '返回普通用户登录' : '注册普通用户'}
              </button>
            ) : null}

            {mode === 'register' ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                注册后将创建一个新的普通用户账号，无法获得管理员后台权限。
              </div>
            ) : null}
          </form>

          {mode === 'login' && role === 'user' ? (
            <p className="mt-5 text-sm text-slate-400">
              没有普通用户账号？可点击下方“注册普通用户”自行创建。
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-slate-300">{label}</span>
      {children}
    </label>
  );
}

const inputClassName = 'w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40';
