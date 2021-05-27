import * as events from 'events';
import * as fs from 'fs';

import {Pod} from './pod';

export interface WatcherFileChangeEvent {
  event: string;
  podPath: string;
}

/**
 * Watcher observes changes to files within the pod and emits file change
 * events. Change events are debounced within a small window to avoid sending
 * multiple overlapping events, because some editors may use a swap file, which
 * sends several events in succession. The watcher is primarily used in
 * conjunction with the server, during development, so the server can do things
 * like reload itself or reset its caches.
 */
export class Watcher extends events.EventEmitter {
  private pod: Pod;
  static Events = {
    FILE_CHANGE: 'fileChange',
  };
  static DebounceWindow = 300;
  watching: boolean;

  constructor(pod: Pod) {
    super();
    this.pod = pod;
    this.watching = false;
  }

  start() {
    this.watching = true;
    let timer = 0;
    fs.watch(this.pod.root, {recursive: true}, (event, filename) => {
      // `filename` is either a numeric file descriptor or filename. Short
      // circuit if this is a file descriptor.
      const podPath = `/${filename}`;
      if (!this.pod.fileExists(podPath)) {
        return;
      }
      // `fs.watch` may trigger many times within a small window.
      // Only run once within a 300ms window.
      if (Date.now() - timer < Watcher.DebounceWindow) {
        return;
      }
      this.emit(Watcher.Events.FILE_CHANGE, {
        event: event,
        podPath: podPath,
      });
      timer = Date.now();
    });
  }
}
