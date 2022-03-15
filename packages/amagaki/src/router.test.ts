import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import { Route } from './router';
import {Server} from './server';
import getPort from 'get-port';
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
  const result = await pod.builder.build();
  t.true(result.manifest.files.length === 3);
  // Build one page by URL.
  const route = await pod.router.resolve('/samples/rex/');
  const html = await (route as Route).build();
  t.deepEqual('<title>rex</title>', html);
});

test('Changing static files alters the router', async (t: ExecutionContext) => {
  const pod = new Pod('./.test/staticDevServer/');
  await pod.writeFileAsync('/src/static/file.txt', 'file');
  const port = await getPort();
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

test('AddRoute', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/sampleRouteProvider/');
  pod.router.addRoutes('default', async (provider) => {
    provider.addRoute({
      urlPath: '/foo/bar/',
      build: async () => '<title>foo</title>',
    })
  });
  pod.router.addRoutes('custom', async (provider) => {
    provider.addRoute({
      urlPath: '/foo/custom/',
      build: async () => '<title>custom</title>',
    })
  });
  for (const [path, content] of [
    ['/foo/bar/', '<title>foo</title>'],
    ['/foo/custom/', '<title>custom</title>'],
  ]) {
    const route = await pod.router.resolve(path);
    const html = await (route as Route).build();
    t.deepEqual(content, html);
  }
});
