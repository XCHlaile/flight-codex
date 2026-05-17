import { Link } from 'react-router-dom';
import { Gauge, GitCompareArrows, Heart, Milestone, Plane } from 'lucide-react';
import type { AircraftRecord } from '../../shared/aviation';
import { useCompareStore } from '@/store/useCompareStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';

export default function AircraftCard({ aircraft }: { aircraft: AircraftRecord }) {
  const toggle = useCompareStore((state) => state.toggle);
  const isSelected = useCompareStore((state) => state.isSelected(aircraft.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const isFavorite = useFavoritesStore((state) => state.has(aircraft.id));

  return (
    <article className="group overflow-hidden rounded-[28px] border border-cyan-400/15 bg-slate-950/70 shadow-lg shadow-cyan-500/5 transition hover:-translate-y-1 hover:border-cyan-300/30">
      <div className="relative h-52 overflow-hidden">
        <img
          src={aircraft.imageUrl}
          alt={aircraft.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-300/20 bg-slate-950/70 px-3 py-1 text-xs text-cyan-100">
            {aircraft.country}
          </span>
          <span className="rounded-full border border-amber-300/20 bg-slate-950/70 px-3 py-1 text-xs text-amber-100">
            {aircraft.era}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">{aircraft.name}</h3>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">{aircraft.englishName}</p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              {aircraft.category}
            </span>
          </div>
          <p className="text-sm leading-6 text-slate-300">{aircraft.summary}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <Gauge className="h-4 w-4 text-cyan-300" />
              速度
            </div>
            <p className="font-semibold text-white">{aircraft.maxSpeedKmh} km/h</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <Plane className="h-4 w-4 text-cyan-300" />
              航程
            </div>
            <p className="font-semibold text-white">{aircraft.rangeKm} km</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <Milestone className="h-4 w-4 text-cyan-300" />
              首飞
            </div>
            <p className="font-semibold text-white">{aircraft.firstFlightYear}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {aircraft.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-cyan-300/15 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-100">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/aircraft/${aircraft.id}`}
            className="flex-1 rounded-full bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            查看详情
          </Link>
          <button
            type="button"
            onClick={() => toggleFavorite(aircraft.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm transition ${
              isFavorite
                ? 'border-rose-300/40 bg-rose-300/10 text-rose-100'
                : 'border-slate-700 text-slate-200 hover:border-rose-300/30 hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? '已收藏' : '收藏'}
          </button>
          <button
            type="button"
            onClick={() => toggle(aircraft.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm transition ${
              isSelected
                ? 'border-amber-300/40 bg-amber-300/10 text-amber-100'
                : 'border-slate-700 text-slate-200 hover:border-cyan-400/30 hover:text-white'
            }`}
          >
            <GitCompareArrows className="h-4 w-4" />
            {isSelected ? '取消对比' : '加入对比'}
          </button>
        </div>
      </div>
    </article>
  );
}
