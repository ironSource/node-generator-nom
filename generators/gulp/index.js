'use strict'

const Conditional = require('../conditional-subgen')

const self = module.exports = class GulpGenerator extends Conditional {
  constructor(args, options, config) {
    super(args, options, config)

    this.option('tasks', {
      type: String,
      default: this.templatePath('tasks') + '/*'
    })

    this.ctx = {}
  }

  writing() {
    let deps = {
      'gulp': '~3.9.0'
    }

    this._copyTpl('_gulpfile.js', 'gulpfile.js')

    let ctx = Object.assign({}, this.ctx, this.options.ctx)
      , tasks = [].concat(this.options.tasks)

    this.fs.copyTpl(tasks, this.destinationPath('tasks'), ctx)

    this.saveDependencies(deps, { dev: true }, this.async())
  }

  _copyTpl(src, dest) {
    this.fs.copyTpl(this.templatePath(src), this.destinationPath(dest), this.ctx)
  }
}

self.task = 'Install gulp 3.9 and create gulpfile'
self.regenerate = 'Reinstall gulp 3.9 and recreate gulpfile'
self.runByDefault = false

self.shouldRun = function (ctx, opts, done) {
  done(null, !ctx.fs.exists('gulpfile.js'))
}
