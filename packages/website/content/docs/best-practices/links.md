---
title: Creating links to pages
---
# Creating links to pages

All internal links in Amagaki are declarative and dynamic. An Amagaki function
can and should always be used to generate internal links to your pages and
assets (or really, to anything that has a route).

Why? Using an Amagaki function to create a link to a page is more maintainable –
it ensures you’ll never have a broken link internally, and also empowers you to
change your URL format halfway through a project with few repercussions.

From your content, use a custom YAML type to refer to another document:

{% filter codeTabs %}
```yaml
partials:
...
- button:
  label: Go home
  doc: !pod.doc /content/pages/index.yaml
...
```
{% endfilter %}

Then, within a template:

{% filter codeTabs %}{% raw %}
```nunjucks
<a href="{{partial.button.doc.url.path}}">{{partial.button.label}}</a>
```
{% endraw %}{% endfilter %}


Or, if you need to hardcode a link within a template, see below. Note this is
not advised as it begins to couple content to your views. It’s a best practice
to keep your content decoupled from your templates, so your content can be
easily managed later, and so your templates can be reused.

{% filter codeTabs %}{% raw %}
```nunjucks
{% set page = pod.doc('/content/pages/index.yaml') %}
<a href="{{page.url.path}}">{{page.fields.title}}</a>
```
{% endraw %}{% endfilter %}

Remember, this also works for static files:

{% filter codeTabs %}{% raw %}
```nunjucks
{% set css = pod.staticFile('/dist/css/main.min.css') %}
<link rel="stylesheet" href="{{css.url.path}}">
```
{% endraw %}{% endfilter %}

Avoid a common pitfall! You should never hardcode internal links. To understand
how to configure the URLs for documents and static files, see the URLs section.