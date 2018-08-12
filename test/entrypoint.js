'use strict'

const test = require('tape')
    , fs = require('fs')
    , u = require('./util')
    , run = require('./util/runner')('generators/entrypoint')

test('esm option', (t) => {
  t.plan(3)

  run(() => {
    let expected = u.read(u.fixture('entrypoint/index-cjs.js'))
    t.equal(u.read('index.js'), expected, 'defaults to CommonJS')
  })

  run({ options: { esm: false } }, () => {
    let expected = u.read(u.fixture('entrypoint/index-cjs.js'))
    t.equal(u.read('index.js'), expected, 'CommonJS')
  })

  run({ options: { esm: true } }, () => {
    let expected = u.read(u.fixture('entrypoint/index-esm.js'))
    t.equal(u.read('index.mjs'), expected, 'ES6')
  })
})
