---
title: Best practices
---
# Best practices {#best-practices}


## Creating links to pages {#creating-links-to-pages}

All internal links in Amagaki are declarative and dynamic. An Amagaki function
can and should always be used to generate internal links to your pages and
assets (or really, to anything that has a route).

Why? Using an Amagaki function to create a link to a page is more maintainable –
it ensures you’ll never have a broken link internally, and also empowers you to
change your URL format halfway through a project with few repercussions.

From your content, use a custom YAML type to refer to another document:


```
partials:
...
- button:
  label: Go home
  doc: !pod.doc /content/pages/index.yaml
...
```


Then, within a template:


```
{{partial.button.doc.url.path}}
```


Or, if you need to hardcode a link within a template, see below. Note this is
not advised as it begins to couple content to your views. It’s a best practice
to keep your content decoupled from your templates, so your content can be
easily managed later, and so your templates can be reused.


```
{{pod.doc('/content/pages/index.yaml').url.path}}
```


Remember, you should never hardcode internal links. To understand how to
configure the URLs for documents and static files, see the URLs section.


## Creating navigation or menus

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


## Creating breadcrumbs {#creating-breadcrumbs}

Leverage the `{{doc.collection.parents}}` property to dynamically create a
blueprint for the current document:


```
<ul>
  {% for collection in doc.collection.parents|reverse %}
    {% set firstDoc = collection.docs()|first %}
    <li><a href="{{firstDoc.url.path}}">{{firstDoc.fields.title}}</a></li>
    {% endfor %}
    <li><a href="{{collection.docs()|first.url.path}}">{{collection.docs()|first.fields.title}}</a></li>
```


Then, within a template:


```
{{partial.button.doc.url.path}}
```



## Categorizing pages {#categorizing-pages}

There are a variety of ways to categorize content. The simplest way would be to
use subcollections. To use subcollections, create a collection folder, and then
create a subcollection folder within that collection.

Here’s what a sample content structure may look like:


```
.
└── content
    └── posts
        ├── _collection.yaml
        ├── a
        |   ├── _collection.yaml
        |   └── post.md
        └── b
            ├── _collection.yaml
            └── post.md
```


To list categories within the `posts` collection:


```
pod.collection('/content/posts').subcollections
```


To list posts within a subcollection:


```
pod.collection('/content/posts/a').docs()
```


You can also use glob syntax to fetch posts from a specific category:


```
pod.docs(['/content/posts/**'])
```



## Using partials to assemble pages {#using-partials-to-assemble-pages}

In earlier portions of the documentation you learned about ways to manage
content, relationships between content, the rendering context, and templates.
Now, you can put this knowledge to use by leveraging the most powerful way to
assemble marketing pages – partials.

The concept of partials – both partial content, and partial templates – allow
you to architect reusable modules and insert different content into those
modules depending on their use case. All “modular pages” should be created by
mixing and matching various partial templates with partial content.

Partials have a few components:



*   The partial loop within the base template
*   Reusable partial templates
*   Reusable partial styles
*   Partial content

Partial content

The first step to 


## Restructuring data within templates {#restructuring-data-within-templates}
