import * as events from 'events';
import * as fs from 'fs';

import {Pod} from './pod';
import {Server} from './server';

const AUTORELOAD_PATHS = ['^/amagaki.(j|t)s', '^/plugins'];

export class Watcher extends events.EventEmitter {
  private pod: Pod;
  private server: Server;

  constructor(pod: Pod, server: Server) {
    super();
    this.pod = pod;
    this.server = server;
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
    const reloadRegex = new RegExp(AUTORELOAD_PATHS.join('|'));
    let timer = 0;
    fs.watch(this.pod.root, {recursive: true}, (_event, filename) => {
      // `filename` is either a numeric file descriptor or filename. Short
      // circuit if this is a file descriptor.
      const podPath = `/${filename}`;
      if (!this.pod.fileExists(podPath)) {
        return;
      }
      // `fs.watch` may trigger many times within a small window.
      // Only run once within a 300ms window.
      if (Date.now() - timer < 300) {
        return;
      }
      if (podPath.match(reloadRegex)) {
        this.server.reloadPod();
      } else {
        // TODO: Clear based on dependency graph and file type.
        this.pod.cache.reset();
      }
      this.warmup(false);
      timer = Date.now();
    });
    this.warmup(true);
  }
}
