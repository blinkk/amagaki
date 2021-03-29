import {Pod} from './pod';

export interface TemplateEngineComponent {
  pod: Pod;
  /**
   * Renders the template string using the template engine and the given context.
   */
  render: (template: string, context: any) => Promise<string>;
  /**
   * Renders the template from a string using the template engine and the given context.
   */
  renderFromString: (template: string, context: any) => Promise<string>;
}

export interface TemplateEngineConstructor {
  new (pod: Pod): TemplateEngineComponent;
}

export class TemplateEngineManager {
  pod: Pod;
  private engines: Record<string, TemplateEngineComponent>;
  private extToClass: Record<string, TemplateEngineConstructor>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.engines = {};
    this.extToClass = {};
  }

  associate(extension: string, TemplateEngineClass: TemplateEngineConstructor) {
    if (!extension || !extension.startsWith('.')) {
      throw new InvalidExtensionError(
        'Template engine extensions needs to start with a period (.).'
      );
    }

    this.extToClass[extension] = TemplateEngineClass;
  }

  getEngineByExtension(extension: string): TemplateEngineComponent {
    if (!(extension in this.extToClass)) {
      throw new MissingTemplateEngineError(
        `Unable to find template engine for the ${extension} extension.`
      );
    }

    // Only need to create one template engine instance per extension.
    // Allows each extension's template engine to be configured separately
    // by using the plugin hook.
    if (!this.engines[extension]) {
      this.engines[extension] = new this.extToClass[extension](this.pod);

      // Trigger the plugin hook for new template engines.
      this.pod.plugins.trigger(
        'createTemplateEngine',
        this.engines[extension],
        extension
      );
    }

    return this.engines[extension];
  }

  getEngineByFilename(fileName: string): TemplateEngineComponent {
    // Go through the extensions starting with the longest extension.
    // This allows for sub extensions to take priority. (Ex: .foo.bar > .bar).
    const knownExtensions = Object.keys(this.extToClass).sort(
      (a, b) => b.length - a.length
    );

    fileName = fileName.trim();

    let knownExtension: string | undefined = undefined;
    for (const ext of knownExtensions) {
      if (fileName.endsWith(ext)) {
        knownExtension = ext;
      }
    }

    if (!knownExtension) {
      throw new MissingTemplateEngineError(
        `Unable to find template engine for the ${fileName} file name.`
      );
    }

    return this.getEngineByExtension(knownExtension);
  }
}

export class InvalidExtensionError extends Error {}
export class MissingTemplateEngineError extends Error {}
