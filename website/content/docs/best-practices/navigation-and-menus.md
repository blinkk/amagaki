---
title: Creating navigation or menus
---
# Creating navigation or menus

Navigation and menus can be created manually or automatically. We generally
recommend creating headers and footers manually by managing links within partial
header and footer files, whereas tables of contents, or menus for content-heavy
sites should be automatically generated.

**Manually generating menus**

Assume we are creating a header menu. First, create a partial file that can be
used to store the header’s content:


```
partial: header
title: My Website
menu:
- doc: !pod.doc /content/pages/index.yaml
  title: Home
- doc: !pod.doc /content/pages/index.yaml
```


Next, create a template to render this content: \
 \
Finally, use a code snippet to render the template:

**Automatically generating menus**

Assume we are creating a table of contents allowing the user to navigate through
various categories of page content. First, create your content structure:

Second, ensure that each `_collection.yaml` file has fields populated, with
appropriate titles and orders.

Last, use a code snippet to render the menu:

TODO
