import * as utils from '../utils';
import * as yaml from 'js-yaml';

import {Locale, LocaleSet, LocalizableData} from '../locale';

import {Collection} from '../collection';
import {Document} from '../document';
import {Environment} from '../environment';
import {PluginComponent} from '../plugins';
import {Pod} from '../pod';
import {StaticFile} from '../staticFile';
import {TranslationString} from '../string';

interface YamlTypeArguments {
  tag: string;
  options: yaml.TypeConstructorOptions;
}

/**
 * Plugin providing built-in custom YAML types.
 */
export class YamlPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;
  private shortcutTypes: Array<YamlTypeArguments>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.shortcutTypes = [];
  }

  /**
   * Returns whether supplied parts resemble the arguments for `pod.docs` or
   * `pod.collections`. Supplied parts must be in the following format:
   * ```
   * patterns?: string[] | string, options?: DocumentListOptions
   * ```
   */
  private partsLikeGlobOptions(parts: any) {
    return (
      parts.length >= 2 &&
      (typeof parts[0] === 'string' || Array.isArray(parts[0])) &&
      typeof parts[parts.length - 1] === 'object'
    );
  }

  // Shortcut for adding custom YAML types without creating a full plugin.
  addType(tag: string, options: yaml.TypeConstructorOptions) {
    this.shortcutTypes.push({
      tag: tag,
      options: options,
    });
  }

  createYamlTypesHook(yamlTypeManager: YamlTypeManager) {
    /**
     * !pod.collection '/content/pages/_collection.yaml'
     */
    yamlTypeManager.addType('!pod.collection', {
      kind: 'scalar',
      instanceOf: Collection,
      resolve: podPath => {
        return podPath && podPath.startsWith(this.pod.defaultContentPodPath);
      },
      construct: podPath => {
        return this.pod.collection(podPath);
      },
      represent: value => {
        const collection = value as Collection;
        return collection.podPath;
      },
    });

    /**
     * !pod.collections ['/content/pages/_collection.yaml', '/content/posts/_collection.yaml']
     * !pod.collections [['/content/pages/_collection.yaml', '/content/posts/_collection.yaml'], {sort: 'order'}]
     */
    yamlTypeManager.addType('!pod.collections', {
      kind: 'sequence',
      resolve: parts => {
        return (
          // Options version.
          this.partsLikeGlobOptions(parts) ||
          // Simple version.
          parts.every((part: any) => {
            return (
              typeof part === 'string' &&
              part.startsWith(this.pod.defaultContentPodPath)
            );
          })
        );
      },
      construct: parts => {
        const patterns = parts;
        if (this.partsLikeGlobOptions(parts)) {
          // Options version.
          const options = parts.pop();
          return this.pod.collections(
            patterns.length === 1 ? patterns[0] : patterns,
            options
          );
        } else {
          // Simple version.
          return this.pod.collections(patterns);
        }
      },
      represent: value => {
        const doc = value as Document;
        return [doc.podPath, doc.locale];
      },
    });

    /**
     * !pod.doc '/content/pages/index.yaml'
     */
    yamlTypeManager.addType('!pod.doc', {
      kind: 'scalar',
      instanceOf: Document,
      resolve: podPath => {
        return podPath && podPath.startsWith(this.pod.defaultContentPodPath);
      },
      construct: podPath => {
        return this.pod.doc(podPath);
      },
      represent: value => {
        const doc = value as Document;
        return doc.podPath;
      },
    });

    /**
     * !pod.doc ['/content/pages/index.yaml', 'de']
     * !pod.doc ['/content/pages/index.yaml', !pod.locale 'de']
     */
    yamlTypeManager.addType('!pod.doc', {
      kind: 'sequence',
      instanceOf: Document,
      resolve: parts => {
        const podPath = parts[0];
        return podPath && podPath.startsWith(this.pod.defaultContentPodPath);
      },
      construct: parts => {
        const podPath = parts[0];
        const localeIdOrLocale = parts[1];
        const locale =
          typeof localeIdOrLocale === 'string'
            ? this.pod.locale(localeIdOrLocale)
            : localeIdOrLocale;
        return this.pod.doc(podPath, locale);
      },
      represent: value => {
        const doc = value as Document;
        return [doc.podPath, doc.locale];
      },
    });

    /**
     * !pod.docs ['/content/pages/index.yaml', '/content/pages/foo.yaml']
     * !pod.docs ['/content/posts/**', {sort: 'order'}]
     * !pod.docs [['/content/posts/**'], {sort: 'order'}]
     */
    yamlTypeManager.addType('!pod.docs', {
      kind: 'sequence',
      resolve: parts => {
        return (
          // Options version.
          this.partsLikeGlobOptions(parts) ||
          // Simple version.
          parts.every((part: any) => {
            return (
              typeof part === 'string' &&
              part.startsWith(this.pod.defaultContentPodPath)
            );
          })
        );
      },
      construct: parts => {
        const patterns = parts;
        if (this.partsLikeGlobOptions(parts)) {
          // Options version.
          const options = parts.pop();
          return this.pod.docs(
            patterns.length === 1 ? patterns[0] : patterns,
            options
          );
        } else {
          // Simple version.
          return this.pod.docs(patterns);
        }
      },
      represent: value => {
        const docs = value as Document[];
        return docs.map(doc => doc.podPath);
      },
    });

    /**
     * !pod.locale 'de'
     */
    yamlTypeManager.addType('!pod.locale', {
      kind: 'scalar',
      instanceOf: Locale,
      resolve: data => {
        return typeof data === 'string';
      },
      construct: value => {
        return this.pod.locale(value);
      },
      represent: value => {
        const locale = value as Locale;
        return locale.id;
      },
    });

    /**
     * !pod.locales ['de', 'ja']
     */
    yamlTypeManager.addType('!pod.locales', {
      kind: 'sequence',
      resolve: parts => {
        return parts.every((part: any) => typeof part === 'string');
      },
      construct: ids => {
        return LocaleSet.fromIds(ids, this.pod);
      },
      represent: value => {
        const localeSet = value as LocaleSet;
        return [...localeSet].map(locale => locale.id);
      },
    });

    /**
     * !pod.staticFile '/src/images/file.png'
     */
    yamlTypeManager.addType('!pod.staticFile', {
      kind: 'scalar',
      instanceOf: StaticFile,
      resolve: data => {
        return data && data.startsWith('/');
      },
      construct: podPath => {
        return this.pod.staticFile(podPath);
      },
      represent: value => {
        const staticFile = value as StaticFile;
        return staticFile.podPath;
      },
    });

    /**
     * !pod.string 'String Value'
     */
    yamlTypeManager.addType('!pod.string', {
      kind: 'scalar',
      resolve: data => {
        return typeof data === 'string';
      },
      construct: value => {
        return this.pod.string({value: value});
      },
      represent: value => {
        const string = value as TranslationString;
        return string.value;
      },
    });

    /**
     * !pod.string
     *   prefer: Preferred String
     *   value: Original String
     */
    yamlTypeManager.addType('!pod.string', {
      kind: 'mapping',
      instanceOf: TranslationString,
      resolve: data => {
        return typeof data === 'object' && 'value' in data;
      },
      construct: value => {
        return this.pod.string(value);
      },
      represent: value => {
        const string = value as TranslationString;
        if (string.prefer) {
          return {
            prefer: string.prefer,
            value: string.value,
          };
        } else {
          return string.value;
        }
      },
    });

    /**
     * !pod.yaml '/content/partials/foo.yaml'
     * !pod.yaml '/content/partials/foo.yaml?bar'
     */
    yamlTypeManager.addType('!pod.yaml', {
      kind: 'scalar',
      resolve: data => {
        return data !== null && data.startsWith('/');
      },
      construct: value => {
        // value can be: /content/partials/base.yaml
        // value can be: /content/partials/base.yaml?foo
        // value can be: /content/partials/base.yaml?foo.bar.baz
        const timer = this.pod.profiler.timer('yaml.query', 'Yaml query');
        try {
          const parts = value.split('?');
          const podPath = parts[0];
          const result = this.pod.readYaml(podPath);
          if (parts.length > 1) {
            return utils.queryObject(parts[1], result);
          } else {
            return result;
          }
        } finally {
          timer.stop();
        }
      },
      represent: string => {
        return string;
      },
    });

    /**
     * !IfEnvironment
     *   default: foo
     *   prod: bar
     */
    yamlTypeManager.addType('!IfEnvironment', {
      kind: 'mapping',
      resolve: data => {
        return typeof data === 'object';
      },
      construct: value => {
        return value[this.pod.env.name] ?? Environment.DefaultName;
      },
      // TODO: Represent serialized values so they can be round-tripped.
    });

    /**
     * !IfLocale
     *   default: foo
     *   de: German
     *   it: Italian
     */
    yamlTypeManager.addType('!IfLocale', {
      kind: 'mapping',
      instanceOf: LocalizableData,
      resolve: data => {
        return typeof data === 'object';
      },
      construct: value => {
        return new LocalizableData(this.pod, value);
      },
      represent: data => {
        const localizableData = data as LocalizableData;
        return localizableData.data;
      },
    });

    /**
     * !pod.meta
     * !pod.meta 'foo.bar'
     */
    yamlTypeManager.addType('!pod.meta', {
      kind: 'scalar',
      construct: value => {
        return utils.queryObject(value, this.pod.config.meta);
      },
      // TODO: Represent serialized values so they can be round-tripped.
    });

    /**
     * !pod
     */
     yamlTypeManager.addType('!pod', {
      kind: 'scalar',
      instanceOf: Pod,
      construct: value => {
        return this.pod;
      },
      represent: data => {
        // Exclude `Pod` objects from serialization.
        return undefined;
      },
    });

    for (const shortcutType of this.shortcutTypes) {
      yamlTypeManager.addType(shortcutType.tag, shortcutType.options);
    }
  }
}

/**
 * Custom YAML type manager for adding custom YAML types.
 */
export class YamlTypeManager {
  types: Array<yaml.Type>;

  constructor() {
    this.types = [];
  }

  addType(tag: string, options: yaml.TypeConstructorOptions) {
    const yamlType = new yaml.Type(tag, options);
    this.types.push(yamlType);
  }
}
