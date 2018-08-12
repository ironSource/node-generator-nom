'use strict'

const test = require('tape')
    , fs = require('fs')
    , u = require('./util')
    , run = require('./util/runner')('generators/entrypoint')

test('modules option', (t) => {
  t.plan(6)

  run(() => {
    let expected = u.read(u.fixture('entrypoint/index-cjs.js'))
    t.equal(u.read('index.js'), expected, 'defaults to CommonJS')
  })

  run({ options: { modules: 'CommonJS'} }, () => {
    let expected = u.read(u.fixture('entrypoint/index-cjs.js'))
    t.equal(u.read('index.js'), expected, 'CommonJS')
  })

  run({ options: { modules: 'commonjs'} }, () => {
    let expected = u.read(u.fixture('entrypoint/index-cjs.js'))
    t.equal(u.read('index.js'), expected, 'commonjs')
  })

  run({ options: { modules: 'ES6'} }, () => {
    let expected = u.read(u.fixture('entrypoint/index-esm.js'))
    t.equal(u.read('index.js'), expected, 'ES6')
  })

  run({ options: { modules: 'es6'} }, () => {
    let expected = u.read(u.fixture('entrypoint/index-esm.js'))
    t.equal(u.read('index.js'), expected, 'es6')
  })

  run({ options: { modules: 'invalid' }}, (err) => {
    t.ok(err, 'invalid option')
  })
})
