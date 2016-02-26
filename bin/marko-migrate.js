var options = require('argly')
    .createParser({
        '--help': {
            type: 'string',
            description: 'Show this help message'
        },
        '--syntax -s': {
            type: 'string',
            description: 'The syntax to use for migrated templates. Either "html" (default) or "concise"'
        }
    })
    .usage('Usage: $0 [options]')
    .example(
        'Migrate the project in the current directory',
        '$0')
    .example(
        'Migrate the project in the current directory and use the concise syntax for output templates',
        '$0 --syntax concise')
    .validate(function(result) {
        if (result.help) {
            this.printUsage();
            process.exit(0);
        }
    })
    .onError(function(err) {
        this.printUsage();
        console.error(err);
        process.exit(1);
    })
    .parse();

require('../').migrateProject(process.cwd(), options);