import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('Pod basepath', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/basePath/');
  t.is(pod.basePath, '/foo/');
  // Warmup to ensure URLs are generated for docs.
  await pod.router.warmup();
  const doc = pod.doc('/content/about.njk');
  t.is(doc.url?.path, '/foo/about/');
});

test('Pod collection', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/simple/');
  const collection = pod.collection('/content/pages/');
  t.truthy(collection);
});

test('Pod collections', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/simple/');

  t.deepEqual(
    pod.collections().map(collection => collection.podPath),
    ['/content/pages']
  );
});

test('Pod docs', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/simple/');

  // By default, return all docs in the pod.
  t.deepEqual(
    pod.docs().map(doc => doc.podPath),
    [
      '/content/pages/about.yaml',
      '/content/pages/bio.md',
      '/content/pages/contact.yaml',
      '/content/pages/dir/index.yaml',
      '/content/pages/index.yaml',
      '/content/pages/routes.yaml',
      '/content/pages/template.njk',
      '/content/partials/base.yaml',
      '/content/partials/footer.yaml',
      '/content/partials/header.yaml',
    ]
  );

  // Both strings and lists are supported.
  t.deepEqual(
    pod.docs('**/*.md').map(doc => doc.podPath),
    ['/content/pages/bio.md']
  );
  t.deepEqual(
    pod.docs(['**/*.md']).map(doc => doc.podPath),
    ['/content/pages/bio.md']
  );
  t.deepEqual(
    pod.docs(['**/index.yaml']).map(doc => doc.podPath),
    ['/content/pages/dir/index.yaml', '/content/pages/index.yaml']
  );
  t.deepEqual(
    pod.docs(['**/about.yaml', '**/index.yaml']).map(doc => doc.podPath),
    [
      '/content/pages/about.yaml',
      '/content/pages/dir/index.yaml',
      '/content/pages/index.yaml',
    ]
  );

  // Default behavior requesting docs from a specific collection.
  t.deepEqual(
    pod.docs('/content/pages/**').map(doc => doc.podPath),
    [
      '/content/pages/about.yaml',
      '/content/pages/bio.md',
      '/content/pages/contact.yaml',
      '/content/pages/dir/index.yaml',
      '/content/pages/index.yaml',
      '/content/pages/routes.yaml',
      '/content/pages/template.njk',
    ]
  );

  // Exclusively use glob syntax; missing * will result in an empty list.
  t.deepEqual(
    pod.docs('/content/pages/').map(doc => doc.podPath),
    []
  );
});

test('Pod writeFileAsync', async (t: ExecutionContext) => {
  const pod = new Pod('./.test/');
  const podPath = '/test.txt';
  if (pod.fileExists(podPath)) {
    await pod.deleteFileAsync(podPath);
  }
  t.false(pod.fileExists(podPath));
  await pod.writeFileAsync(podPath, 'test');
  t.true(pod.fileExists(podPath));
  t.deepEqual('test', pod.readFile(podPath));
});
