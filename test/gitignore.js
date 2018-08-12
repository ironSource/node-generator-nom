'use strict'

const test = require('tape')
const fs = require('fs')
const u = require('./util')
const run = require('./util/runner')('generators/gitignore')

test('creates .gitignore file', (t) => {
  t.plan(1)
  run(() => u.files(t, ['.gitignore']))
})
