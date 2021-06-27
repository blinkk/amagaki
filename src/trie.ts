import {RouteProvider} from './providers/provider';

/**
 * A trie data structure that stores routes. The trie supports `:param` and
 * `*wildcard` values.
 */
export class RouteTrie {
  private children: Record<string, RouteTrie> = {};
  private paramChild?: ParamChild;
  private wildcardChild?: WildcardChild;
  private provider?: RouteProvider;

  /**
   * Adds a route to the trie.
   */
  add(path: string, provider: RouteProvider) {
    path = this.normalizePath(path);

    // If the end was reached, save the value to the node.
    if (path === '') {
      this.provider = provider;
      return;
    }

    const [head, tail] = this.splitPath(path);
    if (head[0] === '*') {
      const paramName = head.slice(1);
      this.wildcardChild = new WildcardChild(paramName, provider);
      return;
    }

    let nextNode: RouteTrie;
    if (head[0] === ':') {
      if (!this.paramChild) {
        const paramName = head.slice(1);
        this.paramChild = new ParamChild(paramName);
      }
      nextNode = this.paramChild.trie;
    } else {
      nextNode = this.children[head];
      if (!nextNode) {
        nextNode = new RouteTrie();
        this.children[head] = nextNode;
      }
    }
    nextNode.add(tail, provider);
  }

  /**
   * Returns a route mapped to the given path and any parameter values from the
   * URL.
   */
  get(path: string): [RouteProvider | undefined, Record<string, string>] {
    const params = {};
    const route = this.getRoute(path, params);
    return [route, params];
  }

  /**
   * Walks the route trie and calls a callback function for each route.
   */
  walk(cb: (path: string, provider: RouteProvider) => void) {
    if (this.provider) {
      cb('/', this.provider);
    }
    if (this.paramChild) {
      const param = ':' + this.paramChild.name;
      this.paramChild.trie.walk(
        (childPath: string, provider: RouteProvider) => {
          const path = `/${param}${childPath}`;
          cb(path, provider);
        }
      );
    }
    if (this.wildcardChild) {
      const path = `/*${this.wildcardChild.name}`;
      cb(path, this.wildcardChild.provider);
    }
    for (const subpath of Object.keys(this.children)) {
      const childTrie = this.children[subpath];
      childTrie.walk((childPath: string, childRoute: RouteProvider) => {
        cb(`/${subpath}${childPath}`, childRoute);
      });
    }
  }

  private getRoute(
    path: string,
    params: Record<string, string>
  ): RouteProvider | undefined {
    path = this.normalizePath(path);
    if (path === '') {
      return this.provider;
    }

    const [head, tail] = this.splitPath(path);

    const child = this.children[head];
    if (child) {
      const route = child.getRoute(tail, params);
      if (route) {
        return route;
      }
    }

    if (this.paramChild) {
      const route = this.paramChild.trie.getRoute(tail, params);
      if (route) {
        params[this.paramChild.name] = head;
        return route;
      }
    }

    if (this.wildcardChild) {
      params[this.wildcardChild.name] = path;
      return this.wildcardChild.provider;
    }

    return undefined;
  }

  /**
   * Normalizes a path for inclusion into the route trie.
   */
  private normalizePath(path: string) {
    // Remove leading slashes.
    return path.replace(/^\/+/g, '');
  }

  /**
   * Splits the parent directory from its children, e.g.:
   *
   *     splitPath("foo/bar/baz") -> ["foo", "bar/baz"]
   */
  private splitPath(path: string): [string, string] {
    const i = path.indexOf('/');
    if (i === -1) {
      return [path, ''];
    }
    return [path.slice(0, i), path.slice(i + 1)];
  }
}

/**
 * A node in the RouteTrie for a :param child.
 */
class ParamChild {
  readonly name: string;
  readonly trie: RouteTrie = new RouteTrie();

  constructor(name: string) {
    this.name = name;
  }
}

/**
 * A node in the RouteTrie for a *wildcard child.
 */
class WildcardChild {
  readonly name: string;
  readonly provider: RouteProvider;

  constructor(name: string, provider: RouteProvider) {
    this.name = name;
    this.provider = provider;
  }
}
