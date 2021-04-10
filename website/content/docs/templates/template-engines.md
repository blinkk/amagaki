---
title: Template engines
order: 2
---
# Template engines 

Amagaki supports multiple template engines. Because Amagaki is primarily an HTML
generator, and because Nunjucks is a simple template engine that is fully
compatible with HTML, Nunjucks is included in Amagaki’s core.

Read the Nunjucks manual


### Template specification

Amagaki determines which template engine to used based on the file extension of
the template specified b


### Global default template

By default, if `$view` is not specified within `_collection.yaml` or within a
document’s front matter, the default `/views/base.njk` template is used. When
used in conjunction with the partial loop, this global default represents a
powerful way to follow the DRY (don’t repeat yourself) concept -- avoiding
specification of different $view settings – while maintaining the concept of
building websites out of reusable modules.


### Adding new template engines

Different template engines can be used by installing or writing an Amagaki
plugin. See the Plugins: Template engines documentation to understand how.