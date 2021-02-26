import {Datastore} from '@google-cloud/datastore';
import {Pod} from './pod';

export class Injector {
  pod: Pod;
  cache: Record<string, string>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.cache = {};
  }

  async warmup() {
    const podPath = '/content/pages/about.yaml';
    const ref = 'abcdefg';
    const entity = await this.getDatastoreFile(podPath, ref);
    if (entity) {
      this.cache[podPath] = entity.content;
      console.log(`Injected -> ${podPath}`);
    }
  }

  async getDatastoreFile(podPath: string, ref: string) {
    const datastore = new Datastore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
    const key = datastore.key(['AmagakiFile', `${podPath}:${ref}`]);
    console.log(`Loading -> ${key}`);
    const resp = await datastore.get(key);
    const entity = resp && resp[0];
    return entity;
  }

  getContent(podPath: string) {
    return this.cache[podPath];
  }
}
