import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('Num missing translations', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/missingTranslations/');
  const buildResult = await pod.builder.export();
  t.deepEqual(buildResult.metrics.localesToNumMissingTranslations.de, 2);
});

test('Build matching patterns', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/simple/');
  const buildResult = await pod.builder.export({
    patterns: ['content/pages/index.yaml', 'content/pages/about.yaml'],
  });
  t.deepEqual(
    buildResult.manifest.files.map(file => file.path),
    [
      '/about/index.html',
      '/intl/de/about/index.html',
      '/intl/fi/about/index.html',
      '/intl/fr/about/index.html',
      '/intl/it/about/index.html',
      '/intl/ja/about/index.html',
      '/intl/ko/about/index.html',
      '/intl/nl/about/index.html',
      '/index.html',
      '/intl/de/index.html',
      '/intl/fi/index.html',
      '/intl/fr/index.html',
      '/intl/it/index.html',
      '/intl/ja/index.html',
      '/intl/ko/index.html',
      '/intl/nl/index.html',
    ]
  );
});
