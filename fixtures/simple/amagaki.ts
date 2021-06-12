import {Pod} from '../../';

export default function (pod: Pod) {
  pod.configure({
    staticRoutes: [
      {
        path: '/static/css/',
        staticDir: '/dist/css/',
      },
      {
        path: '/static/js/',
        staticDir: '/dist/js/',
      },
    ],
  });
}
