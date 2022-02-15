---
title: Front matter and data
order: 4
---
# Front matter and data

All content documents can contain front matter. Front matter is used to organize
the data used on each page – facilitating the best practice of separating
content from presentation.

Generally, avoid inserting content into your template. While it may seem
convenient, doing so is a common pitfall. When content is inserted directly into
a template, the template cannot be reused, which creates maintainability and
scalability issues.

## Within Markdown and text formats

Front matter can be used within Markdown-formatted content documents like so:

{% filter codeTabs %}{% raw %}
```markdown:title=/content/index.md
---
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

## Within structured content documents

Documents can also be entirely composed of front matter. Here's an example. This
example assumes your project is using the partial loop.

First, place data into your document:

{% filter codeTabs %}
```yaml:title=/content/index.yaml
partials:
- partial: hero
  headline: !pod.string Hello World!
  body: !pod.string This is the body copy for my website.
  buttons:
  - label: !pod.string Watch video
    url: https://youtube.com/foo
  - label: !pod.string Learn more
    url: https://example.com
```
{% endfilter %}

Then, reference that front matter within the template:

{%  filter codeTabs %}{% raw %}
```nunjucks
<div class="hero">
    <div class="hero__headline">{{partial.headline}}</div>
    <div class="hero__body">{{partial.body}}</div>
    <div class="hero__buttons">
        {% for button in partial.buttons %}
            <div class="hero__buttons__button">
                <a href="{{button.url}}">{{button.label}}</a>
            </div>
        {% endfor %}
    </div>
</div>
```
{% endraw %}{% endfilter %}

As you can see from this example, the template contains no content, just
references to the content stored in the document. This makes the `hero` template
reusable across multiple pages, and even multiple times within the same page.}