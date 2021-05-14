---
title: YAML types
order: 6
---
# YAML types

One of Amagaki’s unique concepts is bringing elevating YAML types to first party
citizens in the ecosystem. Amagaki provides Pod Functions and additional inbuilt
YAML types to assist with common content management tasks.

Amagaki’s YAML types facilitate content management best practices, entirely
within the content layer. For example, using YAML types, you can:

*   Create and reuse partial content (such as common modules)
*   Refer to pod objects, such as documents, collections, static files, and URLs
    – entirely within the content layer
*   Refer to translation strings, including the ability to use preferred string
    values and fall back to previous translations if a new translation is not
    yet available
*   Conditionally change content based on the pod’s environment or document’s
    locale
*   Create custom YAML types representing custom content structures within your
    site. For example, you can create a YAML type representing a button, or a
    YAML type representing a media asset. Custom YAML types can be validated,
    and represented into objects of your choosing.

### When to use YAML types

Always avoid hardcoding objects that can be represented through an existing or
custom YAML type. For example, you should:

*   Never hardcode URLs. URLs can change throughout the life of a project. Use
    the `url` property on a document to determine URLs instead.
*   Never hardcode document or collection paths. Use the !pod.doc or
    !pod.collection YAML types to represent documents instead. Hardcoding
    document or collection paths could result in a template error if a typo was
    made.

### Built-in YAML types

- `!pod.doc`
- `!pod.docs`
- `!pod.collection`
- `!pod.collections`
- `!pod.metadata` (WIP)
- `!pod.string`
- `!pod.staticFile`
- `!pod.yaml`
- `!pod.locale`
- `!pod.locales`
- `!pod.config` (WIP)
- `!IfEnvironment`
- `!IfLocale` (WIP)

#### !pod.doc

Returns a document.

{% filter codeTabs %}
```yaml
# Single document.
!pod.doc '/content/pages/index.yaml'

# Single document, localized.
!pod.doc ['/content/pages/index.yaml', !pod.locale 'de']
```
{% endfilter %}

#### !pod.docs

Returns a list of documents. Either multiple docs can be enumerated explicitly,
or glob syntax can be used to fetch documents using a glob pattern.

{% filter codeTabs %}
```yaml
# Two documents.
!pod.docs ['/content/pages/index.yaml', '/content/posts/2019-01-06.md']

# All documents within the `posts` collection, with options.
!pod.docs ['/content/posts/**', {sort: 'order'}]

# All documents within the `pages` and `posts` collection, with options.
!pod.docs [['/content/pages/**', '/content/posts/**'], {sort: 'order'}]
```
{% endfilter %}

### Custom YAML types

Custom YAML types are created through plugins. Custom YAML types can be used to
represent objects that may be helpful for reusing throughout the content layer
in your site.

Often, custom YAML types will be used for things like:

- Restructure content prior to being inserted into the template layer
- Simplify template logic
- Connect with headless CMSes

{{button.button({
    label: 'Learn how to create custom YAML types',
    doc: '/content/plugins/yaml-types.md',
    class: 'button button--low',
    icon: 'arrow_forward'
})}}