import * as fs from 'fs';
import * as path from 'path';

import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('Environment fields', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/environment/');
  const doc = pod.doc('/content/index.njk');
  t.is('default', await doc.render());
  pod.setEnvironment('prod');
  t.is('prod', await doc.render());
});
