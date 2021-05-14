---
title: Server middleware
order: 3
---
# Server middleware

The Amagaki server can be extended with Express middleware. This may be useful
in a variety of scenarios, such as:

- Enforcing authentication flows, i.e. for headless CMS or content integrations
- Adding headers or metadata to the HTTP responses, i.e. for testing production
  behavior
- Extending the functionality of Amagaki with custom request handlers

Remember, Amagaki is intended to be a static site generator. Request handlers
made available on the server will not be available in production when serving a
fully static site. Therefore, server middleware is most useful for adding
functionality that enhances development velocity and the development workflow.

## Example

{% filter codeTabs %}
```javascript:title=amagaki.js
module.exports = function (pod) {
    const serverPlugin = pod.plugins.get('ServerPlugin');
    serverPlugin.register(app => {
        app.use('/foo', (req, res) => {
            res.send('This is a response from custom middleware.');
        });
    });
};
```
{% endfilter %}