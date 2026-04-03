/**
 * Core type definitions for cf-httpbin
 */

export interface IPInfo {
  origin: string;
  proxy: string;
  forwarded_for: string | null;
}

export interface CFMetadata {
  ray: string | null;
  country: string | null;
  ip: string;
  scheme: string;
  device: string | null;
  isWorkerSubrequest: boolean;
  colo: string | null;
}

export interface FileInfo {
  filename: string;
  size: number;
  type: string;
}

export interface ReflectData {
  args: Record<string, string>;
  data: string;
  files: Record<string, FileInfo>;
  form: Record<string, string>;
  headers: Record<string, string>;
  json: unknown;
  method: string;
  origin: string;
  url: string;
}

export interface UUIDResponse {
  uuid: string;
}

export interface Base64Response {
  encoded: string;
  decoded: string;
}

export interface CookieMap {
  [key: string]: string;
}

/** Route handler function type */
export type RouteHandler = (
  request: Request,
  url: URL
) => Response | Promise<Response>;

/** Route definition */
export interface Route {
  pattern: string | RegExp;
  methods: string[];
  handler: RouteHandler;
}

/** Environment bindings (empty for now, extend as needed) */
export interface Env {
  // Add KV bindings, secrets, etc. here
}

/** HTTP status code mapping */
export type StatusCode =
  | 100 | 101 | 200 | 201 | 202 | 204 | 206
  | 301 | 302 | 304
  | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 408 | 409 | 410 | 418 | 429
  | 500 | 501 | 502 | 503 | 504;

/** Status text mapping */
export const STATUS_TEXTS: Record<number, string> = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  206: 'Partial Content',
  301: 'Moved Permanently',
  302: 'Found',
  304: 'Not Modified',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  418: "I'm a Teapot",
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};
