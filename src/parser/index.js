const resolveFrom = require("resolve-from");
const path = require("path");

function parse(src, filename, options) {
  const dir = path.dirname(filename);
  const markoCompilerPath = resolveFrom(dir, "marko/compiler");

  let markoCompiler;

  if (markoCompilerPath) {
    markoCompiler = require(markoCompilerPath);
  } else {
    // Use the the version that ships with this package
    markoCompiler = require("marko/compiler");
  }

  if (markoCompiler.parseRaw) {
    return markoCompiler.parseRaw(src, filename);
  } else {
    return require("../marko-2/parser").parse(src, filename, options);
  }
}

exports.parse = parse;
