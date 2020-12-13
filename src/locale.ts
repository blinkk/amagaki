import {Pod} from './pod';

export class Locale {
  pod: Pod;
  podPath: string;
  id: string;

  constructor(pod: Pod, id: string) {
    this.pod = pod;
    this.id = id;
    this.podPath = `/locales/${id}.yaml`;
  }

  get translations() {
    return this.pod.readYaml(this.podPath);
  }

  getTranslation(value: string) {
    if (!this.pod.fileExists(this.podPath)) {
      return value;
    }
    return this.translations[value] || value;
  }
}
