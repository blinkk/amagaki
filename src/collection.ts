import {Pod} from './pod';
import * as fs from 'fs';
import * as fsPath from 'path';

export class Collection {
  path: string;
  pod: Pod;
  collectionPath: string;
  private _fields: any;

  constructor(pod: Pod, path: string) {
    this.pod = pod;
    this.path = path;
    this.collectionPath = fsPath.join(this.path, '_collection.yaml');
    this._fields = null;
  }

  toString() {
    return `{Collection: "${this.path}"}`;
  }

  get exists() {
    return this.pod.fileExists(this.collectionPath);
  }

  get parent() {
    const absPath = fsPath.join(this.collectionPath, '..');
    const path = fs.realpathSync(absPath);
    return this.pod.collection(path);
  }

  get fields() {
    if (this._fields) {
      return this._fields;
    }
    // TODO: Verify this is what we want to do if the collection doesn't exist,
    // or if it's just masking an error.
    if (!this.exists) {
      return {};
    }
    this._fields = this.pod.readYaml(this.collectionPath);
    return this._fields;
  }
}
