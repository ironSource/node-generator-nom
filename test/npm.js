const test = require('tape')
    , fs = require('fs')
  , { files, notFiles, fixture, read } = require('./util')
    , run = require('./util/runner')('src/npm')

test('main option', (t) => {
  function main(option, expected, msg, next) {
    run({ options: { main: option }}, (err) => {
      if (expected !== null) {
        if (option === false) notFiles(t, expected, msg)
        else files(t, expected, msg)
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
    let expected = read(fixture('npm/index-cjs.js'))
    t.equal(read('index.js'), expected, 'defaults to CommonJS')
  })

  run({ options: { modules: 'CommonJS'} }, () => {
    let expected = read(fixture('npm/index-cjs.js'))
    t.equal(read('index.js'), expected, 'CommonJS')
  })

  run({ options: { modules: 'commonjs'} }, () => {
    let expected = read(fixture('npm/index-cjs.js'))
    t.equal(read('index.js'), expected, 'commonjs')
  })

  run({ options: { modules: 'ES6'} }, () => {
    let expected = read(fixture('npm/index-esm.js'))
    t.equal(read('index.js'), expected, 'ES6')
  })

  run({ options: { modules: 'es6'} }, () => {
    let expected = read(fixture('npm/index-esm.js'))
    t.equal(read('index.js'), expected, 'es6')
  })

  run({ options: { modules: 'invalid' }}, (err) => {
    t.ok(err, 'invalid option')
  })
})
