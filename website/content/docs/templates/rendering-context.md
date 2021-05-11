---
title: Template variables and context
order: 2
---

# Template variables and rendering context

By default, Amagaki’s document route provider will render all documents
configured with URLs. Binding a URL to a document means “render me as a page”.
When Amagaki renders a document, it selects a template (either the pod’s default
template or a template bound to a collection), and renders it with a rendering
context.

## Template variables

Here is the top-level rendering context available when templates are rendered:

### doc

A reference to the current document being rendered. All properties of the
document are available. Some commonly used ones are:

- `doc.body` – The document's body (i.e. for Markdown or HTML documents)
- `doc.collection` – A reference to the document’s collection
- `doc.fields` – The document's front matter
- `doc.locale` – A reference to the document's locale

{{button.button({
    label: 'Read Document API Reference',
    url: 'https://blinkkcode.github.io/amagaki/api/classes/document.document-1.html',
    external: true,
    class: 'button button--low',
    icon: 'launch'
})}}

### pod

A reference to the pod. All pod functions are available from the `pod` object,
which can be invoked from your templates. Some commonly used ones are:

- `pod.collection(...)` – Returns a collection object
- `pod.collections(...)` – Returns a list of collections
- `pod.doc(...)` – Returns a document object
- `pod.docs(...)` – Returns a list of documents
- `pod.env` – Returns the current rendering environment
- `pod.staticFile(...)` – Returns a static file object

{{button.button({
    label: 'Read Pod API Reference',
    url: 'https://blinkkcode.github.io/amagaki/api/classes/pod.pod-1.html',
    external: true,
    class: 'button button--low',
    icon: 'launch'
})}}

### route

A reference to the route binding the URL to the document. Some commonly used
properties of the route are:

- `route.fields` – Any data fields added to the route (i.e. by a route provider)
- `route.params` – Any params used when matching the request to the route
- `route.url` – A reference to the document's Url object

{{button.button({
    label: 'Read Route API Reference',
    url: 'https://blinkkcode.github.io/amagaki/api/classes/router.route.html',
    external: true,
    class: 'button button--low',
    icon: 'launch'
})}}