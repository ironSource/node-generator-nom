'use strict'

const Conditional = require('../conditional-subgen')
const pathExists = require('path-exists')

const self = module.exports = class GitignoreGenerator extends Conditional {
  configuring () {
    this.fs.copyTpl(
      this.templatePath('_.gitignore'),
      this.destinationPath('.gitignore')
    )
  }
}

self.task = 'Create .gitignore file'
self.regenerate = 'Recreate .gitignore file'

self.shouldRun = function (ctx, opts, done) {
  done(null, !pathExists.sync(ctx.destinationPath('.gitignore')))
}
