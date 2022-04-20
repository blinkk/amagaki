import { Route } from "./routes";

export type NodeType = 'default' | 'wildcard' | 'param';

export type RouteParams = Record<string, string>;

/**
 * A trie data structure that stores routes. The trie supports `:param` and
 * `*wildcard` values.
 */
 export class RouteTrie {
  private children: Record<string, RouteTrie> = {};
  private paramChild?: ParamChild;
  private wildcardChild?: WildcardChild;
  private route?: Route;

  /**
   * Adds a route to the trie.
   */
  add(path: string, route: Route) {
    path = this.normalizePath(path);

    // If the end was reached, save the value to the node.
    if (path === '') {
      this.route = route;
      return;
    }

    const [head, tail] = this.splitPath(path);
    if (head[0] === '*') {
      const paramName = head.slice(1);
      this.wildcardChild = new WildcardChild(paramName, route);
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
    nextNode.add(tail, route);
  }

  /**
   * Returns a route mapped to the given path and any parameter values from the
   * URL.
   */
  get(path: string): [Route | undefined, RouteParams] {
    const params = {};
    const route = this.getRoute(path, params);
    return [route, params];
  }

  /**
   * Walks the route trie and calls a callback function for each route.
   */
  walk(cb: (path: string, route: Route, type: NodeType) => void) {
    if (this.route) {
      cb('/', this.route, 'default');
    }
    if (this.paramChild) {
      const param = ':' + this.paramChild.name;
      this.paramChild.trie.walk((childPath: string, route: Route) => {
        const path = `/${param}${childPath}`;
        cb(path, route, 'param');
      });
    }
    if (this.wildcardChild) {
      const path = `/*${this.wildcardChild.name}`;
      cb(path, this.wildcardChild.route, 'wildcard');
    }
    for (const subpath of Object.keys(this.children)) {
      const childTrie = this.children[subpath];
      childTrie.walk((childPath: string, childRoute: Route, type: NodeType) => {
        cb(`/${subpath}${childPath}`, childRoute, type);
      });
    }
  }

  private getRoute(
    path: string,
    params: RouteParams
  ): Route | undefined {
    path = this.normalizePath(path);
    if (path === '') {
      return this.route;
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
      return this.wildcardChild.route;
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
  readonly route: Route;

  constructor(name: string, route: Route) {
    this.name = name;
    this.route = route;
  }
}
