---
title: Content types
order: 2
---
# Supported content types

In Amagaki, you can mix and match content types depending on the file type that
is best suited for your data. For example, typically long-form content such as
blog posts will be authored as Markdown. Pages assembled by mixing and matching
modules will be YAML files (containing a list of partials used on a page).

Amagaki supports the following content types:

*   JSON
*   MD
*   YAML

All "long-form" content types support front matter. Front matter is used to
define additional metadata for documents, and can be used to specify a
document’s URL, template, or other properties.

Here’s what a Markdown document with front matter may look like:

```
---
title: Hello World
date: 2019-01-06
description: This was my first day!
---
## My story

Hello, everyone. Today was my first day. I had a great day today. As a reminder, this is Markdown content.
```

Here’s what a blueprint (`_collection.yaml`) may look like:

```
$path: /posts/${doc.date}/
$view: /views/base.njk
```

In the above example, the blueprint is declaring that:

*   All documents in the collection should be rendered with the
    `/views/base.njk` template.
*   All documents in the collection should be generated to the path:
    `/posts/${doc.date}/`

In this example, to add a new post to your site, you simply add a new Markdown
file within the collection’s folder.

If your project has the following structure, it will then generate three pages.
The pages all use the `$path` settings specified in `_collection.yaml`.

```
.
└── content
    ├── pages
        ├── _collection.yaml
        ├── about.yaml
        ├── contact.yaml
        └── index.yaml
```