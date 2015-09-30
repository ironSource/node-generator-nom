# generator-nom

**A modular [Yeoman](http://yeoman.io) generator to create or update node modules. It's composed of several subgenerators - relatively unopinionated, apart from a preference for ES6 - that are usable by themselves. Most but not all input values are remembered.**

[![npm status](http://img.shields.io/npm/v/generator-nom.svg?style=flat-square)](https://www.npmjs.org/package/generator-nom) [![Dependency status](https://img.shields.io/david/ironsource/generator-nom.svg?style=flat-square)](https://david-dm.org/ironsource/generator-nom)

## demo

![demo](https://github.com/ironSource/node-generator-nom/raw/master/demo.gif)

## what it does

*`yo nom`* will ask you which subgenerators to execute, then executes those in order as listed below. Those you successfully ran before will be disabled by default. Run any of them separately with `yo nom:*`. For example: `yo nom:travis` to just setup Travis.

<style>
    dl.omnomnom dt { font-style: normal }
    dl.omnomnom code { color: red }
</style>

<dl class="omnomnom">
<dt>npm</dt><dd>Create <code>package.json</code> and prompt to keep dependencies of a previous <code>package.json</code> if any. Create <code>.gitignore</code>, <code>cli.js</code> (optional), install test framework (tape, tap, mocha, grunt, cake, or ava), add <code>LICENSE</code> file (MIT, BSD2 or BSD3).</dd>

<dt>git</dt><dd>Initialize local git repository, unless <code>.git</code> directory exists</dd>

<dt>github</dt><dd>Create public or private GitHub project, named "module-name" or "node-module-name". Unless local git already has configured remotes. Asks for access token and repository owner (which defaults to the owner of the token), skips creation if the repository already exists, adds URLs to <code>package.json</code> and adds remote origin.</dd>

<dt>travis</dt><dd>Add <code>.travis.yml</code> for node 0.10 and iojs, setup GitHub hook. The <code>travis</code> tool asks for username and password.</dd>

<dt>appveyor</dt><dd>Add <code>appveyor.yml</code> for node 0.10 and iojs, setup GitHub hook. Asks for access token.</dd>

<dt>gulp</dt><dd>Create an ES6 gulpfile and <code>tasks</code> directory.</dd>

<dt>style [todo]</dt><dd>Add <code>standard</code> or <code>xo</code> as a pretest script</dd>

<dt>readme</dt><dd>Add <code>readme.md</code> with common sections and <a href="https://shield.io">shield.io</a> badges for npm and david. If you did the travis and/or appveyor setup, badges for those services will be added as well.</dd>
</dl>

## usage

```
mkdir my-module
cd my-module
yo nom
```

## install

Install Yeoman and generator-nom globally with [npm](https://npmjs.org):

```
npm i yo generator-nom -g 
```

## license and acknowledgments

[MIT](http://opensource.org/licenses/MIT) © [ironSource](http://www.ironsrc.com/). Originally forked from [generator-n](https://www.npmjs.com/package/generator-n) © Andrei Kashcha. Small parts borrowed from [generator-nm](https://github.com/sindresorhus/generator-nm) © [Sindre Sorhus](http://sindresorhus.com/).
