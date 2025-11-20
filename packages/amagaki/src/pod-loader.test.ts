import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('Pod loader: esbuild-register with imports', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/tsImports/', undefined, {
    tsLoader: 'esbuild-register',
  });
  t.is(pod.meta?.name, 'Amagaki TS Imports');
});

test('Pod loader: tsx with imports', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/tsImports/', undefined, {
    tsLoader: 'tsx',
  });
  t.is(pod.meta?.name, 'Amagaki TS Imports');
});

test('Pod loader: jiti with imports', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/tsImports/', undefined, {
    tsLoader: 'jiti',
  });
  t.is(pod.meta?.name, 'Amagaki TS Imports');
});

test('Pod loader: auto with imports', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/tsImports/', undefined, {
    tsLoader: 'auto',
  });
  t.is(pod.meta?.name, 'Amagaki TS Imports');
});
