import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import aviationRoutes from './routes/aviation.js';
import authRoutes from './routes/auth.js';
import { ensureDataFiles, uploadsDir } from './lib/repository.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const app: express.Application = express();

void ensureDataFiles();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'ok',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', aviationRoutes);

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  });
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));

  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found. Run npm run build before starting production mode.',
    });
  });
}

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  void req;
  void next;
  console.error(error);
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  });
});

export default app;
