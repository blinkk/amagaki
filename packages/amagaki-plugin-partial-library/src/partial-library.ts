import * as fsPath from 'path';

import {
  Artifact,
  Builder,
  CreatedPath,
  PluginComponent,
  Pod,
  TemplateEngineRenderResult,
} from '@amagaki/amagaki';
import {
  libraryIndexTemplate,
  libraryPartialTemplate,
} from './partial-library-templates';

export interface PartialLibraryPluginOptions {
  /**
   * Options for how the plugin acts during the build process.
   */
  build?: {
    /**
     * Loading bar label for build process.
     *
     * @default 'Partials Library'
     */
    loadingLabel?: string;
  };

  /**
   * Options for how the document is parsed for gathering partials.
   */
  document?: {
    /**
     * Document field key to use for finding the partials.
     *
     * @default 'partials'
     */
    key?: string;
  };

  /**
   * Options for how the partials are parsed.
   */
  partial?: {
    /**
     * Partial key to use for identifying the partial in use.
     *
     * @default 'partial'
     */
    key?: string;
    /**
     * Ignored partial keys.
     *
     * These partials will not be tracked at all in the library.
     */
    ignored?: string[];
    /**
     * Tracking only partial keys.
     *
     * These partials will not have the full data tracked, just the usage.
     */
    tracked?: string[];
  };

  /**
   * Options for how the plugin renders the library.
   */
  rendering?: {
    /**
     * View to use for rendering the library.
     *
     * Used to determine the template engine to use.
     *
     * If no view is provided, renders the library using nunjucks without
     * styling or other project specific styling.
     */
    view?: string;
  };

  /**
   * Options for how the partials are served during build.
   */
  serving?: {
    /**
     * Path prefix to build the library at.
     *
     * @default '/library/'
     */
    pathPrefix?: string;
    /**
     * Template to use when building the library.
     *
     * @default '/views/base.njk'
     */
    template?: string;
  };
}

/**
 * Context used for rendering the partial library.
 */
export interface PartialLibraryContext {
  pod: Pod;
  partials: Record<string, PartialLibraryPartial>;
  partial?: PartialLibraryPartial;
  pathPrefix: string;
}

/**
 * Track instances information for a partial.
 */
export class PartialLibraryInstance {
  constructor(
    public readonly config?: Record<string, any>,
    public readonly fileName?: string
  ) {}
}

/**
 * Track all information about the partial and how it is used in the pod.
 */
export class PartialLibraryPartial {
  instances: PartialLibraryInstance[] = [];

  constructor(public readonly key: string) {}

  addInstance(config?: Record<string, any>, fileName?: string) {
    this.instances.push(new PartialLibraryInstance(config, fileName));
  }

  get length() {
    return this.instances.length;
  }
}

/**
 * Plugin for tracking and reporting on partials.
 */
export class PartialLibraryPlugin implements PluginComponent {
  /**
   * Helper method for registering the plugin.
   *
   * @param pod Pod instance
   * @param options Options for the partial library
   * @returns Options for the partial library
   */
  static register(
    pod: Pod,
    options?: PartialLibraryPluginOptions
  ): PartialLibraryPluginOptions | undefined {
    pod.plugins.register(PartialLibraryPlugin, options);

    return options;
  }
  partials: Record<string, PartialLibraryPartial> = {};

  constructor(public pod: Pod, public config: PartialLibraryPluginOptions) {}

  addPartialInstance(
    key: string,
    partialConfig: Record<string, any>,
    fileName?: string
  ) {
    if (!(key in this.partials)) {
      this.partials[key] = new PartialLibraryPartial(key);
    }

    // Ignore the ignored partials.
    if (this.config.partial?.ignored?.includes(key)) {
      return;
    }

    // Track only (no config) for the tracked partials.
    if (this.config.partial?.tracked?.includes(key)) {
      this.partials[key].addInstance(undefined, fileName);
      return;
    }

    this.partials[key].addInstance(partialConfig, fileName);
  }

  /**
   * Hook for finding all of the partial usage when rendering.
   */
  async afterRenderHook(result: TemplateEngineRenderResult): Promise<void> {
    const docPartials =
      result.context.doc?.fields[this.config.document?.key ?? 'partials'] ?? [];

    for (const partialConfig of docPartials) {
      const partialKey = this.config.partial?.key ?? 'partial';
      const partial = partialConfig[partialKey];
      this.addPartialInstance(partial, partialConfig, result.path);
    }
  }

