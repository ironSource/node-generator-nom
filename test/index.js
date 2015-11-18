const test = require('tape')
    , fs = require('fs')

const { files, notFiles, run } = require('./util')

test('esnext option or prompt', (t) => {
  const ES6 = ['gulpfile.babel.js', '.babelrc']
      , ES5 = ['gulpfile.js']

  t.test('esnext option true', (t) => {
    t.plan(2)
    run('gulp', { options: { esnext: true }}, () => {
      files(t, ES6)
      notFiles(t, ES5)
    })
  })

  t.test('esnext option false', (t) => {
    t.plan(2)
    run('gulp', { options: { esnext: false }}, () => {
      files(t, ES5)
      notFiles(t, ES6)
    })
  })

  t.test('esnext prompt true', (t) => {
    t.plan(2)
    run('gulp', { prompts: { esnext: true }}, () => {
      files(t, ES6)
      notFiles(t, ES5)
    })
  })

  t.test('esnext prompt false', (t) => {
    t.plan(2)
    run('gulp', { prompts: { esnext: false }}, () => {
      files(t, ES5)
      notFiles(t, ES6)
    })
  })

  t.test('esnext option overrides prompt', (t) => {
    t.plan(2)

    run('gulp')
      .withOptions({ esnext: true })
      .withPrompts({ esnext: false })
      .on('end', () => {
        files(t, ES6)
        notFiles(t, ES5)
      })
  })
})

test('creates example gulp task', (t) => {
  t.plan(1)
  run('gulp', () => {
    files(t, ['tasks/build.js'])
  })
})

test('saves dependencies', (t) => {
  t.plan(1)

  let options = { esnext: true }

  run('gulp', { options }, () => {
    let expected = ['gulp', 'gulp-util', 'glob', 'babel-core']
      , pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      , actual = Object.keys(pkg.devDependencies)

    t.deepEqual(actual.sort(), expected.sort())
  })
})
