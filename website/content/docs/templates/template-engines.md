---
title: Template engines
order: 1
---
# Template engines 

Amagaki supports multiple template engines. Because Amagaki is primarily an HTML
generator, and because Nunjucks is a simple template engine that is fully
compatible with HTML, Amagaki's core includes Nunjucks. But, any template engine
is a first-party citizen of Amagaki and can be brought in using plugins.

{{button.button({
    label: 'Read Nunjucks templating guide',
    url: 'https://mozilla.github.io/nunjucks/templating.html',
    external: true,
    class: 'button button--low',
    icon: 'launch'
})}}

### Template specification

Amagaki determines which template engine to used based on the file extension of
the template specified by the page's `$view`. When using the [partial
loop]({{pod.doc('/content/docs/content-management/partial-content.md').url.path}}),
the partial's `partial` key specifies the template.

```yaml
# Base template for the page.
$path: /views/page.njk
```

```yaml
# When using the partial loop, `partial` specifies the template.
# ...
partials:
- partial: hero
  # ...
- partial: columns
  # ...
```

### Global default template

By default, if `$view` is not specified within `_collection.yaml` or within a
document’s front matter, the default `/views/base.njk` template is used. When
used in conjunction with the partial loop, this global default represents a
powerful way to follow the DRY (don’t repeat yourself) concept -- avoiding
specification of different $view settings – while maintaining the concept of
building websites out of reusable modules.

### Adding new template engines

Different template engines can be used by installing or writing an Amagaki
plugin. See the template engines plugin documentation to understand how.

{{button.button({
    label: 'Learn about template engine plugins',
    doc: '/content/docs/plugins/template-engines.md',
    class: 'button button--low',
    icon: 'arrow_forward'
})}}
