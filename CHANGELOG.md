# Changelog

## Table of Contents

<details><summary>Click to expand</summary>
- [Unreleased](#unreleased)
- [2.0.0](#200)
</details>

## [Unreleased][unreleased]

This upcoming release brings `generator-nom` up to par with latest `yo` and `yeoman-generator`. To install the bleeding edge:

```
npm i yo@latest ironSource/node-generator-nom#next -g
```

### Changed

- Upgrade `yeoman-generator` from `~0.21.1` to `~3.1.1`
- Travis and AppVeyor: upgrade to node 6, 8, 9 and 10
- Default to private GitHub repo
- Capitalize README headers
- Use standard badge style (remove `?style=flat-square`)
- Link to license file in README
- Save copyright owner to global settings
- Set initial `version` in `package.json` to `0.0.0`
- Make email address of `author` in `package.json` optional
- Set `engines.node` in `package.json` to `>=6`
- Set npm test script to `<runner> test` instead of `<runner> test/**/*.js`

### Added

- Select `standard` or custom code style
- Choose CLI module (none, `minimist`, `yargs`, `meow`, `commander`)
- Select copyright owner from previously entered names
- Add copyright year (`<current year>-present`) to README
- Add x86 and x64 to AppVeyor matrix
- Add node version badge to README.

### Removed

- Remove `gulpfile.babel.js`
- Remove use of `glob` in `gulpfile.js`, prefer explicit `require()`
- Remove `engines.npm` from `package.json`
- Remove `shallow_clone: true` from `appveyor.yml`
- Remove `--main` option
- Remove creation of `test/` directory.

### Fixed

- Support scoped package names
- Remove semicolons after `'use strict'`.

## [2.0.0][2.0.0]

### Changed

- Disable gulp subgenerator by default
- Make main file (`index.js`) optional
- Move CLI to own subgenerator, with new questions for name and path.
- CI: target node 0.10 and 4
- Deduce author's name and email from (in order): author field of existing `package.json`, npm config (legacy formats too) and git config. Because Yeoman reads the git config by spawning git, this is done lazily, as a last resort.
- Make author's URL in `package.json` optional
- Don't humanize author's URL, to keep it "clickable" in editors and other places.

### Added

- Optionally create Gulpfile as an ES6 `gulpfile.babel.js`.

### Fixed

- Always create a `package.json` (e.g. when running `nom:gulp` by itself)
- Preserve sort order of existing `package.json`, except for dependencies which are always sorted lexicographically (like npm does).
- Install latest npm on AppVeyor
- Pin Babel to 5.

[unreleased]: https://github.com/ironSource/node-generator-nom/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/ironSource/node-generator-nom/compare/v1.1.1...v2.0.0
