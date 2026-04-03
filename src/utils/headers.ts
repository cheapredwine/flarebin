/**
 * Header utility functions
 */

import type { CookieMap } from '../types';

/**
 * Convert Headers object to plain object
 */
export function headersToObj(headers: Headers): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [k, v] of headers) {
    obj[k] = v;
  }
  return obj;
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for') ??
    'unknown'
  );
}

/**
 * Parse Cookie header into object
 */
export function parseCookies(cookieHeader: string): CookieMap {
  const cookies: CookieMap = {};
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k) cookies[k.trim()] = v.join('=').trim();
  }
  return cookies;
}

/**
 * Create a JSON response with proper headers
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Create a text response with proper headers
 */
export function textResponse(
  text: string,
  status = 200,
  contentType = 'text/plain'
): Response {
  return new Response(text, {
    status,
    headers: { 'content-type': contentType },
  });
}
