const exists = require('path-exists')
    , fs = require('fs')
  , { resolve } = require('path')

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

exports.fixture = function fixture(path) {
  return resolve(__dirname, '..', 'fixtures', path)
}

exports.read = function read(path, encoding = 'utf8') {
  return fs.readFileSync(path, encoding)
}
