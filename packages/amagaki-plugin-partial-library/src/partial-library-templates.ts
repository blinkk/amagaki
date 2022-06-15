export const libraryIndexTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partial library</title>
    <style>
      body {
        font-family: sans-serif;
        font-size: 16px;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <h1>Partial Library</h1>

    <ul>
      {% for key, partial in partials %}
        <li><a href="{{pathPrefix}}{{key}}/">{{ key }}</a></li>
      {% endfor %}
    </ul>
  </body>
</html>`;

export const libraryPartialTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partial: {{partial.key}}</title>
    <style>
      body {
        font-family: sans-serif;
        font-size: 16px;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <h1>Partial Library</h1>

    <ul>
      {% for key, partial in partials %}
        <li><a href="{{pathPrefix}}{{key}}/">{{ key }}</a></li>
      {% endfor %}
    </ul>

    <h2>Partial: {{partial.key}}</h2>

    <dl>
      <dt>Instance count</dt>
      <dd>{{partial.length}}</dd>
    </dl>
  </body>
</html>`;
