'use strict';
var ok = require('assert').ok;
var path = require('path');
var htmlparser = require("htmlparser2");
var builder = require('marko/compiler').builder;
var expressionParser = require('./util/expression-parser');
var parseString = require('./util/parseString');
var taglibs = require('./taglibs');
var handleBinaryOperators = require('./util/handleBinaryOperators');

function getMacroName(el) {
    var functionAttrValue = el.getAttributeValue('function');
    var functionString = functionAttrValue.value.trim();
    var argIndex = functionString.indexOf('(');

    // We need to separate out the arguments from the name
    if (argIndex === -1) {
        return functionString;
    } else {
        return functionString.substring(0, argIndex);
    }
}

var parserOptions  = {
    recognizeSelfClosing: true,
    recognizeCDATA: true,
    lowerCaseTags: false,
    lowerCaseAttributeNames: false,
    xmlMode: false
};

function parse(src, filename, options) {
    var logger = options && options.logger;

    ok(filename);
    var taglibLookup = taglibs.buildLookup(path.dirname(filename), logger);
    var root = builder.htmlElement('ROOT');

    var currentParent = root;
    var stack = [currentParent];
    var foundMacros = {};

    function handleText(text) {

        var finalText = '';

        expressionParser.parse(text, {
            text: function (text, escapeXml) {
                finalText += text;
            },
            expression: function (expression, escapeXml) {
                // Marko v2 allowed macros to be invoked inside placeholders. For example:
                // <li>${myMacro('foo', 'bar')}</li>
                //
                // That is no longer allowed so we convert the placeholder expressions into an
                // `<invoke>` tag that will then be converted over to something like
                // `<myMacro('a', 'b')/>`
                var parsed;

                try {
                    parsed = builder.parseExpression(expression);
                } catch(e) {}

                if (parsed && parsed.type === 'FunctionCall') {
                    var callee = parsed.callee;
                    if (callee.type === 'Identifier') {
                        var functionName = callee.name;
                        if (foundMacros.hasOwnProperty(functionName)) {
                            if (finalText) {
                                let textNode = builder.text(builder.literal(finalText));
                                currentParent.appendChild(textNode);
                                finalText = '';
                            }

                            var invokeEl = builder.htmlElement('invoke', {
                                'function': builder.literal(expression)
                            });

                            currentParent.appendChild(invokeEl);
                            return;
                        }
                    }
                }
                finalText += (escapeXml ? '${' : '$!{') + expression + '}';
            },
            scriptlet: function (scriptlet) {
                finalText += '<%' + scriptlet + '%>';
            },
            error: function (message) {
                throw Error(message);
            }
        });

        var textNode = builder.text(builder.literal(finalText));
        currentParent.appendChild(textNode);
    }

    var parser = new htmlparser.Parser({
            onopentag: function(tagName, attrs) {
                tagName = tagName.replace(/[.]/g, ':');

                var attributes = [];
                Object.keys(attrs).forEach((name) => {
                    var value = attrs[name];
                    var attrDef = taglibLookup.getAttribute(tagName, name);
                    var targetType = 'string';
                    var allowExpressions = true;
                    if (attrDef) {
                        allowExpressions = attrDef.allowExpressions !== false;
                        targetType = attrDef.type || 'string';
                    }

                     if (targetType === 'template' || targetType === 'path') {
                        targetType = 'string';
                    }

                    if (value) {
                        if (targetType === 'expression' ||
                            targetType === 'object' ||
                            targetType === 'array') {
                            value = handleBinaryOperators(value);
                            value = builder.parseExpression(value);
                        } else if (targetType === 'custom' || targetType === 'identifier') {
                            value = builder.literal(value);
                        } else if (allowExpressions) {
                            value = parseString(value, targetType);
                        } else if (targetType === 'double' ||
                            targetType === 'number' ||
                            targetType === 'integer' ||
                            targetType === 'int' ||
                            targetType === 'boolean') {

                            value = builder.parseExpression(value);
                        } else {
                            value = builder.literal(value);
                        }
                    } else {
                        value = null;
                    }



                    attributes.push({name, value});
                });

                var el = builder.htmlElement(tagName, attributes);
                if (el.tagName === 'def') {
                    foundMacros[getMacroName(el)] = true;
                }

                currentParent.appendChild(el);
                currentParent = el;
                stack.push(el);
            },
            onprocessinginstruction: function(name, data) {
                if (data.startsWith('!')) {
                    var doctypeNode = builder.documentType(builder.literal(data.substring(1)));
                    currentParent.appendChild(doctypeNode);
                } else if (data.startsWith('?') && data.endsWith('?')) {
                    var declarationNode = builder.declaration(builder.literal(data.substring(1, data.length-1)));
                    currentParent.appendChild(declarationNode);
                } else {
                    handleText('<' + data + '>');
                }
            },

            oncdatastart: function() {
                handleText('<![CDATA[');
            },
            oncdataend: function() {
                handleText(']]>');
            },

            ontext: function(text){
                handleText(text);
            },
            onclosetag: function(name){
                stack.pop();
                currentParent = stack[stack.length - 1];
            },
            oncomment: function(comment) {
                var commentNode = builder.htmlComment(builder.literal(comment));
                currentParent.appendChild(commentNode);
            }
        }, parserOptions);

    parser.write(src);
    parser.end();

    return root;
}

exports.parse = parse;