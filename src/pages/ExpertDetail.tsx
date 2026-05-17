import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { AircraftRecord, AviationExpertRecord } from '../../shared/aviation';
import { getExpertDetail } from '@/lib/api';

interface ExpertDetailData extends AviationExpertRecord {
  representativeAircraft: AircraftRecord[];
}

export default function ExpertDetail() {
  const { id = '' } = useParams();
  const [detail, setDetail] = useState<ExpertDetailData | null>(null);

  useEffect(() => {
    void getExpertDetail(id).then(setDetail);
  }, [id]);

  if (!detail) {
    return <div className="rounded-[32px] border border-white/8 bg-white/5 p-8 text-center text-slate-400">正在加载专家档案...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[36px] border border-white/8 bg-white/5 p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{detail.role}</span>
          <span className="rounded-full border border-amber-300/20 px-3 py-1 text-xs text-amber-100">{detail.era}</span>
          <span className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300">{detail.nationality}</span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold text-white">{detail.name}</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-300">{detail.summary}</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/8 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-white">人物档案</h2>
          <p className="mt-5 text-sm leading-8 text-slate-300">{detail.details}</p>
        </div>

        <div className="rounded-[32px] border border-white/8 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-white">代表机型</h2>
          <div className="mt-5 space-y-4">
            {detail.representativeAircraft.map((item) => (
              <Link key={item.id} to={`/aircraft/${item.id}`} className="block rounded-3xl border border-white/8 bg-slate-950/60 p-4 transition hover:border-cyan-300/30">
                <div className="flex items-center gap-4">
                  <img src={item.imageUrl} alt={item.name} className="h-20 w-28 rounded-2xl object-cover" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <p className="mt-1 text-sm text-cyan-200">{item.englishName}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
