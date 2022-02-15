---
title: Plugins overview
order: 0
---

# Plugins overview

## Built-in plugins

Amagaki provides a handful of inbuilt plugins which can trigger callbacks at
different times during Amagaki's lifecycle. Plugins can be used to do things
such as:

- [BuilderPlugin]({{pod.doc('/content/docs/plugins/build-hooks.md').url.path}}) - Adding events before and after building
- [ServerPlugin]({{pod.doc('/content/docs/plugins/server-middleware.md').url.path}}) - Adding events before the dev server starts
- [YamlPlugin]({{pod.doc('/content/docs/plugins/yaml-types.md').url.path}}) - Adding new YAML types
- [Adding new template engines]({{pod.doc('/content/docs/plugins/template-engines.md').url.path}})

## Creating plugins

Custom plugins can be created so that other custom plugins may interact with
them. For example, you may create one plugin that handles authentication for
several other plugins.

Normally, instead of explicitly creating new plugins, you can extend Amagaki
functionality by using hooks available from existing plugins, or by simply
interfacing with Amagaki within `amagaki.js`. But, if you want or need to
create a custom plugin, see below.

First, define the plugin.

{% filter codeTabs %}
```javascript:title=plugin.js
class CustomPlugin {
  constructor(pod, options) {
    this.pod = pod;
    this.options = options;
  }
  getFoo() {
      return this.options.foo;
  }
}
```
{% endfilter %}

Then, register the plugin.

{% filter codeTabs %}
```javascript:title=amagaki.js
module.exports = (pod) => {
    pod.plugins.register(CustomPlugin, {
        foo: 'bar'
    });
}
```
{% endfilter %}

Later, within code that depends on the plugin you created, access it.

{% filter codeTabs %}
```javascript
const customPlugin = pod.plugins.get('CustomPlugin');
customPlugin.getFoo();
```
{% endfilter %}

## Using plugin hooks

Plugins can interface with hooks in Amagaki. These hooks allow for extending the functionality
of Amagaki without needing to change the core of Amagaki.

The `PluginComponent` interface defines the hooks that are available for plugins to use
and which arguments are expected for the hook arguments.

{{button.button({
    label: 'See PluginComponent Reference',
    url: 'https://amagaki.dev/api/interfaces/plugins.plugincomponent.html',
    external: true,
    class: 'button button--low',
    icon: 'launch'
})}}

You can see examples of the hooks in action in the built-in plugins (look for methods ending in `Hook`):

- [BuilderPlugin](https://github.com/blinkk/amagaki/blob/main/src/plugins/builder.ts)
- [ServerPlugin](https://github.com/blinkk/amagaki/blob/main/src/plugins/server.ts)
- [YamlPlugin](https://github.com/blinkk/amagaki/blob/main/src/plugins/yaml.ts)
