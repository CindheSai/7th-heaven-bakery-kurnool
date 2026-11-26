import fs from 'fs';
import path from 'path';
import { INITIAL_STORE_DATA } from '../src/data/seedData.ts';
import type { StoreData } from '../src/types/bakery.ts';

export interface AdminCredential {
  salt: string;
  hash: string;
  claimedAt: string;
}

export interface PersistedStore extends StoreData {
  adminCredential?: AdminCredential;
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
export const UPLOADS_DIR = path.resolve(process.cwd(), 'server', 'uploads');

function ensureDirs(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function readStore(): PersistedStore {
  ensureDirs();
  if (!fs.existsSync(STORE_PATH)) {
    const initial: PersistedStore = structuredClone(INITIAL_STORE_DATA);
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PersistedStore>;
    return {
      settings: parsed.settings ?? structuredClone(INITIAL_STORE_DATA.settings),
      menuItems: Array.isArray(parsed.menuItems)
        ? parsed.menuItems
        : structuredClone(INITIAL_STORE_DATA.menuItems),
      cakeCollections: Array.isArray(parsed.cakeCollections)
        ? parsed.cakeCollections
        : structuredClone(INITIAL_STORE_DATA.cakeCollections),
      gallery: Array.isArray(parsed.gallery)
        ? parsed.gallery
        : structuredClone(INITIAL_STORE_DATA.gallery),
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
      adminCredential: parsed.adminCredential,
    };
  } catch {
    const fallback: PersistedStore = structuredClone(INITIAL_STORE_DATA);
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

export function writeStore(nextStore: PersistedStore): void {
  ensureDirs();
  const tempPath = `${STORE_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(nextStore, null, 2), 'utf8');
  fs.renameSync(tempPath, STORE_PATH);
}

export function toPublicStore(store: PersistedStore): Omit<StoreData, 'enquiries'> {
  return {
    settings: store.settings,
    menuItems: store.menuItems,
    cakeCollections: store.cakeCollections,
    gallery: store.gallery,
  };
}
