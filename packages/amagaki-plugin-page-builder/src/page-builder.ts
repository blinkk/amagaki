import {
  BuildRouteOptions,
  DataType,
  Document,
  Locale,
  Pod,
  Route,
  StaticFile,
  TemplateContext,
  TemplateEngineComponent,
  Url,
  interpolate,
} from '@amagaki/amagaki';
import {html, safeString} from './utils';

import { GridOptions } from './ui/grid-inspector';
import {PageBuilderStaticRouteProvider} from './router';
import {PartialPreviewRouteProvider} from './partial-preview';
import {SitemapPlugin} from './sitemap';
import fs from 'fs';
import jsBeautify from 'js-beautify';

interface PartialIdentifier {
  /** The partial's name. If only `partial` is specified, the partial's template will be loaded from the filesystem using the configuration present in the `partialPaths` configuration option. */
  partial: string;
  /** The absolute path to the partial on the filesystem. Used internally. */
  absolutePath?: string;
  /**  The pod path to the partial's template. Used if the partial is located in a place outside of the `partialPaths` configuration. */
  podPath?: string;
}

interface BuiltInPartialFields {
  /** Where to find the partial. */
  partial?: string | PartialIdentifier;
  /** An ID corresponding to the partial. Unique per page. Used as the deep link to the module on the page, in place of a module number. */
  id?: string;
  /** A link to the design file for the partial. */
  designLink?: string;
  /** A link to the CMS for the partial. */
  editContentLink?: string;
  /** A link to submit an issue about the partial. */
  submitIssueLink?: string;
  /** The partial's size. If specified, the size appears in parenthesis after the partial's name in the page module's inspector. */
  size?: string;
  /** Whether to include the inspector on the page. */
  includeInspector?: boolean;
  /** Whether to include the partial's context on the page. Used for partials that require hydration. */
  includeContext?: boolean;
}

export type Partial = BuiltInPartialFields & Record<string, any>;

export interface PageBuilderDocumentFields {
  title?: string;
  description?: string;
  image?: string;
  partials: Partial[];
}

export type PageBuilderRenderFunction = (context: TemplateContext) => Promise<string>;

interface BuiltinPartial {
  enabled?: boolean;
  name?: string;
  content?: string;
  view?: string;
}

/**
 * The pod path formats for CSS, JS, and the template for each partial. Values are interpolated.
 */
interface PartialPaths {
  /** The path format to load content for a partial. Note: This is optional.
   * Most partials will use page-specific content. Some global partials, e.g. a
   * header and footer, will use shared content. Default:
   * `[/content/partials/${partial.partial}.yaml]` */
  content?: string[];

  /** The path format to load the CSS for a partial. Default:
   * `[/dist/css/partials/${partial.partial}.css]` */
  css: string[];

  /** The path format to load the JS for a partial. Default:
   * `[/dist/js/partials/${partial.partial}.js]` */
  js: string[];

  /** The path format to the view for a partial. Default:
   * `[/views/partials/${partial.partial}.njk]` */
  view: string[];

  /** Whether to load scripts for partials using `type="module"`. Default:
   * false. */
  module?: boolean;
}

type ResourceLoader = {
  /** The reference to the resource, used as the `src` for scripts or the `href`
   * for styles. Accepts either `StaticFile` objects or URLs as strings. */
  href: StaticFile | string;

  /** Whether to use `async` when loading scripts, or whether to load styles
   * asynchronously using the technique described on
   * https://web.dev/defer-non-critical-css/. */
  async?: boolean;

  /** Whether to use `defer` when loading scripts. */
  defer?: boolean;

  /** Whether to use `type="module"` when loading scripts. */
  module?: boolean;
};

type Resource = StaticFile | string | ResourceLoader;

interface GetUrlOptions {
  includeDomain?: boolean;
  relative?: boolean;
}

interface GetHrefFromResourceOptions {
  includeFingerprint?: boolean;
}

/** Options for the inspector UI. */
interface InspectorOptions {
  /** Whether the inspector is enabled. If unset, the inspector is enabled in staging and dev modes only and completely absent from prod. */
  enabled?: boolean;

  /** A list of sizes used by the margin inspector. The margin inspector highlights margins, simplifying visual QA. */
  margins?: number[];

  /** Configuration options for a columns-based layout grid. */
  grid?: GridOptions[];
}

