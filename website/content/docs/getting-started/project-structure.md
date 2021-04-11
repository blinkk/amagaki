---
title: Project structure
order: 2
---
# Project structure

Like most website generators, Amagaki assumes a directory structure and produces
HTML by determining your website’s URL routes, then binding content files to
template files for each URL route it must generate.

**Pods and pod paths**

Amagaki projects are referred to as “pods”, which indicates operating within a
directory containing the elements outlined below. When using Amagaki objects to
build your site, they are generally referenced through an instance of a `Pod`
object.

{{button.button({
    label: 'Read Pod API Reference',
    url: 'TODO',
    external: true,
    class: 'button button--tonal',
    icon: 'launch'
})}}

Throughout this manual, and throughout Amagaki functions, we always refer to
files using their “pod path”. A file’s pod path is mounted at the site root.
Sample pod paths may resemble: `/content/docs/pages/index.yaml`, `/views/base.njk`,
etc.

**Pod structure**

The following elements are the foundation of Amagaki projects:

```
.
├── amagaki.js
├── build
├── content
├── locales
├── src
├── plugins
└── views
```

An explanation for each element is below:

**amagaki.js**

The primary configuration file for your Amagaki site. While this configuration
file is optional, it facilitates configuration of site-wide settings, such as
the locales, path behavior (URL root/mount point for pages and assets), build
environments, and plugins.

{{button.button({
    label: 'Learn more about configuration',
    url: pod.doc('/content/docs/getting-started/configuration.md').url.path,
    class: 'button button--low',
    icon: 'arrow_forward'
})}}


**build**

The output directory for the build process. Equivalent to the “dist” folder for
many JavaScript projects. When `npx amagaki build` is invoked, all generated
files are placed within this directory. In addition to generated files, Amagaki
will also generate metrics and a manifest, which can be used for deployment.


{{button.button({
    label: 'Learn more about the CLI',
    url: pod.doc('/content/docs/getting-started/cli.md').url.path,
    class: 'button button--low',
    icon: 'arrow_forward'
})}}


**content**

Contains all content for your website. Within this folder, there will be
subfolders – one per collection. Collections hold documents, and
_collection.yaml “blueprint” files that describe shared behavior for content
within a collection. Collections themselves can have subcollections to describe
content hierarchy.

{{button.button({
    label: 'Learn more about documents and collections',
    url: pod.doc('/content/docs/content-management/documents-and-collections.md').url.path,
    class: 'button button--low',
    icon: 'arrow_forward'
})}}


**locales**

Contains translations, with one file per locale. Within each file you will find
translation strings, which map source strings to their translations. When the
site is built, the locale files are updated with the record of all strings used.
Translations can be added to these files, or they can be used with the
translation request workflow to acquire translations from translators.

{{button.button({
    label: 'Learn more about translations',
    url: pod.doc('/content/docs/localization/managing-translations.md').url.path,
    class: 'button button--low',
    icon: 'arrow_forward'
})}}


**plugins**

Contains project-local JavaScript plugins for extending Amagaki functionality.
Plugins are configured and registered in `amagaki.js`.

**src**

Contains frontend code and dependencies, such as Sass files, TypeScript files,
and media. You are generally free to customize your frontend stack how you
prefer; our starter project makes some recommendations and Amagaki has some
defaults as well.

**views**

Contains template files. By default, Amagaki ships with Nunjucks templates.
Typically, our recommended approach is to have a `base.njk` file which handles
generating the HTML “frame” or outlet, and a subfolder named `partials` that
contains modules that can be mixed and matched across pages.

{{button.button({
    label: 'Learn more about template engines',
    url: pod.doc('/content/docs/templates/template-engines.md').url.path,
    class: 'button button--low',
    icon: 'arrow_forward'
})}}
