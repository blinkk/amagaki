import {Pod} from './pod';
import {safeLoad} from 'js-yaml';
import {Renderer} from './renderer';

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

  get fields() {
    const fieldsContent = this.pod.readFile(this.path);
    const fields = safeLoad(fieldsContent);
    if (!this._fields) {
      this._fields = fields;
    }
    return this._fields;
  }

  async render() {
    const context = {
      pod: this.pod,
      doc: this,
    };
    const template = this.pod.readFile(this.viewPath);
    return this.renderer.render(template, context);
  }
}
