# amagaki-plugin-partial-library

[![NPM Version][npm-image]][npm-url]
[![GitHub Actions][github-image]][github-url]
[![TypeScript Style Guide][gts-image]][gts-url]

An Amagaki plugin for generating a library of all partial usage in a pod.

## Usage

1. Install the plugin.

```shell
npm install --save @amagaki/amagaki-plugin-partial-library
```

2. Add to `amagaki.ts`.

```typescript
import {PartialLibrary} from '@amagaki/amagaki-plugin-partial-library';
import {Pod} from '@amagaki/amagaki';

export default (pod: Pod) => {
  PartialLibrary.register(pod);
};
```

## Background

Amagaki provides structure around how your site's content and templates are
organized. The partial library detects the partial usage during a build and
generates a library of all the partials used in the normal page builds as
defined in the `partials` key of a content document.

```
# /content/index.yaml

partials:
- partial: hero
  headline: Hello World!
- partial: banner
  body: Lorem ipsum dolor sit amet.
```

In the above content document, we define the `index.yaml` page to contain two
partials: `hero` and `banner`. The partial library will pull out the
information while rendering the pages and include it into the library at the
end of the build process.

## Options

Refer to the [`PartialLibraryPluginOptions` interface](src/partial-library.ts) for a
full list of options.

## Usage

The partial library is designed to be used within a view from the project the
plugin is used in. This allows for defining a view that loads the project
specific styling/js and allows the developer to control the partial output if
they would like to display examples of the partial usage in the site.

By default the plugin only generates a simple partial listing and usage count
information.

Set the view using the `rendering.view` configuration option.

Refer to the [`PartialLibraryContext` interface](src/partial-library.ts) for a
full list of the template context passed to the view.

## Example

See the example in the `/example` directory for a full example, or refer to the
configuration below for example usage within `amagaki.ts`.

```typescript
PartialLibrary.register(pod, {
  document: {
    // Override the key used to find partials in the document.
    key: 'modules',
  },
  partials: {
    // Override the key used to identify the partial in the partials array.
    key: 'module',
  },
});
```

[github-image]: https://github.com/blinkk/amagaki-plugin-partial-library/workflows/Run%20tests/badge.svg
[github-url]: https://github.com/blinkk/amagaki-plugin-partial-library/actions
[npm-image]: https://img.shields.io/npm/v/@amagaki/amagaki-plugin-partial-library.svg
[npm-url]: https://npmjs.org/package/@amagaki/amagaki-plugin-partial-library
[gts-image]: https://img.shields.io/badge/code%20style-google-blueviolet.svg
[gts-url]: https://github.com/google/gts
