var fs = require('fs');
var markoPrettyprint = require('marko-prettyprint');
var parser = require('./parser');
var transformer = require('./transformer');
var logging = require('./logging');

module.exports = function(filename, options) {
    var hasLogger = logging.hasLogger();
    var logger;

    if (!hasLogger) {
        logger = logging.begin();
    }
    var src = fs.readFileSync(filename, { encoding: 'utf8' });
    var parsed = parser.parse(src, filename, options);
    var transformed = transformer.transform(parsed, options);
    var finalSrc = markoPrettyprint(transformed, options);

    if (!hasLogger) {
        logger.end();
    }

    return finalSrc;
};