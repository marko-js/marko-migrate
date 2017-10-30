'use strict';

const chai = require('chai');
chai.config.includeStack = true;
const path = require('path');
const markoMigrate = require('../');

describe(path.basename(__filename), async () => {
    var autoTestDir = path.join(__dirname, 'marko2/autotest-templates');

    require('./util/autotest').scanDir(
        autoTestDir,
        function run(dir, helpers, done) {
            let inputPath = path.join(dir, 'template.marko');
            var actualConcise = markoMigrate.transformTemplate(inputPath, { syntax: 'concise' });
            var actualHtml = markoMigrate.transformTemplate(inputPath, { syntax: 'html' });
            helpers.compare(actualHtml + '\n~~~~~~~\n' + actualConcise, '.marko');
            done();
        });
});
