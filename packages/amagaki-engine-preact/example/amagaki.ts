import {PageBuilder} from '@amagaki/amagaki-plugin-page-builder';
import {Pod} from '@amagaki/amagaki';
import {PreactEnginePlugin} from '../src';

export default (pod: Pod) => {
  PreactEnginePlugin.register(pod);
  PageBuilder.register(pod, {
    partialPaths: {
      css: ['/dist/css/${partial.partial}/${partial.partial}.css'],
      js: ['/dist/js/partials/${partial.partial}/${partial.partial}.js'],
      view: ['/src/partials/${partial.partial}/${partial.partial}.tsx'],
    },
  });
};
