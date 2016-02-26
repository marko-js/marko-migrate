'use strict';
require('shelljs/global');

var chai = require('chai');
chai.config.includeStack = true;
var path = require('path');
var markoMigrate = require('../');


function migrateProject(name) {
    var targetDir = path.join(__dirname, `temp/${name}`);
    var srcDir = path.join(__dirname, `fixtures/test-projects/${name}`);

    rm('-rf', targetDir);

    mkdir('-p', targetDir);

    cp('-R', srcDir, path.dirname(targetDir));

    markoMigrate.migrateProject(targetDir);
}

describe('marko-migrate/migrate-project' , function() {
    it('success', function() {
        migrateProject('success');
    });

    it('migrated-dependency', function() {
        migrateProject('migrated-dependency');
    });

    it('bad-taglib-body-property', function() {
        migrateProject('bad-taglib-body-property');
    });
});