const PRECONNECT_MARKER = '<!-- page-builder: preconnect -->';

interface PreconnectOrigin {
  url: string;
  crossorigin: boolean;
}

export interface PageBuilderOptions {
  inspector?: InspectorOptions;

  /** Whether to dump the partial context into an element adjacent to each partial's `<page-module />` element. A partial's context may be used if the partial needs to be hydrated, inspected, or otherwise. */
  includeContext?: boolean;

  /** Whether to beautify HTML output. */
  beautify?: boolean;

  /** Whether to beautity the contents of the `<page-module-container>` element. */
  beautifyContainer?: boolean;

  footer?: BuiltinPartial;
  header?: BuiltinPartial;
  head?: {
    /**
     * The description to use for the site. This is used as the default <meta>
     * description, if a page does not specify its own `description` field.
     */
    description?: string;

    /** The favicon. */
    icon?: Resource;

    /**
     * The image URL to use for the site. This is used as the default <meta>
     * image, if a page does not specify its own `image` field. Note this image
     * is used primarily when the page is shared. The image size should
     * generally be `1200x630`.
     */
    image?: string;

    /** A list of scripts to include in the <head> element. */
    scripts?: Resource[];

    /**
     * The site name. Used as the default <title> for any page that does not
     * specify its own `title` field. Also used as the `site_name` meta value.
     */
    siteName?: string;

    /** A list of all stylesheets to include in the <head> element. */
    stylesheets?: Resource[];

    /** The Twitter username (including @) belonging to the owner of the site. */
    twitterSite?: string;

    /**
     * The suggested color for browsers to use to customize the surrounding UI.
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/theme-color
     */
    themeColor?: string;

    /** Whether to add a `noindex` meta tag to the page. */
    noIndex?: boolean;

    /** Append extra HTML to the top of the <head> element. */
    prepend?: string[];

    /** Append extra HTML to the bottom of the <head> element. */
    extra?: string[];

    /** Whether to append the site name to the page title. */
    appendSiteName?: boolean;
  };
  body?: {
    /**
     * Override the class on the <body> element. The class can either be a
     * string or an async function that returns a string.
     */
    class?: string | ((context: TemplateContext) => Promise<string>);
    /** Prepend HTML to the top of the <body> element. */
    prepend?: string[];
    /** Append extra HTML to the bottom of the <head> element. */
    extra?: string[];
  };
  main ?: {
    /**
     * Add a class on the <main> element. The class can either be a
     * string or an async function that returns a string.
     */
    class?: string | ((context: TemplateContext) => Promise<string>);
    /** Prepend HTML to the top of the <main> element. */
    prepend?: string[];
    /** Append extra HTML to the bottom of the <main> element. */
    extra?: string[];
  },
  partialPaths?: PartialPaths;
  /** Options for generating the sitemap. */
  sitemapXml?: {
    /** The URL path for the `sitemap.xml`. Example: `/sitemap.xml` */
    path: string;
  };
  /** Options for generating the `robots.txt` file. */
  robotsTxt?: {
    /** The URL path for the `robots.txt` file. Example: `/robots.txt` */
    path: string;
  };
}

export class PageBuilder {
  doc: Document;
  pod: Pod;
  resourceUrls: string[];
  partialPaths: PartialPaths;
  context: TemplateContext;
  options: PageBuilderOptions;
  enableInspector: boolean;
  includeContext: boolean;
  preconnectOrigins: Set<PreconnectOrigin>;
  private partialLoopIncrementer: number;

  constructor(
    doc: Document,
    context: TemplateContext,
    options?: PageBuilderOptions
  ) {
    this.doc = doc;
    this.pod = doc.pod;
    this.resourceUrls = [];
    this.context = context;
    this.options = options || {};
    this.enableInspector = PageBuilder.isInspectorEnabled(
      this.pod,
      this.options
    );
    this.preconnectOrigins = new Set();
    this.partialLoopIncrementer = 0;
    this.includeContext = this.options.includeContext ?? this.enableInspector;
    this.partialPaths = options?.partialPaths ?? {
      content: ['/content/partials/${partial.partial}.yaml'],
      css: ['/dist/css/partials/${partial.partial}.css'],
      js: ['/dist/js/partials/${partial.partial}.js'],
      view: ['/views/partials/${partial.partial}.njk'],
    };
  }

