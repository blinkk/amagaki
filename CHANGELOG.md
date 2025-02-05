# Changelog

## [1.10.2](https://github.com/blinkk/amagaki/compare/v1.10.1...v1.10.2) (2025-02-05)


### ⚠ BREAKING CHANGES

* Change `afterRender` hook to be a sync trigger. ([#214](https://github.com/blinkk/amagaki/issues/214))
* add `amagaki export` command

### Features

* add `amagaki export` command ([eeaa653](https://github.com/blinkk/amagaki/commit/eeaa653010e7d8a395303f817ac4804d2dffd0ad)), closes [#139](https://github.com/blinkk/amagaki/issues/139)
* add ability to build page builder pages from routes ([#188](https://github.com/blinkk/amagaki/issues/188)) ([3002404](https://github.com/blinkk/amagaki/commit/3002404c8852eb5e0c91ef187ff5f47a83c07120))
* add ability to customize class on main element [#173](https://github.com/blinkk/amagaki/issues/173) ([a0cb6f9](https://github.com/blinkk/amagaki/commit/a0cb6f9f9d0138f2c08ee89712d8c61d915f4ff4))
* add addRoute shortcut for adding custom routes ([#179](https://github.com/blinkk/amagaki/issues/179)) ([77512c2](https://github.com/blinkk/amagaki/commit/77512c25fdb36c952e32a185ef8e66af87ace3e3))
* add amagaki-engine-preact ([50ee2be](https://github.com/blinkk/amagaki/commit/50ee2be40672680fcbaa3a96010c831c1be794a4))
* add compression to dev server ([89d19c3](https://github.com/blinkk/amagaki/commit/89d19c3b1c22cde7595f0c1206b80422a1833b24)), closes [#143](https://github.com/blinkk/amagaki/issues/143)
* add dropdown menu to module inspector ([#176](https://github.com/blinkk/amagaki/issues/176)) ([9682069](https://github.com/blinkk/amagaki/commit/968206915fa6e0d26c61ea5108ce7863a8d82b0e))
* add image inspector ([#211](https://github.com/blinkk/amagaki/issues/211)) ([6db732d](https://github.com/blinkk/amagaki/commit/6db732ddeb297de455acc5fc55dabd3c9cbb7e4f))
* add localized urls to top-level sitemap ([ff1c0b2](https://github.com/blinkk/amagaki/commit/ff1c0b2440c3695912fdbe553116393ad47f2fd5))
* add partial hydrater to preact engine ([#151](https://github.com/blinkk/amagaki/issues/151)) ([61d8391](https://github.com/blinkk/amagaki/commit/61d8391c5c294900dea93a9f3ee686526cd3aae0))
* add placeholder when module is missing ([#178](https://github.com/blinkk/amagaki/issues/178)) ([aae5356](https://github.com/blinkk/amagaki/commit/aae53569b44c742e155878b0e6a4779f026d3bf8))
* import `amagaki-plugin-page-builder` to monorepo ([650e914](https://github.com/blinkk/amagaki/commit/650e914045353c99a775ec49bb899567bf458100))
* plugin hook for `afterRender` for changing contents after rendering. ([#199](https://github.com/blinkk/amagaki/issues/199)) ([c91c895](https://github.com/blinkk/amagaki/commit/c91c89517fd5815345078caa53250115be43398e))
* support appended site name in og:title ([748d6f5](https://github.com/blinkk/amagaki/commit/748d6f5c9ad152fbb69fd37f8b0696e5aac53a27))
* support appended site name in og:title ([748d6f5](https://github.com/blinkk/amagaki/commit/748d6f5c9ad152fbb69fd37f8b0696e5aac53a27))
* support appended site name in og:title ([748d6f5](https://github.com/blinkk/amagaki/commit/748d6f5c9ad152fbb69fd37f8b0696e5aac53a27))
* support appended site name in og:title ([748d6f5](https://github.com/blinkk/amagaki/commit/748d6f5c9ad152fbb69fd37f8b0696e5aac53a27))
* support appended site name in og:title ([748d6f5](https://github.com/blinkk/amagaki/commit/748d6f5c9ad152fbb69fd37f8b0696e5aac53a27))
* use absolute paths for 404 pages ([0e1adaa](https://github.com/blinkk/amagaki/commit/0e1adaaab0fb3ccebdae1c3c7820443901c102e5))
* Use mangled plugin for email addresses ([#225](https://github.com/blinkk/amagaki/issues/225)) ([ce645ad](https://github.com/blinkk/amagaki/commit/ce645add64a2f6c9bfdaf1493d4a0d832003df06))


### Bug Fixes

* ability to disable footer and add test [#194](https://github.com/blinkk/amagaki/issues/194) ([a083e6e](https://github.com/blinkk/amagaki/commit/a083e6eeb8da86f64bf461d010c350140100a42d))
* add aria-hidden to the page module inspector ([899223c](https://github.com/blinkk/amagaki/commit/899223cf6699a925d6dd98b094c3d87a608bb7f5))
* all ui dependencies for page builder plugin ([6fb2000](https://github.com/blinkk/amagaki/commit/6fb2000687622e238f00323a4521512fc52594b8))
* allow for setting the document path to null to disable ([#202](https://github.com/blinkk/amagaki/issues/202)) ([d50c6e1](https://github.com/blinkk/amagaki/commit/d50c6e19061d7cb8deaeb2137aced42e37dff790))
* alt text will only show once on a11y highlighter ([13ade79](https://github.com/blinkk/amagaki/commit/13ade7902ce179fbd3e5901820d0a7b8f829afbc))
* amagaki-engine-preact package ([f7abfd5](https://github.com/blinkk/amagaki/commit/f7abfd517c443270f66d8e3caad394436625b2f4))
* build output ([ae32be2](https://github.com/blinkk/amagaki/commit/ae32be21c307607b1d5ef33f558c3b752760167c))
* case-insensitive built in partial paths ([703e57f](https://github.com/blinkk/amagaki/commit/703e57fdfb7d159e95883c3c097a39a535628fbc))
* Change `afterRender` hook to be a sync trigger. ([#214](https://github.com/blinkk/amagaki/issues/214)) ([99ce31a](https://github.com/blinkk/amagaki/commit/99ce31ad4be727d3a08977f4ff8cb31d246b88c7))
* clear module cache on all observed code changes ([32508ad](https://github.com/blinkk/amagaki/commit/32508ad6b71b70e490433ec57d2ae39886edd7c7))
* debounce reload and cache reset ([de5d220](https://github.com/blinkk/amagaki/commit/de5d22059fc128e070cfab016afa624be7ab2ea0))
* dependency issue with release-please ([f3d2eeb](https://github.com/blinkk/amagaki/commit/f3d2eeb7b3229fcf331888826aaccc398c9e0feb))
* duplicate parenthesis in inspector ([28090f3](https://github.com/blinkk/amagaki/commit/28090f38be962abf1ee9c5c226ebc52c66e9feb7))
* environment issue with route-generated canonical URLs ([833e067](https://github.com/blinkk/amagaki/commit/833e06750f857e0eae2bb1b947207d593bca7655))
* escaped markdown in team section ([1f5bcda](https://github.com/blinkk/amagaki/commit/1f5bcdaeec30a598e84e160ced605aa18f22874c))
* Fix issue with uncaught exceptions from timers. ([#215](https://github.com/blinkk/amagaki/issues/215)) ([85db1a5](https://github.com/blinkk/amagaki/commit/85db1a54d7fd9d094083afc9640303ab409c8070))
* improve server reloading error tolerance ([067ccb5](https://github.com/blinkk/amagaki/commit/067ccb5de07f084765315230f0f360f1bcc0e635))
* improve support for custom header/footer ([7f50313](https://github.com/blinkk/amagaki/commit/7f50313d00eaecc842c793e2edcdf85f94ded92b))
* issue setting environment using the cli ([#192](https://github.com/blinkk/amagaki/issues/192)) ([564af87](https://github.com/blinkk/amagaki/commit/564af87d4aee72e745592968accbe958baaebbee))
* issue with !IfEnvironment and falsy values ([c4ca106](https://github.com/blinkk/amagaki/commit/c4ca10647da0d08b8148e049425acd0962e4e4c5))
* issues reloading servers with custom routes ([8a1725c](https://github.com/blinkk/amagaki/commit/8a1725cf44644c801f38e894598285242f25ba8e))
* make it possible for header and footer to entirely be disabled ([1e8378b](https://github.com/blinkk/amagaki/commit/1e8378be45c4cdc250a3f98ca64109b4fbbb8aa8))
* move grid instantiation to firstUpdated ([58398ca](https://github.com/blinkk/amagaki/commit/58398ca5d831fd1ba02f2609ce65f1166bb177e9))
* nested LocalizableData objects [#204](https://github.com/blinkk/amagaki/issues/204) ([6f7906b](https://github.com/blinkk/amagaki/commit/6f7906bb2bea67ff65a06ff4c6701279d0985435))
* no-op change to trigger re-release ([fac2b77](https://github.com/blinkk/amagaki/commit/fac2b77fd88d1494983a84c09bd7895bdc59cd48))
* no-op change to trigger release ([8bf06b3](https://github.com/blinkk/amagaki/commit/8bf06b35ef3a39b38426892657b63216feb6e7fe))
* permit loading scripts with defer/async ([4db8319](https://github.com/blinkk/amagaki/commit/4db8319385f686ffc440f0de1da61d11c4d8be64))
* release-please config ([a030587](https://github.com/blinkk/amagaki/commit/a0305870e4b3ae2a2bde42f3adcf371c02f54af2))
* Remove extra threshold reporting to clean up default builds. ([#219](https://github.com/blinkk/amagaki/issues/219)) ([48f90e7](https://github.com/blinkk/amagaki/commit/48f90e71efd4cfb7c308908178ab3183f50b4ed4))
* remove node-workspace from release-please ([4bc7f68](https://github.com/blinkk/amagaki/commit/4bc7f688af48afa41e1d4621177524e161f43353))
* skip empty partials ([#198](https://github.com/blinkk/amagaki/issues/198)) ([c735ec5](https://github.com/blinkk/amagaki/commit/c735ec58fdd34d2866aa530aa50e4f5ed908c695))
* support dumping pod references into yaml ([f8fad61](https://github.com/blinkk/amagaki/commit/f8fad6172f3b3c43f32ee82d8355356c63836ad6))
* support object renaming in hydrator ([#174](https://github.com/blinkk/amagaki/issues/174)) ([66c20ab](https://github.com/blinkk/amagaki/commit/66c20abb46952c8b39efaedaba01dedd231b0d64))
* trigger release-please for package ([c75968f](https://github.com/blinkk/amagaki/commit/c75968ff8f3b46c5ad3efc0e847ea0741d3eb523))
* Update marked to latest and add heading id parsing. ([#223](https://github.com/blinkk/amagaki/issues/223)) ([d22aba9](https://github.com/blinkk/amagaki/commit/d22aba9cd73196e0e389d424cac37b8297b6c5b3))
* Update nunjucks to use async for render functions. ([#217](https://github.com/blinkk/amagaki/issues/217)) ([3084ae9](https://github.com/blinkk/amagaki/commit/3084ae9da0a0b2c978db5341a03a4c6d101a5a1a))
* Update PluginConstructor to use a generic constructor signature ([#229](https://github.com/blinkk/amagaki/issues/229)) ([016e56f](https://github.com/blinkk/amagaki/commit/016e56fc5a008d67a6a1348f6664bfb1e8443e90))
* Update spelling for error message. ([#220](https://github.com/blinkk/amagaki/issues/220)) ([6b1d19c](https://github.com/blinkk/amagaki/commit/6b1d19c15ad4a2934556b2846c550ffaac912dc3))
* update style of inspector for spacers ([517267b](https://github.com/blinkk/amagaki/commit/517267ba25873bdaeeaf30fcbdb5ddad65449222))


### Miscellaneous Chores

* release 10.10.2 ([dc74277](https://github.com/blinkk/amagaki/commit/dc74277c70ae364abd7aebc0e0de5cb0807f2e83))
