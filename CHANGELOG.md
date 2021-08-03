# Changelog

### [1.3.1](https://www.github.com/blinkk/amagaki/compare/v1.3.0...v1.3.1) (2021-08-03)


### Bug Fixes

* issue with recording preferred strings ([838b229](https://www.github.com/blinkk/amagaki/commit/838b229838d1584323e6d9aa4b4829a11a67b6c6))
* support relative urls when fake documents are passed ([c84790e](https://www.github.com/blinkk/amagaki/commit/c84790eadac6528eec0f710a183810f5f333a8e7))

## [1.3.0](https://www.github.com/blinkk/amagaki/compare/v1.2.0...v1.3.0) (2021-07-27)


### Features

* add -l flag to build for collecting missing translations ([384e285](https://www.github.com/blinkk/amagaki/commit/384e28520c7b3eec313cacc80c2737847bbf92e8))

## [1.2.0](https://www.github.com/blinkk/amagaki/compare/v1.1.3...v1.2.0) (2021-07-12)


### Features

* add DataType check for pod objects ([219144d](https://www.github.com/blinkk/amagaki/commit/219144d93968432a3cd11562b851fad8c7a687f8))
* add support for incremental builds using patterns ([#109](https://www.github.com/blinkk/amagaki/issues/109)) ([d35be52](https://www.github.com/blinkk/amagaki/commit/d35be520f41277351e8c8e7952dc155657693c0f))
* add support for per-template profiling [#25](https://www.github.com/blinkk/amagaki/issues/25) ([#107](https://www.github.com/blinkk/amagaki/issues/107)) ([8cb7ca1](https://www.github.com/blinkk/amagaki/commit/8cb7ca11ca9bf15be2471f07a9ff3734da3c4be1))


### Bug Fixes

* allow localized-only pages without root paths [#111](https://www.github.com/blinkk/amagaki/issues/111) ([a7c7f11](https://www.github.com/blinkk/amagaki/commit/a7c7f1195149619fdc107ecdc0731311764d5aa4))

### [1.1.3](https://www.github.com/blinkk/amagaki/compare/v1.1.2...v1.1.3) (2021-06-28)


### Bug Fixes

* fix and clean up missing string recording ([22430db](https://www.github.com/blinkk/amagaki/commit/22430dba5b54e0971cb129daed8786ba90d083cd))
* rename route.path to route.podPath and add sample ([#105](https://www.github.com/blinkk/amagaki/issues/105)) ([945976a](https://www.github.com/blinkk/amagaki/commit/945976a5d409347ec46cb36e845fcd4b0970c4a3))

### [1.1.2](https://www.github.com/blinkk/amagaki/compare/v1.1.1...v1.1.2) (2021-06-24)


### Bug Fixes

* fix serialization of simple pod.string types ([f4acadb](https://www.github.com/blinkk/amagaki/commit/f4acadbcf52e84f8e3adddfb8320b092785bdb4d))

### [1.1.1](https://www.github.com/blinkk/amagaki/compare/v1.1.0...v1.1.1) (2021-06-23)


### Bug Fixes

* allow IfLocale and pod.string YAML types to roundtrip ([e9216f7](https://www.github.com/blinkk/amagaki/commit/e9216f7401d15b23c79337718520b2a14d7f4bac))

## [1.1.0](https://www.github.com/blinkk/amagaki/compare/v1.0.1...v1.1.0) (2021-06-22)


### Features

* add build options to the route building ([#101](https://www.github.com/blinkk/amagaki/issues/101)) ([3796761](https://www.github.com/blinkk/amagaki/commit/37967616a0ea4bede673eb2357a2d6c0555b19dd))


### Bug Fixes

* add contentType for StaticRoute ([a66d2f3](https://www.github.com/blinkk/amagaki/commit/a66d2f36802f57c2b93939c6ec4a6a416f3c877f))
* Benchmark not using current amagaki build. ([d71b3bc](https://www.github.com/blinkk/amagaki/commit/d71b3bc14ec280727369892499ea1184488931cf))
* Fixing cache for benchmark data file. ([4ec8430](https://www.github.com/blinkk/amagaki/commit/4ec8430b6513d9c6eec94e08e7b488c11965dd7f))
* Improve the benchmark profiling output and reduce size of the history. ([a8708d7](https://www.github.com/blinkk/amagaki/commit/a8708d763c6f532462d4218997b167723b91b7ab))
* Increasing size of history for benchmark results. ([508a71e](https://www.github.com/blinkk/amagaki/commit/508a71e59637ea072c89e8b96ee96fa34ad4204d))
* Restore benchmarking performance regression testing for pushes. ([5f372bc](https://www.github.com/blinkk/amagaki/commit/5f372bc2b6c87075117f63e1e8077f0fa26d9b59))
* Updating how the benchmark caches. ([d6f2175](https://www.github.com/blinkk/amagaki/commit/d6f217501727aecc6076673876ecff5007e98ac4))

### [1.0.1](https://www.github.com/blinkk/amagaki/compare/v1.0.0...v1.0.1) (2021-06-12)


### Bug Fixes

* expose environment option as a global option ([953a6da](https://www.github.com/blinkk/amagaki/commit/953a6dacca95697018f21100f9eca8e06175733d))

## [1.0.0](https://www.github.com/blinkk/amagaki/compare/v0.6.2...v1.0.0) (2021-06-08)


### ⚠ BREAKING CHANGES

* Async triggers for plugins (#90)

### Features

* Async triggers for plugins ([#90](https://www.github.com/blinkk/amagaki/issues/90)) ([f2dcd73](https://www.github.com/blinkk/amagaki/commit/f2dcd73d25f70339830d5d7d9f106dbb0e187705))

### [0.6.2](https://www.github.com/blinkk/amagaki/compare/v0.6.1...v0.6.2) (2021-05-30)


### Bug Fixes

* remove superfluous file ([cf760c2](https://www.github.com/blinkk/amagaki/commit/cf760c2d7fc0e5b562ab25b1da4eddac66e36365))

### [0.6.1](https://www.github.com/blinkk/amagaki/compare/v0.6.0...v0.6.1) (2021-05-30)


### Bug Fixes

* fix package bin path ([80ac1f1](https://www.github.com/blinkk/amagaki/commit/80ac1f1e809505cd37578798b6b432bf5fc626ef))

## [0.6.0](https://www.github.com/blinkk/amagaki/compare/v0.5.0...v0.6.0) (2021-05-30)


### Features

* add await filter, remove dead test filter ([b228fdc](https://www.github.com/blinkk/amagaki/commit/b228fdce88ae1da9cd37bfd56432b8ea4d6fa9a6))
* add IfLocale yaml type ([fa433b6](https://www.github.com/blinkk/amagaki/commit/fa433b670f2a663acc93da5b6370e52e541fb6f6))
* implement pod.meta yaml type ([2164877](https://www.github.com/blinkk/amagaki/commit/2164877e2a989f1984adaf288a399573fe1352bb))


### Bug Fixes

* fix packaged version ([59f9e7f](https://www.github.com/blinkk/amagaki/commit/59f9e7f71c4eaadffab6af6eea589593f8ab10ef))

## [0.5.0](https://www.github.com/blinkk/amagaki/compare/v0.4.0...v0.5.0) (2021-05-28)


### Features

* add contributor avatars to website homepage ([6f34053](https://www.github.com/blinkk/amagaki/commit/6f34053a9408f1fe5ede06a1d432e986a42ebe10))
* allow configuration via amagaki.ts ([f685207](https://www.github.com/blinkk/amagaki/commit/f6852073f965aef32a04a44b666c74773a435ed9))
* autoreload server when amagaki.{t|j}s changes ([c8d1a3d](https://www.github.com/blinkk/amagaki/commit/c8d1a3d1353c3e0cf1cfcd93fb8359fbc22ddb43))


### Bug Fixes

* remove debug content in footer ([f0e7e06](https://www.github.com/blinkk/amagaki/commit/f0e7e066442eaab8b4c95e0701faaf2e50c08e48))
* remove example using extraneous yaml library ([b1d991d](https://www.github.com/blinkk/amagaki/commit/b1d991d1e77779ecb4b550f41553d1e508a4331b))
* use inbuilt yaml type for test ([38c6cdc](https://www.github.com/blinkk/amagaki/commit/38c6cdc59bb83b403c9ac522487e4cfaf45d7e49))
