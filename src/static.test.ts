import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('Exists', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/static/');
  t.true(pod.staticFile('/src/static/file.txt').exists);
  t.false(pod.staticFile('/src/static/bad.txt').exists);
});

test('Fingerprint', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/static/');
  const staticFile = pod.staticFile('/src/static/file.txt');
  t.is(staticFile.fingerprint, 'ed076287532e86365e841e92bfc50d8c');
});