  static isInspectorEnabled(pod: Pod, options?: PageBuilderOptions) {
    return (
      options?.inspector?.enabled ?? (pod.env.dev || pod.env.name === 'staging')
    );
  }

  static async build(
    doc: Document,
    context: TemplateContext,
    options?: PageBuilderOptions
  ) {
    const builder = new PageBuilder(doc, context, options);
    return await builder.buildDocument();
  }

  static register(pod: Pod, options?: PageBuilderOptions) {
    SitemapPlugin.register(pod, {
      robotsTxtPath: options?.robotsTxt?.path,
      sitemapPath: options?.sitemapXml?.path,
    });
    if (PageBuilder.isInspectorEnabled(pod, options)) {
      PartialPreviewRouteProvider.register(pod, {
        pageBuilderOptions: options || {},
      });
      PageBuilderStaticRouteProvider.register(pod);
    }
    pod.defaultView = async (context: TemplateContext) => {
      return await PageBuilder.build(context.doc, context, options);
    };
    return options;
  }

  static buildFromRoute(
    pod: Pod,
    urlPath: string,
    fields: PageBuilderDocumentFields,
    buildRouteOptions?: BuildRouteOptions,
    locale?: undefined,
  ) {
    const doc = {
      fields: fields,
      locale: locale ?? pod.defaultLocale,
      locales: [],
      pod: pod,
      podPath: __filename,
      url: new Url({
        env: pod.env,
        path: urlPath,
      }),
    } as unknown as Document;
    const pageBuilderRender = pod.defaultView as PageBuilderRenderFunction;
    return pageBuilderRender({
      doc: doc,
      env: pod.env,
      pod: pod,
      process: process,
      req: buildRouteOptions?.req,
    });
  }

  /**
   * Returns a field value with fallback from the document to the collection.
   * @param name The field's key.
   * @returns The field's value, either from the document fields or the collection fields.
   */
  getFieldValue(name: string) {
    return this.doc.fields[name] ?? this.doc.collection?.fields[name];
  }

  async buildBodyElement() {
    if (this.options.body?.class) {
      const className =
        typeof this.options.body?.class === 'function'
          ? await this.options.body?.class(this.context)
          : this.options.body?.class;
      return html`<body class="${className}">`;
    } else {
      return html`<body>`;
    }
  }

  async buildMainElement() {
    if (this.options.main?.class) {
      const className =
        typeof this.options.main?.class === 'function'
          ? await this.options.main?.class(this.context)
          : this.options.main?.class;
      return html`<main class="${className}">`;
    } else {
      return html`<main>`;
    }
  }

  async buildDocument() {
    const partials =
      this.doc.fields.partials ?? this.doc.collection?.fields.partials;
    let result = html`
      <!DOCTYPE html>
      <html lang="${this.getHtmlLang(
        this.doc.locale
      )}" itemscope itemtype="https://schema.org/WebPage">
      ${await this.buildHeadElement()}
      ${await this.buildBodyElement()}
        ${
          this.options.body?.prepend
            ? safeString(await this.buildExtraElements(this.options.body?.prepend))
            : ''
        }
        <div class="main">
          ${
            this.getFieldValue('header') === false || this.options.header?.enabled === false
              ? ''
              : await this.buildBuiltinPartial('header', this.options.header)
          }
          ${await this.buildMainElement()}
            ${
              this.options.main?.prepend
                ? safeString(await this.buildExtraElements(this.options.main?.prepend))
                : ''
            }
            ${safeString(
              (
                await Promise.all(
                  ((partials as any[]) ?? []).map((partial: Partial) =>
                    this.buildPartialElement(partial)
                  )
                )
              ).join('\n')
            )}
            ${
              this.options.main?.extra
                ? safeString(await this.buildExtraElements(this.options.main?.extra))
                : ''
            }
          </main>
          ${
            this.getFieldValue('footer') === false || this.options.footer?.enabled === false
              ? ''
              : await this.buildBuiltinPartial('footer', this.options.footer)
          }
        </div>
        ${
          this.options.body?.extra
            ? safeString(await this.buildExtraElements(this.options.body?.extra))
            : ''
        }
        ${this.enableInspector ?
          html`
            <page-inspector
              ${this.options?.inspector?.margins ? html`margins="${JSON.stringify(this.options.inspector.margins)}"` : ''}
              ${this.options?.inspector?.grid ? html`grid="${JSON.stringify(this.options.inspector.grid)}"` : ''}
            ></page-inspector>`
          : ''}
      </body>
      </html>
    `;
    let text = result.toString();
    // Insert collected preconnect elements.
    if (this.preconnectOrigins.size > 0) {
      const preconnectElements = this.buildPreconnectElements([...this.preconnectOrigins]).join('\n');
      text = text.replace(PRECONNECT_MARKER, preconnectElements);
    } else {
      text = text.replace(PRECONNECT_MARKER, '');
    }
    if (this.options.beautify === false) {
      return text;
    }
    text = text.replace(/^\s*\n/gm, '');
    const unformattedOptions = [];
    if (this.options.beautifyContainer === false) {
      unformattedOptions.push('page-module-container');
    }
    return jsBeautify.html(text, {indent_size: 2, unformatted: unformattedOptions});
  }

