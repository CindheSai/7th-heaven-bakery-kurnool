import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { readStore, writeStore } from './store.ts';

const EPHEMERAL_SESSION_SECRET = crypto.randomBytes(32).toString('hex');

function getSessionSecret(): string {
  const configured = process.env.SESSION_SECRET?.trim();
  return configured && configured.length >= 16 ? configured : EPHEMERAL_SESSION_SECRET;
}

export function getEnvAdminPasscode(): string | null {
  const val = process.env.ADMIN_PASSCODE?.trim();
  return val && val.length > 0 ? val : null;
}

export function getAuthStatus(): {
  configured: boolean;
  mode: 'env_passcode' | 'claimed_password' | 'claim_required';
} {
  if (getEnvAdminPasscode()) {
    return { configured: true, mode: 'env_passcode' };
  }
  const store = readStore();
  if (store.adminCredential?.hash && store.adminCredential?.salt) {
    return { configured: true, mode: 'claimed_password' };
  }
  return { configured: false, mode: 'claim_required' };
}

function hashPasswordScrypt(password: string, salt: string): Buffer {
  return crypto.scryptSync(password, salt, 64);
}

export function claimAdminPassword(password: string): { ok: boolean; error?: string } {
  if (getEnvAdminPasscode()) {
    return { ok: false, error: 'Admin passcode is already configured via environment secrets.' };
  }
  const store = readStore();
  if (store.adminCredential?.hash) {
    return { ok: false, error: 'Admin access has already been claimed.' };
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPasswordScrypt(password, salt).toString('hex');
  store.adminCredential = {
    salt,
    hash,
    claimedAt: new Date().toISOString(),
  };
  writeStore(store);
  return { ok: true };
}

export function verifyAdminPassword(password: string): boolean {
  const envPass = getEnvAdminPasscode();
  if (envPass) {
    const a = crypto.createHash('sha256').update(password).digest();
    const b = crypto.createHash('sha256').update(envPass).digest();
    return crypto.timingSafeEqual(a, b);
  }
  const store = readStore();
  const cred = store.adminCredential;
  if (!cred?.salt || !cred?.hash) {
    return false;
  }
  const derived = hashPasswordScrypt(password, cred.salt);
  const storedBuf = Buffer.from(cred.hash, 'hex');
  if (derived.length !== storedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(derived, storedBuf);
}

interface TokenPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

export function createAdminToken(): string {
  const now = Date.now();
  const payload: TokenPayload = {
    role: 'admin',
    iat: now,
    exp: now + 1000 * 60 * 60 * 12, // 12 hours
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${sig}`;
}

export function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return false;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');

  const bufA = Buffer.from(providedSig, 'utf8');
  const bufB = Buffer.from(expectedSig, 'utf8');
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as TokenPayload;
    if (payload.role !== 'admin') return false;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: 'Invalid or expired admin session.' });
    return;
  }
  next();
}
