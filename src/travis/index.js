'use strict';

const Conditional = require('../conditional-subgen')
    , travisjs = require.resolve('travisjs/bin/travisjs')

const self = module.exports = class TravisGenerator extends Conditional {
  writing() {
    this.copy('_.travis.yml', '.travis.yml')
  }

  // The travis tool needs git info, so we need to run this
  // after everything else has been written to disk.
  end() {
    let done = this.async()
    this.spawnCommand('node', [travisjs, 'hook']).on('exit', done)
  }
}

self.task = 'Setup Travis'
self.regenerate = 'Setup Travis again'
self.runByDefault = false

self.shouldRun = function (ctx, opts, done) {
  done(null, !ctx.fs.exists('.travis.yml'))
}
