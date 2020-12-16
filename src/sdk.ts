import SemVer from 'semver/classes/semver';

export const VERSION = new SemVer('v0.1.0')

export function getCurrentVersion(): SemVer {
  // TODO: Read from package.json?
  return VERSION;
}

export function getLatestVersion(): SemVer {
  // TODO: Read from github releases api.
  return VERSION;
}
