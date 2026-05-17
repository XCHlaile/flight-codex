import { Link } from 'react-router-dom';
import { Radar, X } from 'lucide-react';
import { buildComparePath } from '@/lib/compare-share';
import { useCompareStore } from '@/store/useCompareStore';

export default function CompareDock() {
  const selectedIds = useCompareStore((state) => state.selectedIds);
  const clear = useCompareStore((state) => state.clear);

  if (!selectedIds.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,900px)] -translate-x-1/2 rounded-3xl border border-cyan-400/30 bg-slate-950/90 px-4 py-3 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
            <Radar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">对比机库已装载 {selectedIds.length} 款机型</p>
            <p className="text-xs text-slate-400">已自动保存在本机，可随时继续对比或打开分享链接。</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <X className="h-4 w-4" />
            清空
          </button>
          <Link
            to={buildComparePath(selectedIds)}
            className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            打开对比页
          </Link>
        </div>
      </div>
    </div>
  );
}
