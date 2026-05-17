import { useEffect, useMemo, useState } from 'react';
import type { AircraftCategory, AircraftRecord, CreateAircraftRequest } from '../../shared/aviation';
import { createAircraft, deleteAircraft, getAircraftList, getCatalog, uploadImage } from '@/lib/api';

const categoryOptions: Array<{ value: AircraftCategory; label: string }> = [
  { value: 'fighter', label: '战斗机' },
  { value: 'airliner', label: '客机' },
  { value: 'helicopter', label: '直升机' },
  { value: 'drone', label: '无人机' },
  { value: 'transport', label: '运输机' },
];

const initialForm: CreateAircraftRequest = {
  name: '',
  englishName: '',
  category: 'fighter',
  country: '',
  era: '2020年代',
  firstFlightYear: 2024,
  engineType: '',
  maxSpeedKmh: 1000,
  rangeKm: 1000,
  lengthM: 10,
  wingspanM: 10,
  heightM: 4,
  crew: '1',
  imageUrl: '',
  summary: '',
  tags: [],
  relatedEventIds: [],
  relatedExpertIds: [],
};

type AdminMode = 'create' | 'delete';
type AdminAircraftListItem = Pick<
  AircraftRecord,
  'id' | 'name' | 'englishName' | 'country' | 'category' | 'firstFlightYear'
>;

function toAdminAircraftList(aircraft: AircraftRecord[]): AdminAircraftListItem[] {
  return aircraft.map((item) => ({
    id: item.id,
    name: item.name,
    englishName: item.englishName,
    country: item.country,
    category: item.category,
    firstFlightYear: item.firstFlightYear,
  }));
}

function getCategoryLabel(category: AircraftCategory) {
  return categoryOptions.find((item) => item.value === category)?.label || category;
}

