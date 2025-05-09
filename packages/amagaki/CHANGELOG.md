# Changelog

## [3.1.2](https://github.com/blinkk/amagaki/compare/amagaki-v3.1.1...amagaki-v3.1.2) (2025-04-25)


### Bug Fixes

* preserve config types in plugins.ts ([#236](https://github.com/blinkk/amagaki/issues/236)) ([9146c1d](https://github.com/blinkk/amagaki/commit/9146c1debada19fb84147e799e4efaa0c12d8662))

## [3.1.1](https://github.com/blinkk/amagaki/compare/amagaki-v3.1.0...amagaki-v3.1.1) (2025-02-05)


### Bug Fixes

* Update PluginConstructor to use a generic constructor signature ([#229](https://github.com/blinkk/amagaki/issues/229)) ([016e56f](https://github.com/blinkk/amagaki/commit/016e56fc5a008d67a6a1348f6664bfb1e8443e90))

## [3.1.0](https://www.github.com/blinkk/amagaki/compare/amagaki-v3.0.2...amagaki-v3.1.0) (2023-08-18)


### Features

* Use mangled plugin for email addresses ([#225](https://www.github.com/blinkk/amagaki/issues/225)) ([ce645ad](https://www.github.com/blinkk/amagaki/commit/ce645add64a2f6c9bfdaf1493d4a0d832003df06))

### [3.0.2](https://www.github.com/blinkk/amagaki/compare/amagaki-v3.0.1...amagaki-v3.0.2) (2023-07-14)


### Bug Fixes

* Update marked to latest and add heading id parsing. ([#223](https://www.github.com/blinkk/amagaki/issues/223)) ([d22aba9](https://www.github.com/blinkk/amagaki/commit/d22aba9cd73196e0e389d424cac37b8297b6c5b3))

### [3.0.1](https://www.github.com/blinkk/amagaki/compare/amagaki-v3.0.0...amagaki-v3.0.1) (2023-04-21)


### Bug Fixes

* Remove extra threshold reporting to clean up default builds. ([#219](https://www.github.com/blinkk/amagaki/issues/219)) ([48f90e7](https://www.github.com/blinkk/amagaki/commit/48f90e71efd4cfb7c308908178ab3183f50b4ed4))
* Update spelling for error message. ([#220](https://www.github.com/blinkk/amagaki/issues/220)) ([6b1d19c](https://www.github.com/blinkk/amagaki/commit/6b1d19c15ad4a2934556b2846c550ffaac912dc3))

## [3.0.0](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.2.3...amagaki-v3.0.0) (2023-03-22)


### ⚠ BREAKING CHANGES

* Change `afterRender` hook to be a sync trigger. (#214)

### Bug Fixes

* Change `afterRender` hook to be a sync trigger. ([#214](https://www.github.com/blinkk/amagaki/issues/214)) ([99ce31a](https://www.github.com/blinkk/amagaki/commit/99ce31ad4be727d3a08977f4ff8cb31d246b88c7))
* Fix issue with uncaught exceptions from timers. ([#215](https://www.github.com/blinkk/amagaki/issues/215)) ([85db1a5](https://www.github.com/blinkk/amagaki/commit/85db1a54d7fd9d094083afc9640303ab409c8070))
* Update nunjucks to use async for render functions. ([#217](https://www.github.com/blinkk/amagaki/issues/217)) ([3084ae9](https://www.github.com/blinkk/amagaki/commit/3084ae9da0a0b2c978db5341a03a4c6d101a5a1a))

### [2.2.3](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.2.2...amagaki-v2.2.3) (2023-03-13)


### Bug Fixes

* alt text will only show once on a11y highlighter ([13ade79](https://www.github.com/blinkk/amagaki/commit/13ade7902ce179fbd3e5901820d0a7b8f829afbc))

### [2.2.2](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.2.1...amagaki-v2.2.2) (2022-07-10)


### Bug Fixes

* nested LocalizableData objects [#204](https://www.github.com/blinkk/amagaki/issues/204) ([6f7906b](https://www.github.com/blinkk/amagaki/commit/6f7906bb2bea67ff65a06ff4c6701279d0985435))

### [2.2.1](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.2.0...amagaki-v2.2.1) (2022-06-16)


### Bug Fixes

* allow for setting the document path to null to disable ([#202](https://www.github.com/blinkk/amagaki/issues/202)) ([d50c6e1](https://www.github.com/blinkk/amagaki/commit/d50c6e19061d7cb8deaeb2137aced42e37dff790))

## [2.2.0](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.1.7...amagaki-v2.2.0) (2022-05-24)


### Features

* plugin hook for `afterRender` for changing contents after rendering. ([#199](https://www.github.com/blinkk/amagaki/issues/199)) ([c91c895](https://www.github.com/blinkk/amagaki/commit/c91c89517fd5815345078caa53250115be43398e))

### [2.1.7](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.1.6...amagaki-v2.1.7) (2022-04-06)


### Bug Fixes

* skip empty partials ([#198](https://www.github.com/blinkk/amagaki/issues/198)) ([c735ec5](https://www.github.com/blinkk/amagaki/commit/c735ec58fdd34d2866aa530aa50e4f5ed908c695))

### [2.1.6](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.1.5...amagaki-v2.1.6) (2022-03-23)


### Bug Fixes

* issue setting environment using the cli ([#192](https://www.github.com/blinkk/amagaki/issues/192)) ([564af87](https://www.github.com/blinkk/amagaki/commit/564af87d4aee72e745592968accbe958baaebbee))

### [2.1.5](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.1.4...amagaki-v2.1.5) (2022-03-22)


### Bug Fixes

* support dumping pod references into yaml ([f8fad61](https://www.github.com/blinkk/amagaki/commit/f8fad6172f3b3c43f32ee82d8355356c63836ad6))

### [2.1.4](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.1.3...amagaki-v2.1.4) (2022-03-21)


### Bug Fixes

* no-op change to trigger re-release ([fac2b77](https://www.github.com/blinkk/amagaki/commit/fac2b77fd88d1494983a84c09bd7895bdc59cd48))

### [2.1.3](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.1.2...amagaki-v2.1.3) (2022-03-18)


### Bug Fixes

* clear module cache on all observed code changes ([32508ad](https://www.github.com/blinkk/amagaki/commit/32508ad6b71b70e490433ec57d2ae39886edd7c7))

### [2.1.2](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.1.1...amagaki-v2.1.2) (2022-03-17)


### Bug Fixes

* debounce reload and cache reset ([de5d220](https://www.github.com/blinkk/amagaki/commit/de5d22059fc128e070cfab016afa624be7ab2ea0))

### [2.1.1](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.1.0...amagaki-v2.1.1) (2022-03-17)


### Bug Fixes

* issues reloading servers with custom routes ([8a1725c](https://www.github.com/blinkk/amagaki/commit/8a1725cf44644c801f38e894598285242f25ba8e))

## [2.1.0](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.0.1...amagaki-v2.1.0) (2022-03-15)


### Features

* add addRoute shortcut for adding custom routes ([#179](https://www.github.com/blinkk/amagaki/issues/179)) ([77512c2](https://www.github.com/blinkk/amagaki/commit/77512c25fdb36c952e32a185ef8e66af87ace3e3))

### [2.0.1](https://www.github.com/blinkk/amagaki/compare/amagaki-v2.0.0...amagaki-v2.0.1) (2022-03-03)


### Bug Fixes

* case-insensitive built in partial paths ([703e57f](https://www.github.com/blinkk/amagaki/commit/703e57fdfb7d159e95883c3c097a39a535628fbc))

## [2.0.0](https://www.github.com/blinkk/amagaki/compare/amagaki-v1.12.1...amagaki-v2.0.0) (2022-02-24)


### ⚠ BREAKING CHANGES

* add `amagaki export` command

### Features

* add `amagaki export` command ([eeaa653](https://www.github.com/blinkk/amagaki/commit/eeaa653010e7d8a395303f817ac4804d2dffd0ad)), closes [#139](https://www.github.com/blinkk/amagaki/issues/139)

### [1.12.1](https://www.github.com/blinkk/amagaki/compare/amagaki-v1.12.0...amagaki-v1.12.1) (2022-02-21)


### Bug Fixes

* trigger release-please for package ([c75968f](https://www.github.com/blinkk/amagaki/commit/c75968ff8f3b46c5ad3efc0e847ea0741d3eb523))

## [1.12.0](https://www.github.com/blinkk/amagaki/compare/amagaki-v1.11.0...amagaki-v1.12.0) (2022-02-21)


### Features

* add amagaki-engine-preact ([50ee2be](https://www.github.com/blinkk/amagaki/commit/50ee2be40672680fcbaa3a96010c831c1be794a4))


### Bug Fixes

* improve server reloading error tolerance ([067ccb5](https://www.github.com/blinkk/amagaki/commit/067ccb5de07f084765315230f0f360f1bcc0e635))

## [1.11.0](https://www.github.com/blinkk/amagaki/compare/amagaki-v1.10.2...amagaki-v1.11.0) (2022-02-19)


### Features

* add compression to dev server ([89d19c3](https://www.github.com/blinkk/amagaki/commit/89d19c3b1c22cde7595f0c1206b80422a1833b24)), closes [#143](https://www.github.com/blinkk/amagaki/issues/143)

### [1.10.2](https://www.github.com/blinkk/amagaki/compare/amagaki-v1.10.1...amagaki-v1.10.2) (2022-02-19)


### Miscellaneous Chores

* release 10.10.2 ([dc74277](https://www.github.com/blinkk/amagaki/commit/dc74277c70ae364abd7aebc0e0de5cb0807f2e83))

### [1.10.1](https://www.github.com/blinkk/amagaki/compare/v1.10.0...v1.10.1) (2022-02-10)


### Bug Fixes

* support document-level defaultLocale ([f5cfdc1](https://www.github.com/blinkk/amagaki/commit/f5cfdc1487cae1db763a0636be422231e41b30a0))

## [1.10.0](https://www.github.com/blinkk/amagaki/compare/v1.9.1...v1.10.0) (2022-01-31)


### Features

* automatically find open port when using dev server [#136](https://www.github.com/blinkk/amagaki/issues/136) ([7b368a2](https://www.github.com/blinkk/amagaki/commit/7b368a2c65ac689824439861b4b366d3662fa5ba))


### Bug Fixes

* update deepWalk dependency ([d89fdee](https://www.github.com/blinkk/amagaki/commit/d89fdeea1f6757e664ab7033da3137c62c12b269))

### [1.9.1](https://www.github.com/blinkk/amagaki/compare/v1.9.0...v1.9.1) (2022-01-21)


### Bug Fixes

* color output in console [#134](https://www.github.com/blinkk/amagaki/issues/134) ([346be78](https://www.github.com/blinkk/amagaki/commit/346be78238a8e6fd5cd287b9b943b909e104e08e))

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