  /**
   * Hook for generating the library files before the manifest is generated.
   *
   * This allows for all of the document partials to be parsed and tracked
   * before generating the library output and still be included in the
   * build manifest for deployment.
   *
   * @param builder Builder instance
   */
  async beforeBuildManifestHook(
    builder: Builder,
    createdPaths: Array<CreatedPath>,
    artifacts: Array<Artifact>
  ): Promise<void> {
    const partialKeys = Object.keys(this.partials).sort();
    const bar = Builder.createProgressBar(
      this.config?.build?.loadingLabel ?? 'Partial library'
    );
    const startTime = new Date().getTime();

    // Pages for all partials plus main library index.
    bar.start(partialKeys.length + 1, 0, {
      customDuration: Builder.formatProgressBarTime(0),
    });

    const pathPrefix = this.config.serving?.pathPrefix ?? '/library/';

    // Add the main library page.
    const normalPath = Builder.normalizePath(pathPrefix);
    const tempPath = fsPath.join(
      builder.tempDirRoot,
      builder.outputDirectoryPodPath,
      normalPath
    );
    const realPath = this.pod.getAbsoluteFilePath(
      fsPath.join(builder.outputDirectoryPodPath, normalPath)
    );

    const createdPath = {
      tempPath,
      normalPath,
      realPath,
    };

    // TODO: Use a nunjucks template.
    const timer = this.pod.profiler.timer(
      'library.render',
      'Partial Library render'
    );

    try {
      const context = {
        pod: this.pod,
        partials: this.partials,
        pathPrefix,
      };
      if (this.config.rendering?.view) {
        const templateEngine = this.pod.engines.getEngineByFilename(
          this.config.rendering.view
        );
        const content = await templateEngine.render(
          this.config.rendering.view,
          context
        );
        await builder.writeFileAsync(createdPath.tempPath, content);
      } else {
        const templateEngine =
          this.pod.engines.getEngineByFilename('library.njk');
        const content = await templateEngine.renderFromString(
          libraryIndexTemplate,
          context
        );
        await builder.writeFileAsync(createdPath.tempPath, content);
      }
    } finally {
      timer.stop();
    }

    createdPaths.push(createdPath);
    artifacts.push({
      tempPath: createdPath.tempPath,
      realPath: createdPath.realPath,
    });

    bar.increment({
      customDuration: Builder.formatProgressBarTime(
        new Date().getTime() - startTime
      ),
    });

    // Add each partial library page.
    for (const partialKey of partialKeys) {
      const partial = this.partials[partialKey];

      const partialPath = `${pathPrefix}${partialKey}/`;
      const normalPath = Builder.normalizePath(partialPath);
      const tempPath = fsPath.join(
        builder.tempDirRoot,
        builder.outputDirectoryPodPath,
        normalPath
      );
      const realPath = this.pod.getAbsoluteFilePath(
        fsPath.join(builder.outputDirectoryPodPath, normalPath)
      );
      const createdPath = {
        tempPath: tempPath,
        normalPath: normalPath,
        realPath: realPath,
      };

      // TODO: Use a nunjucks template.
      const timer = this.pod.profiler.timer(
        'library.render',
        'Partial Library render'
      );

      try {
        const context = {
          pod: this.pod,
          partial: partial,
          partials: this.partials,
          pathPrefix,
        };
        if (this.config.rendering?.view) {
          const templateEngine = this.pod.engines.getEngineByFilename(
            this.config.rendering.view
          );
          const content = await templateEngine.render(
            this.config.rendering.view,
            context
          );
          await builder.writeFileAsync(createdPath.tempPath, content);
        } else {
          const templateEngine =
            this.pod.engines.getEngineByFilename('library.njk');
          const content = await templateEngine.renderFromString(
            libraryPartialTemplate,
            context
          );
          await builder.writeFileAsync(createdPath.tempPath, content);
        }
      } finally {
        timer.stop();
      }

      createdPaths.push(createdPath);
      artifacts.push({
        tempPath: createdPath.tempPath,
        realPath: createdPath.realPath,
      });

      bar.increment({
        customDuration: Builder.formatProgressBarTime(
          new Date().getTime() - startTime
        ),
      });
    }

    bar.stop();
  }
}
