'use strict'

const test = require('tape')
    , fs = require('fs')
    , u = require('./util')
    , run = require('./util/runner')('generators/npm')

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
