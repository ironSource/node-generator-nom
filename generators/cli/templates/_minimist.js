#!/usr/bin/env node
'use strict'

const <%= camelModuleName %> = require('./')
    , argv = require('minimist')(process.argv.slice(2))
