/**
 * Compression utility functions using Web CompressionStream API
 */

/**
 * Compress data using gzip
 */
export async function gzip(data: string): Promise<ArrayBuffer> {
  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  writer.write(new TextEncoder().encode(data));
  writer.close();
  return new Response(stream.readable).arrayBuffer();
}

/**
 * Compress data using deflate
 */
export async function deflate(data: string): Promise<ArrayBuffer> {
  const stream = new CompressionStream('deflate');
  const writer = stream.writable.getWriter();
  writer.write(new TextEncoder().encode(data));
  writer.close();
  return new Response(stream.readable).arrayBuffer();
}
