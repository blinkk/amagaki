import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('Default view', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/defaultView/');
  const doc = pod.doc('/content/index.yaml');
  // Verify rendering without a template throws an error.
  await t.throwsAsync(doc.render);
  // Set a default view and then verify the output.
  pod.defaultView = async () => {
    return 'foobar';
  };
  t.deepEqual('foobar', await doc.render());
});

test('Doc sort', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/documents/');
  t.deepEqual(
    pod.docs('/content/*', {sort: 'order'}).map(doc => doc.podPath),
    [
      '/content/foo.yaml',
      '/content/bar.yaml',
      '/content/bam.yaml',
      '/content/baz.yaml',
    ]
  );
  t.deepEqual(
    pod.docs('/content/sort-alpha/*', {sort: 'order'}).map(doc => doc.podPath),
    [
      '/content/sort-alpha/foo.yaml',
      '/content/sort-alpha/bar.yaml',
      '/content/sort-alpha/baz.yaml',
    ]
  );
});
