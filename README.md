# generator-nom

**A modular [Yeoman](http://yeoman.io) generator to create or update node modules. It's composed of several subgenerators, relatively unopinionated, usable by themselves. Most but not all input values are remembered.**

[![npm status](http://img.shields.io/npm/v/generator-nom.svg)](https://www.npmjs.org/package/generator-nom)
[![Dependency status](https://img.shields.io/david/ironsource/node-generator-nom.svg)](https://david-dm.org/ironsource/node-generator-nom)

![demo](https://github.com/ironSource/node-generator-nom/raw/master/demo.gif)

## What It Does

*`yo nom`* will ask you which subgenerators to execute, then executes those in order as listed below. Those you successfully ran before will be disabled by default. Run any of them separately with `yo nom:*`. For example: `yo nom:travis` to just setup Travis.

### `npm`

Create `package.json`, `.gitignore`, install test framework (tape, tap, mocha, grunt, cake, or ava), add `LICENSE` file (MIT, BSD2 or BSD3). If a `package.json` already exists, it will be merged, used for default answers and for sort order of the top-level fields. At deeper levels, like dependencies, nom behaves like npm and sorts lexicographically.

### `git`

Initialize local git repository, unless `.git` directory exists.

### `github`

Create public or private GitHub project, named "module-name" or "node-module-name". Unless local git already has configured remotes. Asks for access token and repository owner (which defaults to the owner of the token), skips creation if the repository already exists, adds URLs to `package.json` and adds remote origin.

### `travis`

Add `.travis.yml` for node 0.10 and iojs, setup GitHub hook. The `travis` tool asks for username and password.

### `appveyor`

Add `appveyor.yml` for node 0.10 and iojs, setup GitHub hook. Asks for access token.

### `cli`

Create a CLI app (with [meow](https://github.com/sindresorhus/meow)) and add a `bin` field to `package.json`. Asks for name and path.

### `readme`

Add `readme.md` with common sections and [shield.io](https://shield.io) badges for npm and david. If you did the travis and/or appveyor setup, badges for those services will be added as well.

### `gulp`

Create a gulpfile and `tasks` directory. Installs `gulp`.

## Usage

```
mkdir my-module
cd my-module
yo nom
```

## Install

Install Yeoman and generator-nom globally with [npm](https://npmjs.org):

```
npm i yo generator-nom -g
```

## Changelog

### Unreleased

This release brings `generator-nom` up to par with latest `yo` and `yeoman-generator`. To install:

```
npm i yo@latest generator-nom@latest -g
```

#### Changed

- Upgrade `yeoman-generator` from `~0.21.1` to `~3.1.1`
- Travis and AppVeyor: upgrade to node 6, 8, 9 and 10
- Default to private GitHub repo
- Capitalize README headers
- Use standard badge style (remove `?style=flat-square`)
- Link to license file in README
- Save copyright owner to global settings
- Set initial `version` in `package.json` to `0.0.0`
- Make email and url of `author` in `package.json` optional
- Set `engines.node` in `package.json` to `>=6`
- Set npm test script to `<runner> test` instead of `<runner> test/**/*.js`

#### Added

- Select `standard` or custom code style
- Add copyright year (`<year>-present`) to README
- Add x86 and x64 to AppVeyor matrix
- Add node version badge to README
- Choose CLI module (none, `minimist`, `yargs`, `meow`, `commander`)
- Select copyright owner from previously entered names

#### Removed

- Remove `gulpfile.babel.js`
- Remove use of `glob` in `gulpfile.js`, prefer explicit `require()`
- Remove `engines.npm` from `package.json`
- Remove `shallow_clone: true` from `appveyor.yml`
- Remove `--main` option
- Remove creation of `test/` directory

#### Fixed

- Support scoped package names
- Remove semicolon after `'use strict'` in main file

### 2.0.0

- Gulpfile can be in ES5 or ES6.
- Disable gulp subgenerator by default
- A `package.json` will always be created (for example, when running `nom:gulp` by itself).
- Generation of main file (`index.js`) is optional
- Move CLI to own subgenerator, with new questions for name and path.
- Preserve sort order of existing `package.json`, except for dependencies which are always sorted lexicographically (like npm does).
- CI targets node 0.10 and 4
- Install latest npm on AppVeyor
- Deduce author's name and email from (in order): author field of existing `package.json`, npm config (legacy formats too) and git config. Because Yeoman reads the git config by spawning git, it is done lazily, as a last resort.
- Don't humanize author's URL, to keep it "clickable" in editors and other places
- Author URL is optional
- Pin Babel to 5

## License

[MIT](LICENSE) © 2015-present [ironSource](http://www.ironsrc.com/). Originally forked from [generator-n](https://www.npmjs.com/package/generator-n) © Andrei Kashcha. Small parts borrowed from [generator-nm](https://github.com/sindresorhus/generator-nm) © [Sindre Sorhus](http://sindresorhus.com/).
