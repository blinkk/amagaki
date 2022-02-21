# amagaki-engine-preact

[![NPM Version][npm-image]][npm-url]
[![TypeScript Style Guide][gts-image]][gts-url]

An Amagaki plugin for using Preact for template rendering.
## Usage

1. Install the plugin.

```shell
# Install the plugin.
npm install --save @amagaki/amagaki-engine-preact
```

2. Add to `amagaki.ts`.

```typescript
import {Pod} from '@amagaki/amagaki';
import {PreactEnginePlugin} from '@amagaki/amagaki-engine-preact';

export default (pod: Pod) => {
  PreactEnginePlugin.register(pod);
};
```

[npm-image]: https://img.shields.io/npm/v/@amagaki/amagaki-engine-preact.svg
[npm-url]: https://npmjs.org/package/@amagaki/amagaki-engine-preact
[gts-image]: https://img.shields.io/badge/code%20style-google-blueviolet.svg
[gts-url]: https://github.com/google/gts
