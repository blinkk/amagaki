import express = require('express');

import {PluginComponent} from '../plugins';
import {Pod} from '../pod';

/**
 * Plugin providing access to the Express server.
 */
export class ServerPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;
  private callbacks: Array<Function>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.callbacks = [];
  }

  register(func: Function) {
    this.callbacks.push(func);
  }

  async createServerHook(app: express.Application) {
    for (const callback of this.callbacks) {
      await callback(app);
    }
  }
}
