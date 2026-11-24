import * as net from 'net';
import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import { Route } from './router';
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
  const port = await getAvailablePort();
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

test('Disable default-locale route while building localized routes (#111)', async (t: ExecutionContext) => {
  const pod = new Pod('./.test/disableRootRoute/');
  await pod.writeFileAsync(
    '/content/_collection.yaml',
    '$path: /${doc.basename}/\n$localization:\n  path: /${doc.locale.id}/${doc.basename}/\n  locales: [en, ja]\n'
  );
  await pod.writeFileAsync(
    '/content/page.yaml',
    '$path: false\n$view: /views/base.njk\ntitle: Hello\n'
  );
  await pod.writeFileAsync('/views/base.njk', '{{doc.fields.title}}');
  try {
    await pod.router.warmup();
    t.falsy(await pod.router.resolve('/page/'));
    t.truthy(await pod.router.resolve('/ja/page/'));
  } finally {
    await pod.deleteFileAsync('/content/_collection.yaml');
    await pod.deleteFileAsync('/content/page.yaml');
    await pod.deleteFileAsync('/views/base.njk');
  }
});

test('Url reflects active pod environment (#191)', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/environment/');
  await pod.router.warmup();
  const doc = pod.doc('/content/index.njk');
  t.is(doc.url?.toString(), 'http://localhost/');
  pod.setEnvironment('prod');
  t.is(doc.url?.toString(), 'https://prod.com/');
});
