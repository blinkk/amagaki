import {basename} from 'path';
import {Pod} from './pod';
import {Renderer} from './renderer';
import {Url} from './url';

export class Document {
  path: string;
  pod: Pod;
  renderer: Renderer;
  viewPath: string;

  private _fields: any;

  constructor(pod: Pod, path: string) {
    this.pod = pod;
    this.path = path;
    this.renderer = pod.renderer('njk');
    this.viewPath = '/views/base.njk';
  }

  toString() {
    return `{Document: "${this.path}"}`;
  }

  get fields() {
    const fields = this.pod.readYaml(this.path);
    if (!this._fields) {
      this._fields = fields;
    }
    return this._fields;
  }

  async render(): Promise<string> {
    const context = {
      doc: this,
      env: this.pod.env,
      pod: this.pod,
    };
    const template = this.pod.readFile(this.viewPath);
    return this.renderer.render(template, context);
  }

  get url(): Url | undefined {
    return this.pod.router.getUrl('doc', this);
  }

  get basename() {
    return basename(this.path).split('.')[0];
  }

  get pathFormat() {
    // TODO: Parameterize this.
    return '/pages/${doc.basename}/';
  }
}
