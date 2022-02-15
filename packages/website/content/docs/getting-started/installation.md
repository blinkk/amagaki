---
title: Installation
order: 0
---
# Install

While we recommend using our quick start project as the foundation for getting
started with Amagaki (as it comes with the nuts and bolts needed for building
marketing sites beyond just the website build tool), you can also use Amagaki
from scratch.

{% filter codeTabs %}
```shell
npm install @amagaki/amagaki

# Start the dev server.
npx amagaki serve

# Build the site.
npx amagaki build
```
{% endfilter %}

Amagaki assumes a defaults project structure and will generate your site using
the defaults, in absence of an amagaki.js configuration file. Learn more about
the project structure.