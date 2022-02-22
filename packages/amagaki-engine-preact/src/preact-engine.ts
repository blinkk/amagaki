import {h} from 'preact';
import {PluginComponent, Pod, TemplateEngineComponent} from '@amagaki/amagaki';

import {register as esbuildRegister} from 'esbuild-register/dist/node';
import render from 'preact-render-to-string';

export class PreactEnginePlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.pod.engines.associate('.tsx', PreactEngine);
  }

  static register(pod: Pod, config?: any) {
    esbuildRegister();
    pod.plugins.register(PreactEnginePlugin, config ?? {});
  }

  createTemplateEngineHook(templateEngine: TemplateEngineComponent, extension: string) {  }
}

class PreactEngine implements TemplateEngineComponent {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
  }

  async render(path: string, context: any): Promise<string> {
    const modulePath = this.pod.getAbsoluteFilePath(path);
    // Facilitate autoreload on dev.
    if (this.pod.env.dev) {
      delete require.cache[require.resolve(modulePath)];
    }
    const createElement = require(modulePath);
    let vDom;
    if (typeof createElement?.default === 'function') {
      vDom = h(createElement.default, context);
    } else {
      vDom = h(createElement, context);
    }
    return render(vDom);
  }

  async renderFromString(template: string, context: any): Promise<string> {
    throw new Error('renderToString is not implemented.');
  }
}
