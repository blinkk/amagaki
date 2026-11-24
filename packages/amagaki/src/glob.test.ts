import {ExecutionContext} from 'ava';
import test from 'ava';
import {globFiles, matchesGlob} from './glob';

test('globFiles lists files with leading slash and excludes directories', (t: ExecutionContext) => {
  const files = globFiles('/content/**/_collection.yaml', {
    cwd: './fixtures/simple',
  });
  t.deepEqual(files, ['content/pages/_collection.yaml']);
});

test('globFiles ignoreUnderscore excludes underscore-prefixed files and dirs', (t: ExecutionContext) => {
  const files = globFiles('/content/**/*', {
    cwd: './fixtures/simple',
    ignoreUnderscore: true,
  });
  t.true(files.length > 0);
  t.false(
    files.some(f => f.split('/').some(seg => seg.startsWith('_')))
  );
});

test('globFiles prevents path traversal outside cwd', (t: ExecutionContext) => {
  const files = globFiles('../*', {
    cwd: './fixtures/simple',
  });
  t.deepEqual(files, []);
});

test('matchesGlob supports full path and matchBase', (t: ExecutionContext) => {
  t.true(matchesGlob('/content/pages/index.yaml', '/content/pages/*.yaml'));
  t.false(matchesGlob('/content/pages/index.yaml', '*.yaml'));
  t.true(matchesGlob('/content/pages/index.yaml', '*.yaml', {matchBase: true}));
  t.true(
    matchesGlob('content/pages/index.yaml', 'content/**/index.yaml', {
      matchBase: true,
    })
  );
});
