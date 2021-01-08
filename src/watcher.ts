import * as events from 'events';
import * as fs from 'fs';
import Pod from './pod';

export default class Watcher extends events.EventEmitter {
  pod: Pod;

  constructor(pod: Pod) {
    super();
    this.pod = pod;
  }

  start() {
    fs.watch(this.pod.root, {recursive: true}, (event, filename) => {
      const podPath = `/${filename}`;
      this.pod.cache.reset(podPath);
      this.pod.router.warmup();
    });
    const seconds = this.pod.router.warmup();
    if (this.pod.router.routes.length > 5000) {
      console.log(
        'Warmed up: '.blue +
          `${this.pod.router.routes.length} routes in ${seconds.toFixed(2)}s`
      );
    }
  }
}
