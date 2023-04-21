import {PartialLibraryPlugin} from '../dist/';
import {Pod} from '@amagaki/amagaki';

export default async (pod: Pod) => {
  pod.configure({
    localization: {
      defaultLocale: 'en',
      locales: ['en', 'ja'],
    },
    environments: {
      staging: {},
      prod: {},
    },
    staticRoutes: [
      {
        path: '/static/',
        staticDir: '/dist/',
      },
    ],
  });

  PartialLibraryPlugin.register(pod, {
    partial: {
      tracked: ['spacer'],
    },
    serving: {
      template: '/views/library.njk',
    },
  });
};
