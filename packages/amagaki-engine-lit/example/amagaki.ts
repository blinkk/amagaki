import {Pod} from '@amagaki/amagaki';
import {LitEnginePlugin} from '../dist';

export default (pod: Pod) => {
  LitEnginePlugin.register(pod);

  pod.configure({
    localization: {
      defaultLocale: 'en',
      locales: ['en'],
    }
  });
};
