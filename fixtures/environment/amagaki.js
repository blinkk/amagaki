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
