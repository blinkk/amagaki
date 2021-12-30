import * as getPort from '@ava/get-port';

import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import {Server} from './server';
import test from 'ava';

test('StaticRoute contentType', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/static/');
  const route = await pod.router.resolve('/static/file.txt');
  t.deepEqual(route?.contentType, 'text/plain; charset=utf-8');
});

test('SampleRouteProvider', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/sampleRouteProvider/');
  await pod.warmup();
  // Build the whole site.
  const result = await pod.builder.export();
  t.true(result.manifest.files.length === 3);
  // Build one page by URL.
  const route = await pod.router.resolve('/samples/rex/');
  const html = await route?.build();
  t.deepEqual('<title>rex</title>', html);
});

test('Changing static files alters the router', async (t: ExecutionContext) => {
  const pod = new Pod('./.test/staticDevServer/');
  await pod.writeFileAsync('/src/static/file.txt', 'file');
  const port = await getPort.default();
  const server = new Server(pod, {
    port: port,
  });
  await server.start();

  const podPath = '/src/static/foo.txt';
  try {
    t.falsy(await pod.router.resolve('/static/foo.txt'));
    await pod.writeFileAsync(podPath, 'foo');
    // Cache is reset by the file watcher.
    pod.cache.reset();
    t.truthy(await pod.router.resolve('/static/foo.txt'));
  } finally {
    if (pod.fileExists(podPath)) {
      await pod.deleteFileAsync(podPath);
    }
    await server.stop();
  }
});