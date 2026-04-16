/**
 * @fileoverview Enhanced diagnostic endpoints
 *
 * These endpoints provide detailed information about:
 * - Connection details (TLS, HTTP version)
 * - Timing metrics (server processing time, worker age)
 * - Combined diagnostics (everything in one response)
 */

import type { CFRequest, CFMetadata, EnhancedDiagnostics } from '../types';
import { jsonResponse, getClientIP } from '../utils/headers';

// =============================================================================
// Deployment Info
// =============================================================================

/**
 * Deployment version identifier
 *
 * In production, this could be set during the build process from git commit hash.
 * For now, we use a timestamp to identify when this Worker code started.
 *
 * Note: Cloudflare Workers use a different environment system than Node.js.
 * Environment variables are accessed via the Env interface and bindings.
 */
const DEPLOYMENT_VERSION = 'dev-' + new Date().toISOString();
const DEPLOYMENT_TIME = new Date().toISOString();

/**
 * Worker instance start time
 *
 * Workers are stateless and can be restarted at any time.
 * This timestamp helps detect cold starts and measure instance lifetime.
 */
const WORKER_START_TIME = Date.now();

// =============================================================================
// Connection Endpoint
// =============================================================================

/**
 * Connection details from Cloudflare
 *
 * Accessed via request.cf which contains TLS and HTTP protocol info.
 * These properties are only available in the Cloudflare Workers runtime.
 */
interface ConnectionInfo {
  /** TLS version (e.g., "1.3", "1.2", "1.1") */
  tlsVersion: string | null;
  /** TLS cipher suite (e.g., "AEAD-AES256-GCM-SHA384") */
  tlsCipher: string | null;
  /** HTTP protocol version (e.g., "HTTP/2", "HTTP/1.1") */
  httpProtocol: string | null;
  /** Whether the connection used 0-RTT (zero round-trip time) for faster TLS */
  tlsEarlyData: boolean | null;
}

/**
 * Handle GET /connection
 *
 * Returns TLS and HTTP connection details.
 *
 * Why this matters:
 * - TLS 1.3 is faster and more secure than 1.2
 * - HTTP/2 and HTTP/3 (QUIC) are more efficient than HTTP/1.1
 * - Cipher suites indicate the encryption strength
 *
 * @param request - The incoming request with Cloudflare properties
 * @returns JSON with connection details
 */
export function handleConnection(request: CFRequest): Response {
  const cf = request.cf;

  const info: ConnectionInfo = {
    tlsVersion: (cf?.tlsVersion as string | undefined) ?? null,
    tlsCipher: (cf?.tlsCipher as string | undefined) ?? null,
    httpProtocol: (cf?.httpProtocol as string | undefined) ?? null,
    tlsEarlyData: (cf?.tlsEarlyData as boolean | undefined) ?? null,
  };

  return jsonResponse(info, request);
}

// =============================================================================
// Timing Endpoint
// =============================================================================

/**
 * Timing information for performance debugging
 */
interface TimingInfo {
  /** When this Worker instance started (Unix timestamp in milliseconds) */
  workerStartTime: number;
  /** How long this Worker instance has been running (milliseconds) */
  workerAgeMs: number;
  /** Whether this appears to be a cold start (worker < 1 second old) */
  isColdStart: boolean;
  /** Deployment version identifier */
  deploymentVersion: string;
  /** When this code was deployed */
  deploymentTime: string;
  /**
   * Server processing time note
   *
   * For accurate timing, use the Server-Timing header or /diagnostics endpoint
   * which includes processing time for that specific request.
   */
  note: string;
}

/**
 * Handle GET /timing
 *
 * Returns timing and deployment information.
 *
 * This helps with:
 * - Detecting cold starts (slow first request after deploy)
 * - Measuring Worker instance lifetime
 * - Tracking which version of code is running
 *
 * @param request - The incoming request
 * @returns JSON with timing info
 */
export function handleTiming(request: CFRequest): Response {
  const now = Date.now();
  const workerAgeMs = now - WORKER_START_TIME;

  const info: TimingInfo = {
    workerStartTime: WORKER_START_TIME,
    workerAgeMs,
    isColdStart: workerAgeMs < 1000, // Less than 1 second = likely cold start
    deploymentVersion: DEPLOYMENT_VERSION,
    deploymentTime: DEPLOYMENT_TIME,
    note: 'Use /diagnostics for per-request timing metrics',
  };

  return jsonResponse(info, request);
}

// =============================================================================
// Combined Diagnostics Endpoint
// =============================================================================

