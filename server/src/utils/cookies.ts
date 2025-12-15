import type { CookieOptions } from 'express';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function getAuthCookieName() {
  return process.env.COOKIE_NAME ?? 'koltechat_auth';
}

function getBaseAuthCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };
}

export function getAuthCookieOptions(): CookieOptions {
  const maxAgeMs = process.env.COOKIE_MAX_AGE_MS
    ? Number(process.env.COOKIE_MAX_AGE_MS)
    : 7 * ONE_DAY_MS;

  return {
    ...getBaseAuthCookieOptions(),
    maxAge: maxAgeMs,
  };
}

export function getAuthCookieClearOptions(): CookieOptions {
  return getBaseAuthCookieOptions();
}
