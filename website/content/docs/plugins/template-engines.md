---
title: Template engines
order: 2
---
# Template engines

## Nunjucks

Amagaki provides convenience methods for extending Nunjucks functionality. See
below to learn how to easily add Nunjucks filters or globals.


```
const nunjucksPlugin = pod.plugins.get('NunjucksPlugin');
nunjucksPlugin.addFilter('testShortcutFilter', value => `${value}--SHORTCUT`);
nunjucksPlugin.addGlobal('copyrightYear', () => new Date().getFullYear());
```
