---
title: Rendering context
---
# Rendering context and functions

By default, Amagaki’s document route provider will render all documents
configured with URLs. Binding a URL to a document means “render me as a page”.
When Amagaki renders a document, it selects a template (either the pod’s default
template or a template bound to a collection), and renders it with a rendering
context.

Here is the top-level rendering context: \



<table>
  <tr>
   <td>Template variable
   </td>
   <td>Description
   </td>
  </tr>
  <tr>
   <td>doc
   </td>
   <td>A reference to the current document being rendered. All properties of the document are available. Some commonly used ones are: \

<ol>

<li>doc.fields – containing front matter

<li>doc.body – containing the body (i.e. for Markdown or HTML documents)

<li>doc.collection – a reference to the document’s collection

<li>doc.locale

<p>
See API Reference for Document objects
</li>
</ol>
   </td>
  </tr>
  <tr>
   <td>route
   </td>
   <td>A reference to the route binding the URL to the document. Commonly used properties of the route are:
<ol>

<li>route.params

<li>route.fields

<p>
See API Reference for Route objects
</li>
</ol>
   </td>
  </tr>
  <tr>
   <td>pod
   </td>
   <td>A reference to the pod. All pod functions are available from the `pod` object, which can be invoked from your templates.
<p>
See API Reference for Pod objects
   </td>
  </tr>
</table>
