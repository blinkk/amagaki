---
title: Referring to static files
order: 3
---
# Referring to static files

Static files should always be loaded using an Amagaki function. By default,
static files can be placed in the `/src/static/` folder, and then can be loaded
using the `staticFile` Amagaki function.

In YAML:

```yaml
file: !pod.staticFile /src/static/image.jpg
```

In a template:

```nunjucks
{%- raw -%}
<img src="{{pod.staticFile('/src/static/image.jpg').url.path}}">
{% endraw %}
```

Avoid hardcoding paths to static files. When hardcoding paths, maintainability
is reduced, and it’s easier to make mistakes (i.e. typos that refer to files
that may not exist). Using the Amagaki functions also enables the features that
come with it – such as recording static file usage.