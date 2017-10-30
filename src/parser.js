const resolveFrom = require('resolve-from');
const path = require('path');

function parseVersion(str) {
  let parts = str.split('.');
  let major = parseInt(parts[0], 10);
  let minor = parseInt(parts[1], 10);
  let patch = parseInt(parts[2], 10);
  return {major, minor, patch};
}

function parse(src, filename, options) {
  const dir = path.dirname(filename);
  const markoPackagePath = resolveFrom(dir, 'marko/package.json');

  let markoPackage;
  let markoCompiler;

  if (markoPackagePath) {
    markoPackage = require(markoPackagePath);
    markoCompiler = require(path.dirname(markoPackagePath) + '/compiler');
  } else {
    markoPackage = require('marko/package.json');
    markoCompiler = require('marko/compiler');
  }

  const version = parseVersion(markoPackage.version);

  if (markoCompiler.parseRaw) {
    return markoCompiler.parseRaw(src, filename);
  } else if (version.major === 2) {
    return require('./marko-2').parse(src, filename, options);
  }
}

exports.parse = parse;