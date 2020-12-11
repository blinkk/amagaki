import {Builder} from './builder';
import {Document} from './document';
import {readFileSync} from 'fs';
import {Router} from './router';
import {join} from 'path';
import {getRenderer} from './renderer';
import {Environment} from './environment';
import {Collection} from './collection';
import {safeLoad} from 'js-yaml';

export class Pod {
  builder: Builder;
  root: string;
  router: Router;
  env: Environment;

  constructor(root: string) {
    this.root = root;
    this.builder = new Builder(this);
    this.router = new Router(this);
    this.env = new Environment({
      host: 'localhost',
      name: 'default',
      scheme: 'http',
      dev: true,
    });
  }

  doc(path: string) {
    return new Document(this, path);
  }

  collection(path: string) {
    return new Collection(this, path);
  }

  renderer(path: string) {
    const rendererClass = getRenderer(path);
    return new rendererClass(this);
  }

  readFile(path: string) {
    return readFileSync(this.getFilePath(path), 'utf8');
  }

  readYaml(path: string) {
    return safeLoad(this.readFile(path));
  }

  getFilePath(path: string) {
    path = path.replace(/^\/+/, '');
    return join(this.root, path);
  }
}
