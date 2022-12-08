import {html, renderToString} from '@popeindustries/lit-html-server/lit-html-server.js';
import {PluginComponent, Pod, TemplateEngineComponent} from '@amagaki/amagaki';

export class LitEnginePlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;

    this.pod.engines.associate('.tsx', LitEngine);
  }

  static register(pod: Pod, config?: any) {
    pod.plugins.register(LitEnginePlugin, config ?? {});
  }

  createTemplateEngineHook(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    templateEngine: TemplateEngineComponent,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extension: string
  ) {}
}

class LitEngine implements TemplateEngineComponent {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
  }

  async render(path: string, context: any): Promise<string> {
    console.log(path);
    return renderToString(html`Test render!`, context);
  }

  async renderFromString(template: string, context: any): Promise<string> {
    throw new Error('renderToString is not implemented.');
  }
}
