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

  createServerHook(app: express.Application) {
    this.callbacks.forEach(callback => {
      callback(app);
    });
  }
}
