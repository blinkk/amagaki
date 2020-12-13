import * as fsPath from 'path';
import {Pod} from './pod';
import {Renderer} from './renderer';
import {Url} from './url';

const DEFAULT_RENDERER = 'njk';
const DEFAULT_VIEW = '/views/base.njk';

export class Document {
  path: string;
  pod: Pod;
  renderer: Renderer;
  private _fields: any;

  constructor(pod: Pod, path: string) {
    this.pod = pod;
    this.path = path;
    this.renderer = pod.renderer(DEFAULT_RENDERER);
    this._fields = null;
  }

  toString() {
    return `{Document: "${this.path}"}`;
  }

  get collection() {
    return this.pod.collection(fsPath.dirname(this.path));
  }

  get fields() {
    if (this._fields) {
      return this._fields;
    }
    this._fields = this.pod.readYaml(this.path);
    return this._fields;
  }

  async render(): Promise<string> {
    const context = {
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
    if (!this.fields) {
      return null;
    }
    return (
      this.fields['$path'] ||
      (this.collection && this.collection.fields['$path'])
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
}
