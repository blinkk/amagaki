import {
  DocumentRoute,
  Pod,
  Route,
  RouteProvider,
  Router,
} from '@amagaki/amagaki';

import jsBeautify from 'js-beautify';

export interface SitemapPluginOptions {
  sitemapPath?: string;
  robotsTxtPath?: string;
}

export class SitemapPlugin extends RouteProvider {
  options: SitemapPluginOptions;
  type: string;

  constructor(router: Router, options: SitemapPluginOptions) {
    super(router);
    this.type = 'robots';
    this.options = options;
  }

  static register(pod: Pod, options?: SitemapPluginOptions) {
    const provider = new SitemapPlugin(pod.router, options ?? {} );
    pod.router.addProvider(provider);
    return provider;
  }

  async routes():Promise<any> {
    return [new RobotsTxtRoute(this), new SitemapRoute(this)];
  }
}

class RobotsTxtRoute extends Route {
  provider: SitemapPlugin;

  constructor(provider: SitemapPlugin) {
    super(provider);
    this.provider = provider;
  }

  get urlPath() {
    return this.provider.options.robotsTxtPath ?? '/robots.txt';
  }

  async build() {
    // TODO: Add Sitemap property, hook into document.
    return 'User-agent: *\nAllow: /';
  }
}

class SitemapRoute extends Route {
  provider: SitemapPlugin;
  pod: Pod;

  constructor(provider: SitemapPlugin) {
    super(provider);
    this.provider = provider;
  }

  get urlPath() {
    return this.provider.options.sitemapPath ?? '/sitemap.xml';
  }

  get templateSource() {
    return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
      {% for route in routes %}
      {% set doc = route.doc %}
      {% if doc.locales %}
      {% for locale in doc.locales %}
      {% set localized_doc = pod.doc(doc.podPath, locale) %}
      <url>
          <loc>{{localized_doc.url}}</loc>
          <xhtml:link href="{{doc.url}}" hreflang="x-default" rel="alternate" />
          {% for locale in doc.locales %}
          {% set inner_doc = pod.doc(doc.podPath, locale) %}
          <xhtml:link href="{{inner_doc.url}}" hreflang="{{inner_doc.locale.id}}" rel="alternate" />
          {% endfor %}
      </url>
      {% endfor %}
      {% else %}
      <url>
          <loc>{{doc.url}}</loc>
          <xhtml:link href="{{doc.url}}" hreflang="x-default" rel="alternate" />
          {% for locale in doc.locales %}
          {% set inner_doc = pod.doc(doc.podPath, locale) %}
          <xhtml:link href="{{inner_doc.url}}" hreflang="{{inner_doc.locale.id}}" rel="alternate" />
          {% endfor %}
      </url>
      {% endif %}
      {% endfor %}
  </urlset>`;
  }

  async build() {
    const njk = this.pod.engines.getEngineByExtension('.njk');
    const routes = (await this.pod.router.routes()).filter(
      route =>
        ['collection', 'doc'].includes(route.provider.type) &&
        (route as DocumentRoute).locale === this.pod.defaultLocale &&
        !route.urlPath.includes('/404/')
    );
    const text = (
      await njk.renderFromString(this.templateSource, {
        routes: routes,
        pod: this.pod,
      })
    ).replace(/^\s*[\r\n]/gm, '');
    return jsBeautify.html(text, {indent_size: 2});
  }
}
