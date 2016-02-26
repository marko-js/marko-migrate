var builder = require('marko/compiler').builder;
var expressionParser = require('./expression-parser');

function parseString(value) {
    var finalValue = '';

    var hasText = false;
    var foundExpression;

    expressionParser.parse(value, {
        text: function (text, escapeXml) {
            hasText = true;
            finalValue += text;
        },
        expression: function (expression, escapeXml) {
            if (foundExpression === undefined) {
                foundExpression = escapeXml === true ? expression : null;
            } else {
                foundExpression = null;
            }
            finalValue += (escapeXml ? '${' : '$!{') + expression + '}';
        },
        error: function (message) {
            throw Error(message);
        }
    });

    if (!hasText && foundExpression) {
        return builder.parseExpression(foundExpression);
    } else {
        return builder.literal(finalValue);
    }
}

module.exports = parseString;