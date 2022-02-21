import { Pod } from '@amagaki/amagaki';
import {PreactEnginePlugin} from '../src';

export default (pod: Pod) => {
  PreactEnginePlugin.register(pod);
};
