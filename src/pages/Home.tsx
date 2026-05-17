import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bookmark, Database, Radar, Search, Shield, Sparkles } from 'lucide-react';
import type { AircraftRecord, AviationEventRecord, AviationExpertRecord, DashboardSummary } from '../../shared/aviation';
import AircraftCard from '@/components/AircraftCard';
import { getCatalog, getSummary } from '@/lib/api';
import { useFavoritesStore } from '@/store/useFavoritesStore';

const statMeta = [
  { key: 'aircraftCount', label: '飞行器档案', icon: Database },
  { key: 'eventCount', label: '航空事件', icon: Radar },
  { key: 'expertCount', label: '航空专家', icon: Sparkles },
  { key: 'compareReadyCount', label: '可对比机型', icon: Shield },
] as const;

const curatedDossiers = [
  {
    title: '超音速与高速传奇',
    description: '聚焦协和式、SR-71 等高速飞行器，适合从速度与技术突破角度探索航空史。',
    to: '/catalog?tag=%E8%B6%85%E9%9F%B3%E9%80%9F',
    badge: '专题策展',
  },
  {
    title: '隐身与现代空战',
    description: '从隐身战斗机与现代空战装备切入，快速浏览代表型号与关键节点。',
    to: '/catalog?tag=%E9%9A%90%E8%BA%AB',
    badge: '主题筛选',
  },
  {
    title: '运输航空体系',
    description: '查看大型运输机与客机的谱系差异，适合教学展示尺寸、航程和任务定位。',
    to: '/catalog?category=transport',
    badge: '按类别浏览',
  },
  {
    title: '首飞里程碑时间线',
    description: '直接进入航空时间线，聚焦首飞与里程碑事件，理解机型演进与产业节点。',
    to: '/timeline',
    badge: '时间轴',
  },
] as const;

export default function Home() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([]);
  const [events, setEvents] = useState<AviationEventRecord[]>([]);
  const [experts, setExperts] = useState<AviationExpertRecord[]>([]);
  const [query, setQuery] = useState('');
  const favoriteIds = useFavoritesStore((state) => state.ids);

  useEffect(() => {
    void Promise.all([getSummary(), getCatalog()]).then(([summaryData, catalogData]) => {
      setSummary(summaryData);
      setAircraft(catalogData.aircraft);
      setEvents(catalogData.events);
      setExperts(catalogData.experts);
    });
  }, []);

  const featuredAircraft = useMemo(() => aircraft.slice(0, 6), [aircraft]);
  const featuredEvents = useMemo(() => events.slice(0, 4), [events]);
  const featuredExperts = useMemo(() => experts.slice(0, 4), [experts]);
  const favoriteAircraft = useMemo(
    () => aircraft.filter((item) => favoriteIds.includes(item.id)).slice(0, 4),
    [aircraft, favoriteIds],
  );

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-[36px] border border-cyan-300/15 bg-slate-950/75 px-6 py-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl lg:px-10 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-100">
              <Radar className="h-4 w-4" />
              中文航空知识平台 Demo
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-['Orbitron'] text-4xl uppercase leading-tight text-white md:text-5xl">
                Flight Codex
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300">
                将飞行器图鉴、航空事件年表与航空专家档案放进同一个中文知识中枢，支持即时检索、多机型对比和后台新增发布。
              </p>
            </div>

            <form
              className="flex flex-col gap-3 rounded-[28px] border border-cyan-300/15 bg-white/5 p-4 md:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                navigate(`/catalog${query ? `?q=${encodeURIComponent(query)}` : ''}`);
              }}
            >
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <Search className="h-5 w-5 text-cyan-200" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索机型、事件或航空专家，例如 C919、协和式、Kelly Johnson"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                进入知识库
              </button>
            </form>

            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <Link to="/catalog?category=fighter" className="rounded-full border border-cyan-300/20 px-4 py-2 hover:border-cyan-200/40 hover:text-white">战斗机</Link>
              <Link to="/catalog?category=airliner" className="rounded-full border border-cyan-300/20 px-4 py-2 hover:border-cyan-200/40 hover:text-white">客机</Link>
              <Link to="/catalog?category=helicopter" className="rounded-full border border-cyan-300/20 px-4 py-2 hover:border-cyan-200/40 hover:text-white">直升机</Link>
              <Link to="/catalog?category=drone" className="rounded-full border border-cyan-300/20 px-4 py-2 hover:border-cyan-200/40 hover:text-white">无人机</Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {statMeta.map(({ key, label, icon: Icon }) => (
              <div key={key} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
                <div className="mb-10 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.28em] text-slate-500">Live</span>
                </div>
                <p className="text-3xl font-semibold text-white">{summary ? summary[key] : '--'}</p>
                <p className="mt-2 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/8 bg-white/5 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">精选飞行器</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">从代表机型进入图鉴</h2>
            </div>
            <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white">
              全部浏览
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {featuredAircraft.map((item) => (
              <AircraftCard key={item.id} aircraft={item} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-white/8 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">航空时间线</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">大事件速览</h2>
              </div>
              <Link to="/timeline" className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white">
                进入时间线
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 space-y-5">
              {featuredEvents.map((item) => (
                <Link
                  key={item.id}
                  to={`/events/${item.id}`}
                  className="block rounded-3xl border border-white/8 bg-slate-950/60 p-4 transition hover:border-cyan-300/30 hover:bg-slate-950"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-xs uppercase tracking-[0.24em] text-amber-200">{item.date}</span>
                    <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{item.type}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.summary}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/8 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">专家人物墙</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">连接机型背后的人</h2>
            <div className="mt-6 space-y-4">
              {featuredExperts.map((item) => (
                <Link
                  key={item.id}
                  to={`/experts/${item.id}`}
                  className="flex items-start justify-between gap-4 rounded-3xl border border-white/8 bg-slate-950/60 p-4 transition hover:border-cyan-300/30 hover:bg-slate-950"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <p className="mt-1 text-sm text-cyan-100">{item.role} · {item.nationality}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.summary}</p>
                  </div>
                  <span className="rounded-full border border-amber-300/20 px-3 py-1 text-xs text-amber-100">{item.era}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/8 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">专题策展</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">像数字馆藏一样进入主题航线</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
              借鉴航空博物馆数字媒资平台的主题导航方式，用预设专题快速进入某条知识路径，而不必每次都从关键词开始搜索。
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {curatedDossiers.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="rounded-[28px] border border-cyan-300/15 bg-slate-950/60 p-5 transition hover:border-cyan-300/35 hover:bg-slate-950"
            >
              <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{item.badge}</span>
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm text-cyan-200">
                进入专题
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {favoriteAircraft.length ? (
        <section className="rounded-[32px] border border-white/8 bg-white/5 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">我的收藏</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">继续浏览你标记过的机型</h2>
            </div>
            <Link
              to="/catalog?favorite=1"
              className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white"
            >
              查看全部收藏
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-rose-100">
            <Bookmark className="h-4 w-4" />
            已保存 {favoriteIds.length} 款机型
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {favoriteAircraft.map((item) => (
              <AircraftCard key={item.id} aircraft={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
