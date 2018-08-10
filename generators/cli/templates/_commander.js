#!/usr/bin/env node
'use strict'

const <%= camelModuleName %> = require('./')
    , program = require('commander')

program
  .version('0.0.1')
  .option('-p, --peppers', 'Add peppers')
  .parse(process.argv)
