import * as utils from './utils';

import {ExecutionContext} from 'ava';
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
