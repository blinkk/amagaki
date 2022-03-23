import {Pod} from '../../src/pod';

export default function (pod: Pod) {
  pod.configure({
    environments: {
      prod: {
        host: 'prod.com',
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
