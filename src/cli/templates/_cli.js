#!/usr/bin/env node
'use strict';

var meow = require('meow')
  , <%= camelModuleName %> = require('./')

var cli = meow({
  help: [
    'Usage',
    '  $ <%= binName %> [input]',
    '',
    'Options',
    '  --flag  Description (default: false)',
    '',
    'Examples',
    '  $ <%= binName %>',
    '  unicorns',
    '  $ <%= binName %> ponies',
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
