# Contributing

Thank you so much for contributing to this project! Our mission is to streamline
website production. We aim to provide a lean developer tool that is easily
installable, runnable, and usable for either small or big interactive projects.

Amagaki doesn't intend to be the next big frontend framework – in fact, it's not
a frontend framework at all. We want to:

- Generate static HTML
- Provide developers with a platform for bringing their own client-side frontend
  stack
- Allow developers to focus on building UIs and reduce thinking about content
  management
- Facilitate content management best practices and localization
- Include an appropriate amount of functionality within Amagaki's core and
  provide developers with a clear way to extend their projects with site-level
  plugins

Keep the above in mind when adding features to Amagaki!

## Philosophy

- Write as little code as possible, but as much as necessary to complete a task
  correctly.
- Avoid introducing new dependencies as much as possible. The core project
  should be kept slim/lean. Installing Amagaki should install as few
  sub-packages as possible.
- Group code logically by file. A new contributor should be able to quickly
  understand the project structure and where to go to make code changes or
  enhancements – having too many files reduces scannability of the codebase.
  - Avoid creating new files that have just one function. Avoid creating new
    files to contain shared code until that code is used in more than one
    location.
- Provide site developers with insights into best practices for building out
  their own sites. Statistics such as memory usage, file size, page metrics
  should be readily available to developers.
- The design of Amagaki itself should encourage developers to follow best
  practices with respect to content management and project structure.
- Things should work "out of the box" for developers as frequently as possible.

## Requirements

- New features should avoid memory bloat. Amagaki should boot and serve with the
  same speed when generating just one page to one million pages.
- Amagaki should scale: builds should be as fast as possible, use as little
  memory as possible and scale to at least tens of thousands of pages.
- Avoid adding noise or extraneous information to command line utility output or
  visual UIs.
- Make error messages clear and helpful. Put yourself in the user's shoes. When
  encountering a problem, an error message should provide the user with a path
  to fixing the error.

## Writing and style

- Be concise and consistent.
- Include as few words as possible to convey what you're trying to say.
- Use "Sentence case" for titles and labels. Avoid "Title Case" for labels.
- Variable and function names should be concise but self-explanatory.

## Commit messages

[Release Please](https://github.com/googleapis/release-please) is used to
automatically create changelogs, releases, and versions.

- Commit messages must follow the [Conventional
  Commit](https://www.conventionalcommits.org/en/v1.0.0/) specification
- Follow the [Angular
  convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type)
  to see all commit types

## Pull request flow

- Avoid merge commits. Use the "rebase and merge" strategy or "squash and merge"
  strategy (preferred for larger features or commits).
- Preserve the PR# in commit message subjects so the relevant discussion can be
  found later.
- Commits that can be merged directly to `main`:
  - Comments/documentation
  - Implementing functionality that has already been scaffolded
  - Tests
  - Code style fixes/improvements
  - Cleanup or removal of dead code
- Commits that should be sent via pull requests:
  - Designing new user-facing core features
  - Reworking the overall structure of several files or the internals of data structures
- When desinging new user-facing core features, send a draft pull request early
  so there is visibility into the development and rationale, and so that
  feedback can be provided.

## Development workflow

### Getting started

Note: Node version 10 or higher is required. We recommend using
[nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage Node
versions on your system.

1. Clone this project.
2. Run `npm install`.
3. Run `npm run dev` in one Terminal to start the watcher. The watcher invokes
   the TypeScript compiler when code is changed.
4. Run `node ./dist/src/index.js` to invoke the CLI from the local project
   directory.
5. Run `node ./dist/src/index.js build example` to test building the included
   example site.

### Running against other sites locally

Using `npm link`:

1. From Amagaki's root directory, run `npm link`. This tells NPM to "install
   Amagaki from this directory, instead of from npmjs.org" for any project that
   depends on Amagaki.
2. `cd` to the site's root directory.
3. Ensure `@amagaki/amagaki` is in the project's `package.json` dependencies.
4. Run `npm install`.
5. Invoking the `amagaki` command directly will now point to your local development
   version instead of the one hosted on npmjs.org.

To unlink (the order is important):

1. `cd` to the site's root directory.
2. Run `npm unlink --no-save @amagaki/amagaki`
3. `cd` to Amagaki's root directory.
4. Run `npm unlink`

Using a local install:

The `npm link` method is not compatible with invoking the `amagaki` commands
from npm scripts. For another site to depend on your local copy of Amagaki and
to run that local copy via an npm script, you'll need to temporarily install the
local Amagaki using: `npm install ~/path/to/amagaki/`.

Avoid committing any changes to `package.json` that depend on local files.

## Tips

- We recommend using VSCode or a similar editor that supports autofixing and
  displaying TypeScript and ESLint code hints.
- When using VSCode, we recommend the following extensions (see below).

```
dbaeumer.vscode-eslint
```

- When using VSCode, we recommend enabling "Fix All on Save" (see below).

```
# In VSCode's `settings.json`
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
},
```

## Other

- What does Amagaki mean? It's a variety of persimmon (sweet persimmon).
- How do I pronounce it? [("ahmuh-gah-key")](https://eng.ichacha.net/pronounce/amagaki.html)
