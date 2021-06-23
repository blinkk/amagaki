---
title: Build hooks
order: 4
---
# Build hooks

The `BuilderPlugin` allows you to run hooks before and after the build step.
This may be useful for running tests, performing some sort of verification, or
peforming general operations before and after the build.

The `BuilderPlugin` has access to the `Builder` object before the build step,
and has access to a `BuildResult` object after the build step. The `BuildResult`
object contains a diff, manifest, and metrics about the build.

{{button.button({
    label: 'Read BuildResult Reference',
    url: 'https://blinkk.github.io/amagaki/api/interfaces/builder.buildresult.html',
    external: true,
    class: 'button button--low',
    icon: 'launch'
})}}

## Example

{% filter codeTabs %}
```javascript:title=amagaki.js
module.exports = function (pod) {
    const plugin = pod.plugins.get('BuilderPlugin');
 
    plugin.addBeforeBuildStep(builder => {
    // Do something with the builder.
    });
 
    plugin.addAfterBuildStep(buildResult => {
    // Do something with the build result.
    });
};
```
{% endfilter %}