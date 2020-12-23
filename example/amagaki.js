module.exports = function (pod) {
  pod.plugins.addNunjucksFilter('testPluginFilter', value => {
    return `${value}--TESTING`;
  });
};
