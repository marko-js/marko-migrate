"use strict";

const fs = require("fs");
const markoPrettyprint = require("marko-prettyprint");
const parser = require("./parser");

const markoCompiler = require("marko/compiler");
const TemplateContext = require("./TemplateContext");

async function runTransforms(ast, filename, migrateContext) {
  let compileContext = markoCompiler.createCompileContext(filename);
  let templateContext = new TemplateContext(compileContext, migrateContext);
  migrateContext.template = templateContext;

  let preTransformWalker = markoCompiler.createWalker({
    exit: function(node) {
      if (node.type === "HtmlElement") {
        migrateContext.runHtmlElementTransforms(node, "pretransform");
      }
    }
  });

  ast = preTransformWalker.walk(ast);

  await migrateContext.events.emitAsync("afterPretransformTemplate", {
    context: migrateContext
  });

  await migrateContext.events.emitAsync("beforeTransformTemplate", {
    context: migrateContext
  });

  let walker = markoCompiler.createWalker({
    exit: function(node) {
      if (node.type === "HtmlElement") {
        migrateContext.runHtmlElementTransforms(node, "transform");
      }
    }
  });

  ast = walker.walk(ast);

  await migrateContext.events.emitAsync("afterTransformTemplate", {
    context: migrateContext,
    root: ast
  });

  migrateContext.template = null;

  return ast;
}

module.exports = async function transformTemplate(filename, migrateContext) {
  let src = fs.readFileSync(filename, { encoding: "utf8" });
  let options = migrateContext.options;
  let parsed = parser.parse(src, filename, options);
  let transformed = await runTransforms(parsed, filename, migrateContext);
  let finalSrc = markoPrettyprint(transformed, options);
  return finalSrc;
};
