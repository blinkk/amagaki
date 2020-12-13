import {Pod} from './pod';
import * as fs from 'fs';
import * as fsPath from 'path';
import * as yaml from 'js-yaml';
import {Document} from './document';

export function interpolate(pod: Pod, string: string, params: any) {
  // Cache created functions to avoid memory leak.
  const names = Object.keys(params);
  const vals = Object.values(params);
  const key = `${string}:${names}`;
  if (pod.cache.interpolations[key]) {
    return pod.cache.interpolations[key](...vals);
  }
  const func = new Function(...names, `return \`${string}\`;`);
  pod.cache.interpolations[key] = func;
  return func(...vals);
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
  const stringType = new yaml.Type('!a.String', {
    kind: 'mapping',
    resolve: data => {
      return (
        typeof data === 'string' ||
        (typeof data === 'object' && 'value' in data)
      );
    },
    construct: value => {
      return pod.string(value);
    },
    represent: string => {
      return string;
    },
  });
  return yaml.Schema.create([docType, stringType]);
}

export function getLocalizedValue(doc: Document, item: any, key: string) {
  return doc.locale ? item[`${key}@${doc.locale.id}`] || item[key] : item[key];
}

export function formatBytes(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return '0 Bytes';
  }
  // @ts-ignore
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  // @ts-ignore
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
