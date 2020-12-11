import {Pod} from '../pod';
import {createApp} from '../server';

interface ServeOptions {
  site: string;
  ref?: string;
  fcd?: string;
}

export class ServeCommand {
  constructor(private readonly options: ServeOptions) {
    this.options = options;
  }

  async run(path: string) {
    const pod = new Pod(path);
    const app = createApp(pod);
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
      console.log('Press Ctrl+C to quit.');
    });
  }
}
