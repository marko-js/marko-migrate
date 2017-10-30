'use strict';

var fs = require('fs');
var path = require('path');

var markoCompiler = require('marko/compiler');
var builder = markoCompiler.builder;

class TransformerContext {
    constructor() {
        this.macroNames = {};
        this.requires = [];
        this.builder = builder;
    }

    registerMacroName(name) {
        this.macroNames[name] = true;
    }

    isMacro(name) {
        return this.macroNames.hasOwnProperty(name);
    }

    addRequire(moduleName, varName) {
        this.requires.push({
            moduleName: moduleName,
            varName: varName
        });
    }
}

var transformers = {};

function loadTransformers() {
    var transformersDirname = path.join(__dirname, 'transformers');
    var filename = fs.readdirSync(transformersDirname);
    filename.forEach((filename) => {
        if (path.extname(filename) !== '.js') {
            return;
        }

        var key = filename.slice(0, -3);
        filename = path.join(transformersDirname, filename);
        transformers[key] = require(filename);
    });
}


loadTransformers();

exports.transform = function transform(ast) {
    var context = new TransformerContext();

    var walker = markoCompiler.createWalker({
        exit: function(node) {
            if (node.type === 'HtmlElement') {
                let tagName = node.tagName;
                var tagTransformer = transformers[tagName + '-tag'];
                if (tagTransformer) {
                    var result = tagTransformer.transform(node, context);
                    if (result !== undefined) {
                        return result;
                    }
                }

                var attrs = node.getAttributes();
                attrs.forEach((attr) => {
                    var attrName = attr.name;
                    var attrTransformer = transformers[attrName + '-attr'];
                    if (attrTransformer) {
                        attrTransformer.transform(node, attr, context);
                    }
                });
            }
        }
    });

    ast = walker.walk(ast);

    var requires = context.requires;
    if (requires.length) {
        var importLines = [];
        requires.forEach((req) => {
            importLines.push('var ' + req.varName + ' = require(' + JSON.stringify(req.moduleName) + ');');
        });

        var importsCode = importLines.join('\n');

        var scriptEl = builder.htmlElement('script', { 'marko-init': null });
        scriptEl.appendChild(builder.text(builder.literal(importsCode)));

        ast.prependChild(scriptEl);
    }

    return ast;
};