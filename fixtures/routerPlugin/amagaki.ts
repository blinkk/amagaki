import {Pod, RouterPlugin} from '../../src';

export default function (pod: Pod) {
  const plugin = pod.plugins.get('RouterPlugin') as RouterPlugin;
  plugin.addPathFormatFunction('slug', (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  });
}
