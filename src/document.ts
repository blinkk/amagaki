import * as fsPath from 'path';
import * as utils from './utils';

import {Locale, LocaleSet} from './locale';

import {Pod} from './pod';
import {Renderer} from './renderer';
import {Url} from './url';

const DEFAULT_RENDERER = 'njk';
const DEFAULT_VIEW = '/views/base.njk';

interface DocumentParts {
  body?: string | null;
  fields?: any;
}

/**
 * Documents represent dynamically rendered pages. The document object controls
 * all aspects of rendering itself, with references to things like its template
 * renderer, its locale, and its content type. A document is defined by a
 * content file within the pod's content directory.
 *
 * The structure of a document's `content` comes in two parts: `fields` and
 * `body`. `fields` represent either a full YAML document, or YAML front matter.
 * For Markdown and HTML-formatted documents, a document's `body` is everything
 * below the front matter delimiter (`---`) or the entire file contents in
 * absence of a front matter delimiter. YAML files may not have a `body`.
 *
 * Documents are grouped into collections. A collection is a directory within
 * the pod's content directory. A `_collection.yaml` file defines a collection.
 *
 * The same document may be available in multiple locales. Each locale has its
 * own document object (documents are instantiated with both a `podPath` and a
 * `locale` parameter). If a `locale` parameter is not provided, the pod's
 * default locale is used to instantiate the document. Localized documents will
 * automatically resolve any localizable elements (such as `!a.String` YAML
 * types or `!a.Localized` YAML types) to their correct locale.
 *
 * Finally, documents may or may not actually be bound to routes. In other
 * words, a document can be a partial document and only used as a data source or
 * input for another document, or it might just be hidden. If a document lacks a
 * `pathFormat`, it won't be generated as an individual route. A document's
 * `url` object is determined by its own `pathFormat` and coupled to the pod's
 * `router`.
 */
export class Document {
  path: string;
  locale: Locale;
  pod: Pod;
  readonly ext: string;
  private parts: DocumentParts;
  private _content?: string | null;
  private _renderer?: Renderer | null;
  static SupportedExtensions = new Set(['.md', '.yaml']);

  constructor(pod: Pod, path: string, locale: Locale) {
    this.pod = pod;
    this.path = path;
    this.locale = locale;
    this.ext = fsPath.extname(this.path);
    this.parts = {};
  }

  toString() {
    return `[Document: ${this.path} (${this.locale.id})]`;
  }

  /**
   * Returns the document's collection object. If no `_collection.yaml` is found
   * within the document's content directory, the directory structure will be
   * walked upwards until locating a `_collection.yaml`.
   */
  get collection() {
    return this.pod.collection(fsPath.dirname(this.path));
  }

  /**
   * Returns the default locale for the document. The default locale of a
   * document can be specified one of three ways, in order:
   * `$localization?defaultLocale` field within the document's fields, the
   * collection's `_collection.yaml`, or the pod's `amagaki.yaml`.
   */
  get defaultLocale() {
    // TODO: Allow docs and collections to override default locales.
    return this.pod.defaultLocale;
  }

  async render(): Promise<string> {
    const context = {
      process: process,
      doc: this,
      env: this.pod.env,
      pod: this.pod,
      a: {
        static: this.pod.staticFile.bind(this.pod),
      },
    };
    const renderer = this.renderer;
    if (!renderer) {
      throw Error(`No renderer found, can't render: ${this}`);
    }
    return (this.renderer as Renderer).render(this.view, context);
  }

  /**
   * Returns the document's url object by looking it up in the pod's router. If
   * the document has no url (i.e. if it's a partial document or if it's
   * disabled), `undefined` is returned.
   */
  get url(): Url | undefined {
    return this.pod.router.getUrl('doc', this);
  }

  /**
   * Returns the document's basename. A document's basename is its full filename
   * (including extension), for example, the basename for
   * `/content/pages/index.yaml` is `index.yaml`.
   */
  get basename() {
    return fsPath.basename(this.path).split('.')[0];
  }

  /**
   * Returns the document's path format, which the router uses to generate the
   * document's actual `Url` object. The path format is specified in the `$path`
   * key of the document's fields, or if absent, inherited from the
   * `_collection.yaml`. For localized documents, the `$localization?path` key
   * is used instead of the `$path` key. If no `$path` or `$localization?path`
   * is specified, the `pathFormat` is `false`.
   */
  get pathFormat() {
    // TODO: See if this is what we want to do, or if we want path formats to be
    // exclusively defined by the router.
    // return '/pages/${doc.basename}/';
    if (this.locale.id === this.pod.defaultLocale.id) {
      return (
        (this.fields && this.fields['$path']) ||
        (this.collection && this.collection.fields['$path'])
      );
    }
    return (
      (this.fields &&
        this.fields['$localization'] &&
        this.fields['$localization']['path']) ||
      (this.collection &&
        this.collection.fields['$localization'] &&
        this.collection.fields['$localization']['path'])
    );
  }

  /**
   * Returns the filename of the template to render.
   */
  get view(): string {
    if (!this.fields) {
      return (
        (this.collection && this.collection.fields['$view']) || DEFAULT_VIEW
      );
    }
    return (
      this.fields['$view'] ||
      (this.collection && this.collection.fields['$view']) ||
      DEFAULT_VIEW
    );
  }

  /**
   * Returns the document's set of locale objects. In order, the locales are
   * determined by the `$localization:locales` from the document's fields, or if
   * not specified, inherited from the `_collection.yaml`, or if not specified
   * there, then `amagaki.yaml`.
   */
  get locales(): Set<Locale> {
    if (
      this.fields &&
      this.fields['$localization'] &&
      this.fields['$localization']['locales']
    ) {
      return new LocaleSet(
        this.fields['$localization']['locales'].map((locale: string) => {
          return this.pod.locale(locale);
        })
      );
    }
    if (this.collection) {
      return this.collection.locales;
    }
    return this.pod.locales;
  }

  get renderer() {
    // Document has no view, is not renderable.
    if (!this.view) {
      return null;
    }
    const renderer = this.pod.plugins.renderers[fsPath.extname(this.view)];
    if (!renderer) {
      throw Error(`No renderer found for: ${this.view}`);
    }
    return renderer;
  }

  get fields() {
    if (this.parts.fields) {
      return this.parts.fields;
    }
    if (this.ext === '.md') {
      this.parts = this.initPartsFromFrontMatter();
    } else {
      const timer = this.pod.profiler.timer(
        'document.fields.localize',
        'Document fields localization'
      );
      try {
        this.parts.fields = utils.localizeData(
          this.pod.readYaml(this.path),
          this.locale
        );
      } finally {
        timer.stop();
      }
    }
    return this.parts.fields;
  }

  get content() {
    if (this._content !== null) {
      return this._content;
    }
    this._content = this.pod.readFile(this.path);
    return this._content;
  }

  get body() {
    if (this.parts.body !== null) {
      return this.parts.body;
    }
    if (this.ext === '.yaml') {
      this.parts.body = '';
    } else if (this.ext === '.md') {
      this.parts = this.initPartsFromFrontMatter();
    }
    return this.parts.body;
  }

  private initPartsFromFrontMatter(): DocumentParts {
    // If the body value is not undefined, assume the front matter has been split.
    if (this.parts.body !== undefined) {
      return this.parts;
    }
    const result = utils.splitFrontMatter(this.content);
    return {
      body: result.body || null,
      fields: result.frontMatter
        ? utils.localizeData(
            this.pod.readYamlString(result.frontMatter, this.path),
            this.locale
          )
        : {},
    };
  }
}
