'use strict'

const test = require('tape')
    , fs = require('fs')
    , u = require('./util')
    , run = require('./util/runner')('generators/npm')

test('main option', (t) => {
  function main(option, expected, msg, next) {
    run({ options: { main: option } }, (err) => {
      if (expected !== null) {
        if (option === false) u.notFiles(t, expected, msg)
        else u.files(t, expected, msg)
      }
      next && next(err)
    })
  }

  t.plan(6)

  main(true, 'index.js', 'defaults to index.js (1)')
  main(undefined, 'index.js', 'defaults to index.js (2)')
  main(' // libA/index b.js', 'lib-a/index-b.js')
  main(false, 'index.js', 'can be disabled')
  main('', null, null, (e) => t.ok(e, 'cannot be empty'))
  main('.', null, null, (e) => t.ok(e, 'must be param case'))
})

test('modules option', (t) => {
  t.plan(6)

  run(() => {
    let expected = u.read(u.fixture('npm/index-cjs.js'))
    t.equal(u.read('index.js'), expected, 'defaults to CommonJS')
  })

  run({ options: { modules: 'CommonJS'} }, () => {
    let expected = u.read(u.fixture('npm/index-cjs.js'))
    t.equal(u.read('index.js'), expected, 'CommonJS')
  })

  run({ options: { modules: 'commonjs'} }, () => {
    let expected = u.read(u.fixture('npm/index-cjs.js'))
    t.equal(u.read('index.js'), expected, 'commonjs')
  })

  run({ options: { modules: 'ES6'} }, () => {
    let expected = u.read(u.fixture('npm/index-esm.js'))
    t.equal(u.read('index.js'), expected, 'ES6')
  })

  run({ options: { modules: 'es6'} }, () => {
    let expected = u.read(u.fixture('npm/index-esm.js'))
    t.equal(u.read('index.js'), expected, 'es6')
  })

  run({ options: { modules: 'invalid' }}, (err) => {
    t.ok(err, 'invalid option')
  })
})
