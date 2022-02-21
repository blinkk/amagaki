import * as express from 'express';

import {NunjucksPlugin} from '../src/plugins/nunjucks';
import {Pod} from '../src/pod';
import {ServerPlugin} from '../src/plugins/server';
import {YamlPlugin} from '../src/plugins/yaml';

import {ExamplePlugin} from './plugins/example';

export default function (pod: Pod) {
  pod.configure({
    meta: {
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
        path: '/static/css/',
        staticDir: '/dist/css/',
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

  const serverPlugin = pod.plugins.get('ServerPlugin') as ServerPlugin;
  serverPlugin.register(async (app: express.Express) => {
    const promise = () => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          console.log('tested');
          resolve();
        }, 2000);
      });
    };
    await promise();
    app.use('/foo', (req: express.Request, res: express.Response) => {
      res.send('This is a response from custom middleware.');
    });
  });

  // Shortcut method for adding custom nunjucks filter and global.
  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin') as NunjucksPlugin;
  nunjucksPlugin.addFilter(
    'testShortcutFilter',
    (value: string) => `${value}--SHORTCUT`
  );
  nunjucksPlugin.addGlobal('copyrightYear', () => new Date().getFullYear());

  // Shortcut method for adding custom yaml types.
  const yamlPlugin = pod.plugins.get('YamlPlugin') as YamlPlugin;
  yamlPlugin.addType('!a.Foo', {
    kind: 'scalar',
    resolve: () => true,
    construct: value => `Foo: ${value}`,
    represent: value => value,
  });
}
