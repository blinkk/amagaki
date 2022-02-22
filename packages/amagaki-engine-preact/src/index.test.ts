import {ExecutionContext} from 'ava';
import {Pod} from '@amagaki/amagaki';
import test from 'ava';

test('Build example', async (t: ExecutionContext) => {
  const pod = new Pod('./example/');
  const result = await pod.builder.export();
  t.deepEqual(result.metrics.numDocumentRoutes, 3);
  t.assert(pod.readFile('/build/page/index.html').includes('Hello World'));
});
