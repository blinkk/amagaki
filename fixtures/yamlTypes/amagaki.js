module.exports = function (pod) {
  pod.configure({
    environments: {
      default: {},
      prod: {},
    },
  });

  const yamlPlugin = pod.plugins.get('YamlPlugin');
  yamlPlugin.addType('!async', {
    kind: 'scalar',
    construct: value => {
      return async context => {
        return value.toUpperCase();
      };
    },
  });
};
