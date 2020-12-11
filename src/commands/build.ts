
interface BuildOptions {
}

export class BuildCommand {
  constructor(private readonly options: BuildOptions) {
    this.options = options;
  }

  async run(path: string) {
  }
}
