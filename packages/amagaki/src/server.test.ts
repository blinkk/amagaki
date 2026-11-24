import * as http from 'http';
import * as net from 'net';
import * as zlib from 'zlib';

import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import {Server} from './server';
import test from 'ava';

function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Failed to allocate port')));
        return;
      }
      const {port} = address;
      server.close(() => resolve(port));
    });
  });
}

function httpGet(
  port: number,
  urlPath: string,
  headers: Record<string, string> = {}
): Promise<{statusCode: number; headers: http.IncomingHttpHeaders; body: Buffer}> {
  return new Promise((resolve, reject) => {
    const req = http.get(
      {hostname: '127.0.0.1', port, path: urlPath, headers},
      res => {
        const chunks: Buffer[] = [];
        res.on('data', chunk => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
      }
    );
    req.on('error', reject);
  });
}

test('Server start and gzip compression', async (t: ExecutionContext) => {
  const port = await getAvailablePort();
  const pod = new Pod('./fixtures/static/');
  const server = new Server(pod, {
    port: port,
  });
  await server.start();
  try {
    const plain = await httpGet(port, '/static/file.txt', {
      'accept-encoding': 'identity',
    });
    t.is(plain.statusCode, 200);
    t.is(plain.headers['content-encoding'], undefined);
    t.is(plain.body.toString('utf8').trim(), 'Hello World!');

    const gzipped = await httpGet(port, '/static/file.txt', {
      'accept-encoding': 'gzip',
    });
    t.is(gzipped.statusCode, 200);
    t.is(gzipped.headers['content-encoding'], 'gzip');
    t.true(
      String(gzipped.headers['vary'] || '')
        .toLowerCase()
        .includes('accept-encoding')
    );
    t.is(zlib.gunzipSync(gzipped.body).toString('utf8').trim(), 'Hello World!');

    await server.reload();
  } finally {
    await server.stop();
  }
});
