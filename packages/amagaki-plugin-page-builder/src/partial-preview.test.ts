import {Pod, Route} from '@amagaki/amagaki';

import {ExecutionContext} from 'ava';
import test from 'ava';

test('PatialPreview', async (t: ExecutionContext) => {
  const pod = new Pod('./example', {dev: true, name: 'staging'});
  await pod.router.warmup();
  const html = await (await pod.router.resolve('/preview/') as Route).build();
  const expected = `
<!DOCTYPE html>
<html lang="en" itemscope itemtype="https://schema.org/WebPage">

<head>
  <!-- Extra content inserted at the top of the <head> element. -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Gallery | Example</title>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://www.google-analytics.com">
  <meta name="referrer" content="no-referrer">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Example">
  <meta property="og:url" content="http://localhost/preview/">
  <meta property="og:title" content="Preview Gallery | Example">
  <meta property="og:locale" content="en">
  <meta property="twitter:title" content="Preview Gallery | Example">
  <meta property="twitter:card" content="summary_large_image">
  <link href="http://localhost/preview/" rel="canonical">
  <link href="https://fonts.googleapis.com/css?family=Material+Icons|Roboto:400,500,700&amp;display=swap" rel="stylesheet" rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <link href="./../static/css/main.css?fingerprint=d41d8cd98f00b204e9800998ecf8427e" rel="stylesheet" rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <script src="./../static/js/main.js?fingerprint=d41d8cd98f00b204e9800998ecf8427e" type="module"></script>
  <!-- Extra content inserted within the <head> element. -->
  <script>
    (function(i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r;
      i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
      }, i[r].l = 1 * new Date();
      a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
  </script>
  <script src="./../_page-builder/page-builder-ui.min.js"></script>
</head>

<body>
  <!-- Extra content inserted within the <body> element. -->
  <div class="main">
    <header>
      <page-module partial="header" position="1">
        <page-module-inspector></page-module-inspector>
        <page-module-container>
          <div class="header">
            <p>Header</p>
          </div>
        </page-module-container>
        <page-module-context>
          <script type="application/json">
            {
              "partial": "header"
            }
          </script>
        </page-module-context>
      </page-module>
    </header>
    <main>
      <page-module partial="partial-preview-gallery" position="2">
        <page-module-container>
          <div class="partial-preview-gallery">
            <ul>
              <li><a href="/preview/header/">header</a>
              <li><a href="/preview/hero/">hero</a>
            </ul>
          </div>
        </page-module-container>
        <page-module-context>
          <script type="application/json">
            {
              "partial": {
                "partial": "partial-preview-gallery"
              },
              "partials": [
                "header",
                "hero"
              ]
            }
          </script>
        </page-module-context>
      </page-module>
    </main>
  </div>
  <page-inspector></page-inspector>
</body>

</html>
  `.trim();
  t.deepEqual(html, expected);
});
