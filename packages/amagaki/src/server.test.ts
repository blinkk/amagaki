import getPort from 'get-port';

import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import {Server} from './server';
import test from 'ava';

test('Server start', async (t: ExecutionContext) => {
  const port = await getPort();
  const pod = new Pod('./fixtures/static/');
  const server = new Server(pod, {
    port: port,
  });
  await server.start();
  await server.reload();
  await server.stop();
  t.pass();
});
