import {Pod} from '@amagaki/amagaki';

export default (pod: Pod) => {
  pod.configure({
    meta: {
      siteTitle: 'Amagaki Starter',
    },
    localization: {
      defaultLocale: 'en',
      locales: ['en', 'ja'],
    },
    staticRoutes: [
      {
        path: '/static/',
        staticDir: '/static/',
      },
    ],
  });
};
