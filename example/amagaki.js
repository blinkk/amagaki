const ExamplePlugin = require('./plugins/example/plugin');

module.exports = function (pod) {
  pod.metadata = {
    name: 'Amagaki Example',
  };

  pod.localization = {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'it', 'ja'],
  };

  pod.staticRoutes = [
    {
      path: '/static/',
      staticDir: '/source/static/',
    },
  ];

  pod.plugins.registerPlugin(new ExamplePlugin(pod));
};
