import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Gauge, GitCompareArrows, Heart, Plane, Rocket, Ruler, Timer } from 'lucide-react';
import type { AircraftRecord, AviationEventRecord, AviationExpertRecord } from '../../shared/aviation';
import { getAircraftDetail } from '@/lib/api';
import { useCompareStore } from '@/store/useCompareStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';

interface AircraftDetailData extends AircraftRecord {
  relatedEvents: AviationEventRecord[];
  relatedExperts: AviationExpertRecord[];
}

export default function AircraftDetail() {
  const { id = '' } = useParams();
  const [detail, setDetail] = useState<AircraftDetailData | null>(null);
  const toggle = useCompareStore((state) => state.toggle);
  const isSelected = useCompareStore((state) => (detail ? state.isSelected(detail.id) : false));
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const isFavorite = useFavoritesStore((state) => (detail ? state.has(detail.id) : false));

  useEffect(() => {
    void getAircraftDetail(id).then(setDetail);
  }, [id]);

  if (!detail) {
    return <div className="rounded-[32px] border border-white/8 bg-white/5 p-8 text-center text-slate-400">正在加载飞行器档案...</div>;
  }

  const metrics = [
    { label: '最高速度', value: `${detail.maxSpeedKmh} km/h`, icon: Gauge },
    { label: '最大航程', value: `${detail.rangeKm} km`, icon: Plane },
    { label: '首飞年份', value: `${detail.firstFlightYear}`, icon: Timer },
    { label: '机身长度', value: `${detail.lengthM} m`, icon: Ruler },
    { label: '发动机', value: detail.engineType, icon: Rocket },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[36px] border border-white/8 bg-white/5">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-h-[340px]">
            <img src={detail.imageUrl} alt={detail.name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{detail.country}</span>
              <span className="rounded-full border border-amber-300/20 px-3 py-1 text-xs text-amber-100">{detail.category}</span>
              <span className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300">{detail.era}</span>
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-white">{detail.name}</h1>
              <p className="mt-2 font-['Orbitron'] text-sm uppercase tracking-[0.28em] text-cyan-200">{detail.englishName}</p>
            </div>
            <p className="text-sm leading-7 text-slate-300">{detail.summary}</p>
            <div className="flex flex-wrap gap-3">
              {detail.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-cyan-300/15 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-100">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => toggle(detail.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  isSelected
                    ? 'border border-amber-300/40 bg-amber-300/10 text-amber-100'
                    : 'bg-cyan-300 text-slate-950 hover:bg-cyan-200'
                }`}
              >
                <GitCompareArrows className="h-4 w-4" />
                {isSelected ? '已加入对比，点击移除' : '加入对比池'}
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(detail.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
                  isFavorite
                    ? 'border-rose-300/40 bg-rose-300/10 text-rose-100'
                    : 'border-white/10 text-slate-200 hover:border-rose-300/30 hover:text-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? '已加入收藏' : '收藏这款机型'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-[28px] border border-white/8 bg-white/5 p-5">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[32px] border border-white/8 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-white">尺寸与基础参数</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem label="翼展" value={detail.wingspanM ? `${detail.wingspanM} m` : '未公开'} />
            <InfoItem label="高度" value={detail.heightM ? `${detail.heightM} m` : '未公开'} />
            <InfoItem label="机组" value={detail.crew || '未公开'} />
            <InfoItem label="动力形式" value={detail.engineType} />
          </div>
        </div>

        <div className="rounded-[32px] border border-white/8 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-white">关联内容</h2>
          <div className="mt-6 space-y-4">
            {detail.relatedEvents.map((item) => (
              <Link key={item.id} to={`/events/${item.id}`} className="block rounded-3xl border border-white/8 bg-slate-950/60 p-4 transition hover:border-cyan-300/30">
                <p className="text-xs uppercase tracking-[0.24em] text-amber-200">{item.date}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.summary}</p>
              </Link>
            ))}
            {detail.relatedExperts.map((item) => (
              <Link key={item.id} to={`/experts/${item.id}`} className="block rounded-3xl border border-white/8 bg-slate-950/60 p-4 transition hover:border-cyan-300/30">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{item.role}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
