import {Pod} from '../../src/pod';
import {metaName} from './config';

export default function (pod: Pod) {
  pod.configure({
    meta: {
      name: metaName,
    },
  });
}
