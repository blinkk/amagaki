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
  t.is(
    staticFile.fingerprint(),
    '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
  );
});
