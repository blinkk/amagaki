import {Router} from './router';
import {Builder} from './builder';
import {Document} from './document';

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

  query() {}
}
