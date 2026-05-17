import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import type { AircraftCategory, AircraftRecord, CatalogResponse, ContentCategory } from '../../shared/aviation';
import AircraftCard from '@/components/AircraftCard';
import { getCatalog } from '@/lib/api';
import { useFavoritesStore } from '@/store/useFavoritesStore';

const categories: Array<{ value: ContentCategory; label: string }> = [
  { value: 'aircraft', label: '飞行器' },
  { value: 'event', label: '航空事件' },
  { value: 'expert', label: '航空专家' },
];

const aircraftTypes: Array<{ value: '' | AircraftCategory; label: string }> = [
  { value: '', label: '全部类别' },
  { value: 'fighter', label: '战斗机' },
  { value: 'airliner', label: '客机' },
  { value: 'helicopter', label: '直升机' },
  { value: 'drone', label: '无人机' },
  { value: 'transport', label: '运输机' },
];

const sortOptions = [
  { value: 'default', label: '默认排序' },
  { value: 'firstFlightDesc', label: '首飞年份从新到旧' },
  { value: 'firstFlightAsc', label: '首飞年份从旧到新' },
  { value: 'speedDesc', label: '最高速度优先' },
  { value: 'rangeDesc', label: '最大航程优先' },
  { value: 'nameAsc', label: '名称 A-Z' },
];

