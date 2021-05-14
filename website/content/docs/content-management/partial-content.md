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

## The partial loop

Within a content document, the partial loop is represented by a list of
partials, like this:

{% filter codeTabs %}
```yaml
# ...
partials:
# Renders: /views/partials/hero.njk
# Loads:   /src/sass/partials/hero.sass
- partial: hero  
  headline: Page headline
# Renders: /views/partials/spacer.njk
# Loads:   /src/sass/partials/spacer.sass
- partial: spacer
# Renders: /views/partials/columns.njk
# Loads:   /src/sass/partials/columns.sass
- partial: columns
  header:
    headline: Columns headline
    body: Columns body.
  columns: 
  - headline: Column 1 headline
  - headline: Column 2 headline
```
{% endfilter %}

Within Amagaki’s default base template, the content document’s partials are
looped over, rendering one at a time. Each partial’s rendering context is
populated by its content from the partial loop:

{%  filter codeTabs %}{% raw %}
```nunjucks
<div class="columns">
  <div class="columns__header">
    <div class="columns__header__headline">
      {{partial.header.headline}}
    </div>
    <div class="columns__header__body">
      {{partial.header.body}}
    </div>
  </div>
  <div class="columns__columns">
    {% for column in partial.columns %}
      <div class="columns__columns__column">
        {{column.headline}}
      </div>
    {% endfor %}
  </div>
</div>
```
{% endraw %}{% endfilter %}

In summary, each document should be rendered as an assembly of partials, with an
overall anatomy of:

*   The list of partials within the document
*   The data within each partial in the partial loop
*   The partial template – within `/views/partials/<partial>`
*   The partial templates CSS – within `/src/sass/partials/<partial>`

As your site evolves over time, you can easily create new partials, mix and
match partials, and manage them all independently of one another. Note that even
if a page has a section that will never be reused on another page, you should
still build that page as a list of partials for consistency.
