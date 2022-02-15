import {Pod} from '../../src/pod';

export default function (pod: Pod) {
  pod.configure({
    environments: {
      prod: {
        host: 'example.com',
        fields: {
          apiKey: 'foo',
        },
      },
      staging: {
        host: 'example.com',
        fields: {
          apiKey: 'bar',
        },
      },
    },
  });
}