  getUrl(item: any, options?: GetUrlOptions) {
    const fingerprint = item?.fingerprint;
    let url = item;
    if (item?.url) {
      url = options?.includeDomain ? item.url.toString() : item.url.path;
    }
    // 404 pages may be served from multiple places; ensure the URL is always
    // absolute for 404 pages.
    if (options?.relative && url && !this.doc.url.path.includes('404')) {
      url = Url.relative(url, this.context.doc);
    }
    return fingerprint && !url?.includes('?')
      ? `${url}?fingerprint=${fingerprint}`
      : url;
  }

  getHtmlLang(locale: Locale) {
    return locale.id.replace('_ALL', '').replace('_', '-');
  }

  serializeContext(partialContext: any) {
    const context = {...partialContext};
    // Strip out internally used paths.
    // TODO: Move these to an internal `_pageBuilder` key.
    delete context.partial.absolutePath;
    delete context.partial.includeInspector;
    delete context.podPath;
    return JSON.stringify(context, ((key, value) => {
      if (value?.constructor?.name === 'Pod' && value.root) {
        return undefined;
      }
      if (value?.constructor?.name === 'Locale' && value.podPath) {
        return (value as Locale).id;
      }
      if (value?.constructor?.name === 'Url' && value.podPath) {
        return (value as Url).toString();
      }
      if (DataType.isDocument(value)) {
        const doc = value as Document;
        return {
          body: doc.body,
          fields: doc.fields,
          locale: doc.locale.id,
        };
      }
      return value;
    }), 2);
  }

  async buildContextElement(context: any) {
    return html`
      <page-module-context>
        <script type="application/json">
          ${safeString(this.serializeContext(
            context.partial
          ))}
        </script>
      </page-module-context>
    `;
  }

  static selectPodPath(pod: Pod, pathFormats: string[], partial: string) {
    for (const pathFormat of pathFormats) {
      const podPath = interpolate(pod, pathFormat, {
        partial: {partial: partial},
      });
      if (pod.fileExists(podPath)) {
        return podPath;
      }
    }
  }

  async buildBuiltinPartial(partial: string, options?: BuiltinPartial) {
    const contentPodPath = options?.content ?? PageBuilder.selectPodPath(this.pod, this.partialPaths.content ?? ['/content/partials/${partial.partial}.yaml'], partial);
    const viewPodPath = options?.view ?? PageBuilder.selectPodPath(this.pod, this.partialPaths.view, partial);
    return viewPodPath && this.pod.fileExists(viewPodPath)
      ? html`
        <${partial}>
        ${await this.buildPartialElement({
          ...{partial: options?.name ?? partial, podPath: viewPodPath},
          ...(contentPodPath
            ? this.pod.doc(contentPodPath, this.context.doc.locale).fields
            : {}),
        })}
        </${partial}>
      ` : '';
  }

