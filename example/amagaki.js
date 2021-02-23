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
        path: '/static/js/',
        staticDir: '/dist/js/',
      },
      {
        path: '/static/texts/',
        staticDir: '/src/static/texts/',
      },
      {
        path: '/static/images/',
        staticDir: '/src/static/images/',
      },
    ],
  });

  pod.plugins.register(ExamplePlugin, {});

  // Shortcut method for adding custom nunjucks filter and global.
  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin');
  nunjucksPlugin.addFilter('testShortcutFilter', value => `${value}--SHORTCUT`);
  nunjucksPlugin.addGlobal('copyrightYear', () => new Date().getFullYear());

  // Shortcut method for adding custom yaml types.
  const yamlPlugin = pod.plugins.get('YamlPlugin');
  yamlPlugin.addType(
    new yaml.Type('!a.Bar', {
      kind: 'scalar',
      resolve: () => true,
      construct: value => `Bar: ${value}`,
      represent: value => value,
    })
  );
};
