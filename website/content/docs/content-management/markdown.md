---
title: Markdown
order: 5
---
# Markdown

Amagaki supports Markdown-formatted content documents. Additionally, front
matter facilitates the use of structured content within the Markdown itself.

## Full example

First, use front matter with Markdown within a content document.

{% filter codeTabs %}{% raw %}
```markdown:title=/content/lorem-ipsum.md
---
$path: /${doc.base}/
$view: /views/base.njk
date: 2021-01-06
author:
  name: Lorem ipsum
  email: lorem@example.com
---
# This is my page title.
 
By: <a href="mailto:{{doc.fields.email}}">{{doc.fields.name}}</a>
Published: {{doc.fields.date}}
```
{% endraw %}{% endfilter %}

Use the `render` filter along with `doc.body` to render the Markdown as HTML.

{% filter codeTabs %}{% raw %}
```nunjucks:title=/views/base.njk
<!DOCTYPE html>
<body>
{{doc.body|render}}
</body>
```
{% endraw %}{% endfilter %}

The resulting page will render at `/lorem-ipsum/`.