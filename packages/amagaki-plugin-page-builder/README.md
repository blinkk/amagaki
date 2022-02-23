# amagaki-plugin-page-builder

[![NPM Version][npm-image]][npm-url]
[![GitHub Actions][github-image]][github-url]
[![TypeScript Style Guide][gts-image]][gts-url]

An opinionated page builder for Amagaki: the base template for constructing
pages from content and templates.

## Usage

1. Install the plugin.

```shell
npm install --save @amagaki/amagaki-plugin-page-builder
```

2. Add to `amagaki.ts`.

```typescript
import {PageBuilder} from '@amagaki/amagaki-plugin-page-builder';
import {Pod} from '@amagaki/amagaki';

export default (pod: Pod) => {
  PageBuilder.register(pod);
};
```

3. Ensure your site uses the following structure:

```
# Page module templates.
/views/partials/{partial}.njk

# Page module JavaScript.
/dist/js/{partial}.js

# Page module CSS.
/dist/css/{partial}.css
```

## Background

Amagaki provides structure around how your site's content and templates are
organized, but it doesn't provide any built-in structure for generating the
markup used in HTML pages, or loading page modules. That's where this plugin
comes in.

To use this plugin, get started by placing content within the `/content`
directory. A content document should then define a field `partials` that lists
the partial content used by a page's modules.

```
# /content/index.yaml

partials:
- partial: hero
  headline: Hello World!
- partial: banner
  body: Lorem ipsum dolor sit amet.
```

In the above content document, we define the `index.yaml` page to contain two
partials: `hero` and `banner`. These partials correspond to files in the
`/views` directory, such as:

```
# /views/partials/hero.njk

<div class="hero">
  {{partial.headline}}
</div>
```

The page builder plugin will render the page by looping over the items in the
`partials` field and rendering the individual partial templates.

Furthermore, the page builder manages resource loading. By default, it will look
for CSS and JS files corresponding to each partial template, and load them as
needed on a per-module basis.

By default, the page builder looks for CSS and JS in the following directories:

```
/dist/css/{partial}.css
/dist/js/{partial}.js
```

In addition to rendering page modules using the partial loop, the page builder
also manages the `<head>` tag and typical elements, such as elements used for
SEO and sharing metadata, as well as `canonical` and `alternate` links. These
elements are either configurable or managed automatically.


## Options

Refer to the [`PageBuilderOptions` interface](src/page-builder.ts#L69) for a full list of options.

### Grid inspector settings

The page builder includes a configurable layout grid inspector to simplify
comparing a web page to a Figma design. The grid inspector can be configured
across various breakpoints, with parameters that align to Figma's options:

- **The Count** determines how many columns there are in the grid.
- **The Gutter** defines the distance between each column.
- **The Margin** is the distance from the edge that the column.

## Example

See the example in the `/example` directory for a full example, or refer to the
configuration below for example usage within `amagaki.ts`.

```typescript
PageBuilder.register(pod, {
  head: {
    siteName: 'Site Name',
    twitterSite: '@username',
    icon: pod.staticFile('/src/images/favicon.ico'),
    scripts: [pod.staticFile('/dist/js/main.min.js')],
    stylesheets: [
      'https://fonts.googleapis.com/css?family=Material+Icons|Roboto:400,500,700&display=swap',
      pod.staticFile('/dist/css/main.css'),
    ],
    extra: ['/views/head.njk'],
  },
  body: {
    extra: ['/views/body.njk'],
  },
});
```

[github-image]: https://github.com/blinkk/amagaki-plugin-page-builder/workflows/Run%20tests/badge.svg
[github-url]: https://github.com/blinkk/amagaki-plugin-page-builder/actions
[npm-image]: https://img.shields.io/npm/v/@amagaki/amagaki-plugin-page-builder.svg
[npm-url]: https://npmjs.org/package/@amagaki/amagaki-plugin-page-builder
[gts-image]: https://img.shields.io/badge/code%20style-google-blueviolet.svg
[gts-url]: https://github.com/google/gts
