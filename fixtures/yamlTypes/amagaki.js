module.exports = function (pod) {
  pod.configure({
    environments: {
      default: {},
      prod: {},
    },
  });

  const yamlPlugin = pod.plugins.get('YamlPlugin');
  yamlPlugin.addType('!promise', {
    kind: 'scalar',
    construct: value => {
      return new Promise(resolve => {
        resolve(value.toUpperCase());
      });
    },
  });
  yamlPlugin.addType('!async', {
    kind: 'scalar',
    construct: async value => {
      return value.toUpperCase();
    },
  });
};
