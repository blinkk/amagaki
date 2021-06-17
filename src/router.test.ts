import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('StaticRoute contentType', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/static/');
  const route = await pod.router.resolve('/static/file.txt');
  t.deepEqual(route?.contentType, 'text/plain; charset=utf-8');
});
