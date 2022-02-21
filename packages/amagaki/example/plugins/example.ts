import {Pod} from '../../src';
import { PluginComponent } from '../../src';

export class ExamplePlugin implements PluginComponent {
  pod: Pod;
  config: Record<string, any>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
  }

  createTemplateEngineHook(templateEngine: any) {
    if (templateEngine.constructor.name === 'NunjucksTemplateEngine') {
      templateEngine.env.addFilter('testPluginFilter', (value: string) => {
        return `${value}--TESTING`;
      });
    }
  }
}
