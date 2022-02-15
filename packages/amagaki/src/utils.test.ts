import * as utils from './utils';

import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

test('queryObject', (t: ExecutionContext) => {
  const data = {
    foo: {
      bar: 'value',
    },
  };
  t.deepEqual(utils.queryObject('foo.bar', data), 'value');
  t.deepEqual(utils.queryObject('foo.bar.baz', data), undefined);
  t.deepEqual(utils.queryObject('', data), data);
  t.deepEqual(utils.queryObject(undefined, data), data);
});

test('DataType', (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/simple/');
  t.true(utils.DataType.isCollection(pod.collection('/content/pages/')));
  t.true(utils.DataType.isDocument(pod.doc('/content/pages/index.yaml')));
  t.true(utils.DataType.isStaticFile(pod.staticFile('/static/images/cat.jpg')));
});
