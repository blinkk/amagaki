---
title: Partial content
order: 7
---
# Partial content

One of the most important concepts with Amagaki is the partial loop. Most pages
on marketing and informational websites are assembled by mixing and matching
reusable sections or templates – in Amagaki, these are called partials.

A partial is a reusable, content-agnostic template that is designed to be
reused, mixed, and matched in pages. Partials are meant to be independent of one
another and completely isolated such that there are minimal, or no dependencies
beyond the content injected into the partial.

Within a content document, the partial loop is represented by a list of
partials, like this:


```
...
partials:

- partial: hero  # Maps to /views/partials/hero.njk
  headline: Hello World!

- partial: spacer  # Maps to /views/partials/spacer.njk

- partial: columns  # Maps to /views/partials/columns.njk
  columns: 
  - headline: Column 1 headline
  - headline: Column 2 headline
```

Within Amagaki’s default base template, the content document’s partials are
looped over, rendering one at a time. Each partial’s rendering context
(`{{partial}}`) is populated by its content from the partial loop.

In summary, each document should be rendered as an assembly of partials, with an
overall anatomy of:

*   The list of partials within the document
*   The data within each partial in the partial loop
*   The partial template – within /views/partials/&lt;partial>
*   The partial templates CSS – within /src/sass/partials/&lt;partial>

As your site evolves over time, you can easily create new partials, mix and
match partials, and manage them all independently of one another. Note that even
if a page has a section that will never be reused on another page, you should
still build that page as a list of partials for consistency.
