import {ExecutionContext} from 'ava';
import Pod from './pod';
import test from 'ava';

test('Pod collection', (t: ExecutionContext) => {
  const pod = new Pod('./example/');
  const collection = pod.collection('/content/pages/');
  t.truthy(collection);
});