  async buildHeadElement() {
    return html`
      <head>
        ${this.options.head?.prepend
          ? safeString(await this.buildExtraElements(this.options.head.prepend))
          : ''}
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${this.buildHeadMetaElements({
          noIndex: this.getFieldValue('noIndex') ?? this.options.head?.noIndex,
          themeColor:
            this.getFieldValue('themeColor') ?? this.options.head?.themeColor,
          description:
            this.getFieldValue('description') ?? this.options.head?.description,
          image: this.getFieldValue('image') ?? this.options.head?.image,
          locale: this.doc.locale.id,
          siteName:
            this.getFieldValue('siteName') ?? this.options.head?.siteName,
          title: this.getFieldValue('title') ?? this.options.head?.siteName,
          twitterSite:
            this.getFieldValue('twitterSite') ?? this.options.head?.twitterSite,
          url: (this.doc.url as Url).toString(),
          appendSiteName: this.getFieldValue('appendSiteName') ?? this.options.head?.appendSiteName ?? true,
        })}
        ${this.buildHreflangLinkElements()}
        ${this.buildHeadLinkElements({
          icon: this.getFieldValue('icon') ?? this.options.head?.icon,
        })}
        ${safeString(
          this.options.head?.stylesheets
            ?.map(style => this.buildStyleLinkElement(style, undefined))
            .join('\n') ?? ''
        )}
        ${safeString(
          this.options.head?.scripts
            ?.map(script => this.buildScriptElement(script, undefined))
            .join('\n') ?? ''
        )}
        ${this.options.head?.extra
          ? safeString(await this.buildExtraElements(this.options.head.extra))
          : ''}
        ${safeString(
          this.enableInspector
            ? PageBuilderStaticRouteProvider.scripts
                .map(path =>
                  this.buildScriptElement(
                    `${PageBuilderStaticRouteProvider.urlBase}/${path}`
                  )
                )
                .join('\n')
            : ''
        )}
      </head>
    `;
  }

  async buildExtraElements(extra: string[]) {
    const html = (
      await Promise.all(extra.map(podPath => this.renderFile(podPath)))
    ).join('\n');
    this.collectPreconnectOrigins(html);
    return html;
  }

  async renderFile(podPath: string) {
    const engine = this.pod.engines.getEngineByFilename(podPath);
    return await engine.render(podPath, this.context);
  }

  buildHreflangLinkElements() {
    // Documents created by the preview gallery may not have URLs. Check for
    // URLs prior to outputting link tags.
    const defaultUrl = this.getUrl(
      this.pod.doc(this.doc.podPath, this.doc.defaultLocale).url
    );
    return html`
      ${this.doc.url
        ? html`<link href="${this.doc.url}" rel="canonical">`
        : ''}
      ${defaultUrl
        ? html`<link
            href="${defaultUrl}"
            hreflang="x-default"
            rel="alternate"
          >`
        : ''}
      ${safeString([...this.doc.locales]
        .filter(locale => {
          return locale !== this.doc.defaultLocale;
        })
        .map(locale => {
          return html`<link
            href="${this.getUrl(this.pod.doc(this.doc.podPath, locale).url)}"
            hreflang="${this.getHtmlLang(locale)}"
            rel="alternate"
          >`;
        })
        .join('\n'))}
    `;
  }

