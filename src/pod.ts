import {Builder} from './builder';
import {Document} from './document';
import {readFileSync} from 'fs';
import {Router} from './router';
import {join} from 'path';
import {Renderer} from './renderer';

export class Pod {
  builder: Builder;
  root: string;
  router: Router;

  constructor(root: string) {
    this.root = root;
    this.builder = new Builder(this);
    this.router = new Router(this);
  }

  doc(path: string) {
    return new Document(this, path);
  }

  renderer(extension: string) {
    return new Renderer(this);
  }

  readFile(path: string) {
    return readFileSync(this.getFilePath(path), 'utf8');
  }

  getFilePath(path: string) {
    path = path.replace(/^\/+/, '');
    return join(this.root, path);
  }
}
