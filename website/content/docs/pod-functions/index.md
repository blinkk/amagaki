---
title: Overview
order: 0
---
# Hello123  World

All Amagaki content is organized into collections, which themselves have blueprints, documents, and may have subcollections. Unlike other website generators, Amagaki does not assume a 1:1 relationship between content and pages. Understandably, you might have content that’s shared across pages (this type of content is typically called “partial” content)

You may architect your content in a way that makes most logical sense for your project, and decide later how to represent that content on pages. Documents and collections may specify URLs and bind themselves to templates, or they may not.

Here’s what a sample content structure may look like:

```
.
└── content
    ├── pages
    |   ├── _collection.yaml
    |   ├── about.yaml
    |   ├── contact.yaml
    |   └── index.yaml
    ├── partials
    |   ├── header.yaml
    |   └── footer.yaml
    └── posts
        ├── _collection.yaml
        ├── 2019-01-06.md
        ├── 2021-04-01.md
        └── 2021-08-08.md
```

In this example content structure:

- We generate three pages, generate three blog posts, and use two partial documents.
- Note partial content does not need `_collection.yaml` (the collection’s blueprint).
- Blueprints are only needed to define URLs; if documents aren’t meant to be generated into individual pages, no blueprint is necessary.
