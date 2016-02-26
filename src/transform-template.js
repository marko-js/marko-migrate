var fs = require('fs');
var markoPrettyprint = require('marko-prettyprint');
var parser = require('./parser');
var transformer = require('./transformer');

module.exports = function(filename, options) {
    var src = fs.readFileSync(filename, { encoding: 'utf8' });
    var parsed = parser.parse(src, filename, options);
    var transformed = transformer.transform(parsed, options);
    var finalSrc = markoPrettyprint(transformed, options);
    return finalSrc;
};