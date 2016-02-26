var ok = require('assert').ok;
var path = require('path');
var htmlparser = require("htmlparser2");
var builder = require('marko/compiler').builder;
var expressionParser = require('./util/expression-parser');
var parseString = require('./util/parseString');
var taglibs = require('./taglibs');
var handleBinaryOperators = require('./util/handleBinaryOperators');

function isExpressionType(targetType) {
    return targetType === 'float' ||
        targetType === 'double' ||
        targetType === 'number' ||
        targetType === 'integer' ||
        targetType === 'int' ||
        targetType === 'expression' ||
        targetType === 'object' ||
        targetType === 'boolean' ||
        targetType === 'array';
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

    function handleText(text) {

        var finalText = '';

        expressionParser.parse(text, {
            text: function (text, escapeXml) {
                finalText += text;
            },
            expression: function (expression, escapeXml) {
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

    var parser = this.parser = new htmlparser.Parser({
            onopentag: function(tagName, attrs) {
                tagName = tagName.replace(/[.]/g, ':');

                var attributes = [];
                Object.keys(attrs).forEach((name) => {
                    var value = attrs[name];
                    var attrDef = taglibLookup.getAttribute(tagName, name);
                    var targetType = 'string';
                    if (attrDef) {
                        targetType = attrDef.type || 'string';
                    }

                    if (value) {
                        if (targetType === 'string') {
                            value = parseString(value);
                        } else if (isExpressionType(targetType)) {
                            value = handleBinaryOperators(value);
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
                currentParent.appendChild(el);
                currentParent = el;
                stack.push(el);
            },
            onprocessinginstruction: function(name, data) {
                handleText('<' + data + '>');
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
                handleText('<!--' + comment + '-->');
            }
        }, parserOptions);

    parser.write(src);
    parser.end();

    return root;
}

exports.parse = parse;