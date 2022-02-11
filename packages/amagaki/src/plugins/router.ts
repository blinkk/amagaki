import {PluginComponent} from '../plugins';
import {Pod} from '../pod';

/**
 * Plugin for working with routes and URL path formats.
 */
export class RouterPlugin implements PluginComponent {
  pod: Pod;
  formatters: Record<string, Function>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.formatters = {};
  }

  /**
   * Adds a path formatter function to make it available from a document or
   * collection's `$path` setting.
   *
   * For example, if a document's `$path` is set to:
   *
   * ```
   * $path: /blog/articles/${slugify(doc.fields.title)}/
   * ```
   *
   * You could then add a path formatter with name `slugify` to create a URL for
   * the document, based on its `title` field.
   */
  addPathFormatFunction(name: string, func: Function) {
    if (['doc', 'pod'].includes(name)) {
      throw new Error(
        'Cannot overwrite "doc" or "pod" in the path formatter context.'
      );
    }
    this.formatters[name] = func;
  }

  updatePathFormatContextHook(context: Record<string, any>) {
    Object.assign(context, this.formatters);
  }
}
