module.exports = function (pod) {
  pod.configure({
    metadata: {
      siteTitle: 'Amagaki',
    },
    staticRoutes: [
      {
        path: '/static/css/',
        staticDir: '/dist/css/',
      },
    ],
  });

  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin');
  nunjucksPlugin.addFilter('url', value => {
    if (value.doc) {
      return value.doc.url.path;
    } else {
      return value.url;
    }
  });
};
