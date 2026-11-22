import * as codeTabs from './plugins/codeTabs';

import {
  Document,
  NunjucksPlugin,
  NunjucksTemplateEngine,
  Pod,
  Url,
  interpolate,
} from '@amagaki/amagaki';

function stripMarkdownForSearch(md: string): string {
  return md
    .replace(/\{%[\s\S]*?%\}/g, ' ')
    .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>|~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default (pod: Pod) => {
  pod.configure({
    meta: {
      siteTitle: 'Amagaki',
      githubRepo: 'blinkk/amagaki',
      githubUrl: 'https://github.com/blinkk/amagaki',
      githubEditRoot:
        'https://github.com/blinkk/amagaki/edit/main/packages/website',
    },
    staticRoutes: [
      {
        path: '/static/',
        staticDir: '/static/',
      },
    ],
  });

  codeTabs.register(pod);

  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin') as NunjucksPlugin;

  nunjucksPlugin.addFilter('url', (value: Record<string, Document | Url>) => {
    if (value?.doc) {
      return (value.doc as Document).url?.path;
    }
    return value?.url;
  });

  nunjucksPlugin.addFilter('render', function (value: string, context: Object) {
    const nunjucksEngine = pod.engines.getEngineByExtension(
      '.njk'
    ) as NunjucksTemplateEngine;
    const defaultContext = Object.assign({}, this.ctx, context || {});
    return nunjucksEngine.env.renderString(value, defaultContext);
  });

  nunjucksPlugin.addFilter('interpolate', function (value: string) {
    return interpolate(pod, value, this.ctx);
  });

  // Return ordered sidebar groups for either /content/docs or /content/api.
  nunjucksPlugin.addGlobal('getSidebarSections', (rootPath: string) => {
    const rootCollection = pod.collection(rootPath);
    const collections = [rootCollection, ...rootCollection.subcollections].sort(
      (a, b) => (a.fields?.order ?? 999) - (b.fields?.order ?? 999)
    );
    return collections.map(col => {
      const docs = col
        .docs({excludeSubcollections: true})
        .sort((a, b) => {
          const orderDiff = (a.fields?.order ?? 999) - (b.fields?.order ?? 999);
          if (orderDiff !== 0) {
            return orderDiff;
          }
          return (a.fields?.title || '').localeCompare(b.fields?.title || '');
        });
      return {
        title: col.fields?.title || col.basename,
        podPath: col.podPath,
        docs,
      };
    });
  });

  // Return flattened prev/next navigation neighbors within a section root.
  nunjucksPlugin.addGlobal('getPager', (currentDoc: Document, rootPath: string) => {
    const rootCollection = pod.collection(rootPath);
    const collections = [rootCollection, ...rootCollection.subcollections].sort(
      (a, b) => (a.fields?.order ?? 999) - (b.fields?.order ?? 999)
    );
    const allDocs: Document[] = [];
    for (const col of collections) {
      const docs = col
        .docs({excludeSubcollections: true})
        .sort((a, b) => {
          const orderDiff = (a.fields?.order ?? 999) - (b.fields?.order ?? 999);
          if (orderDiff !== 0) {
            return orderDiff;
          }
          return (a.fields?.title || '').localeCompare(b.fields?.title || '');
        });
      allDocs.push(...docs);
    }
    const idx = allDocs.findIndex(d => d.podPath === currentDoc.podPath);
    return {
      prev: idx > 0 ? allDocs[idx - 1] : null,
      next: idx >= 0 && idx < allDocs.length - 1 ? allDocs[idx + 1] : null,
    };
  });

  // Generate client-side search index for Docs and API Reference pages.
  pod.router.addRoutes('searchIndex', async provider => {
    provider.addRoute({
      urlPath: '/search-index.json',
      contentType: 'application/json; charset=utf-8',
      build: async () => {
        const docs = pod.docs(['/content/docs/**/*.md', '/content/api/**/*.md']);
        const entries = docs
          .filter(d => d.url?.path)
          .map(d => ({
            title: d.fields?.title || d.basename,
            section: d.collection?.fields?.title || '',
            location: d.url!.path,
            text: stripMarkdownForSearch(d.body || ''),
          }));
        return JSON.stringify({docs: entries});
      },
    });
  });

  // Generate sitemap.xml, robots.txt, and llms.txt for SEO & AEO.
  pod.router.addRoutes('seo', async provider => {
    provider.addRoute({
      urlPath: '/sitemap.xml',
      contentType: 'application/xml; charset=utf-8',
      build: async () => {
        const docs = pod.docs(['/content/**/*.yaml', '/content/**/*.md']);
        const urls = docs
          .map(d => d.url?.path)
          .filter((p): p is string => Boolean(p))
          .sort();
        const items = urls
          .map(u => `  <url><loc>https://amagaki.dev${u}</loc></url>`)
          .join('\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
      },
    });

    provider.addRoute({
      urlPath: '/robots.txt',
      contentType: 'text/plain; charset=utf-8',
      build: async () =>
        'User-agent: *\nAllow: /\n\nSitemap: https://amagaki.dev/sitemap.xml\n',
    });

    provider.addRoute({
      urlPath: '/llms.txt',
      contentType: 'text/plain; charset=utf-8',
      build: async () =>
        [
          '# Amagaki',
          '',
          '> Amagaki is a lightweight, extensible TypeScript static site generator with structured YAML/Markdown content, Nunjucks templates, and built-in localization. Created by Blinkk.',
          '',
          'Note: Amagaki is in maintenance mode. For new projects, Blinkk recommends [Root.js](https://rootjs.dev).',
          '',
          '## Quick Start',
          '',
          '```bash',
          'npm init amagaki',
          '```',
          '',
          '## Documentation',
          '',
          '- [Home](https://amagaki.dev/)',
          '- [Docs](https://amagaki.dev/docs/)',
          '- [Installation](https://amagaki.dev/docs/getting-started/installation/)',
          '- [Starter Project](https://amagaki.dev/docs/getting-started/starter-project/)',
          '- [CLI](https://amagaki.dev/docs/getting-started/cli/)',
          '- [Templates](https://amagaki.dev/docs/templates/)',
          '- [Plugins](https://amagaki.dev/docs/plugins/)',
          '- [Localization](https://amagaki.dev/docs/localization/)',
          '- [API Reference](https://amagaki.dev/api/)',
          '',
          '## Links',
          '',
          '- GitHub: https://github.com/blinkk/amagaki',
          '- npm: https://www.npmjs.com/package/@amagaki/amagaki',
          '- Releases: https://github.com/blinkk/amagaki/releases',
          '- Ecosystem: [Root.js](https://rootjs.dev), [Grow](https://grow.dev)',
          '',
        ].join('\n'),
    });

    provider.addRoute({
      urlPath: '/404.html',
      contentType: 'text/html; charset=utf-8',
      build: async () => {
        const nunjucksEngine = pod.engines.getEngineByExtension(
          '.njk'
        ) as NunjucksTemplateEngine;
        return nunjucksEngine.env.render('views/404.njk', {
          pod,
          doc: {
            fields: {
              title: 'Page not found',
              description: 'The requested page could not be found on Amagaki.',
              layout: '404',
              noindex: true,
            },
            locale: pod.defaultLocale,
            url: {path: '/404.html'},
            podPath: '/404.html',
          },
        });
      },
    });
  });
};