export default function Admin() {
  const [mode, setMode] = useState<AdminMode>('create');
  const [form, setForm] = useState<CreateAircraftRequest>(initialForm);
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleteEnglishName, setDeleteEnglishName] = useState('');
  const [deleteCountry, setDeleteCountry] = useState('');
  const [deleteFirstFlightYear, setDeleteFirstFlightYear] = useState('');
  const [deleteCategory, setDeleteCategory] = useState('');
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [experts, setExperts] = useState<Array<{ id: string; name: string }>>([]);
  const [aircraftList, setAircraftList] = useState<AdminAircraftListItem[]>([]);

  useEffect(() => {
    void Promise.all([getCatalog(), getAircraftList()]).then(([catalog, aircraft]) => {
      setEvents(catalog.events.map((item) => ({ id: item.id, title: item.title })));
      setExperts(catalog.experts.map((item) => ({ id: item.id, name: item.name })));
      setAircraftList(toAdminAircraftList(aircraft));
    });
  }, []);

  const previewTags = useMemo(
    () => tagInput.split(',').map((item) => item.trim()).filter(Boolean),
    [tagInput],
  );

  const filteredAircraftList = useMemo(() => {
    const nameKeyword = deleteName.trim().toLowerCase();
    const englishNameKeyword = deleteEnglishName.trim().toLowerCase();
    const countryKeyword = deleteCountry.trim().toLowerCase();
    const firstFlightYearKeyword = deleteFirstFlightYear.trim();

    return aircraftList.filter((item) => {
      const matchesName = !nameKeyword || item.name.toLowerCase().includes(nameKeyword);
      const matchesEnglishName =
        !englishNameKeyword || item.englishName.toLowerCase().includes(englishNameKeyword);
      const matchesCountry = !countryKeyword || item.country.toLowerCase().includes(countryKeyword);
      const matchesFirstFlightYear =
        !firstFlightYearKeyword || String(item.firstFlightYear).includes(firstFlightYearKeyword);
      const matchesCategory = !deleteCategory || item.category === deleteCategory;

      return (
        matchesName &&
        matchesEnglishName &&
        matchesCountry &&
        matchesFirstFlightYear &&
        matchesCategory
      );
    });
  }, [
    aircraftList,
    deleteCategory,
    deleteCountry,
    deleteEnglishName,
    deleteFirstFlightYear,
    deleteName,
  ]);

  async function refreshAircraftList() {
    const updated = await getAircraftList();
    setAircraftList(toAdminAircraftList(updated));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('正在发布飞行器档案...');

    try {
      let imageUrl = form.imageUrl;

      if (imageFile) {
        const dataUrl = await readAsDataUrl(imageFile);
        const upload = await uploadImage(dataUrl, imageFile.name);
        imageUrl = upload.imageUrl;
      }

      const created = await createAircraft({
        ...form,
        imageUrl,
        tags: previewTags,
      });

      setForm(initialForm);
      setTagInput('');
      setImageFile(null);
      setMessage(`发布成功：${created.name} 已加入前台知识库。`);
      await refreshAircraftList();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '发布失败，请稍后重试。');
    }
  }

  async function handleDeleteAircraft(item: AdminAircraftListItem) {
    const confirmed = window.confirm(`确认删除「${item.name}」吗？删除后前台目录和详情关联都会同步更新。`);

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setMessage(`正在删除：${item.name}...`);

    try {
      await deleteAircraft(item.id);
      setAircraftList((current) => current.filter((record) => record.id !== item.id));
      setMessage(`删除成功：${item.name} 已从知识库移除。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '删除失败，请稍后重试。');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[32px] border border-white/8 bg-white/5 p-6">
          <p className="text-sm text-slate-400">机型总数</p>
          <p className="mt-3 text-4xl font-semibold text-white">{aircraftList.length}</p>
        </div>
        <div className="rounded-[32px] border border-white/8 bg-white/5 p-6">
          <p className="text-sm text-slate-400">可关联事件</p>
          <p className="mt-3 text-4xl font-semibold text-white">{events.length}</p>
        </div>
        <div className="rounded-[32px] border border-white/8 bg-white/5 p-6">
          <p className="text-sm text-slate-400">可关联专家</p>
          <p className="mt-3 text-4xl font-semibold text-white">{experts.length}</p>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/8 bg-white/5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">管理后台</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">飞行器数据维护</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
              管理员可在这里新增飞行器档案，也可以切换到删除数据视图，通过搜索或筛选定位具体记录后删除。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                mode === 'create'
                  ? 'bg-cyan-300 text-slate-950'
                  : 'border border-cyan-300/20 text-cyan-100 hover:border-cyan-200/40 hover:text-white'
              }`}
            >
              增加数据
            </button>
            <button
              type="button"
              onClick={() => setMode('delete')}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                mode === 'delete'
                  ? 'bg-rose-300 text-slate-950'
                  : 'border border-rose-300/20 text-rose-100 hover:border-rose-200/40 hover:text-white'
              }`}
            >
              删除数据
            </button>
          </div>
        </div>
        <p className="mt-5 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
          {message || '请选择增加数据或删除数据。'}
        </p>
      </section>

      {mode === 'create' ? (
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[32px] border border-white/8 bg-white/5 p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">后台录入</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">新增飞行器并即时发布</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                填写文本、图片和关键参数后提交，数据会写入本地知识库，前台首页、知识库和对比页会自动读取到最新内容。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="中文名称">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClassName} />
              </Field>
              <Field label="英文名称">
                <input value={form.englishName} onChange={(event) => setForm({ ...form, englishName: event.target.value })} className={inputClassName} />
              </Field>
              <Field label="类别">
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as AircraftCategory })} className={inputClassName}>
                  {categoryOptions.map((item) => (
                    <option key={item.value} value={item.value} className="bg-slate-900">
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="国家/地区">
                <input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} className={inputClassName} />
              </Field>
              <Field label="年代">
                <input value={form.era} onChange={(event) => setForm({ ...form, era: event.target.value })} className={inputClassName} />
              </Field>
              <Field label="首飞年份">
                <input type="number" value={form.firstFlightYear} onChange={(event) => setForm({ ...form, firstFlightYear: Number(event.target.value) })} className={inputClassName} />
              </Field>
              <Field label="最高速度 km/h">
                <input type="number" value={form.maxSpeedKmh} onChange={(event) => setForm({ ...form, maxSpeedKmh: Number(event.target.value) })} className={inputClassName} />
              </Field>
              <Field label="最大航程 km">
                <input type="number" value={form.rangeKm} onChange={(event) => setForm({ ...form, rangeKm: Number(event.target.value) })} className={inputClassName} />
              </Field>
              <Field label="机身长度 m">
                <input type="number" value={form.lengthM} onChange={(event) => setForm({ ...form, lengthM: Number(event.target.value) })} className={inputClassName} />
              </Field>
              <Field label="翼展 m">
                <input type="number" value={form.wingspanM || 0} onChange={(event) => setForm({ ...form, wingspanM: Number(event.target.value) })} className={inputClassName} />
              </Field>
              <Field label="高度 m">
                <input type="number" value={form.heightM || 0} onChange={(event) => setForm({ ...form, heightM: Number(event.target.value) })} className={inputClassName} />
              </Field>
              <Field label="机组/操控">
                <input value={form.crew || ''} onChange={(event) => setForm({ ...form, crew: event.target.value })} className={inputClassName} />
              </Field>
            </div>

            <Field label="发动机类型">
              <input value={form.engineType} onChange={(event) => setForm({ ...form, engineType: event.target.value })} className={inputClassName} />
            </Field>

            <Field label="标签（英文逗号分隔）">
              <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="隐身, 战斗机, 第五代" className={inputClassName} />
            </Field>

            <Field label="飞行器简介">
              <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} rows={4} className={`${inputClassName} resize-none`} />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="关联事件">
                <select
                  multiple
                  value={form.relatedEventIds}
                  onChange={(event) => setForm({ ...form, relatedEventIds: Array.from(event.target.selectedOptions).map((item) => item.value) })}
                  className={`${inputClassName} min-h-36`}
                >
                  {events.map((item) => (
                    <option key={item.id} value={item.id} className="bg-slate-900">
                      {item.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="关联专家">
                <select
                  multiple
                  value={form.relatedExpertIds}
                  onChange={(event) => setForm({ ...form, relatedExpertIds: Array.from(event.target.selectedOptions).map((item) => item.value) })}
                  className={`${inputClassName} min-h-36`}
                >
                  {experts.map((item) => (
                    <option key={item.id} value={item.id} className="bg-slate-900">
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="上传图片">
                <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className={`${inputClassName} file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950`} />
              </Field>
              <Field label="或直接填写图片地址">
                <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://..." className={inputClassName} />
              </Field>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-400">提交后将写入本地数据源并更新前台内容。</p>
              <button type="submit" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                发布飞行器档案
              </button>
            </div>
          </form>

          <section className="rounded-[32px] border border-white/8 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold text-white">实时预览</h2>
            <div className="mt-5 overflow-hidden rounded-[28px] border border-cyan-400/15 bg-slate-950/60">
              <div className="h-48 bg-[radial-gradient(circle_at_top,_rgba(104,225,253,0.25),_transparent_42%),linear-gradient(135deg,_rgba(104,225,253,0.18),_rgba(7,17,31,0.95))]" />
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap gap-2">
                  {previewTags.length ? previewTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-cyan-300/15 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-100">
                      {tag}
                    </span>
                  )) : <span className="text-xs text-slate-500">标签将展示在这里</span>}
                </div>
                <h3 className="text-2xl font-semibold text-white">{form.name || '待录入飞行器'}</h3>
                <p className="font-['Orbitron'] text-xs uppercase tracking-[0.24em] text-cyan-200">{form.englishName || 'ENGLISH NAME'}</p>
                <p className="text-sm leading-7 text-slate-300">{form.summary || '这里会显示飞行器简介，建议用 2 到 3 句说明技术特点与科普价值。'}</p>
              </div>
            </div>
          </section>
        </section>
      ) : (
        <section className="rounded-[32px] border border-white/8 bg-white/5 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-rose-200">删除数据</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">搜索或筛选后删除飞行器</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                可分别按中文名、英文名、国家/地区、首飞年份和类别筛选。只删除确认的单条飞行器记录。
              </p>
            </div>
            <div className="text-sm text-slate-400">
              当前显示 {filteredAircraftList.length} / {aircraftList.length} 条
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto] xl:items-end">
            <Field label="中文名">
              <input
                value={deleteName}
                onChange={(event) => setDeleteName(event.target.value)}
                placeholder="如：歼-20"
                className={inputClassName}
              />
            </Field>
            <Field label="英文名">
              <input
                value={deleteEnglishName}
                onChange={(event) => setDeleteEnglishName(event.target.value)}
                placeholder="如：Raptor"
                className={inputClassName}
              />
            </Field>
            <Field label="国家/地区">
              <input
                value={deleteCountry}
                onChange={(event) => setDeleteCountry(event.target.value)}
                placeholder="如：中国"
                className={inputClassName}
              />
            </Field>
            <Field label="首飞年份">
              <input
                type="number"
                value={deleteFirstFlightYear}
                onChange={(event) => setDeleteFirstFlightYear(event.target.value)}
                placeholder="如：2017"
                className={inputClassName}
              />
            </Field>
            <Field label="类别">
              <select
                value={deleteCategory}
                onChange={(event) => setDeleteCategory(event.target.value)}
                className={inputClassName}
              >
                <option value="" className="bg-slate-900">全部类别</option>
                {categoryOptions.map((item) => (
                  <option key={item.value} value={item.value} className="bg-slate-900">
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <button
              type="button"
              onClick={() => {
                setDeleteName('');
                setDeleteEnglishName('');
                setDeleteCountry('');
                setDeleteFirstFlightYear('');
                setDeleteCategory('');
              }}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
            >
              重置筛选
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {filteredAircraftList.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-white/8 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{item.name}</p>
                  <p className="mt-1 font-['Orbitron'] text-xs uppercase tracking-[0.2em] text-cyan-200">{item.englishName}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {item.country} · {getCategoryLabel(item.category)} · 首飞 {item.firstFlightYear}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={deletingId === item.id}
                  onClick={() => void handleDeleteAircraft(item)}
                  className="rounded-full border border-rose-300/30 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:border-rose-200 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === item.id ? '删除中...' : '删除这条数据'}
                </button>
              </div>
            ))}

            {!filteredAircraftList.length ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                没有找到符合条件的飞行器数据。
              </div>
            ) : null}
          </div>
        </section>
      )}
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

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('图片读取失败，请重新选择文件。'));
    reader.readAsDataURL(file);
  });
}

const inputClassName = 'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40';
