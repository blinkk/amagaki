---
title: YAML types
order: 1
---
# YAML types

The YAML types plugin allows you to create custom tags for your YAML files.
Custom YAML types provide a variety of uses, and can help you organize and
structure your content, as well as validate the content that you are managing.

With custom YAML types, you can further keep concerns around content in the
content layer, and allow you to avoid holding too much business logic in your
templates.

Custom YAML types have a variety of uses, such as:

- Verifying reusable data structures
- Simplifying template logic
- Restructuring data between the content and template layer
- Integrating with external content sources, such as Google Sheets or headless
  CMSes

## Example

Here is an example of a custom YAML type being used. In it, we have a custom
type named `!Person` that accepts `firstName` and `lastName` options. The custom
type is constructed into an object `Person`, with getter `fullName` that joins
the first and last name together.

1. Use the custom type in YAML:

{% filter codeTabs %}
```yaml
avengers:
- !Person
    firstName: Tony
    lastName: Stark
- !Person
    firstName: Steve
    lastName: Rogers
- !Person
    firstName: Carol
    lastName: Danvers
```
{% endfilter %}

2. Create the custom type:

{% filter codeTabs %}
```js:title=amagaki.js
module.exports = (pod) => {
    class Person {
        constructor(options) {
            this.firstName = options.firstName;
            this.lastName = options.lastName;
        }
        get name() {
            return `${this.firstName} ${this.lastName}`;
        }
    }
    const yamlPlugin = pod.plugins.get('YamlPlugin');
    yamlPlugin.addType('!Person', {
        kind: 'mapping',
        construct: data => {
            return new Person(data);
        },
    });
}
```
{% endfilter %}

3. Use the `Person` objects in templates. Note that we never declared any
   `fullName` in YAML. That property was defined in our `Person` object.

{% filter codeTabs %}
```nunjucks
{%- raw %}
{% for person in avengers %}
    {{person.fullName}}
{% endfor %}
{% endraw %}
```
{% endfilter %}