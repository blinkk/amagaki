import {Pod} from './pod';
import * as fs from 'fs';
import * as fsPath from 'path';
import {Locale} from './locale';

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
    return `[Collection: ${this.path}]`;
  }

  static find(pod: Pod, path: string): Collection | null {
    const collection = new Collection(pod, path);
    if (collection.exists) {
      return collection;
    }
    // Reached the pod root, no collection found.
    if (collection.path === '') {
      return null;
    }
    return Collection.find(pod, collection.parentPath);
  }

  get exists() {
    return this.pod.fileExists(this.collectionPath);
  }

  get parentPath() {
    const absPath = this.pod.getAbsoluteFilePath(fsPath.join(this.path, '..'));
    return fs.realpathSync(absPath).replace(this.pod.root, '');
  }

  get parent() {
    return this.pod.collection(this.parentPath);
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

  get locales(): Set<Locale> {
    if (
      this.fields &&
      this.fields['$localization'] &&
      this.fields['$localization']['locales']
    ) {
      return new Set(
        this.fields['$localization']['locales'].map((locale: string) => {
          return this.pod.locale(locale);
        })
      );
    }
    return this.pod.locales;
  }
}
