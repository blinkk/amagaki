import {ExecutionContext} from 'ava';
import {html} from './utils';
import test from 'ava'

test('html escaping', async (t: ExecutionContext) => {
  const name = 'Foo';
  const tag = '<script>';
  const result = html`${tag} is ${name}'s favorite HTML tag.`;
  t.deepEqual(result.toString(), `&lt;script&gt; is Foo's favorite HTML tag.`);
});
