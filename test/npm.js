'use strict'

const test = require('tape')
    , fs = require('fs')
    , u = require('./util')
    , run = require('./util/runner')('generators/npm')

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

test('codeStyle prompt: standard', (t) => {
  t.plan(3)

  run({ prompts: { codeStyle: 'standard', testFramework: 'none' }}, (err) => {
    t.ifError(err, 'non error')
    const pkg = u.readJSON('package.json')
    t.is(pkg.scripts.test, 'standard')
    t.ok(pkg.devDependencies.standard, 'has dependency')
  })
})

test('codeStyle prompt: standard with tape', (t) => {
  t.plan(3)

  run({ prompts: { codeStyle: 'standard', testFramework: 'tape' }}, (err) => {
    t.ifError(err, 'non error')
    const pkg = u.readJSON('package.json')
    t.is(pkg.scripts.test, 'standard && tape test')
    t.ok(pkg.devDependencies.standard, 'has dependency')
  })
})

test('codeStyle prompt: custom scoped', (t) => {
  t.plan(3)

  run({ prompts: { codeStyle: '__custom__', customCodeStyle: '@example/foo', testFramework: 'none' }}, (err) => {
    t.ifError(err, 'non error')
    const pkg = u.readJSON('package.json')
    t.is(pkg.scripts.test, 'foo', 'uses basename as bin')
    t.ok('@example/foo' in pkg.devDependencies, 'has dependency')
  })
})
