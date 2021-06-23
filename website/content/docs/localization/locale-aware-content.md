---
title: Locale-aware content
order: 1
---
# Locale-aware content

Amagaki has inbuilt support for generating localized pages, using localized URL
paths and supporting localized content. See the steps below to learn how to
generate localized pages.
## Localized URL paths

To start with localization, create a page. Define its localization path
structure in front matter, and specify the locales it should be available in.

{% filter codeTabs %}
```yaml:title=/content/pages/about.yaml
$path: /${doc.basename}/
$localization:
  path: /${doc.locale.id}/${doc.basename}/
  locales:
  - en
  - de
  - it
```
{% endfilter %}

The above configuration will generate four pages, at the following URL paths:

- `/about/`
- `/de/about/`
- `/it/about/`

### Default locale

Within `amagaki.ts`, you can specify the pod's default locale. By default,
the default locale for all Amagaki projects is `en`. The default locale
indicates the "base" document, and it will not be included in localized paths.

### Unique URL paths

Ensure that every localized path is unique. If two localized paths are
identical, Amagaki will raise an error.

### Localized collections

You can localize all documents within a collection by specifying `$localization`
within the collection's `_collection.yaml`. In the below example, the `$path`
and `$localization` settings will be applied to all documents within the
`/content/pages` collection.

Settings can be overriden on a per-document basis.

{% filter codeTabs %}
```yaml:title=/content/pages/_collection.yaml
$path: /${doc.basename}/
$localization:
  path: /${doc.locale.id}/${doc.basename}/
  locales:
  - en
  - de
  - it
```
{% endfilter %}

## Localized content

Now that you're generating localized pages, you can use the `!IfLocale` YAML
type to conditionally change content.

Let's say you want to change the hero copy in the `de` locale:

```yaml
# ...
hero: !IfLocale
  default: !pod.string Hello World
  de: !pod.string Welcome to the site
# ...
```

In the above example, Amagaki will render "Hello World" for all locales, and
request the translation for "Welcome to the site" for locale `de` from
`/content/locales/de.yaml`.

NOTE: Avoid the common pitfall of including translated copy in YAML files.
Website translations should always be managed witin `locales` files. The
`!IfLocale` type is meant to vary source strings (or non-translated data), and
you should avoid storing translations within the documents.