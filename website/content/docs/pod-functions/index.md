---
title: Pod functions
order: 0
---
# Pod functions

The term "pod functions" is how we refer to the set of Amagaki's primary
functions that are available to use throughout YAML, JavaScript, and template
contexts. Pod functions allow you to interact with the objects in your website
in a simple, predictable way.

Pod functions facilitate things like:

- Listing and getting documents
- Listing and getting collections
- Listing and getting static files
- Using pod metadata
- Using pod locales

You will most frequently use pod functions via YAML type,s within YAML files,
but when you are building plugins or templates, you may need to use the
JavaScript API.

## Examples

### YAML

{% filter codeTabs %}{% raw %}
```yaml:title=/content/pages/index.yaml
$view: /views/page.njk
# Create a menu containing three documents.
menu:
- doc: !pod.doc /content/pages/index.yaml
  title: Homepage
- doc: !pod.doc /content/pages/about.yaml
  title: About
- doc: !pod.doc /content/pages/contact.yaml
  title: Contact
```
```nunjucks:title=/views/page.njk
{# Render the menu. #}
<ul>
    {% for item in doc.menu %}
        <li><a href="{{item.doc.url.path}}">{{item.title}}</a></li>
    {% endfor %}
</ul>
```
{% endraw %}{% endfilter %}

{{button.button({
    label: 'Learn about pod functions within YAML types',
    doc: '/content/docs/plugins/yaml-types.md',
    class: 'button button--low',
    icon: 'arrow_forward'
})}}

### JavaScript

{% filter codeTabs %}
```javascript
// Get one document.
const doc = pod.doc('/content/pages/index.yaml');
 
// List all documents within the posts collection.
const docs = pod.docs('/content/posts/**');
```
{% endfilter %}

{{button.button({
    label: 'See full API Reference',
    url: 'https://blinkkcode.github.io/amagaki/api/',
    class: 'button button--low',
    icon: 'launch'
})}}

{{button.button({
    label: 'See API Reference for pod functions',
    url: 'https://blinkkcode.github.io/amagaki/api/',
    class: 'button button--low',
    icon: 'launch'
})}}
