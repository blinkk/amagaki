import {Pod, YamlPlugin} from '@amagaki/amagaki';
const pod = new Pod('../../fixtures/simple');
console.log(`Successfully imported using clean package path: ${pod}`);
console.log(`Successfully imported plugin from subdirectory: ${YamlPlugin}`);
