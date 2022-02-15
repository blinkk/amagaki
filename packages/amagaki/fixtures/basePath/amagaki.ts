import {Pod} from '../../src/pod';

export default function (pod: Pod) {
  pod.configure({
    basePath: '/foo/',
  });
}
