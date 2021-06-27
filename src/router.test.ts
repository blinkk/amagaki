import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('StaticRoute contentType', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/static/');
  const route = await pod.router.getRoute('/static/file.txt');
  t.deepEqual(route?.contentType, 'text/plain; charset=utf-8');
});

test('SampleRouteProvider', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/sampleRouteProvider/');
  await pod.warmup();
  // Build the whole site.
  const result = await pod.builder.export();
  t.true(result.manifest.files.length === 3);
  // Build one page by URL.
  const route = await pod.router.getRoute('/samples/rex/');
  const html = await route?.build();
  t.deepEqual('<title>rex</title>', html);
});
