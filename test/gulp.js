'use strict'

const test = require('tape')
    , fs = require('fs')
    , u = require('./util')
    , run = require('./util/runner')('generators/gulp')

test('creates gulpfile and example gulp task', (t) => {
  t.plan(1)
  run(() => u.files(t, ['gulpfile.js', 'tasks/build.js']))
})

test('saves dependencies', (t) => {
  t.plan(1)

  run(() => {
    let expected = ['gulp']
      , pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      , actual = Object.keys(pkg.devDependencies)

    t.deepEqual(actual.sort(), expected.sort())
  })
})
