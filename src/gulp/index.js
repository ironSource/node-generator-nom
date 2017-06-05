'use strict';

const Conditional = require('../conditional-subgen')
const { looseBoolean } = require('../app/option-parser')

const self = module.exports = class GulpGenerator extends Conditional {
  constructor(args, options, config) {
    super(args, options, config)

    this.option('tasks', {
      type: 'String',
      defaults: this.templatePath('tasks') + '/*'
    })

    // "--esnext" or "--no-esnext" or "--esnext true"
    this.option('esnext', {
      type: 'Boolean',
      desc: `Use ES6 gulpfile or not (--no-esnext) and skip question`
    })

    this.options.esnext = looseBoolean(this.options.esnext, undefined)
  }

  prompting() {
    if (this.options.esnext === undefined) {
      let questions = [
        { type: 'confirm'
        , name: 'esnext'
        , message: 'Do you want an ES6 gulpfile?'
        , default: true
        , store: true }
      ]

      let done = this.async()
      this.prompt(questions, (answers) => {
        this.ctx = answers
        done()
      })
    } else {
      this.ctx = { esnext: this.options.esnext }
    }
  }

  writing() {
    let deps = {
      'gulp': '~3.9.0',
      'gulp-util': '~3.0.6',
      'glob': null // use latest version
    }

    if (this.ctx.esnext) {
      this._copyTpl('_gulpfile.babel.js', 'gulpfile.babel.js')
      this._copyTpl('_.babelrc', '.babelrc')
      deps['babel-core'] = '~5.8.33'
    } else {
      deps['object-assign'] = null
      this._copyTpl('_gulpfile.js', 'gulpfile.js')
    }

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
  done(null, !ctx.fs.exists('gulpfile.js') && !ctx.fs.exists('gulpfile.babel.js'))
}
