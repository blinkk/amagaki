import {Pod, Route} from '@amagaki/amagaki';

import {ExecutionContext} from 'ava';
import test from 'ava';

test('SitemapPlugin: sitemap.xml', async (t: ExecutionContext) => {
  const pod = new Pod('./example');
  await pod.router.warmup();
  const sitemapRoute = await pod.router.resolve('/foo/sitemap.xml') as Route;
  const sitemapContent = await sitemapRoute.build();
  const sitemapExpected = 
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>http://localhost/pages/foo/</loc>
    <xhtml:link href="http://localhost/pages/foo/" hreflang="x-default" rel="alternate" />
    <xhtml:link href="http://localhost/pages/foo/" hreflang="en" rel="alternate" />
    <xhtml:link href="http://localhost/ja/pages/foo/" hreflang="ja" rel="alternate" />
  </url>
  <url>
    <loc>http://localhost/ja/pages/foo/</loc>
    <xhtml:link href="http://localhost/pages/foo/" hreflang="x-default" rel="alternate" />
    <xhtml:link href="http://localhost/pages/foo/" hreflang="en" rel="alternate" />
    <xhtml:link href="http://localhost/ja/pages/foo/" hreflang="ja" rel="alternate" />
  </url>
  <url>
    <loc>http://localhost/pages/</loc>
    <xhtml:link href="http://localhost/pages/" hreflang="x-default" rel="alternate" />
    <xhtml:link href="http://localhost/pages/" hreflang="en" rel="alternate" />
    <xhtml:link href="http://localhost/ja/pages/" hreflang="ja" rel="alternate" />
  </url>
  <url>
    <loc>http://localhost/ja/pages/</loc>
    <xhtml:link href="http://localhost/pages/" hreflang="x-default" rel="alternate" />
    <xhtml:link href="http://localhost/pages/" hreflang="en" rel="alternate" />
    <xhtml:link href="http://localhost/ja/pages/" hreflang="ja" rel="alternate" />
  </url>
</urlset>
`.trim();
  t.deepEqual(sitemapContent, sitemapExpected);
});

test('SitemapPlugin: robots.txt', async (t: ExecutionContext) => {
  const pod = new Pod('./example');
  await pod.router.warmup();
  const robotsRoute = await pod.router.resolve('/bar/robots.txt') as Route;
  const robotsContent = await robotsRoute.build();
  const robotsExpected = 'User-agent: *\nAllow: /';
  t.deepEqual(robotsContent, robotsExpected);
});
