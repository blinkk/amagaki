import {Pod} from './pod';
import * as fs from 'fs';
import * as fsPath from 'path';
import * as yaml from 'js-yaml';
import {Document} from './document';

export function interpolate(string: string, params: any) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${string}\`;`)(...vals);
}

export function basename(path: string) {
  return path.split('/').reverse()[0];
}

export function walk(path: string, newFiles?: string[], removePrefix?: string) {
  let files = newFiles || [];
  fs.readdirSync(path).forEach(file => {
    const absPath = fsPath.join(path, file);
    if (fs.statSync(absPath).isDirectory()) {
      files = walk(absPath, files, removePrefix);
    } else {
      files.push(removePrefix ? absPath.replace(removePrefix, '') : absPath);
    }
  });
  return files;
}

export function createYamlSchema(pod: Pod) {
  // TODO: Expose YAML schemas for sites to register additional types.
  const docType = new yaml.Type('!a.Doc', {
    kind: 'scalar',
    resolve: data => {
      return data !== null && data.startsWith('/');
    },
    construct: podPath => {
      return pod.doc(podPath);
    },
    represent: doc => {
      return doc;
    },
  });
  return yaml.Schema.create([docType]);
}

export function getLocalizedValue(doc: Document, item: any, key: string) {
  return doc.locale ? item[`${key}@${doc.locale.id}`] || item[key] : item[key];
}
