# Upgrading

## Grow.dev

Amagaki is largely based on Grow, a Python static site generator that shares similar goals. Grow projects overlap significantly with Amagaki projects.

- All frontend JavaScript and CSS can be reused, because Grow and Amagaki are both static site generators and not frontend frameworks.
- Projects share the same structure. Projects are called "pods", content is in `/content` and views (templates) are in `/views`.

### New features from Grow.dev

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

### Key differences from Grow.dev

- Instant dev server startup. All routing and document instantiation is done
  lazily. The dev server starts instantly.

- Focus on minimizing memory usage when building both one and multiple pages.
  Memory usage outputted after builds are complete. Static files are
  streamed/copied rather than rendered into memory.

- Removal of implicit `@locale`-based localized content management in YAML
  files. `@locale`-based content management is still supported, but usage is via a custom YAML type.

#### Grow.dev localization example

```
# /content/pages/index.yaml
foo: Hello World
foo@ja_JP: こんにちは世界

# /views/base.html
{{doc.foo}}
```

#### Amagaki localization example
```
# /content/pages/index.yaml
foo: !IfLocale
  default: Hello World
  ja_JP: こんにちは世界

# /views/base.njk
{{doc.fields.foo}}
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

### Breaking changes

- `_blueprint.yaml` is now `_collection.yaml`
- `podspec.yaml` is now `amagaki.ts`
- `!g.doc`, `!g.static`, `!g.yaml`, etc. are now `!pod.doc`, `!pod.staticFile`, `!pod.yaml`
- `!g.string` is now `!pod.string` which is similar but has more features
- `.grow/index.proto.json` is now `.amagaki/build.json` (the `files`, `commit`, and `branch` values are preserved. the `deployed` key is changed to `built` and the `author` key is removed as it is a duplicate of the `commit.author` value)
- Translations are stored in `/locales` and use a proprietary YAML file format. PO files are abandoned.

### What about the Live Editor (grow-ext-editor)?

A new version of the live editor is being created that will support amagaki projects.