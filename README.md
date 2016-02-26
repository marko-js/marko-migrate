Marko v3 Migration Tool
=======================

This tool can be used to migrate a project that uses Marko v2 to be compatible with Marko v3. All taglibs and templates within the project (excluding anything under `node_modules`) will automatically be migrated.

# Installation

```
npm install marko-migrate --global
```

# Usage

:warning: :warning: ___WARNING:___ This tool modifies a project in place! Make sure you are using source control or have your code backed up! If you are using source control then make sure everything has been committed first! :warning: :warning:

___IMPORTANT:___ Make sure you run an `npm install` for your current project _before_ running the migration script!

___NOTE:___ Node.js v4+ is required

## Migrate a project and use the HTML syntax

```
cd my-project/
marko-migrate --syntax html
```

## Migrate a project and use the concise syntax

```
cd my-project/
marko-migrate --syntax concise
```

# Example Output

You will receive output similar to the following:

```text
marko-migrate --syntax html
[modified] package.json
  - [info] Updated "marko" version: ^2.7.3 → ^3.0.0-rc.1 (in "dependencies")
  - [info] Updated "marko-widgets" version: ^5.0.0-beta → ^6.0.0-alpha.1 (in "dependencies")
  - [info] Updated "lasso" version: ^1.10.1 → ^2.0.0 (in "dependencies")
[modified] test/mocha-phantomjs/test-page.marko
[modified] src/pages/home/template.marko
[modified] src/pages/error/template.marko
[modified] src/components/app-todo-item/template.marko
[modified] src/components/app-notifications-overlay/template.marko
[modified] src/components/app-notification/template.marko
[modified] src/components/app-main/template.marko
[modified] src/components/app-header/template.marko
[modified] src/components/app-footer/template.marko
[modified] src/components/app/template.marko
[moved] src/marko-taglib.json → src/marko.json

PENDING TASKS:
[task] The following installed package should now be migrated: node_modules/browser-refresh-taglib/marko-taglib.json
[task] The following installed package should now be migrated: node_modules/lasso/marko-taglib.json
[task] The following installed package should now be migrated: node_modules/marko-widgets/marko-taglib.json

Migration completed successfully!:
- 0 warning(s)
- 3 pending task(s)
```