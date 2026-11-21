---
title: Creating navigation or menus
description: Build explicit and automatic navigation menus in Amagaki using YAML partials and collections.
---
# Creating navigation or menus

Navigation and menus can be created manually or generated automatically from collections. Headers and footers are usually best managed explicitly in partial YAML files, while documentation sidebars and section indexes work well when generated from collections.

## Explicit menu

Store your header links in a partial YAML file using `!pod.doc` so URLs stay in sync if routes change:

{% filter codeTabs %}
```yaml:title=/content/partials/header.yaml
title: My Website
menu:
  - doc: !pod.doc /content/pages/index.yaml
    title: Home
  - doc: !pod.doc /content/pages/about.yaml
    title: About
  - doc: !pod.doc /content/pages/contact.yaml
    title: Contact
```
{% endfilter %}

Render the partial in your template:

{% filter codeTabs %}{% raw %}
```nunjucks:title=/views/partials/header.njk
{% set header = pod.readYaml('/content/partials/header.yaml') %}
<header class="header">
  <div class="header__logo">{{header.title}}</div>
  <nav class="header__menu">
    {% for item in header.menu %}
      <a class="header__menu__item" href="{{item.doc.url.path}}">
        {{item.title}}
      </a>
    {% endfor %}
  </nav>
</header>
```
{% endraw %}{% endfilter %}

## Automatic menu

To generate a multi-section sidebar or table of contents automatically from collections:

1. Give each `_collection.yaml` a `title` and numeric `order`.
2. Give each document front matter a `title` and numeric `order`.
3. Walk the collections and their documents in your template:

{% filter codeTabs %}{% raw %}
```nunjucks:title=/views/partials/sidebar.njk
{% set root = pod.collection('/content/docs') %}
<nav aria-label="Documentation">
  {% for col in root.subcollections | sort(attribute='fields.order') %}
    <div class="sidebar__heading">{{col.fields.title}}</div>
    <ul>
      {% for item in col.docs({excludeSubcollections: true, sort: 'order'}) %}
        <li>
          <a
            href="{{item.url.path}}"
            {% if doc.podPath == item.podPath %}aria-current="page"{% endif %}
          >
            {{item.fields.title}}
          </a>
        </li>
      {% endfor %}
    </ul>
  {% endfor %}
</nav>
```
{% endraw %}{% endfilter %}
