import {Document} from '../document';
import {ExecutionContext} from 'ava';
import {LocaleSet} from '../locale';
import {Pod} from '../pod';
import test from 'ava';

test('Inbuilt YAML types', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/yamlTypes/');
  const doc = pod.doc('/content/pages/index.yaml') as Document;
  t.deepEqual(doc.fields.doc.simple, pod.doc('/content/pages/index.yaml'));
  t.deepEqual(
    doc.fields.doc.options,
    pod.doc('/content/pages/index.yaml', pod.locale('de'))
  );
  t.deepEqual(
    doc.fields.docs,
    pod.docs(['/content/pages/index.yaml', '/content/posts/2019-01-06.md'])
  );
  t.deepEqual(doc.fields.collection, pod.collection('/content/pages/'));
  t.deepEqual(
    doc.fields.collections,
    pod.docs(['/content/pages/', '/content/posts/'])
  );
  t.deepEqual(doc.fields.locale, pod.locale('de'));
  t.deepEqual(doc.fields.locales, LocaleSet.fromIds(['de', 'ja'], pod));
  t.deepEqual(doc.fields.staticFile, pod.staticFile('/src/static/file.txt'));
  t.deepEqual(doc.fields.string.simple, pod.string({value: 'Hello World'}));
  t.deepEqual(
    doc.fields.string.options,
    pod.string({prefer: 'New Value', value: 'Old Value'})
  );
  t.deepEqual(doc.fields.yaml, pod.readYaml('/content/pages/page.yaml'));
  t.deepEqual(doc.fields.IfEnvironment, 'foo');
});

test('IfEnvironment', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/yamlTypes/', {
    dev: false,
    host: 'example.com',
    name: 'prod',
    scheme: 'https',
  });
  const doc = pod.doc('/content/pages/index.yaml') as Document;
  t.deepEqual(doc.fields.IfEnvironment, 'bar');
});
