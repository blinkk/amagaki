import {Collection} from './collection';
import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('Collection docs', (t: ExecutionContext) => {
  const pod = new Pod('./example/');
  const collection = pod.collection('/content/pages/') as Collection;
  const docs = collection.docs();
  const paths = docs.map(doc => doc.path);

  t.deepEqual(paths, [
    '/content/pages/about.yaml',
    '/content/pages/bio.md',
    '/content/pages/contact.yaml',
    '/content/pages/index.yaml',
    '/content/pages/routes.yaml',
    '/content/pages/template.njk',
  ]);
});
