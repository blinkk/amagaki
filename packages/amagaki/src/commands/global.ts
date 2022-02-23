import {EnvironmentOptions, Pod} from '..';
import fs from 'fs';

export interface GlobalOptions {
  profile?: boolean;
  env?: string;
}

export function getPodWithEnvironment(
  path: string,
  globalOptions: GlobalOptions,
  env?: EnvironmentOptions
): Pod {
  const pod = new Pod(
    fs.realpathSync(path),
    env ?? (globalOptions.env ? {name: globalOptions.env} : undefined)
  );
  if (env !== undefined && globalOptions.env) {
    pod.setEnvironment(globalOptions.env);
  }
  return pod;
}
