# Amagaki

Amagaki is an experimental static site generator based on
[Grow.dev](https://grow.dev/).

## Key concepts

- TypeScript and Node
- Minimal core dependencies
- Inbuilt build metrics (memory usage, generated file size, routes, locales,
  translation recording)
- Multiple template languages (Nunjucks as default)
- Still a static site generator (not a frontend framework)
- Still renders pages at request time (unlike other static generators which
  watch and rebuild)
- Still has localization as an inbuilt feature

## New features from Grow.dev

- TypeScript and Node (with forced linting and autofixing) in the Amagaki
  codebase

- Route providers generate all routes. (`Document` and `StaticFile` as default).
  Can be expanded with custom route providers (i.e. for headless CMS). Because
  route providers are more pluggable, we can also more easily do more custom
  things like paginated (i.e. a `PaginatedCollectionProvider` or similar).

- Always-on translation recording. Missing strings are always recorded when
  building individual and bulk pages.

- Expanded options for URL formats. URL formats (i.e. `$path`) are interpolated
  JavaScript strings, so they are more customizable.

```
# In Amagaki
$path: /pages/${doc.basename.toLowerCase()}/
```

- More defaults for URLs, static file directories, and environments. Sites can
  be built without any configuration files as long as content and templates are
  in the right places.

- YAML types will be extendable via extensions. Site authors can create
  site-specific YAML types to improve consistency of content across the site.
  For example, a site author could create an `!Asset` type, that validates its
  properties and serializes into a custom `Asset` class defined in a custom
  TypeScript extension for the site.

- Can support multiple template languages or Markdown flavors.

- Need to prototype this: single-page client-side rendering (i.e. Amagaki in a
  Chrome tab). Theoretically, this would allow us to build an interactive editor
  that lets operators change content and see an instant preview of the changes
  (all without a backend server).

## What about the Live Editor (grow-ext-editor)?

We'll need to prototype this!

The server-side APIs that the Editor's frontend depends on can be rewritten as
an Amagaki extension and then plugged into Amagaki's dev server. We can then
pair the Editor frontend with the Amagaki server for page rendering.

If we want to pursue this route, we may need to "fork" the Editor or add
pluggable support for Amagaki's tags (i.e. `g.doc` -> `a.Doc`).

## Key differences from Grow.dev

- Instant dev server startup. All routing and document instantiation is done
  lazily. The dev server starts instantly.

- Focus on minimizing memory usage when building both one and multiple pages.
  Memory usage outputted after builds are complete. Static files are
  streamed/copied rather than rendered into memory.

- Removal of implicit `@locale`-based localized content management in YAML
  files. `@locale`-based content management is still supported, but usage in the
  template now must be explicit.

For example:

```
## /content/pages/index.yaml
foo: Hello World
foo@ja_JP: こんにちは世界

# In Grow.dev
## /views/base.html
{{doc.foo}}

# In Amagaki
{{l('doc.foo')}} or {{doc|l('foo')}}
```

- Removal of Babel and gettext translations; translations are now stored in
  proprietary YAML files which support additional translation request lifecycle
  behavior (i.e. "preferred" translations for ovewriting source copy without
  breaking translations and auto-extracting context for translators).

```
# In Grow.dev
{{_(doc.title)}}

# In Amagaki
{{doc.title|t}}
```

- Removal of `deployments` concept. Instead, all builds are assumed local.
  Environment options (i.e. dev, staging, prod URLs) are preserved from
  Grow.dev. Deployment to servers now managed as a separate post-build step.

- More minimal core. Preprocessor integrations (i.e. with Google Sheets) to be
  implemented as extensions.

A few proposed naming changes (TBD?):

- `_blueprint.yaml` is now `_collection.yaml`
- `podspec.yaml` is now `amagaki.yaml`
- `g.doc`, `g.static`, etc. are now `a.Doc`, `a.Static` etc.