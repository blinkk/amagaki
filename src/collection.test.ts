import {Collection} from './collection';
import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('Collection docs', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/collections/');
  let collection = pod.collection('/content/collection/') as Collection;
  let docs = collection.docs();
  let paths = docs.map(doc => doc.path);

  t.deepEqual(paths, [
    '/content/collection/collection-a/collection-b/index.yaml',
    '/content/collection/collection-a/dir/index.yaml',
    '/content/collection/collection-a/index.yaml',
    '/content/collection/dir/collection-c/index.yaml',
    '/content/collection/dir/index.yaml',
    '/content/collection/index.yaml',
  ]);

  // Sub collection is a sub-set of parent collection.
  collection = pod.collection('/content/collection/collection-a') as Collection;
  docs = collection.docs();
  paths = docs.map(doc => doc.path);

  t.deepEqual(paths, [
    '/content/collection/collection-a/collection-b/index.yaml',
    '/content/collection/collection-a/dir/index.yaml',
    '/content/collection/collection-a/index.yaml',
  ]);
});

test('Collection docs exclude sub collections', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/collections/');
  const collection = pod.collection('/content/collection/') as Collection;
  const docs = collection.docs({
    excludeSubCollections: true,
  });
  const paths = docs.map(doc => doc.path);

  t.deepEqual(paths, [
    '/content/collection/dir/index.yaml',
    '/content/collection/index.yaml',
  ]);
});

test('Collection parents', (t: ExecutionContext) => {
  // No parents.
  const pod = new Pod('./fixtures/collections/');
  let collection = pod.collection('/content/collection/') as Collection;
  t.deepEqual([], collection.parents);

  // Single layer of parents.
  collection = pod.collection(
    '/content/collection/collection-a/'
  ) as Collection;
  t.deepEqual([pod.collection('/content/collection/')], collection.parents);

  // Multiple layers of parents.
  collection = pod.collection(
    '/content/collection/collection-a/collection-b/'
  ) as Collection;
  t.deepEqual(
    [
      pod.collection('/content/collection/collection-a/'),
      pod.collection('/content/collection/'),
    ],
    collection.parents
  );

  // Single layer of parents withing a sub-directory.
  // Note: Sub directory is not a valid 'parent' and should not show up.
  collection = pod.collection(
    '/content/collection/dir/collection-c/'
  ) as Collection;
  t.deepEqual([pod.collection('/content/collection/')], collection.parents);
});
