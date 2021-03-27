import * as fs from 'fs';
import * as fsPath from 'path';
import {Locale, LocaleSet} from './locale';
import {Pod} from './pod';

/**
 * Collections represent groups of documents. Collections allow documents to
 * share things, such as locales, URL path formats, views, etc. A collection
 * exists as long as a `_collection.yaml` file exists within the pod's content
 * directory. If a directory exists without a `_collection.yaml`, it will look
 * up until a `_collection.yaml` is found. Arbitrary data can also be specified
 * on the collection's `_collection.yaml` fields, and then accessed from
 * documents within that collection.
 */
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

  /**
   * Finds a collection object by testing whether the given directory has a
   * `_collection.yaml` file within it, and if not, it will walk upwards until
   * one is found. If the root of the pod is reached, no collection requested
   * was located, and `null` will be returned.
   * @param pod A reference to the pod object.
   * @param path The starting podPath to find.
   */
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

  /**
   * Returns whether a collection exists. A collection exists if it has a
   * `_collection.yaml` file in it.
   */
  get exists() {
    return this.pod.fileExists(this.collectionPath);
  }

  /** Returns the absolute parent directory path of the collection. */
  get parentPath() {
    const absPath = this.pod.getAbsoluteFilePath(fsPath.join(this.path, '..'));
    return fs.realpathSync(absPath).replace(this.pod.root, '');
  }

  /** Returns the parent collection object. */
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
      return LocaleSet.fromIds(
        this.fields['$localization']['locales'],
        this.pod
      );
    }
    return this.pod.locales;
  }
}
