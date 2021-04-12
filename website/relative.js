/*
"""Create a relative path to another url."""
if isinstance(path, Url):
    path = path.path
if path.startswith(('http://', 'https://')):
    return path

# Need to support relative paths that are not directories.
if not path.endswith('/') or not relative_to.endswith('/'):
    if path.endswith('/'):
        path_head = path
        path_tail = None
    else:
        path_head, path_tail = os.path.split(path)

    if relative_to.endswith('/'):
        relative_head = relative_to
    else:
        relative_head, _ = os.path.split(relative_to)

    result = os.path.relpath(path_head, relative_head)
    if path_tail:
        result = '{}/{}'.format(result, path_tail)
else:
    result = os.path.relpath(path, relative_to)
if path.endswith('/'):
    result = result + '/'
if not result.startswith(('/', '.')):
    return './' + result
return result
*/

import * as fsPath from 'path';

function split(path) {
    var index = path.lastIndexOf('/');
    return [path.slice(0, index), path.slice(index + 1)];
}

function relative(from, to) {
    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join('/');
}

function createRelative(path, relativeTo) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  let pathHead;
  let pathTail;
  if (!path.endsWith('/') || !relativeTo.endsWith('/')) {
    if (path.endsWith('/')) {
      pathHead = path;
      pathTail = null;
    } else {
        pathHead, pathTail = split(path);
    }

    let relativeHead;
    if (relativeTo.endsWith('/')) {
        relativeHead = relativeTo
    } else {
        relativeHead, _ = split(relativeTo);
    }

    // let result = 
  }
}
