import {Collection} from './collection';
import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('Doc sort', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/documents/');
  const collection = pod.collection('/content/') as Collection;
  const paths = collection.docs({sort: 'order'}).map(doc => doc.path);

  t.deepEqual(paths, [
    '/content/foo.yaml',
    '/content/bar.yaml',
    '/content/bam.yaml',
    '/content/baz.yaml',
  ]);
});
