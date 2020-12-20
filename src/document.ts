import * as fsPath from 'path';
import * as utils from './utils';
import {Locale, LocaleSet} from './locale';
import {Pod} from './pod';
import {Renderer} from './renderer';
import {Url} from './url';

const DEFAULT_RENDERER = 'njk';
const DEFAULT_VIEW = '/views/base.njk';

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
  renderer: Renderer;
  readonly ext: string;
  private _fields: any; // TODO: See if we can limit this.
  private _body: string | null;
  private _content: string | null;
  static SupportedExtensions = new Set(['.md', '.yaml']);

  constructor(pod: Pod, path: string, locale: Locale) {
    this.pod = pod;
    this.path = path;
    this.renderer = pod.renderer(DEFAULT_RENDERER);
    this.locale = locale;
    this.ext = fsPath.extname(this.path);

    this._body = null;
    this._fields = null;
    this._content = null;
  }

  toString() {
    return `[Document: ${this.path} (${this.locale.id})]`;
  }

  get collection() {
    return this.pod.collection(fsPath.dirname(this.path));
  }

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
    return this.renderer.render(this.view, context);
  }

  get url(): Url | undefined {
    return this.pod.router.getUrl('doc', this);
  }

  get basename() {
    return fsPath.basename(this.path).split('.')[0];
  }

  get pathFormat() {
    // TODO: See if this is what we want to do, or if we want path formats to be
    // exclusively defined by the router.
    // return '/pages/${doc.basename}/';
    if (this.locale.id === this.pod.defaultLocale.id) {
      return (
        (this.fields && this.fields['$path']) ||
        (this.collection && this.collection.fields['$path'])
      );
    } else {
      return this.pathFormatLocalized;
    }
  }

  get pathFormatLocalized() {
    return (
      (this.fields &&
        this.fields['$localization'] &&
        this.fields['$localization']['path']) ||
      (this.collection &&
        this.collection.fields['$localization'] &&
        this.collection.fields['$localization']['path'])
    );
  }

  get view() {
    if (!this.fields) {
      return null;
    }
    return (
      this.fields['$view'] ||
      (this.collection && this.collection.fields['$view']) ||
      DEFAULT_VIEW
    );
  }

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

  get fields() {
    if (this._fields) {
      return this._fields;
    }
    if (this.ext === '.md') {
      this.initPartsFromFrontMatter(); // Set this._fields.
    } else {
      this._fields = this.pod.readYaml(this.path);
    }
    return this._fields;
  }

  get content() {
    if (this._content !== null) {
      return this._content;
    }
    this._content = this.pod.readFile(this.path);
    return this._content;
  }

  get body() {
    if (this._body !== null) {
      return this._body;
    }
    if (this.ext === '.yaml') {
      this._body = '';
    } else if (this.ext === '.md') {
      this.initPartsFromFrontMatter(); // Set this._body.
    }
    return this._body;
  }

  private initPartsFromFrontMatter() {
    // If the body value is not null, assume the front matter has been split.
    if (this._body !== null) {
      return;
    }
    const result = utils.splitFrontMatter(this.content || '');
    this._body = result.body;
    if (result.frontMatter === null) {
      this._fields = {};
    } else {
      this._fields = this.pod.readYamlString(result.frontMatter, this.path);
    }
  }
}
