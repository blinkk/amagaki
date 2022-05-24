import {Pod, TemplateEngineRenderResult} from '../../src';
import { PluginComponent } from '../../src';

export class ExamplePlugin implements PluginComponent {
  pod: Pod;
  config: Record<string, any>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
  }

  async afterRenderHook(result: TemplateEngineRenderResult) {
    if (result.context.route?.urlPath?.endsWith('/')) {
      result.content = `${result.content}\r<!-- EXAMPLE PLUGIN - afterRenderHook -->\r`;
    }
  };

  createTemplateEngineHook(templateEngine: any) {
    if (templateEngine.constructor.name === 'NunjucksTemplateEngine') {
      templateEngine.env.addFilter('testPluginFilter', (value: string) => {
        return `${value}--TESTING`;
      });
    }
  }
}
