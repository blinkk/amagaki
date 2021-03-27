import * as events from 'events';
import * as fs from 'fs';

import {Pod} from './pod';

export class Watcher extends events.EventEmitter {
  pod: Pod;

  constructor(pod: Pod) {
    super();
    this.pod = pod;
  }

  private warmup(showLog: Boolean) {
    // Catch errors so they can be fixed without restarting the server. Errors
    // are displayed interactively when rendering pages so they can be fixed
    // without restarting the server.
    try {
      const seconds = this.pod.router.warmup();
      if (this.pod.router.routes.length > 5000) {
        console.log(
          'Warmed up: '.blue +
            `${this.pod.router.routes.length} routes in ${seconds.toFixed(2)}s`
        );
      }
    } catch (err) {
      if (showLog) {
        console.error(err);
      }
    }
  }

  start() {
    // TODO: Clear based on dependency graph and file type.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fs.watch(this.pod.root, {recursive: true}, (event, filename) => {
      // const podPath = `/${filename}`;
      this.pod.cache.reset();
      this.warmup(false);
    });
    this.warmup(true);
  }
}
