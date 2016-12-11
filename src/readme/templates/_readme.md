# <%= packageName %>

**<%= packageDescription %>**

[![npm status](http://img.shields.io/npm/v/<%= packageName %>.svg?style=flat-square)](https://www.npmjs.org/package/<%= packageName %>) [![node](https://img.shields.io/node/v/<%= packageName %>.svg?style=flat-square)](https://www.npmjs.org/package/<%= packageName %>) <% if (repoName) { %><% if (hasTravis) { %>[![Travis build status](https://img.shields.io/travis/<%= repoName %>.svg?style=flat-square&label=travis)](http://travis-ci.org/<%= repoName %>) <% } %><% if (hasAppVeyor) { %>[![AppVeyor build status](https://img.shields.io/appveyor/ci/<%= repoName %>.svg?style=flat-square&label=appveyor)](https://ci.appveyor.com/project/<%= repoName %>) <% } %>[![Dependency status](https://img.shields.io/david/<%= repoName %>.svg?style=flat-square)](https://david-dm.org/<%= repoName %>)<% } %>

## example

`npm i <%= packageName %>`

```js
const <%= camelCaseName %> = require('<%= packageName %>')
```

## api

### `main(arg[,opts])`

## install

With [npm](https://npmjs.org) do:

```
npm install <%= packageName %>
```

## license

[<%= packageLicense %>](http://opensource.org/licenses/<%= packageLicense %>) © <%= authorLink %>
