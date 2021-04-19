---
title: YAML types
order: 1
---
# YAML types

The YAML types plugin allows you to create custom tags for your YAML files.
Custom YAML types provide a variety of uses, and can help you organize and
structure your content, as well as validate the content that you are managing.

With custom YAML types, you can further keep concerns around content in the
content layer, and allow you to avoid holding too much business logic in your
templates.

## Example

Here is an example of a custom YAML type being used:

```yaml


```

To create the custom type:

```js
const yamlPlugin = pod.plugins.get('YamlPlugin');
yamlPlugin.addType(
    new yaml.Type('!Person', {
        kind: 'mapping',
        construct: (data) {
                   
        },
    })
);
```