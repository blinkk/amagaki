/* eslint-disable node/no-unpublished-import */

import * as fetch from 'node-fetch';

import {Pod} from '../../dist/src/pod';
import {YamlPlugin} from '../../dist/src/plugins/yaml';

export const register = (pod: Pod) => {
  const yamlPlugin = pod.plugins.get('YamlPlugin') as YamlPlugin;
  yamlPlugin.addType('!GetGithubContributors', {
    kind: 'sequence',
    construct: projects => {
      const cache = {};
      return async () => {
        const cacheKey = projects.join(',');
        if (cache[cacheKey]) {
          return cache[cacheKey];
        }
        const headers = process.env.GITHUB_TOKEN
          ? {Authorization: `token ${process.env.GITHUB_TOKEN}`}
          : {};
        const result = projects.map(project => {
          return fetch(`https://api.github.com/repos/${project}/contributors`, {
            headers: headers,
          }).then(
            resp => resp.json(),
            err => console.error(err)
          );
        });
        // Flatten contributors from multiple projects into a single array.
        // Remove duplicates and exclude bots.
        interface GithubContributor {
          login: string;
          html_url: string;
          avatar_url: string;
        }
        const allContributors: Array<
          GithubContributor | undefined
          // eslint-disable-next-line prefer-spread
        > = [].concat.apply([], await Promise.all(result));
        const contributors = new Map();
        for (const contributor of allContributors) {
          // The request failed (for example, the developer may be offline.)
          // Check the logs for what went wrong.
          if (!contributor) {
            continue;
          }
          if (
            !contributors.has(contributor.login) &&
            !contributor.login.endsWith('[bot]')
          ) {
            contributors.set(contributor.login, contributor);
          }
        }
        cache[cacheKey] = Array.from(contributors.values());
        return cache[cacheKey];
      };
    },
  });
};
