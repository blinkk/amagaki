import {Pod} from './pod';
import * as nunjucks from 'nunjucks';

export class Renderer {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
    nunjucks.configure(this.pod.root, {autoescape: true});
  }

  render(template: string, context: any) {
    return nunjucks.renderString(template, context);
  }
}
