'use strict'

const Conditional = require('../conditional-subgen')
    , git = require('gift')
    , pathExists = require('path-exists')

const self = module.exports = class GitGenerator extends Conditional {
  initializing() {
    let done = this.async()

    self.shouldRun(this, this.options, (err, should) => {
      if (!should) {
        // TODO: prompt with warning
        this.log.skip('.git - removing is not yet implemented')
        return done()
      }

      git.init(this.destinationRoot(), (err, repo) => {
        if (err) return done(err)

        this.log.create('.git')
        setImmediate(done)
      })
    })
  }
}

self.task = 'Initialize local git repository'
self.regenerate = 'Remove and re-initialize local repository'

self.shouldRun = function (ctx, opts, done) {
  done(null, !pathExists.sync(ctx.destinationPath('.git')))
}
