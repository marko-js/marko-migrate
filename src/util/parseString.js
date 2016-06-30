var builder = require('marko/compiler').builder;
var expressionParser = require('./expression-parser');

function parseString(value, targetType) {
    var finalValue = '';

    targetType = targetType || 'string';

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
        if (targetType === 'string') {
            return builder.literal(finalValue);
        } else {
            return builder.parseExpression(finalValue);
        }
    }
}

module.exports = parseString;