const emptyData: CatalogResponse = {
  aircraft: [],
  events: [],
  experts: [],
};

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const searchKeyword = searchParams.get('q') || '';
  const [query, setQuery] = useState(searchKeyword);
  const activeTab = (searchParams.get('tab') as ContentCategory) || 'aircraft';
  const aircraftCategory = searchParams.get('category') || '';
  const countryFilter = searchParams.get('country') || '';
  const engineFilter = searchParams.get('engine') || '';
  const yearFrom = searchParams.get('yearFrom') || '';
  const yearTo = searchParams.get('yearTo') || '';
  const sortBy = searchParams.get('sort') || 'default';
  const tagFilter = searchParams.get('tag') || '';
  const favoritesOnly = searchParams.get('favorite') === '1';
  const [data, setData] = useState<CatalogResponse>(emptyData);
  const favoriteIds = useFavoritesStore((state) => state.ids);

  useEffect(() => {
    setQuery(searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    setLoading(true);
    void getCatalog({
      q: searchKeyword,
    })
      .then((payload) => setData(payload))
      .finally(() => setLoading(false));
  }, [searchKeyword]);

  const countryOptions = useMemo(() => {
    return Array.from(new Set(data.aircraft.map((item) => item.country))).sort();
  }, [data.aircraft]);

  const engineOptions = useMemo(() => {
    return Array.from(new Set(data.aircraft.map((item) => item.engineType))).sort();
  }, [data.aircraft]);

  const tagOptions = useMemo(() => {
    return Array.from(new Set(data.aircraft.flatMap((item) => item.tags))).sort((a, b) => a.localeCompare(b));
  }, [data.aircraft]);

  const filteredAircraft = useMemo(() => {
    const from = yearFrom ? Number(yearFrom) : null;
    const to = yearTo ? Number(yearTo) : null;

    const filtered = data.aircraft.filter((item) => {
      const matchesCategory = !aircraftCategory || item.category === aircraftCategory;
      const matchesCountry = !countryFilter || item.country === countryFilter;
      const matchesEngine = !engineFilter || item.engineType === engineFilter;
      const matchesTag = !tagFilter || item.tags.includes(tagFilter);
      const matchesYearFrom = from === null || item.firstFlightYear >= from;
      const matchesYearTo = to === null || item.firstFlightYear <= to;
      const matchesFavorite = !favoritesOnly || favoriteIds.includes(item.id);

      return matchesCategory && matchesCountry && matchesEngine && matchesTag && matchesYearFrom && matchesYearTo && matchesFavorite;
    });

    return [...filtered].sort((a, b) => sortAircraft(a, b, sortBy));
  }, [aircraftCategory, countryFilter, data.aircraft, engineFilter, favoriteIds, favoritesOnly, sortBy, tagFilter, yearFrom, yearTo]);

  const resultsCount = useMemo(() => {
    if (activeTab === 'aircraft') return filteredAircraft.length;
    if (activeTab === 'event') return data.events.length;
    return data.experts.length;
  }, [activeTab, data.events.length, data.experts.length, filteredAircraft.length]);

  function updateSearchParams(updates: Record<string, string>) {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });

    setSearchParams(next);
  }

  function resetAircraftFilters() {
    updateSearchParams({
      category: '',
      country: '',
      engine: '',
      tag: '',
      favorite: '',
      yearFrom: '',
      yearTo: '',
      sort: '',
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/8 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">知识库浏览</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">按类别浏览航空知识</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
              在同一套中文信息架构中查看飞行器、航空大事件与航空专家，并用结构化筛选快速定位目标机型。
            </p>
          </div>
          <div className="text-sm text-slate-400">当前结果：{resultsCount} 条</div>
        </div>

        <form
          className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            updateSearchParams({ q: query });
          }}
        >
          <Search className="h-5 w-5 text-cyan-200" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索飞行器、事件、人物"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => updateSearchParams({ tab: item.value })}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeTab === item.value
                  ? 'bg-cyan-300 text-slate-950'
                  : 'border border-cyan-300/20 text-slate-300 hover:border-cyan-200/40 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeTab === 'aircraft' ? (
          <div className="mt-6 rounded-[28px] border border-cyan-300/10 bg-slate-950/45 p-5">
            <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">飞行器高级筛选</h2>
                <p className="mt-1 text-sm text-slate-400">按类别、国家/地区、发动机类型、首飞年份和排序维度组合筛选。</p>
              </div>
              <button
                type="button"
                onClick={resetAircraftFilters}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
              >
                重置筛选
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
              <FilterField label="类别">
                <select
                  value={aircraftCategory}
                  onChange={(event) => updateSearchParams({ category: event.target.value })}
                  className={filterInputClassName}
                >
                  {aircraftTypes.map((item) => (
                    <option key={item.value} value={item.value} className="bg-slate-900">
                      {item.label}
                    </option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="国家/地区">
                <select
                  value={countryFilter}
                  onChange={(event) => updateSearchParams({ country: event.target.value })}
                  className={filterInputClassName}
                >
                  <option value="" className="bg-slate-900">全部国家/地区</option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country} className="bg-slate-900">
                      {country}
                    </option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="发动机类型">
                <select
                  value={engineFilter}
                  onChange={(event) => updateSearchParams({ engine: event.target.value })}
                  className={filterInputClassName}
                >
                  <option value="" className="bg-slate-900">全部发动机</option>
                  {engineOptions.map((engine) => (
                    <option key={engine} value={engine} className="bg-slate-900">
                      {engine}
                    </option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="标签主题">
                <select
                  value={tagFilter}
                  onChange={(event) => updateSearchParams({ tag: event.target.value })}
                  className={filterInputClassName}
                >
                  <option value="" className="bg-slate-900">全部标签</option>
                  {tagOptions.map((tag) => (
                    <option key={tag} value={tag} className="bg-slate-900">
                      {tag}
                    </option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="首飞起始">
                <input
                  type="number"
                  value={yearFrom}
                  onChange={(event) => updateSearchParams({ yearFrom: event.target.value })}
                  placeholder="如 1960"
                  className={filterInputClassName}
                />
              </FilterField>
              <FilterField label="首飞截止">
                <input
                  type="number"
                  value={yearTo}
                  onChange={(event) => updateSearchParams({ yearTo: event.target.value })}
                  placeholder="如 2024"
                  className={filterInputClassName}
                />
              </FilterField>
              <FilterField label="排序">
                <select
                  value={sortBy}
                  onChange={(event) => updateSearchParams({ sort: event.target.value })}
                  className={filterInputClassName}
                >
                  {sortOptions.map((item) => (
                    <option key={item.value} value={item.value} className="bg-slate-900">
                      {item.label}
                    </option>
                  ))}
                </select>
              </FilterField>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => updateSearchParams({ favorite: favoritesOnly ? '' : '1' })}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  favoritesOnly
                    ? 'border-rose-300/40 bg-rose-300/10 text-rose-100'
                    : 'border-white/10 text-slate-300 hover:border-rose-300/30 hover:text-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${favoritesOnly ? 'fill-current' : ''}`} />
                只看收藏
              </button>
              {tagOptions.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => updateSearchParams({ tag: tagFilter === tag ? '' : tag })}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    tagFilter === tag
                      ? 'border-cyan-300 bg-cyan-300 text-slate-950'
                      : 'border-cyan-300/20 text-cyan-100 hover:border-cyan-200/40 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {loading ? (
        <div className="rounded-[32px] border border-white/8 bg-white/5 p-8 text-center text-slate-400">
          正在加载航空知识数据...
        </div>
      ) : null}

      {!loading && activeTab === 'aircraft' ? (
        <section className="grid gap-5 xl:grid-cols-2">
          {filteredAircraft.map((item) => (
            <AircraftCard key={item.id} aircraft={item} />
          ))}
          {!filteredAircraft.length ? (
            <div className="rounded-[32px] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400">
              没有找到符合条件的飞行器。
            </div>
          ) : null}
        </section>
      ) : null}

      {!loading && activeTab === 'event' ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {data.events.map((item) => (
            <Link
              key={item.id}
              to={`/events/${item.id}`}
              className="rounded-[32px] border border-white/8 bg-white/5 p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.07]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.24em] text-amber-200">{item.date}</span>
                <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{item.type}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">{item.location}</p>
            </Link>
          ))}
          {!data.events.length ? (
            <div className="rounded-[32px] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400">
              没有找到符合条件的航空事件。
            </div>
          ) : null}
        </section>
      ) : null}

      {!loading && activeTab === 'expert' ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {data.experts.map((item) => (
            <Link
              key={item.id}
              to={`/experts/${item.id}`}
              className="rounded-[32px] border border-white/8 bg-white/5 p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.07]"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-100">{item.role}</p>
                <span className="rounded-full border border-amber-300/20 px-3 py-1 text-xs text-amber-100">{item.era}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white">{item.name}</h2>
              <p className="mt-2 text-sm text-cyan-200">{item.nationality}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
            </Link>
          ))}
          {!data.experts.length ? (
            <div className="rounded-[32px] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400">
              没有找到符合条件的航空专家。
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="block text-sm text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function sortAircraft(a: AircraftRecord, b: AircraftRecord, sortBy: string) {
  if (sortBy === 'firstFlightDesc') return b.firstFlightYear - a.firstFlightYear;
  if (sortBy === 'firstFlightAsc') return a.firstFlightYear - b.firstFlightYear;
  if (sortBy === 'speedDesc') return b.maxSpeedKmh - a.maxSpeedKmh;
  if (sortBy === 'rangeDesc') return b.rangeKm - a.rangeKm;
  if (sortBy === 'nameAsc') return a.englishName.localeCompare(b.englishName);
  return 0;
}

const filterInputClassName = 'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40';
