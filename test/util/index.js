const pathExists = require('path-exists')

const { resolve, join } = require('path')
    , { test: helpers } = require('yeoman-generator')

const SRC = resolve(__dirname, '..', '..', 'src')

function files(t, files, msg) {
  files = [].concat(files)
  let passed = files.filter(f => pathExists.sync(f))
  t.deepEqual(passed, files, msg || files.join(', '))
}

function notFiles(t, files, msg) {
  files = [].concat(files)
  let passed = files.filter(f => !pathExists.sync(f))
  t.deepEqual(passed, files, msg || ('not: ' + files.join(', ')))
}

function run(generator, args, end) {
  if (typeof args === 'function') end = args, args = {}

  let ctx = helpers.run(join(SRC, generator))
  let { options = {}, prompts = {} } = args || {}

  ctx.withOptions(options).withPrompts(prompts)
  if (end) ctx.on('end', end)

  return ctx
}

exports.files = files
exports.notFiles = notFiles
exports.run = run
