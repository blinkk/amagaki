---
title: Template variables and context
order: 1
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

- doc.fields – containing front matter
- doc.body – containing the body (i.e. for Markdown or HTML documents)
- doc.collection – a reference to the document’s collection
- doc.locale – a reference to the document's locale

{{button.button({
    label: 'Read Document API Reference',
    url: 'TODO',
    external: true,
    class: 'button button--tonal',
    icon: 'launch'
})}}

### pod

A reference to the pod. All pod functions are available from the `pod` object,
which can be invoked from your templates. Some commonly used ones are:

- pod.env: Returns the current rendering environment
- pod.doc(...): Returns a document object
- pod.docs(...): Returns a list of documents
- pod.collection(...): Returns a collection object
- pod.collections(...): Returns a list of collections
- pod.staticFile(...): Returns a static file object

{{button.button({
    label: 'Read Pod API Reference',
    url: 'TODO',
    external: true,
    class: 'button button--tonal',
    icon: 'launch'
})}}

### route

A reference to the route binding the URL to the document. Commonly used
properties of the route are:

- route.url 
- route.fields
- route.params

{{button.button({
    label: 'Read Route API Reference',
    url: 'TODO',
    external: true,
    class: 'button button--tonal',
    icon: 'launch'
})}}