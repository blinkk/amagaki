const ExamplePlugin = require('./plugins/example/plugin');

module.exports = function (pod) {
  pod.configure({
    metadata: {
      name: 'Amagaki Example',
    },
    localization: {
      defaultLocale: 'en',
      locales: ['en', 'fr', 'it', 'ja'],
    },
    staticRoutes: [
      {
        path: '/static/',
        staticDir: '/source/static/',
      },
    ],
  });

  pod.plugins.register(ExamplePlugin, {});
};
