import { Router, type Request, type Response } from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  buildRecordId,
  ensureDataFiles,
  readCollection,
  uploadsDir,
  writeCollection,
} from '../lib/repository.js';
import { requireRole } from '../lib/auth.js';
import type {
  AircraftRecord,
  AviationEventRecord,
  AviationExpertRecord,
  CreateAircraftRequest,
  DashboardSummary,
} from '../../shared/aviation.js';

const router = Router();

async function loadContent() {
  const [aircraft, events, experts] = await Promise.all([
    readCollection<AircraftRecord>('aircraft.json'),
    readCollection<AviationEventRecord>('events.json'),
    readCollection<AviationExpertRecord>('experts.json'),
  ]);

  return { aircraft, events, experts };
}

function includesKeyword(value: string, keyword: string) {
  return value.toLowerCase().includes(keyword.toLowerCase());
}

router.get('/summary', async (_req: Request, res: Response) => {
  const { aircraft, events, experts } = await loadContent();

  const payload: DashboardSummary = {
    aircraftCount: aircraft.length,
    eventCount: events.length,
    expertCount: experts.length,
    compareReadyCount: aircraft.length,
  };

  res.json({ success: true, data: payload });
});

router.get('/catalog', async (req: Request, res: Response) => {
  const { aircraft, events, experts } = await loadContent();
  const keyword = String(req.query.q || '').trim();
  const category = String(req.query.category || '').trim();
  const country = String(req.query.country || '').trim();

  const filteredAircraft = aircraft.filter((item) => {
    const matchesKeyword =
      !keyword ||
      [item.name, item.englishName, item.summary, item.country, item.tags.join(' ')]
        .some((value) => includesKeyword(value, keyword));
    const matchesCategory = !category || item.category === category;
    const matchesCountry = !country || item.country === country;

    return matchesKeyword && matchesCategory && matchesCountry;
  });

  const filteredEvents = events.filter((item) => {
    if (!keyword) {
      return true;
    }

    return [item.title, item.summary, item.location, item.details]
      .some((value) => includesKeyword(value, keyword));
  });

  const filteredExperts = experts.filter((item) => {
    if (!keyword) {
      return true;
    }

    return [item.name, item.role, item.nationality, item.summary, item.details]
      .some((value) => includesKeyword(value, keyword));
  });

  res.json({
    success: true,
    data: {
      aircraft: filteredAircraft,
      events: filteredEvents,
      experts: filteredExperts,
    },
  });
});

router.get('/aircraft', async (_req: Request, res: Response) => {
  const aircraft = await readCollection<AircraftRecord>('aircraft.json');
  res.json({ success: true, data: aircraft });
});

router.get('/aircraft/:id', async (req: Request, res: Response) => {
  const { aircraft, events, experts } = await loadContent();
  const item = aircraft.find((record) => record.id === req.params.id);

  if (!item) {
    res.status(404).json({ success: false, error: '未找到对应飞行器。' });
    return;
  }

  const relatedEvents = events.filter((event) => item.relatedEventIds.includes(event.id));
  const relatedExperts = experts.filter((expert) => item.relatedExpertIds.includes(expert.id));

  res.json({
    success: true,
    data: {
      ...item,
      relatedEvents,
      relatedExperts,
    },
  });
});

