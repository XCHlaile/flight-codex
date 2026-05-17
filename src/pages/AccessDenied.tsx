import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="rounded-[36px] border border-white/8 bg-white/5 p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-300/20 bg-amber-300/10 text-amber-100">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold text-white">无权访问管理后台</h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
        当前账号是普通用户，只能使用首页、知识库、详情页和飞行器对比等公开功能。若需要进入后台，请使用管理员账号重新登录。
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
          返回首页
        </Link>
        <Link to="/login" className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:text-white">
          切换账号
        </Link>
      </div>
    </div>
  );
}
