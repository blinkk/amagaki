---
title: Environments
---
Amagaki supports multiple build environments. You may want your templates – or
your content – to do different things depending on the current status of your
project. For example, you may want to show certain content in development or
staging only, or you may want to include or exclude content or functionality in
production.



### Configuration {#configuration}

To set up different environments, first configure them in `amagaki.js`. In the
below example, we are configuring two environments (prod, and staging).
Environments accept arbitrary fields, allowing you to centrally manage global
data (such as API keys or other configuration) and easily change it depending on
the environment.


```
module.exports = function (pod) {
  pod.configure({
    environments: {
      prod: {
        host: 'example.com',
        fields: {
          apiKey: 'foo',
        },
      },
      staging: {
        host: 'example.com',
        fields: {
          apiKey: 'bar',
        },
      },
    },
  });
};
```



### In templates

In templates, the `pod.env` variable is available. It returns the pod’s current
environment. See Environment reference.


```
{{pod.env.name}}
{{pod.env.fields.apiKey}}
{% if pod.env.name == "prod" %}
<!-- Output prod stuff. -->
{% endif %}
```



### In content

While this can be represented in template logic using an if statement like in
the above examples,  changing content based on the environment is better
represented using the !IfEnvironment YAML type. See the example below:


```
foo: !IfEnvironment
  default: 'Hello World!'
  prod: ''
```



### Defaults



*   When running the dev server, the environment “dev” is used.
*   When running `amagaki build`, the environment “default” is used.

Different environment names can be invoked during the “serve” or “build”
commands by using the “--env &lt;name>” flag. For example, to build the prod
environment: `amagaki build --env prod`.