/**
 * Build comprehensive diagnostics for a request
 *
 * This combines:
 * - Standard Cloudflare metadata (geo, ASN, etc.)
 * - Connection details (TLS, HTTP version)
 * - Timing metrics (processing time, worker age)
 *
 * @param request - The incoming request
 * @param url - Parsed URL
 * @param startTime - When request processing started (from performance.now() or Date.now())
 * @returns Complete diagnostic information
 */
export function buildDiagnostics(
  request: CFRequest,
  url: URL,
  startTime: number
): EnhancedDiagnostics {
  const now = Date.now();
  const cf = request.cf;

  // Get scheme from CF-Visitor header (indicates original protocol)
  const cfVisitorHeader = request.headers.get('cf-visitor');
  let scheme: string | null = null;
  if (cfVisitorHeader) {
    try {
      scheme = JSON.parse(cfVisitorHeader).scheme;
    } catch {
      // Ignore parse errors
    }
  }

  // Build base metadata (same as /cf endpoint)
  const baseMetadata: CFMetadata = {
    ray: request.headers.get('cf-ray') ?? null,
    ip: getClientIP(request),
    scheme: scheme ?? request.headers.get('x-forwarded-proto') ?? 'https',
    colo: (cf?.colo as string | undefined) ?? null,
    country: (cf?.country as string | undefined) ?? null,
    region: (cf?.region as string | undefined) ?? null,
    regionCode: (cf?.regionCode as string | undefined) ?? null,
    city: (cf?.city as string | undefined) ?? null,
    postalCode: (cf?.postalCode as string | undefined) ?? null,
    metroCode: (cf?.metroCode as string | undefined) ?? null,
    timezone: (cf?.timezone as string | undefined) ?? null,
    latitude: (cf?.latitude as string | undefined) ?? null,
    longitude: (cf?.longitude as string | undefined) ?? null,
    asn: (cf?.asn as number | undefined) ?? null,
    asOrganization: (cf?.asOrganization as string | undefined) ?? null,
    clientTcpRtt: (cf?.clientTcpRtt as number | undefined) ?? null,
    clientQuicRtt: (cf?.clientQuicRtt as number | undefined) ?? null,
    device: request.headers.get('cf-device-type') ?? null,
    clientAcceptEncoding: (cf?.clientAcceptEncoding as string | undefined) ?? null,
    isWorkerSubrequest: request.headers.get('cf-worker') !== null,
    'CF-Cache-Status': request.headers.get('cf-cache-status') ?? 'DYNAMIC',
    'CF-IPCountry': request.headers.get('cf-ipcountry') ?? null,
    'True-Client-IP': request.headers.get('true-client-ip') ?? null,
    'CF-Bot-Detection': request.headers.get('cf-bot-detection') ?? null,
    'CF-IPC': request.headers.get('cf-ipc') ?? null,
    'CF-EW': request.headers.get('cf-ew') ?? null,
  };

  // Calculate server processing time
  const serverProcessingMs = now - startTime;
  const workerAgeMs = now - WORKER_START_TIME;

  // Combine everything into enhanced diagnostics
  return {
    ...baseMetadata,
    serverProcessingMs,
    workerStartTime: WORKER_START_TIME,
    workerAgeMs,
    tlsVersion: (cf?.tlsVersion as string | undefined) ?? null,
    tlsCipher: (cf?.tlsCipher as string | undefined) ?? null,
    httpProtocol: (cf?.httpProtocol as string | undefined) ?? null,
    deploymentVersion: DEPLOYMENT_VERSION,
    deploymentTime: DEPLOYMENT_TIME,
  };
}

/**
 * Handle GET /diagnostics
 *
 * Returns comprehensive diagnostic information combining:
 * - Cloudflare metadata (location, network, device)
 * - Connection details (TLS version, HTTP protocol)
 * - Timing metrics (processing time, worker age)
 * - Deployment info (version, timestamp)
 *
 * This is useful for:
 * - Debugging performance issues
 * - Verifying TLS/HTTP configuration
 * - Checking which data center served the request
 * - Detecting cold starts
 *
 * @param request - The incoming request
 * @param url - Parsed URL
 * @returns JSON with complete diagnostics
 */
export function handleDiagnostics(request: CFRequest, url: URL): Response {
  // Record start time as early as possible for accurate timing
  const startTime = Date.now();

  const diagnostics = buildDiagnostics(request, url, startTime);

  return jsonResponse(diagnostics, request);
}
