# amagaki-engine-preact

[![NPM Version][npm-image]][npm-url]
[![TypeScript Style Guide][gts-image]][gts-url]

An Amagaki plugin for using Preact (TSX) for template rendering. Supports server-side
rendering (SSR) and (optionally) hydration.

This engine can be used to bring React into an Amagaki project with minimal
overhead, and you can choose whether to also use it on your site's frontend.
Page modules can be created entirely using React components (via Preact) and
integrate seamlessly with frontend components also built in React.
## Usage

1. Install the plugin. This plugin is meant to be used in conjunction with
   `@amagaki/amagaki-plugin-page-builder`.

```shell
npm install --save \ 
  @amagaki/amagaki-engine-preact \
  @amagaki/amagaki-plugin-page-builder
```

2. Add to `amagaki.ts`.

```typescript
import {PageBuilder} from '@amagaki/amagaki-plugin-page-builder';
import {Pod} from '@amagaki/amagaki';
import {PreactEnginePlugin} from '../src';

export default (pod: Pod) => {
  PreactEnginePlugin.register(pod);
  PageBuilder.register(pod, {
    partialPaths: {
      css: ['/dist/css/${partial.partial}/${partial.partial}.css'],
      js: ['/dist/js/partials/${partial.partial}/${partial.partial}.js'],
      view: ['/src/partials/${partial.partial}/${partial.partial}.tsx'],
    },
  });
};
```

3. If your partial requires hydration:

    a. Add to your frontend's `main.ts`.

    ```typescript
    import {PartialHydrator} from '@amagaki/amagaki-engine-preact';

    // Import all partials that require hydration.
    import Hero from './partials/Hero';

    PartialHydrator.register({
      components: [Hero],
    });
    ```

    b. Ensure `includeContext: true` is supplied in YAML files for any partial
    that requires hydration.

    ```yaml
    partials:
    - partial: Hero
      includeContext: true
      headline: Hello World!
    ```

[npm-image]: https://img.shields.io/npm/v/@amagaki/amagaki-engine-preact.svg
[npm-url]: https://npmjs.org/package/@amagaki/amagaki-engine-preact
[gts-image]: https://img.shields.io/badge/code%20style-google-blueviolet.svg
[gts-url]: https://github.com/google/gts
