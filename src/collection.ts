import * as fs from 'fs';
import * as fsPath from 'path';

import {Document, DocumentListOptions} from './document';
import {Locale, LocaleSet} from './locale';

import {Pod} from './pod';
import glob from 'glob';

export interface CollectionDocsOptions extends DocumentListOptions {
  excludeSubcollections: boolean;
}

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

  static ConfigFile = '_collection.yaml';

  constructor(pod: Pod, path: string) {
    this.pod = pod;
    // Remove trailing slashes from collection paths.
    this.path = Collection.normalizePath(path);
    this.collectionPath = fsPath.join(this.path, Collection.ConfigFile);

    this._fields = null;
  }

  toString() {
    return `[Collection: ${this.path}]`;
  }

  get subcollections(): Array<Collection> {
    const collections = [];

    // Find all of the sub collections.
    const subcollectionPaths = glob.sync(`**/${Collection.ConfigFile}`, {
      cwd: this.pod.root,
      root: this.pod.root,
      // Ignore the current collection.
      // Need to strip of first / for glob matching.
      ignore: this.collectionPath.replace(/^[/]+/, ''),
      nodir: true,
    });

    for (const collectionPath of subcollectionPaths) {
      collections.push(
        new Collection(this.pod, fsPath.dirname(collectionPath))
      );
    }

    return collections;
  }

  /**
   * Returns a list of documents in this collection (recursively).
   *
   * @param options Options for which docs are returned.
   */
  docs(options?: CollectionDocsOptions): Array<Document> {
    if (options?.excludeSubcollections) {
      options.exclude = options.exclude || [];

      for (const subcollection of this.subcollections) {
        (options.exclude as Array<string>).push(`${subcollection.path}/**`);
      }
    }
    return this.pod.docs([`${this.path}/**`], options);
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
   * Returns the collection's basename.
   *
   * A collection's basename is its folder's name, without the full path.
   *
   * The `basename` for `/content/pages` is `pages`.
   * The `basename` for `/content/pages/foo` is `foo`.
   */
  get basename() {
    return fsPath.basename(this.path);
  }

  /**
   * Returns whether a collection exists. A collection exists if it has a
   * `_collection.yaml` file in it.
   */
  get exists() {
    return this.pod.fileExists(this.collectionPath);
  }

  /**
   * Normalize path to collection.
   *
   * `content/pages/` becomes `/content/pages`
   */
  static normalizePath(path: string): string {
    // Begins with /.
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }

    // Ends with no /.
    return path.replace(/[/]+$/, '');
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

  /**
   * Returns a list of the parent collections.
   *
   * This may be useful for situations where you need to walk through content
   * relationships. Examples include generating site navigation menus,
   * breadcrumbs, or various listings of collections and their documents.
   */
  get parents() {
    const parents = [];
    let parent = this.parent;
    while (parent) {
      if (parent.exists) {
        parents.push(parent);
      }
      parent = parent.parent;
    }
    return parents;
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
    if (this.fields?.['$localization']?.['locales']) {
      return LocaleSet.fromIds(
        this.fields['$localization']['locales'],
        this.pod
      );
    }
    return this.pod.locales;
  }
}