router.post('/aircraft', requireRole('admin'), async (req: Request, res: Response) => {
  const body = req.body as CreateAircraftRequest;

  if (!body.name || !body.englishName || !body.summary || !body.imageUrl) {
    res.status(400).json({ success: false, error: '请完整填写名称、英文名、简介和图片。' });
    return;
  }

  const aircraft = await readCollection<AircraftRecord>('aircraft.json');
  const newRecord: AircraftRecord = {
    id: buildRecordId(body.englishName || body.name),
    name: body.name,
    englishName: body.englishName,
    category: body.category,
    country: body.country,
    era: body.era,
    firstFlightYear: Number(body.firstFlightYear),
    engineType: body.engineType,
    maxSpeedKmh: Number(body.maxSpeedKmh),
    rangeKm: Number(body.rangeKm),
    lengthM: Number(body.lengthM),
    wingspanM: body.wingspanM ? Number(body.wingspanM) : undefined,
    heightM: body.heightM ? Number(body.heightM) : undefined,
    crew: body.crew,
    imageUrl: body.imageUrl,
    summary: body.summary,
    tags: body.tags || [],
    relatedEventIds: body.relatedEventIds || [],
    relatedExpertIds: body.relatedExpertIds || [],
  };

  aircraft.unshift(newRecord);
  await writeCollection('aircraft.json', aircraft);

  res.status(201).json({ success: true, data: newRecord });
});

router.delete('/aircraft/:id', requireRole('admin'), async (req: Request, res: Response) => {
  const targetId = req.params.id;
  const { aircraft, events, experts } = await loadContent();
  const target = aircraft.find((record) => record.id === targetId);

  if (!target) {
    res.status(404).json({ success: false, error: '未找到对应飞行器。' });
    return;
  }

  const nextAircraft = aircraft.filter((record) => record.id !== targetId);
  const nextEvents = events.map((event) => ({
    ...event,
    aircraftIds: event.aircraftIds.filter((id) => id !== targetId),
  }));
  const nextExperts = experts.map((expert) => ({
    ...expert,
    representativeAircraftIds: expert.representativeAircraftIds.filter((id) => id !== targetId),
  }));

  await Promise.all([
    writeCollection('aircraft.json', nextAircraft),
    writeCollection('events.json', nextEvents),
    writeCollection('experts.json', nextExperts),
  ]);

  res.json({ success: true, data: target });
});

router.post('/uploads/image', requireRole('admin'), async (req: Request, res: Response) => {
  const dataUrl = String(req.body?.dataUrl || '');
  const fileName = String(req.body?.fileName || 'aircraft-image.png');

  if (!dataUrl.startsWith('data:image/')) {
    res.status(400).json({ success: false, error: '请上传有效的图片文件。' });
    return;
  }

  await ensureDataFiles();

  const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!matches) {
    res.status(400).json({ success: false, error: '图片编码格式不正确。' });
    return;
  }

  const extension = path.extname(fileName) || `.${matches[1].split('/')[1] || 'png'}`;
  const normalizedFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
  const outputPath = path.join(uploadsDir, normalizedFileName);

  await fs.writeFile(outputPath, Buffer.from(matches[2], 'base64'));

  res.status(201).json({
    success: true,
    data: {
      imageUrl: `/uploads/${normalizedFileName}`,
      filename: normalizedFileName,
    },
  });
});

router.get('/events', async (_req: Request, res: Response) => {
  const events = await readCollection<AviationEventRecord>('events.json');
  res.json({ success: true, data: events });
});

router.get('/events/:id', async (req: Request, res: Response) => {
  const { aircraft, events } = await loadContent();
  const item = events.find((record) => record.id === req.params.id);

  if (!item) {
    res.status(404).json({ success: false, error: '未找到对应航空事件。' });
    return;
  }

  const relatedAircraft = aircraft.filter((record) => item.aircraftIds.includes(record.id));
  res.json({ success: true, data: { ...item, relatedAircraft } });
});

router.get('/experts', async (_req: Request, res: Response) => {
  const experts = await readCollection<AviationExpertRecord>('experts.json');
  res.json({ success: true, data: experts });
});

router.get('/experts/:id', async (req: Request, res: Response) => {
  const { aircraft, experts } = await loadContent();
  const item = experts.find((record) => record.id === req.params.id);

  if (!item) {
    res.status(404).json({ success: false, error: '未找到对应航空专家。' });
    return;
  }

  const representativeAircraft = aircraft.filter((record) =>
    item.representativeAircraftIds.includes(record.id),
  );

  res.json({ success: true, data: { ...item, representativeAircraft } });
});

export default router;
