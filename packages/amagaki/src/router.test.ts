import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import {Server} from './server';
import getPort from 'get-port';
import test from 'ava';

test('StaticRoute contentType', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/static/');
  const [route] = await pod.router.resolve('/static/file.txt');
  t.deepEqual(route?.contentType, 'text/plain; charset=utf-8');
});

test('SampleRouteProvider', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/sampleRouteProvider/');
  await pod.warmup();
  // Build the whole site.
  const result = await pod.builder.build();
  t.true(result.manifest.files.length === 3);
  // Build one page by URL.
  const [route] = await pod.router.resolve('/samples/rex/');
  const html = await route.build();
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

  let route;
  const podPath = '/src/static/foo.txt';
  try {
    [route] = await pod.router.resolve('/static/foo.txt');
    t.falsy(route);
    await pod.writeFileAsync(podPath, 'foo');
    // Cache is reset by the file watcher.
    pod.cache.reset();
    [route] = await pod.router.resolve('/static/foo.txt');
    t.truthy(route);
  } finally {
    if (pod.fileExists(podPath)) {
      await pod.deleteFileAsync(podPath);
    }
    await server.stop();
  }
});

test('AddRoute', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/sampleRouteProvider/');
  pod.router.add('/foo/bar/', {
    urlPath: '/foo/bar/',
    build: async () => '<title>foo</title>',
  });
  pod.router.add('/foo/custom/', {
    urlPath: '/foo/bar/',
    build: async () => '<title>custom</title>',
  });
  await pod.warmup();

  for (const [path, content] of [
    ['/foo/bar/', '<title>foo</title>'],
    ['/foo/custom/', '<title>custom</title>'],
  ]) {
    const [route] = await pod.router.resolve(path);
    const html = await route.build();
    t.deepEqual(html, content);
  }
});

test('Dynamic routes', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/dynamicRoutes/');
  for (const [path, value] of [
    ['dynamic', 'dynamic'],
    ['foobar', 'foobar'],
  ]) {
    const [route, params] = await pod.router.resolve(`/${path}/`);
    const resp = await route.build({
      params: params,
    });
    t.deepEqual(`<title>${value}</title>`, resp);
  }
});

test('Get static paths', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/dynamicRoutes/');
  const staticPaths = await pod.router.getStaticPaths();
  t.deepEqual(staticPaths, ['/static-1/', '/static-2/', '/static-3/']);
});

test('Only static routes are built', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/dynamicRoutes/');
  const buildResult = await pod.builder.build();
  t.deepEqual(buildResult.manifest.files.length, 3);
  for (const [slug, html] of [
    ['static-1', '<title>static-1</title>'],
    ['static-2', '<title>static-2</title>'],
    ['static-3', '<title>static-3</title>'],
  ]) {
    t.true(pod.readFile(`/build/${slug}/index.html`).includes(html));
  }
});
