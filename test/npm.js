const test = require('tape')
    , fs = require('fs')

const { files, notFiles, run, fixture, read } = require('./util')

test('main option', (t) => {
  function main(option, expected, msg, next) {
    run('npm', { options: { main: option }}, (err) => {
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

  run('npm', {}, () => {
    let expected = read(fixture('npm/index-cjs.js'))
    t.equal(read('index.js'), expected, 'defaults to CommonJS')
  })

  run('npm', { options: { modules: 'CommonJS'} }, () => {
    let expected = read(fixture('npm/index-cjs.js'))
    t.equal(read('index.js'), expected, 'CommonJS')
  })

  run('npm', { options: { modules: 'commonjs'} }, () => {
    let expected = read(fixture('npm/index-cjs.js'))
    t.equal(read('index.js'), expected, 'commonjs')
  })

  run('npm', { options: { modules: 'ES6'} }, () => {
    let expected = read(fixture('npm/index-esm.js'))
    t.equal(read('index.js'), expected, 'ES6')
  })

  run('npm', { options: { modules: 'es6'} }, () => {
    let expected = read(fixture('npm/index-esm.js'))
    t.equal(read('index.js'), expected, 'es6')
  })

  run('npm', { options: { modules: 'invalid' }}, (err) => {
    t.ok(err, 'invalid option')
  })
})
