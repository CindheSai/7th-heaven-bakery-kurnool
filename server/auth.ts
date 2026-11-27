import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import {
  getAdminCredential,
  getSessionSecretFromStore,
  saveAdminCredential,
} from './store.ts';

export const ADMIN_COOKIE_NAME = '7h_admin_session';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

let cachedSecret: string | null = null;

async function getSessionSecret(): Promise<string> {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  if (!cachedSecret) {
    cachedSecret = await getSessionSecretFromStore();
  }
  return cachedSecret;
}

export function getEnvAdminPasscode(): string | null {
  const val = process.env.ADMIN_PASSCODE?.trim();
  return val && val.length > 0 ? val : null;
}

export async function getAuthStatus(req?: Request): Promise<{
  configured: boolean;
  mode: 'env_passcode' | 'claimed_password' | 'claim_required';
  authenticated: boolean;
}> {
  const authenticated = req ? await isAdminAuthenticated(req) : false;
  if (getEnvAdminPasscode()) {
    return { configured: true, mode: 'env_passcode', authenticated };
  }
  const cred = await getAdminCredential();
  if (cred?.hash && cred?.salt) {
    return { configured: true, mode: 'claimed_password', authenticated };
  }
  return { configured: false, mode: 'claim_required', authenticated };
}

function hashPasswordScrypt(password: string, salt: string): Buffer {
  return crypto.scryptSync(password, salt, 64);
}

export async function claimAdminPassword(
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (getEnvAdminPasscode()) {
    return {
      ok: false,
      error: 'Admin passcode is already configured via environment secrets.',
    };
  }
  const existing = await getAdminCredential();
  if (existing?.hash) {
    return { ok: false, error: 'Admin access has already been claimed.' };
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPasswordScrypt(password, salt).toString('hex');
  const saved = await saveAdminCredential({
    salt,
    hash,
    claimedAt: new Date().toISOString(),
  });
  if (!saved) {
    return { ok: false, error: 'Admin access has already been claimed.' };
  }
  return { ok: true };
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const envPass = getEnvAdminPasscode();
  if (envPass) {
    const a = crypto.createHash('sha256').update(password).digest();
    const b = crypto.createHash('sha256').update(envPass).digest();
    return crypto.timingSafeEqual(a, b);
  }
  const cred = await getAdminCredential();
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

export async function createAdminToken(): Promise<string> {
  const now = Date.now();
  const payload: TokenPayload = {
    role: 'admin',
    iat: now,
    exp: now + TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const secret = await getSessionSecret();
  const sig = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${sig}`;
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return false;

  const secret = await getSessionSecret();
  const expectedSig = crypto
    .createHmac('sha256', secret)
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

function extractCookieToken(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === ADMIN_COOKIE_NAME) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice('Bearer '.length).trim();
    if (bearer) return bearer;
  }
  return extractCookieToken(req);
}

export async function isAdminAuthenticated(req: Request): Promise<boolean> {
  const token = extractTokenFromRequest(req);
  if (!token) return false;
  return verifyAdminToken(token);
}

export function setAdminSessionCookie(req: Request, res: Response, token: string): void {
  const isHttps =
    req.secure || String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: TOKEN_TTL_MS,
  });
}

export function clearAdminSessionCookie(res: Response): void {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ok = await isAdminAuthenticated(req);
    if (!ok) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
