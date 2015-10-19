'use strict';

var Conditional = require('../conditional-subgen')

const self = module.exports = class GulpGenerator extends Conditional {
  static task = 'Install gulp and setup ES6 gulpfile'
  static regenerate = 'Reinstall gulp and recreate ES6 gulpfile'
  static shouldRun(ctx, opts, done) {
    done(null, !ctx.fs.exists('gulpfile.js') && !ctx.fs.exists('gulpfile.babel.js'))
  }

  constructor(args, options, config) {
    super(args, options, config)

    this.option('tasks', {
      type: 'String',
      defaults: this.templatePath('tasks') + '/*'
    })
  }

  writing() {
    this.copy('_gulpfile.babel.js', 'gulpfile.babel.js')
    this.copy('_.babelrc', '.babelrc')

    let ctx = this.options.ctx || {}
    this.fs.copyTpl([].concat(this.options.tasks), this.destinationPath('tasks'), ctx)

    let deps = {
      'gulp': '~3.9.0',
      'gulp-util': '~3.0.6',
      'babel-core': null, // use latest version
      'glob': null
    }

    this.saveDependencies(deps, { dev: true }, this.async())
  }
}
