import {Document} from './document';
import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import {Url} from './url';
import test from 'ava';

test('relative', async (t: ExecutionContext) => {
  t.deepEqual(Url.relative('/foo', '/foo/bar'), './..');
  t.deepEqual(Url.relative('/foo/', '/foo/bar'), './../');
  t.deepEqual(Url.relative('/foo/bar', '/foo/bar'), '.');
  t.deepEqual(Url.relative('/foo/bar/', '/foo/bar'), './');
  t.deepEqual(Url.relative('/foo/bar', '/foo/bar/baz'), './..');
  t.deepEqual(Url.relative('/foo/bar', ''), '/foo/bar');
  t.deepEqual(
    Url.relative('https://example.com', '/foo'),
    'https://example.com'
  );
  t.deepEqual(Url.relative('//example.com', '/foo'), '//example.com');
  t.deepEqual(
    Url.relative('mailto:foo@example.com', '/foo'),
    'mailto:foo@example.com'
  );
  const pod = new Pod('./fixtures/simple/');
  await pod.warmup();
  t.deepEqual(
    Url.relative(
      pod.doc('/content/pages/about.yaml'),
      pod.doc('/content/pages/index.yaml')
    ),
    './about/'
  );

  // Test a fake document, for when a user assembles fake pages in a plugin.
  const fakeDoc = ({foo: 'bar'} as unknown) as Document;
  t.deepEqual(Url.relative(pod.doc('/content/pages/index.yaml'), fakeDoc), '/');
});
