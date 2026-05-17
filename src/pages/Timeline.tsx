import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Search } from 'lucide-react';
import type {
  AircraftRecord,
  AviationEventRecord,
  CatalogResponse,
  EventType,
} from '../../shared/aviation';
import { getCatalog } from '@/lib/api';

const eventTypeOptions: Array<{ value: '' | EventType; label: string }> = [
  { value: '', label: '全部事件' },
  { value: 'first-flight', label: '首航/首飞' },
  { value: 'record', label: '纪录突破' },
  { value: 'accident', label: '事故' },
  { value: 'milestone', label: '里程碑' },
];

const emptyData: CatalogResponse = {
  aircraft: [],
  events: [],
  experts: [],
};

export default function Timeline() {
  const [data, setData] = useState<CatalogResponse>(emptyData);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [eventType, setEventType] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    void getCatalog()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const aircraftById = useMemo(() => {
    return new Map(data.aircraft.map((item) => [item.id, item]));
  }, [data.aircraft]);

  const filteredEvents = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const from = yearFrom ? Number(yearFrom) : null;
    const to = yearTo ? Number(yearTo) : null;

    const filtered = data.events.filter((item) => {
      const year = getEventYear(item);
      const relatedAircraft = item.aircraftIds
        .map((id) => aircraftById.get(id))
        .filter((aircraft): aircraft is AircraftRecord => Boolean(aircraft));
      const matchesKeyword =
        !keyword ||
        [
          item.title,
          item.summary,
          item.details,
          item.location,
          item.type,
          ...relatedAircraft.map((aircraft) => `${aircraft.name} ${aircraft.englishName}`),
        ].some((value) => value.toLowerCase().includes(keyword));
      const matchesType = !eventType || item.type === eventType;
      const matchesFrom = from === null || year >= from;
      const matchesTo = to === null || year <= to;

      return matchesKeyword && matchesType && matchesFrom && matchesTo;
    });

    return [...filtered].sort((a, b) => {
      const result = a.date.localeCompare(b.date);
      return sortDirection === 'asc' ? result : -result;
    });
  }, [aircraftById, data.events, eventType, query, sortDirection, yearFrom, yearTo]);

  const eventStats = useMemo(() => {
    return eventTypeOptions
      .filter((item) => item.value)
      .map((item) => ({
        ...item,
        count: data.events.filter((event) => event.type === item.value).length,
      }));
  }, [data.events]);

  const decadeSections = useMemo(() => {
    const groups = new Map<number, AviationEventRecord[]>();

    filteredEvents.forEach((event) => {
      const decade = Math.floor(getEventYear(event) / 10) * 10;
      const current = groups.get(decade) || [];
      current.push(event);
      groups.set(decade, current);
    });

    return Array.from(groups.entries())
      .sort(([decadeA], [decadeB]) => (sortDirection === 'asc' ? decadeA - decadeB : decadeB - decadeA))
      .map(([decade, events]) => ({
        decade,
        anchorId: `decade-${decade}`,
        events,
      }));
  }, [filteredEvents, sortDirection]);

  return (
    <div className="space-y-8">
      <section className="rounded-[36px] border border-white/8 bg-white/5 p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">航空时间线</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">按年份追踪航空大事件</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
              将首飞、事故、纪录突破和里程碑放在同一条时间轴上，便于理解机型、人物与事件之间的历史关系。
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-300/15 bg-slate-950/60 px-5 py-4 text-sm text-slate-300">
            当前显示 <span className="font-semibold text-white">{filteredEvents.length}</span> / {data.events.length} 条事件
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_220px_160px_160px_180px]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <Search className="h-5 w-5 text-cyan-200" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索事件、地点或关联机型"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
          <select value={eventType} onChange={(event) => setEventType(event.target.value)} className={inputClassName}>
            {eventTypeOptions.map((item) => (
              <option key={item.value} value={item.value} className="bg-slate-900">
                {item.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={yearFrom}
            onChange={(event) => setYearFrom(event.target.value)}
            placeholder="起始年份"
            className={inputClassName}
          />
          <input
            type="number"
            value={yearTo}
            onChange={(event) => setYearTo(event.target.value)}
            placeholder="截止年份"
            className={inputClassName}
          />
          <select value={sortDirection} onChange={(event) => setSortDirection(event.target.value as 'desc' | 'asc')} className={inputClassName}>
            <option value="desc" className="bg-slate-900">从近到远</option>
            <option value="asc" className="bg-slate-900">从远到近</option>
          </select>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {eventStats.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setEventType(item.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                eventType === item.value
                  ? 'border-cyan-300 bg-cyan-300 text-slate-950'
                  : 'border-cyan-300/20 text-slate-300 hover:border-cyan-200/40 hover:text-white'
              }`}
            >
              {item.label} · {item.count}
            </button>
          ))}
        </div>

        {decadeSections.length ? (
          <div className="mt-5 rounded-[28px] border border-cyan-300/10 bg-slate-950/45 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-300">年代锚点导航</p>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {sortDirection === 'desc' ? '从近到远' : '从远到近'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {decadeSections.map((section) => (
                <a
                  key={section.decade}
                  href={`#${section.anchorId}`}
                  className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100 transition hover:border-cyan-200/40 hover:text-white"
                >
                  {section.decade}s · {section.events.length} 条
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {loading ? (
        <div className="rounded-[32px] border border-white/8 bg-white/5 p-8 text-center text-slate-400">
          正在加载时间线...
        </div>
      ) : null}

      {!loading ? (
        <section className="space-y-8">
          {decadeSections.map((section) => (
            <div
              key={section.anchorId}
              id={section.anchorId}
              className="scroll-mt-28 rounded-[32px] border border-white/8 bg-white/[0.03] p-4 md:p-5"
            >
              <div className="sticky top-24 z-10 mb-5 flex items-center justify-between gap-4 rounded-[24px] border border-cyan-300/10 bg-slate-950/85 px-5 py-4 backdrop-blur-xl">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">年代分段</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{section.decade}s</h2>
                </div>
                <div className="text-sm text-slate-400">{section.events.length} 条事件</div>
              </div>

              <div className="relative space-y-5">
                <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-cyan-300/15 md:block" />
                {section.events.map((event) => {
                  const relatedAircraft = event.aircraftIds
                    .map((id) => aircraftById.get(id))
                    .filter((aircraft): aircraft is AircraftRecord => Boolean(aircraft));

                  return (
                    <article key={event.id} className="relative rounded-[32px] border border-white/8 bg-white/5 p-6 md:ml-12">
                      <div className="absolute -left-[46px] top-6 hidden h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/25 bg-slate-950 text-cyan-100 md:flex">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-amber-300/20 px-3 py-1 text-xs text-amber-100">{event.date}</span>
                            <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{getEventTypeLabel(event.type)}</span>
                            <span className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300">{event.location}</span>
                          </div>
                          <Link to={`/events/${event.id}`} className="mt-4 block text-2xl font-semibold text-white transition hover:text-cyan-100">
                            {event.title}
                          </Link>
                          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">{event.summary}</p>
                        </div>
                        <div className="text-right text-sm text-slate-400">
                          {getEventYear(event)}
                        </div>
                      </div>

                      {relatedAircraft.length ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {relatedAircraft.map((aircraft) => (
                            <Link
                              key={aircraft.id}
                              to={`/aircraft/${aircraft.id}`}
                              className="rounded-full border border-cyan-300/15 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-100 transition hover:border-cyan-200/40 hover:text-white"
                            >
                              {aircraft.name}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ))}

          {!filteredEvents.length ? (
            <div className="rounded-[32px] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400">
              没有找到符合条件的航空事件。
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function getEventYear(event: AviationEventRecord) {
  return Number(event.date.slice(0, 4));
}

function getEventTypeLabel(type: EventType) {
  return eventTypeOptions.find((item) => item.value === type)?.label || type;
}

const inputClassName = 'rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40';
