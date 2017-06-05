const test = require('tape')
    , fs = require('fs')
  , { files, notFiles } = require('./util')
    , run = require('./util/runner')('src/gulp')

test('esnext', (t) => {
  const ES6 = ['gulpfile.babel.js', '.babelrc']
      , ES5 = ['gulpfile.js']

  t.test('esnext option true', (t) => {
    t.plan(2)
    run({ options: { esnext: true }}, () => {
      files(t, ES6)
      notFiles(t, ES5)
    })
  })

  t.test('esnext option false', (t) => {
    t.plan(2)
    run({ options: { esnext: false }}, () => {
      files(t, ES5)
      notFiles(t, ES6)
    })
  })

  t.test('esnext prompt true', (t) => {
    t.plan(2)
    run({ prompts: { esnext: true }}, () => {
      files(t, ES6)
      notFiles(t, ES5)
    })
  })

  t.test('esnext prompt false', (t) => {
    t.plan(2)
    run({ prompts: { esnext: false }}, () => {
      files(t, ES5)
      notFiles(t, ES6)
    })
  })

  t.test('esnext option overrides prompt', (t) => {
    t.plan(2)

    run({options: { esnext: true }, prompts: { esnext: false }}, () => {
      files(t, ES6)
      notFiles(t, ES5)
    })
  })
})

test('creates example gulp task', (t) => {
  t.plan(1)
  run(() => files(t, ['tasks/build.js']))
})

test('saves dependencies', (t) => {
  t.plan(1)

  run({ options: { esnext: true } }, () => {
    let expected = ['gulp', 'gulp-util', 'glob', 'babel-core']
      , pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      , actual = Object.keys(pkg.devDependencies)

    t.deepEqual(actual.sort(), expected.sort())
  })
})
