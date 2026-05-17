import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const seedDir = path.join(rootDir, 'seed-data');

export const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(rootDir, 'data');
export const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(dataDir, 'uploads');

const requiredFileNames = ['aircraft.json', 'events.json', 'experts.json', 'users.json'];

export async function ensureDataFiles() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });

  await Promise.all(
    requiredFileNames.map(async (fileName) => {
      const filePath = path.join(dataDir, fileName);
      try {
        await fs.access(filePath);
      } catch {
        const seedPath = path.join(seedDir, fileName);
        try {
          await fs.copyFile(seedPath, filePath);
        } catch {
          await fs.writeFile(filePath, '[]', 'utf-8');
        }
      }
    }),
  );
}

export async function readCollection<T>(fileName: string): Promise<T[]> {
  await ensureDataFiles();
  const filePath = path.join(dataDir, fileName);
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent) as T[];
}

export async function writeCollection<T>(fileName: string, records: T[]) {
  await ensureDataFiles();
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(records, null, 2), 'utf-8');
}

export function buildRecordId(seed: string) {
  const normalized = seed
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

  return `${normalized || 'record'}-${Date.now().toString(36)}`;
}
