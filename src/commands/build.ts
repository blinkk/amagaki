import {Pod} from '../pod';

interface BuildOptions {}

export class BuildCommand {
  constructor(private readonly options: BuildOptions) {
    this.options = options;
  }

  async run(path: string) {
    const pod = new Pod(path);
    const results = await pod.builder.build();
    console.log(results);
  }
}
