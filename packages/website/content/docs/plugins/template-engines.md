---
title: Template engines
order: 2
---
# Template engines

## Nunjucks

Amagaki provides convenience methods for extending Nunjucks functionality. See
below to learn how to easily add Nunjucks filters or globals.

{% filter codeTabs %}
```javascript:title=amagaki.ts
export default (pod: Pod) => {
    const nunjucksPlugin = pod.plugins.get('NunjucksPlugin') as NunjucksPlugin;
    nunjucksPlugin.addFilter('testShortcutFilter', value => `${value}--SHORTCUT`);
    nunjucksPlugin.addGlobal('copyrightYear', () => new Date().getFullYear());
}
```
{% endfilter %}

When creating filters that return safe HTML, ensure you use Amagaki's Nunjucks
environment to mark the return value as safe.

{% filter codeTabs %}
```javascript:title=amagaki.ts
export default (pod: Pod) => {
    const nunjucksPlugin = pod.plugins.get('NunjucksPlugin') as NunjucksPlugin;
    nunjucksPlugin.addFilter('myFilter', function (value) {
        return this.env.filters.safe('<div class="foo">Hello World</div>');
    }
}
```
{% endfilter %}
