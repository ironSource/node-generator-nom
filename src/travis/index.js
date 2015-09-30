'use strict';

var Conditional = require('../conditional-subgen')
  , travisjs = require.resolve('travisjs/bin/travisjs')

const self = module.exports = class TravisGenerator extends Conditional {
  static task = 'Setup Travis'
  static regenerate = 'Setup Travis again'
  static runByDefault = false
  static shouldRun(ctx, opts, done) {
    done(null, !ctx.fs.exists('.travis.yml'))
  }

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
