#!/usr/bin/env node
'use strict'

const meow = require('meow')
const <%= camelModuleName %> = require('.')

const cli = meow({
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
