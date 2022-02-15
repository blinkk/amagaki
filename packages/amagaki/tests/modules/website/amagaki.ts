// eslint-disable-next-line node/no-extraneous-import
import {Pod} from '@amagaki/amagaki';
const pod = new Pod('../../../fixtures/simple');
console.log(`Successfully imported using clean package path: ${pod}`);

export default (pod: Pod) => {
  console.log(`Successfully invoked config for: ${pod}`);
};
