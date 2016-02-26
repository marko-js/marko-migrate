var operatorsRegExp = /"(?:[^"]|\\")*"|'(?:[^']|\\')*'|\s+(?:and|or|lt|gt|eq|ne|lt|gt|ge|le)\s+/g;
var replacements = {
        'and': ' && ',
        'or': ' || ',
        'eq': ' === ',
        'ne': ' !== ',
        'lt': ' < ',
        'gt': ' > ',
        'ge': ' >= ',
        'le': ' <= '
    };
function handleBinaryOperators(str) {
    return str.replace(operatorsRegExp, function (match) {
        return replacements[match.trim()] || match;
    });
}

module.exports = handleBinaryOperators;