  buildHeadLinkElements(options: {icon: string}) {
    return html`
      ${options.icon
        ? html`<link
            rel="icon"
            href="${this.getUrl(options.icon, {
              relative: true,
            })}"
          >`
        : ''}
    `;
  }

  buildHeadMetaElements(options: {
    appendSiteName?: boolean;
    description?: string;
    image?: string;
    locale?: string;
    noIndex?: boolean;
    siteName?: string;
    themeColor?: string;
    title: string;
    twitterSite?: string;
    url: string;
  }) {
    return html`
      ${options.title ? html`<title>${options.title}${options.appendSiteName ? ` | ${options.siteName}` : ''}</title>` : ''}
      ${options.description
        ? html`<meta name="description" content="${options.description}">`
        : ''}
      ${options.themeColor
        ? html`<meta name="theme-color" content="${options.themeColor}">`
        : ''}
      ${options.noIndex ? html`<meta name="robots" content="noindex">` : ''}
      ${safeString(PRECONNECT_MARKER)}
      <meta name="referrer" content="no-referrer">
      <meta property="og:type" content="website">
      ${options.siteName
        ? html`<meta property="og:site_name" content="${options.siteName}">`
        : ''}
      <meta property="og:url" content="${options.url}">
      ${options.title
        ? html`<meta property="og:title" content="${options.title}${options.appendSiteName ? ` | ${options.siteName}` : ''}">`
        : ''}
      ${options.description
        ? html`<meta
            property="og:description"
            content="${options.description}"
         >`
        : ''}
      ${options.image
        ? html`<meta
            property="og:image"
            content="${this.getUrl(options.image, {
              includeDomain: true,
            })}"
         >`
        : ''}
      ${options.locale
        ? html`<meta property="og:locale" content="${options.locale}">`
        : ''}
      ${options.twitterSite
        ? html`<meta
            property="twitter:site"
            content="${options.twitterSite}"
         >`
        : ''}
      ${options.title
        ? html`<meta property="twitter:title" content="${options.title}${options.appendSiteName ? ` | ${options.siteName}` : ''}">`
        : ''}
      ${options.description
        ? html`<meta
            property="twitter:description"
            content="${options.description}"
         >`
        : ''}
      ${options.image
        ? html`<meta
            property="twitter:image"
            content="${this.getUrl(options.image, {includeDomain: true})}"
         >`
        : ''}
      <meta property="twitter:card" content="summary_large_image">
    `;
  }

  async buildPartialElement(partial: Partial) {
    // Support both:
    // 1. {partial: 'foo', ...}
    // 2. {partial: {partial: 'foo', absolutePath: '/Users/foo/.../foo.njk'}, ...}
    // 3. {partial: {partial: 'foo', podPath: '/views/custom/custom-foo.njk'}, ...}
    const name: string =
      typeof partial.partial === 'string'
        ? partial.partial
        : partial.partial?.partial;
    // Skip empty partials, e.g. `{partial: false}`.
    if (!name) {
      return;
    }
    const cssPodPath = PageBuilder.selectPodPath(
      this.pod,
      this.partialPaths.css,
      name
    );
    const jsPodPath = PageBuilder.selectPodPath(
      this.pod,
      this.partialPaths.js,
      name
    );
    const absPath = partial.partial && (partial.partial as PartialIdentifier).absolutePath;

    const partialBuilder = [];
    const htmlId = partial.id ? ` id="${partial.id}"` : '';
    const position = this.partialLoopIncrementer += 1;
    partialBuilder.push(`<page-module${htmlId} partial="${name}" position="${position}">`);

    // Load resources required by partial module.
    if (cssPodPath) {
      const cssFile = this.pod.staticFile(cssPodPath)
      partialBuilder.push(this.buildStyleLinkElement(cssFile));
    }
    if (jsPodPath) {
      const jsFile = this.pod.staticFile(jsPodPath);
      const module = this.partialPaths.module;
      partialBuilder.push(this.buildScriptElement({
        href: jsFile,
        module: module,
      }));
    }
    if (this.enableInspector && partial?.includeInspector !== false && name !== 'partial-preview-spacer') {
      partialBuilder.push(html`
        <page-module-inspector
          partial="${name}"
          position="${position}"
          ${name.toLowerCase().includes('spacer') ? 'neutral' : ''}
          ${partial?.size ? html`size="${partial?.size}"` : ''}
          ${partial?.editContentLink ? html`edit-content-link="${partial?.editContentLink}"` : ''}
          ${partial?.submitIssueLink ? html`submit-issue-link="${partial?.submitIssueLink}"` : ''}
        ></page-module-inspector>
      `);
    }
    const context = {...this.context, partial};
    let result;
    if (absPath) {
      const engine = this.pod.engines.getEngineByFilename(
        absPath
      ) as TemplateEngineComponent;
      const template = fs.readFileSync(absPath, 'utf8');
      result = await engine.renderFromString(template, context);
    } else if (typeof partial.partial === 'string') {
      const viewPodPath =
        partial.podPath ??
        PageBuilder.selectPodPath(this.pod, this.partialPaths.view, name);
      // TODO: Handle error when partial doesn't exist. In this case, no file
      // matched `viewPodPath` on the filesystem and `selectPodPath` failed. We
      // should fail the build in prod and in dev show an in-page module saying
      // `Partial not found: ${name}`. The user can then fix the source of the
      // problem (by either adding the partial or by fixing the configuration).
      if (!viewPodPath) {
        console.error(`Partial not found: ${name}`);
        result = `<page-module-placeholder partial="${name}"></page-module-placeholder>`;
      } else {
        const partialFile = interpolate(this.pod, viewPodPath, {
          partial: partial,
        });
        const engine = this.pod.engines.getEngineByFilename(
          partialFile
        ) as TemplateEngineComponent;
        result = await engine.render(partialFile, context);
      }
    }
    if (this.options.beautifyContainer === false) {
      partialBuilder.push(`<page-module-container>${result?.trim()}</page-module-container>`);
    } else {
      partialBuilder.push(`<page-module-container>`);
      partialBuilder.push(result?.trim());
      partialBuilder.push('</page-module-container>');
    } 
    if (this.includeContext || partial.includeContext) {
      partialBuilder.push(
        await this.buildContextElement(context)
      );
    }
    partialBuilder.push('</page-module>');
    return safeString(partialBuilder.join('\n'));
  }

  getHrefFromResource(
    resource: Resource,
    options?: GetHrefFromResourceOptions
  ) {
    if (DataType.isStaticFile(resource)) {
      resource = resource as StaticFile;
      let href = resource.url?.path;
      if (options?.includeFingerprint !== false && !href?.includes('?')) {
        href = `${href}?fingerprint=${resource.fingerprint}`;
      }
      return href;
    } else if ((resource as ResourceLoader)?.href) {
      return (resource as ResourceLoader).href;
    }
    // `resource` is a string.
    return resource;
  }

  buildScriptElement(resource: Resource, defer = false, async = false) {
    const href = this.getHrefFromResource(resource);
    const url = this.getUrl(href, {relative: true});
    // Resource has already been loaded, don't build again.
    if (this.resourceUrls.includes(url)) {
      return '';
    }
    if (!url) {
      throw new Error(
        `Resource ${resource} has no URL. Does it exist and is it mapped in \`staticRoutes\`?`
      );
    }
    const module = (resource as ResourceLoader)?.module;
    if ((resource as ResourceLoader)?.defer !== undefined) {
      defer = (resource as ResourceLoader)?.defer;
    }
    if ((resource as ResourceLoader)?.async !== undefined) {
      async = (resource as ResourceLoader)?.async;
    }
    this.resourceUrls.push(url);
    return html`
      <script
        src="${url}"
        ${module ? html`type="module"` : ''}
        ${defer ? 'defer' : ''}
        ${async ? 'async' : ''}
      ></script>
    `;
  }

  /** Returns a list of origins to preconnect to given a string. */
  getPreconnectOrigins(content: string): PreconnectOrigin[] {
    const origins: PreconnectOrigin[] = [];
    if (/https:\/\/fonts.googleapis.com/g.test(content)) {
      origins.push({url: 'https://fonts.gstatic.com', crossorigin: true});
      origins.push({url: 'https://fonts.googleapis.com', crossorigin: true});
    }
    if (/https:\/\/www.google-analytics.com/g.test(content)) {
      origins.push({url: 'https://www.google-analytics.com', crossorigin: false});
    }
    if (/https:\/\/www.googletagmanager.com\/gtm.js\?id=/g.test(content)) {
      origins.push({url: 'https://www.googletagmanager.com', crossorigin: false});
    }
    return origins;
  }

  collectPreconnectOrigins(content: string) {
    const origins = this.getPreconnectOrigins(content);
    if (origins) {
      for (const origin of origins) {
        this.preconnectOrigins.add(origin);
      }
    }
  }

  buildPreconnectElements(origins: PreconnectOrigin[]) {
    const added = new Set<string>();
    return origins.map(({url, crossorigin}) => {
      if (!added.has(url)) {
        added.add(url);
        return html`<link rel="preconnect" href="${url}"${crossorigin ? 'crossorigin' : ''}>`;
      }
      return '';
    });
  }

  /**
   * Builds a `<link>` element used for styles.
   * @param resource The style resource to load.
   * @param async Whether the style should be loaded asynchronously.
   * @returns The `<link>` element.
   */
  buildStyleLinkElement(resource: Resource, async = true) {
    const href = this.getHrefFromResource(resource);
    const url = this.getUrl(href, {relative: true});
    // Resource has already been loaded, don't build again.
    if (this.resourceUrls.includes(url)) {
      return '';
    }
    if (!url) {
      throw new Error(
        `Resource ${resource} has no URL. Does it exist and is it mapped in \`staticRoutes\`?`
      );
    }
    this.resourceUrls.push(url);
    this.collectPreconnectOrigins(url);
    return html`
      <link
        href="${url}"
        rel="stylesheet"
        ${async
          ? html`
              rel="preload" as="style"
              onload="this.onload=null;this.rel='stylesheet'"
            `
          : ''}
      >
    `;
  }
}
