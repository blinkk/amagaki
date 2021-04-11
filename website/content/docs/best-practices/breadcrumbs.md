---
title: Creating breadcrumbs
---
# Creating breadcrumbs

Leverage the `doc.collection.parents` property along with the
`doc.collection.index` property to dynamically create a breadcrumb for the
current document.

- `doc.collection.parents`: A list of the document's collection ancestors
- `doc.collection.index`: A document within the collection whose basename is "index", or simply the first document in the collection's directory

The following code snippet will output the current document's collection, and
its ancestors, in reverse order, suitable for rendering a breadcrumb.

```nunjucks
{%- raw -%}
<ul>
  {% for collection in doc.collection.parents|reverse %}
    <li><a href="{{collection.index.url.path}}">{{collection.index.fields.title}}</a></li>
    {% endfor %}
    <li><a href="{{doc.collection.index.url.path}}">{{doc.collection.index.fields.title}}</a></li>
  {% endfor %}
</ul>
{% endraw %}
```