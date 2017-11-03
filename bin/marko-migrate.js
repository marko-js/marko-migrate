const migrate = require("../");
const path = require("path");

const options = require("argly")
  .createParser({
    "--help": {
      type: "string",
      description: "Show this help message"
    },
    "--syntax -s": {
      type: "string",
      description:
        'The syntax to use for migrated templates. Either "html" (default) or "concise"'
    },
    "--template -t": {
      type: "string",
      description: "A single template to migrate"
    },
    "--watch -w": {
      type: "boolean",
      description: "Watch and migrate a single template"
    },
    "--after-script": {
      type: "string",
      description:
        "A path to a JavaScript file to run as a final step (optional)"
    }
  })
  .usage("Usage: $0 [options]")
  .example("Migrate the project in the current directory", "$0")
  .example(
    "Migrate the project in the current directory and use the concise syntax for output templates",
    "$0 --syntax concise"
  )
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

if (options.template) {
  options.template = path.resolve(process.cwd(), options.template);
}

options.dir = process.cwd();

migrate(options).then(
  result => {
    if (result.success) {
      console.log("Migration completed successfully!");
    } else {
      console.log("Migration completed with errors!");
    }
  },
  err => {
    console.error("Migration failed:", err.stack || err);
    process.exit(1);
  }
);
