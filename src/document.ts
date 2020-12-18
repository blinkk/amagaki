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
  fields?: any | null; // TODO: See if we can limit this.
}

export class Document {
  path: string;
  pod: Pod;
  renderer: Renderer;
  locale: Locale;
  readonly ext: string;
  private parts: DocumentParts;
  private _content: string | null;
  static SupportedExtensions = new Set(['.md', '.yaml']);

  constructor(pod: Pod, path: string, locale: Locale) {
    this.pod = pod;
    this.path = path;
    this.renderer = pod.renderer(DEFAULT_RENDERER);
    this.locale = locale;
    this.ext = fsPath.extname(this.path);

    this.parts = {
      body: null,
      fields: null,
    };
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
    // If the body value is not null, assume the front matter has been split.
    if (this.parts.body !== null) {
      return this.parts;
    }
    const result = utils.splitFrontMatter(this.content);
    return {
      body: result.body || null,
      fields:
        result.frontMatter === null
          ? {}
          : utils.localizeData(
              this.pod.readYamlString(result.frontMatter, this.path),
              this.locale
            ),
    };
  }
}
