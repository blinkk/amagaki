import {Pod} from './pod';
import * as fs from 'fs';
import * as fsPath from 'path';
import * as yaml from 'js-yaml';
import {Document} from './document';
import {Locale} from './locale';

export interface FrontMatterResult {
  frontMatter: string | null;
  body: string | null;
}

export class DataType {
  static isArray(value: any) {
    if (Array.isArray) {
      return Array.isArray(value);
    }
    return value && typeof value === 'object' && value.constructor === Array;
  }

  static isBoolean(value: any) {
    return typeof value === 'boolean';
  }

  static isInstance(value: any) {
    return (
      value &&
      typeof value === 'object' &&
      !DataType.isObject(value) &&
      !DataType.isArray(value) &&
      !DataType.isRegExp(value)
    );
  }

  static isDate(value: any) {
    return value instanceof Date;
  }

  static isFunction(value: any) {
    return typeof value === 'function';
  }

  static isNumber(value: any) {
    return typeof value === 'number' && isFinite(value);
  }

  static isNull(value: any) {
    return value === null;
  }

  static isObject(value: any) {
    return value && typeof value === 'object' && value.constructor === Object;
  }

  static isRegExp(value: any) {
    return value && typeof value === 'object' && value.constructor === RegExp;
  }

  static isString(value: any) {
    return typeof value === 'string' || value instanceof String;
  }

  static isSymbol(value: any) {
    return typeof value === 'symbol';
  }

  static isUndefined(value: any) {
    return typeof value === 'undefined';
  }
}

export function basename(path: string) {
  return path.split('/').reverse()[0];
}

export function createYamlSchema(pod: Pod) {
  // TODO: Expose YAML schemas for sites to register additional types.
  const docType = new yaml.Type('!a.Doc', {
    kind: 'scalar',
    resolve: data => {
      // TODO: Validate this is in the content folder.
      return data !== null && data.startsWith('/');
    },
    construct: podPath => {
      return pod.doc(podPath);
    },
    represent: doc => {
      return doc;
    },
  });
  const staticType = new yaml.Type('!a.Static', {
    kind: 'scalar',
    resolve: data => {
      // TODO: Add more validation?
      return data !== null && data.startsWith('/');
    },
    construct: podPath => {
      return pod.staticFile(podPath);
    },
    represent: staticFile => {
      return staticFile;
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
  const yamlType = new yaml.Type('!a.Yaml', {
    kind: 'scalar',
    resolve: data => {
      // TODO: Add more validation?
      return data !== null && data.startsWith('/');
    },
    construct: value => {
      // value can be: /content/partials/base.yaml
      // value can be: /content/partials/base.yaml?foo
      // value can be: /content/partials/base.yaml?foo.bar.baz
      const parts = value.split('?');
      const podPath = parts[0];
      const result = pod.readYaml(podPath);
      if (parts.length > 1) {
        const query = parts[1].split('.');
        // TODO: Implement nested lookups.
        return result[query[0]];
      } else {
        return result;
      }
    },
    represent: string => {
      return string;
    },
  });
  return yaml.Schema.create([docType, staticType, stringType, yamlType]);
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

export function getLocalizedValue(doc: Document, item: any, key: string) {
  return doc.locale ? item[`${key}@${doc.locale.id}`] || item[key] : item[key];
}

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

export function localizeData(data: any, locale: Locale) {
  if (!data) {
    return data;
  }

  if (DataType.isObject(data)) {
    const newData: any = {};
    for (const key of Object.keys(data)) {
      newData[key] = localizeData(data[key], locale);
    }
    return newData;
  } else if (DataType.isArray(data)) {
    const newData = [...data];
    for (const i in newData) {
      newData[i] = localizeData(newData[i], locale);
    }
    return newData;
  } else if (DataType.isInstance(data) && DataType.isFunction(data.localize)) {
    return data.localize(locale);
  }
  return data;
}

export function splitFrontMatter(content: string): FrontMatterResult {
  const openingPart = '---\n';
  const closingPart = '\n---';
  // No opening part present, assume the whole file is not front matter.
  if (!content.startsWith(openingPart)) {
    return {
      frontMatter: null,
      body: content,
    };
  }
  // Strip the opening part.
  content = content.slice(openingPart.length);
  const closingIndex = content.indexOf(closingPart);
  // No closing part present, assume the whole file is front matter.
  if (closingIndex === -1) {
    return {
      frontMatter: content,
      body: null,
    };
  }
  return {
    frontMatter: content.slice(0, closingIndex),
    body: content.slice(closingIndex),
  };
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
