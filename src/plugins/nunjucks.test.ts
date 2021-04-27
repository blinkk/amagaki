import {Document} from '../document';
import {ExecutionContext} from 'ava';
import {Pod} from '../pod';
import test from 'ava';

test('Template front matter', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/templateFrontMatter/');
  const doc = pod.doc('/content/index.yaml') as Document;
  t.deepEqual(await doc.render(), 'Base,Partial');
});
