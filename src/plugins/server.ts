import express = require('express');

import {PluginComponent} from '../plugins';
import {Pod} from '../pod';

export type createServerCallbacks = (app: express.Express) => Promise<void>;

/**
 * Plugin providing access to the Express server.
 */
export class ServerPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;
  private callbacks: Array<createServerCallbacks>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.callbacks = [];
  }

  register(func: createServerCallbacks) {
    this.callbacks.push(func);
  }

  async createServerHook(app: express.Express) {
    for (const callback of this.callbacks) {
      await callback(app);
    }
  }
}
