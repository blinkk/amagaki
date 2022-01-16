# Changelog

## [1.9.0](https://www.github.com/blinkk/amagaki/compare/v1.9.0...v1.9.0) (2022-01-16)


### Miscellaneous Chores

* release 1.9.0 ([329a8c9](https://www.github.com/blinkk/amagaki/commit/329a8c9ba3c23530c1acef698427980b824ce7e5))

## [1.9.0](https://www.github.com/blinkk/amagaki/compare/v1.8.0...v1.9.0) (2022-01-15)


### Features

* add create-amagaki-site [#129](https://www.github.com/blinkk/amagaki/issues/129) ([fc06e1f](https://www.github.com/blinkk/amagaki/commit/fc06e1fa1d8e81e31d19a9639b495d9bf68f6cc6))


### Bug Fixes

* support runtime reloading of src ([a06c40a](https://www.github.com/blinkk/amagaki/commit/a06c40a094267309633ad0b9fbc1efc823281830))

## [1.8.0](https://www.github.com/blinkk/amagaki/compare/v1.7.2...v1.8.0) (2021-12-08)


### Features

* add date to builder ([cb6d4be](https://www.github.com/blinkk/amagaki/commit/cb6d4be0f115fc26aeac488ccc7b64207aca6638))


### Bug Fixes

* keep build temp dir on same volume as output dir ([81cfd74](https://www.github.com/blinkk/amagaki/commit/81cfd745791ddfc7680d093a2864e745c5c0bf36))

### [1.7.2](https://www.github.com/blinkk/amagaki/compare/v1.7.1...v1.7.2) (2021-11-24)


### Bug Fixes

* improve file watching and the dev server ([1c765e8](https://www.github.com/blinkk/amagaki/commit/1c765e801f266eff90c6d9d4be32587d3f751d79))

### [1.7.1](https://www.github.com/blinkk/amagaki/compare/v1.7.0...v1.7.1) (2021-11-24)


### Bug Fixes

* refresh the router when static files change ([10f3ffb](https://www.github.com/blinkk/amagaki/commit/10f3ffbebda71c0c4e6a0efaf2ddbdd1290e1d8e))

## [1.7.0](https://www.github.com/blinkk/amagaki/compare/v1.6.2...v1.7.0) (2021-11-16)


### Features

* add ability to use a function as the default view ([784a34e](https://www.github.com/blinkk/amagaki/commit/784a34eb6fde644980837736001e3392f0ad9b7d))

### [1.6.2](https://www.github.com/blinkk/amagaki/compare/v1.6.1...v1.6.2) (2021-11-05)


### Bug Fixes

* document sorting and add deleteFileAsync ([774e445](https://www.github.com/blinkk/amagaki/commit/774e4450d83df82855d6b96a3636d07e108eaa52))

### [1.6.1](https://www.github.com/blinkk/amagaki/compare/v1.6.0...v1.6.1) (2021-11-01)


### Bug Fixes

* invalidate cache when writing files ([cea678a](https://www.github.com/blinkk/amagaki/commit/cea678a68c80709044bed62525ec67d279cc7ed2))

## [1.6.0](https://www.github.com/blinkk/amagaki/compare/v1.5.1...v1.6.0) (2021-10-16)


### Features

* enable use of the environment name in amagaki.ts ([0cf6b85](https://www.github.com/blinkk/amagaki/commit/0cf6b857b693b6e2b62586e6eb673697e111618a))

### [1.5.1](https://www.github.com/blinkk/amagaki/compare/v1.5.0...v1.5.1) (2021-10-16)


### Bug Fixes

* bug involving autoreload while connection is open ([39e17cb](https://www.github.com/blinkk/amagaki/commit/39e17cb2daca522c0586a445cabf2f84815e7224))

## [1.5.0](https://www.github.com/blinkk/amagaki/compare/v1.4.0...v1.5.0) (2021-10-16)


### Features

* add path format plugin [#98](https://www.github.com/blinkk/amagaki/issues/98) ([64f5393](https://www.github.com/blinkk/amagaki/commit/64f53934924c9a1ebe43da027eec05ddb0377609))
* autoreload server when plugins change ([757be9e](https://www.github.com/blinkk/amagaki/commit/757be9e1c5ef56fc2dc422796c15eb17c0113d02))

## [1.4.0](https://www.github.com/blinkk/amagaki/compare/v1.3.2...v1.4.0) (2021-09-22)


### Features

* improve error logging during full site build ([9432b51](https://www.github.com/blinkk/amagaki/commit/9432b5135dbc9ae06a677fd573ad86a0bb481e96))
* improve nunjucks error output ([745622b](https://www.github.com/blinkk/amagaki/commit/745622b584a8f14e17d86dad3ddba6b37560901f))

### [1.3.2](https://www.github.com/blinkk/amagaki/compare/v1.3.1...v1.3.2) (2021-08-16)


### Bug Fixes

* do not use references when dumping yaml ([a9955df](https://www.github.com/blinkk/amagaki/commit/a9955df98f1c2dba316a30581e2db7324a44ca66))

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
