import {Document} from '../document';
import {ExecutionContext} from 'ava';
import {Pod} from '../pod';
import test from 'ava';

test('addPathFormatFunction', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/routerPlugin/');
  const doc = pod.doc('/content/about.yaml') as Document;
  await pod.router.warmup();
  t.deepEqual(doc.url?.path, '/hello-world/');
});
