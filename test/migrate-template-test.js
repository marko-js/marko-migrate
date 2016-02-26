'use strict';
require('shelljs/global');

var chai = require('chai');
chai.config.includeStack = true;
var autotest = require('./autotest');
var path = require('path');
var markoMigrate = require('../');

describe('marko-migrate' , function() {

    var autoTestDir = path.join(__dirname, 'fixtures/autotest');

    autotest.scanDir(
        autoTestDir,
        function run(dir) {
            let inputPath = path.join(dir, 'template.marko');
            var actualConcise = markoMigrate.transformTemplate(inputPath, { syntax: 'concise' });
            var actualHtml = markoMigrate.transformTemplate(inputPath, { syntax: 'html' });
            return actualHtml + '\n~~~~~~~\n' + actualConcise;
        },
        {
            compareExtension: '.marko'
        });
});
