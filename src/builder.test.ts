import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('Num missing translations', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/missingTranslations/');
  const buildResult = await pod.builder.export();
  t.deepEqual(buildResult.metrics.localesToNumMissingTranslations.de, 2);
});
