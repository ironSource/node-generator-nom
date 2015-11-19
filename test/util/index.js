const exists = require('path-exists')
    , fs = require('fs')
    , patch = require('monkeypatch')

const { resolve, join } = require('path')
    , { test: helpers } = require('yeoman-generator')

const SRC = resolve(__dirname, '..', '..', 'src')
    , FIXTURE = resolve(__dirname, '..', 'fixtures')

const queue = []

exports.files = function files(t, files, msg) {
  files = [].concat(files)
  let passed = files.filter(f => exists.sync(f))
  t.deepEqual(passed, files, msg || files.join(', '))
}

exports.notFiles = function notFiles(t, files, msg) {
  files = [].concat(files)
  let passed = files.filter(f => !exists.sync(f))
  t.deepEqual(passed, files, msg || ('not: ' + files.join(', ')))
}

exports.run = function run(generator, args, cb) {
  if (typeof args === 'function') cb = args, args = {}

  function next(fn = queue.shift()) {
    if (fn) setImmediate(fn)
    else queue.running = false
  }

  function start() {
    let ctx = helpers.run(join(SRC, generator))
    let { options = {}, prompts = {} } = args || {}

    ctx.withOptions(options).withPrompts(prompts)

    function end(err) {
      next()
      if (cb) cb(err)
    }

    ctx.on('end', end).on('error', end)

    if (start.init) start.init(ctx)
  }

  if (!queue.running) {
    queue.running = true
    next(start)
  } else {
    queue.push(start)
  }

  return function setInit(fn) {
    start.init = fn
  }
}

exports.fixture = function fixture(path) {
  return join(FIXTURE, path)
}

exports.read = function read(path, encoding = 'utf8') {
  return fs.readFileSync(path, encoding)
}
