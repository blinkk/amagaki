const ExamplePlugin = require('./plugins/example');
const yaml = require('js-yaml');

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

  // Shortcut method for adding custom yaml types.
  const yamlPlugin = pod.plugins.get('YamlPlugin');
  yamlPlugin.addType(
    new yaml.Type('!a.Bar', {
      kind: 'scalar',
      resolve: () => {
        return true;
      },
      construct: value => {
        return `Bar: ${value}`;
      },
      represent: value => value,
    })
  );
};
