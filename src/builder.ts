import {asyncify, mapLimit} from 'async';
import {Pod} from './pod';
import {Route} from './router';

export class Builder {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
  }

  async build() {
    const pathsToContents: Record<string, string> = {};
    await mapLimit(
      this.pod.router.routes,
      10,
      asyncify(async (route: Route) => {
        const contents = await route.build();
        pathsToContents[route.url.path] = contents;
      })
    );
    return pathsToContents;
  }

  render() {}
}
