import * as fs from 'fs';
import * as fsPath from 'path';

import {Document, DocumentListOptions} from './document';
import {Locale, LocaleSet} from './locale';

import {Pod} from './pod';
import glob from 'glob';

export interface CollectionDocsOptions extends DocumentListOptions {
  excludeSubcollections?: boolean;
}

export interface CollectionListOptions {
  /**
   * Field name to sort the result by.
   */
  sort?: string;
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
  podPath: string;
  pod: Pod;
  collectionPath: string;
  private _fields: any;

  static ConfigFile = '_collection.yaml';

  constructor(pod: Pod, podPath: string) {
    this.pod = pod;
    // Remove trailing slashes from collection paths.
    this.podPath = Collection.normalizePath(podPath);
    this.collectionPath = fsPath.join(this.podPath, Collection.ConfigFile);

    this._fields = null;
  }

  toString() {
    return `[Collection: ${this.podPath}]`;
  }

  /**
   * Lists collections using glob patterns, as outlined by the [`glob`
   * module](https://github.com/isaacs/node-glob#glob-primer).
   *
   * Various techniques can be used to list collections depending on your needs:
   *
   * ```
   * // All top-level collections:
   * Collection.list(pod, '/content/**')
   *
   * // All top-level collections, sorted by the field "order":
   * Collection.list(pod, '/content/**', {sort: 'order'})
   *
   * // Both the "pages" and "posts" collections:
   * Collection.list(pod, ['/content/posts/*', '/content/pages/*'])
   *
   * @param patterns A list of glob patterns or a single glob pattern. If
   * nothing is supplied, all docs within the pod will be returned.
   */
  static list(
    pod: Pod,
    patterns?: string[] | string,
    options?: CollectionListOptions
  ) {
    const paths: Set<string> = new Set();
    if (typeof patterns === 'string') {
      patterns = [patterns];
    }
    patterns = patterns || [
      `${Pod.DefaultContentPodPath}**/${Collection.ConfigFile}`,
    ];
    patterns.forEach(pattern => {
      glob
        .sync(pattern, {
          cwd: pod.root,
          root: pod.root,
          matchBase: false,
          nodir: true,
        })
        .forEach(path => {
          paths.add(path);
        });
    });

    // Normalize paths returned by glob. Depending on the glob pattern, the
    // resulting paths may or may not include the pod root.
    const cleanPaths = Array.from(paths)
      .filter(path => {
        // Only include `_collection.yaml` results.
        return path.endsWith(Collection.ConfigFile);
      })
      .map(path => {
        if (!path.startsWith(pod.root)) {
          path = fsPath.join(pod.root, path);
        }
        return path.replace(pod.root, '');
      });

    // Convert paths to Collection objects.
    const collections = cleanPaths
      .map(path => pod.collection(path))
      .filter(collection => {
        return collection !== null;
      }) as Collection[];

    // Handle sort options.
    if (options?.sort) {
      const sort = options.sort as string;
      collections.sort((a, b) => {
        return a.fields?.[sort] - b.fields?.[sort];
      });
    }
    return collections;
  }

  /**
   * Returns a list of subcollections within this collection (recursively).
   */
  get subcollections(): Array<Collection> {
    const pattern = fsPath.join(this.podPath, '**', Collection.ConfigFile);
    return glob
      .sync(pattern, {
        cwd: this.pod.root,
        root: this.pod.root,
        nodir: true,
      })
      .map(path => {
        // Convert absolute paths to pod paths.
        return fsPath.dirname(path).replace(this.pod.root, '');
      })
      .filter(podPath => {
        // Avoid including the current collection in its subcollections.
        return podPath !== this.podPath;
      })
      .map(podPath => {
        return new Collection(this.pod, podPath);
      });
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
        (options.exclude as Array<string>).push(`${subcollection.podPath}/**`);
      }
    }

    return this.pod.docs([`${this.podPath}/**`], options);
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
    if (collection.podPath === '') {
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
    return fsPath.basename(this.podPath);
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
    const absPath = this.pod.getAbsoluteFilePath(
      fsPath.join(this.podPath, '..')
    );
    return fs.realpathSync(absPath).replace(this.pod.root, '');
  }

  /** Returns the parent collection object. */
  get parent() {
    return this.pod.collection(this.parentPath);
  }

  /**
   * Returns the `index` document from the collection. The `index` document is
   * the document whose basename is `index`. If two documents with different
   * extensions are located, the first one found is returned.
   */
  get index() {
    const ext = Array.from(Document.SupportedExtensions).find(ext => {
      return this.pod.fileExists(`${this.podPath}/index${ext}`);
    });
    return ext ? this.pod.doc(`${this.podPath}/index${ext}`) : undefined;
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
