import {Builder} from './builder';
import {Document} from './document';
import {readFileSync} from 'fs';
import {Router} from './router';
import {join} from 'path';

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

  readFile(path: string) {
    return readFileSync(this.getFilePath(path), 'utf8');
  }

  getFilePath(path: string) {
    path = path.replace(/^\/+/, '');
    return join(this.root, path);
  }
}
