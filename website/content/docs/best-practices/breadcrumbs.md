---
title: Creating breadcrumbs
---
# Creating breadcrumbs

Leverage the `{{doc.collection.parents}}` property to dynamically create a
blueprint for the current document:


```
<ul>
  {% for collection in doc.collection.parents|reverse %}
    {% set firstDoc = collection.docs()|first %}
    <li><a href="{{firstDoc.url.path}}">{{firstDoc.fields.title}}</a></li>
    {% endfor %}
    <li><a href="{{collection.docs()|first.url.path}}">{{collection.docs()|first.fields.title}}</a></li>
```


Then, within a template:


```
{{partial.button.doc.url.path}}
```


