'use strict';
const shell = require('shelljs');
const chai = require('chai');
chai.config.includeStack = true;
const path = require('path');
const markoMigrate = require('../');

describe(path.basename(__filename), async () => {
    var autoTestDir = path.join(__dirname, 'marko2/autotest-projects');

    require('./util/autotest').scanDir(
        autoTestDir,
        function run(dir, helpers, done) {
          var targetDir = path.join(dir, `../.temp/${path.basename(dir)}`);

          console.log('TARGET DIR:', targetDir);

          shell.rm('-rf', targetDir);

          shell.mkdir('-p', targetDir);

          shell.cp('-R', dir, path.dirname(targetDir));

          markoMigrate.migrateProject(targetDir);
          done();
        });
});

