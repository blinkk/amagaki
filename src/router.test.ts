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
  await pod.warmup();
  const podPath = '/src/static/foo.txt';
  const port = await getPort.default();
  const server = new Server(pod, {
    port: port,
  });
  await server.start();

  try {
    let staticFile = pod.staticFile(podPath);
    t.falsy(staticFile.url);
    await pod.writeFileAsync(podPath, 'foo');
    await server.resetCache();
    staticFile = pod.staticFile(podPath);
    t.truthy(staticFile.url);
  } finally {
    if (pod.fileExists(podPath)) {
      await pod.deleteFileAsync(podPath);
    }
    await server.stop();
  }
});
