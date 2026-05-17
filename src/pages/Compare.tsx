import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy } from 'lucide-react';
import type { AircraftRecord } from '../../shared/aviation';
import { getAircraftList } from '@/lib/api';
import { buildComparePath, parseCompareIds } from '@/lib/compare-share';
import { useCompareStore } from '@/store/useCompareStore';

const rows = [
  { label: '缩略图', key: 'imageUrl' },
  { label: '机型', key: 'name' },
  { label: '英文名', key: 'englishName' },
  { label: '类别', key: 'category' },
  { label: '国家/地区', key: 'country' },
  { label: '最高速度', key: 'maxSpeedKmh' },
  { label: '最大航程', key: 'rangeKm' },
  { label: '长度', key: 'lengthM' },
  { label: '翼展', key: 'wingspanM' },
  { label: '发动机类型', key: 'engineType' },
  { label: '首飞年份', key: 'firstFlightYear' },
] as const;

export default function Compare() {
  const [searchParams] = useSearchParams();
  const selectedIds = useCompareStore((state) => state.selectedIds);
  const setSelectedIds = useCompareStore((state) => state.setSelectedIds);
  const toggle = useCompareStore((state) => state.toggle);
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([]);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    void getAircraftList().then(setAircraft);
  }, []);

  useEffect(() => {
    const idsFromUrl = parseCompareIds(searchParams.get('ids'));

    if (idsFromUrl.length) {
      setSelectedIds(idsFromUrl);
    }
  }, [searchParams, setSelectedIds]);

  useEffect(() => {
    if (!shareMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setShareMessage(''), 2200);
    return () => window.clearTimeout(timer);
  }, [shareMessage]);

  const selectedAircraft = useMemo(
    () => aircraft.filter((item) => selectedIds.includes(item.id)),
    [aircraft, selectedIds],
  );

  const fastest = useMemo(() => {
    return selectedAircraft.reduce<string | null>((result, item) => {
      if (!result) return item.id;
      const current = selectedAircraft.find((aircraftItem) => aircraftItem.id === result);
      return (current?.maxSpeedKmh || 0) >= item.maxSpeedKmh ? result : item.id;
    }, null);
  }, [selectedAircraft]);

  const longestRange = useMemo(() => {
    return selectedAircraft.reduce<string | null>((result, item) => {
      if (!result) return item.id;
      const current = selectedAircraft.find((aircraftItem) => aircraftItem.id === result);
      return (current?.rangeKm || 0) >= item.rangeKm ? result : item.id;
    }, null);
  }, [selectedAircraft]);

  const largestWingspan = useMemo(() => {
    return selectedAircraft.reduce<string | null>((result, item) => {
      if (item.wingspanM === undefined) {
        return result;
      }

      if (!result) {
        return item.id;
      }

      const current = selectedAircraft.find((aircraftItem) => aircraftItem.id === result);
      return (current?.wingspanM || 0) >= item.wingspanM ? result : item.id;
    }, null);
  }, [selectedAircraft]);

  const newestFirstFlight = useMemo(() => {
    return selectedAircraft.reduce<string | null>((result, item) => {
      if (!result) return item.id;
      const current = selectedAircraft.find((aircraftItem) => aircraftItem.id === result);
      return (current?.firstFlightYear || 0) >= item.firstFlightYear ? result : item.id;
    }, null);
  }, [selectedAircraft]);

  const earliestFirstFlight = useMemo(() => {
    return selectedAircraft.reduce<string | null>((result, item) => {
      if (!result) return item.id;
      const current = selectedAircraft.find((aircraftItem) => aircraftItem.id === result);
      return (current?.firstFlightYear || 0) <= item.firstFlightYear ? result : item.id;
    }, null);
  }, [selectedAircraft]);

  const metricMax = useMemo(() => ({
    maxSpeedKmh: Math.max(...selectedAircraft.map((item) => item.maxSpeedKmh), 0),
    rangeKm: Math.max(...selectedAircraft.map((item) => item.rangeKm), 0),
    lengthM: Math.max(...selectedAircraft.map((item) => item.lengthM), 0),
    wingspanM: Math.max(...selectedAircraft.map((item) => item.wingspanM || 0), 0),
    firstFlightYear: Math.max(...selectedAircraft.map((item) => item.firstFlightYear), 0),
  }), [selectedAircraft]);

  const conclusionCards = useMemo(() => {
    const fastestAircraft = selectedAircraft.find((item) => item.id === fastest) || null;
    const rangeAircraft = selectedAircraft.find((item) => item.id === longestRange) || null;
    const wingspanAircraft = selectedAircraft.find((item) => item.id === largestWingspan) || null;
    const newestAircraft = selectedAircraft.find((item) => item.id === newestFirstFlight) || null;

    return [
      fastestAircraft ? {
        title: '速度表现',
        winner: fastestAircraft.name,
        detail: `如果你更关注高速突防或制空响应，${fastestAircraft.name}在当前对比组里速度最突出，最高速度达到 ${fastestAircraft.maxSpeedKmh} km/h。`,
      } : null,
      rangeAircraft ? {
        title: '远程任务',
        winner: rangeAircraft.name,
        detail: `如果你更关注远程覆盖与持续航线能力，${rangeAircraft.name}具备本组最高航程，可达到 ${rangeAircraft.rangeKm} km。`,
      } : null,
      wingspanAircraft ? {
        title: '尺寸与平台',
        winner: wingspanAircraft.name,
        detail: `如果你关注大平台气动布局或载荷空间，${wingspanAircraft.name}拥有当前组最大的翼展，更适合从大型平台视角理解机型定位。`,
      } : null,
      newestAircraft ? {
        title: '技术代际',
        winner: newestAircraft.name,
        detail: `如果你想优先观察更新的设计思路，${newestAircraft.name}在本组中首飞时间最新，首飞于 ${newestAircraft.firstFlightYear} 年。`,
      } : null,
    ].filter((item): item is {
      title: string;
      winner: string;
      detail: string;
    } => Boolean(item));
  }, [fastest, largestWingspan, longestRange, newestFirstFlight, selectedAircraft]);

  const narrativeSummary = useMemo(() => {
    const fastestAircraft = selectedAircraft.find((item) => item.id === fastest) || null;
    const rangeAircraft = selectedAircraft.find((item) => item.id === longestRange) || null;
    const earliestAircraft = selectedAircraft.find((item) => item.id === earliestFirstFlight) || null;
    const newestAircraft = selectedAircraft.find((item) => item.id === newestFirstFlight) || null;
    const categories = Array.from(new Set(selectedAircraft.map((item) => getCategoryLabel(item.category))));

    const parts = [
      fastestAircraft ? `${fastestAircraft.name}在速度上领先` : '',
      rangeAircraft ? `${rangeAircraft.name}更强调航程覆盖` : '',
      earliestAircraft && newestAircraft && earliestAircraft.id !== newestAircraft.id
        ? `从首飞年代看，本组横跨 ${earliestAircraft.firstFlightYear} 到 ${newestAircraft.firstFlightYear}`
        : '',
      categories.length > 1
        ? `同时覆盖了${categories.join('、')}等不同类型机型，更适合做任务定位与技术路线对比`
        : `当前对比组同属${categories[0] || '飞行器'}，更适合同类横向评估`,
    ].filter(Boolean);

    return parts.join('；') + '。';
  }, [earliestFirstFlight, fastest, longestRange, newestFirstFlight, selectedAircraft]);

  async function handleCopyShareLink() {
    const shareUrl = new URL(buildComparePath(selectedIds), window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('分享链接已复制');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.setAttribute('readonly', 'true');
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        setShareMessage('分享链接已复制');
      } catch {
        setShareMessage('复制失败，请手动复制地址栏链接');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }

  if (!selectedAircraft.length) {
    return (
      <div className="rounded-[36px] border border-dashed border-white/10 bg-white/5 p-10 text-center">
        <h1 className="text-3xl font-semibold text-white">对比机库还是空的</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          先去首页或知识库将感兴趣的飞行器加入对比池，再回到这里查看缩略图、尺寸、速度、航程、发动机与首飞年份等差异。
        </p>
        <Link to="/catalog" className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
          前往知识库选型
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/8 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">多机型横向对比</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">同场比对飞行器核心参数</h1>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              当前已选 {selectedAircraft.length} 款机型，评委可以直接观察外观、速度、航程、尺寸与首飞年代差异。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {fastest ? <Highlight label="速度最快" value={selectedAircraft.find((item) => item.id === fastest)?.name || ''} /> : null}
            {longestRange ? <Highlight label="航程最远" value={selectedAircraft.find((item) => item.id === longestRange)?.name || ''} /> : null}
            <button
              type="button"
              onClick={() => void handleCopyShareLink()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
            >
              <Copy className="h-4 w-4" />
              复制分享链接
            </button>
          </div>
        </div>
        {shareMessage ? <p className="mt-4 text-sm text-cyan-200">{shareMessage}</p> : null}
      </section>

      <section className="rounded-[32px] border border-cyan-300/10 bg-slate-950/45 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">自动结论</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">平台自动生成本组对比判断</h2>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-300">
              {narrativeSummary}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
            当前结论基于速度、航程、尺寸与首飞年份自动生成
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {conclusionCards.map((item) => (
            <article key={item.title} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{item.title}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{item.winner}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-x-auto rounded-[32px] border border-white/8 bg-white/5">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-white/8 bg-slate-950/70">
              <th className="px-5 py-4 text-sm font-medium text-slate-400">对比维度</th>
              {selectedAircraft.map((item) => (
                <th key={item.id} className="min-w-[240px] px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-cyan-200">{item.englishName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
                    >
                      移除
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-white/8 last:border-b-0">
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-400">{row.label}</td>
                {selectedAircraft.map((item) => (
                  <td key={`${row.label}-${item.id}`} className="px-5 py-4 text-sm text-slate-200">
                    {row.key === 'imageUrl' ? (
                      <img src={item.imageUrl} alt={item.name} className="h-28 w-full rounded-3xl object-cover" />
                    ) : (
                      renderValue(item, row.key, metricMax)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Highlight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
      {label}：{value}
    </div>
  );
}

function getCategoryLabel(category: AircraftRecord['category']) {
  if (category === 'fighter') return '战斗机';
  if (category === 'airliner') return '客机';
  if (category === 'helicopter') return '直升机';
  if (category === 'drone') return '无人机';
  if (category === 'transport') return '运输机';
  return category;
}

function renderValue(
  item: AircraftRecord,
  key: (typeof rows)[number]['key'],
  metricMax: {
    maxSpeedKmh: number;
    rangeKm: number;
    lengthM: number;
    wingspanM: number;
    firstFlightYear: number;
  },
) {
  if (key === 'maxSpeedKmh') {
    return <MetricValue value={`${item.maxSpeedKmh} km/h`} numericValue={item.maxSpeedKmh} max={metricMax.maxSpeedKmh} />;
  }

  if (key === 'rangeKm') {
    return <MetricValue value={`${item.rangeKm} km`} numericValue={item.rangeKm} max={metricMax.rangeKm} />;
  }

  if (key === 'lengthM') {
    return <MetricValue value={`${item.lengthM} m`} numericValue={item.lengthM} max={metricMax.lengthM} />;
  }

  if (key === 'wingspanM') {
    return item.wingspanM
      ? <MetricValue value={`${item.wingspanM} m`} numericValue={item.wingspanM} max={metricMax.wingspanM} />
      : '未公开';
  }

  if (key === 'firstFlightYear') {
    return <MetricValue value={String(item.firstFlightYear)} numericValue={item.firstFlightYear} max={metricMax.firstFlightYear} />;
  }

  return String(item[key] ?? '未公开');
}

function MetricValue({ value, numericValue, max }: { value: string; numericValue: number; max: number }) {
  const percent = max > 0 ? Math.max((numericValue / max) * 100, 6) : 0;

  return (
    <div className="space-y-2">
      <div>{value}</div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-cyan-300"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <div className="text-xs text-slate-500">相对当前组最高值 {Math.round(Math.min(percent, 100))}%</div>
    </div>
  );
}
