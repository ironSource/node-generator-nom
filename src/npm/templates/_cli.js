#!/usr/bin/env node
'use strict';

var meow = require('meow')
  , <%= camelModuleName %> = require('./')

var cli = meow({
  help: [
    'Usage',
    '  $ <%= moduleName %> [input]',
    '',
    'Options',
    '  --flag  Description (default: false)',
    '',
    'Examples',
    '  $ <%= moduleName %>',
    '  unicorns',
    '  $ <%= moduleName %> ponies',
    '  ponies'
  ]
}, {
  boolean: ['flag'],
  string: ['format'],
  default: {
    format: 'text'
  }
})

console.log(<%= camelModuleName %>(cli.input[0] || 'unicorns'))
