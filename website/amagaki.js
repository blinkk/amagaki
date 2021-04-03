module.exports = function (pod) {
  pod.configure({
    staticRoutes: [
      {
        path: '/static/css/',
        staticDir: '/dist/css/',
      },
    ],
  });
};
