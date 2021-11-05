# Amagaki

[![NPM Version][npm-image]][npm-url]
[![GitHub Actions][github-image]][github-url]
[![codecov][codecov-image]][codecov-url]
[![TypeScript Style Guide][gts-image]][gts-url]

Amagaki is a marketing website generator. It's written in TypeScript and TS is a
first-class citizen. It's specifically built for hand-coding marketing and
informational websites. Flexible URLs, benchmarking, localization, a plugin
system, and multiple template engines are all built-in.

Amagaki takes concepts from [Grow.dev](https://github.com/grow/grow) and evolves
them to a TypeScript-first ecosystem.

## [🍊 Start here with the documentation](https://amagaki.dev)

## Key concepts

- TypeScript and Node
- Minimal core dependencies
- Inbuilt build metrics (memory usage, generated file size, routes, locales,
  translations)
- Multiple template languages (Nunjucks as default)
- A static site generator (not a frontend framework)
- Renders pages at request time (unlike other static generators which watch and rebuild)
- Localization is an inbuilt feature
- Custom YAML types for extending the content layer
- Plugin system
- Benchmarking inbuilt

## Try it out

Amagaki is distributed as an npm package. We recommend using our
[starter](https://github.com/blinkk/amagaki-starter) when starting from scratch.

```shell
git clone https://github.com/blinkk/amagaki-starter
npm install

# Start the dev server
npm run dev

# Build the site
npm run build
```

If you are integrating into an existing project, you can install Amagaki directly.

```shell
# Install Amagaki
npm install --save @amagaki/amagaki

# Start the dev server
npx amagaki serve

# Build the site
npx amagaki build
```
## Benchmarks

You can view the [benchmark history](https://blinkk.github.io/amagaki/benchmark/) that shows the benchmark metrics when running `amagaki build` against the [amagaki-benchmark](https://github.com/blinkk/amagaki-benchmark) test repository.

[github-image]: https://github.com/blinkk/amagaki/workflows/Run%20tests/badge.svg
[github-url]: https://github.com/blinkk/amagaki/actions
[codecov-image]: https://codecov.io/gh/blinkk/amagaki/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/blinkk/amagaki
[gts-image]: https://img.shields.io/badge/code%20style-google-blueviolet.svg
[gts-url]: https://github.com/google/gts
[npm-image]: https://img.shields.io/npm/v/@amagaki/amagaki.svg
[npm-url]: https://npmjs.org/package/@amagaki/amagaki