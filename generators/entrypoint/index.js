'use strict'

const Conditional = require('../conditional-subgen')
const pathExists = require('path-exists')

const self = module.exports = class EntrypointGenerator extends Conditional {
  // TODO: prompt for location
  // TODO: get default location from package.main (also use this in shouldRun)
  // TODO: save location to package.main (if not "index.js")

  constructor (args, options, config) {
    super(args, options, config)

    // "--modules es6"
    this.option('modules', {
      type: String,
      desc: 'Module format, case insensitive: es6 or commonjs',
      default: 'commonjs'
    })
  }

  initializing () {
    const modules = (this.options.modules || 'commonjs').toLowerCase()

    if (modules !== 'es6' && modules !== 'commonjs') {
      const msg = 'Module format must be "es6", "commonjs" or undefined'
      return this.env.error(msg)
    }

    this.options.modules = modules
  }

  configuring () {
    this.fs.copyTpl(
      this.templatePath('_index.js'),
      this.destinationPath('index.js'),
      { modules: this.options.modules }
    )
  }
}

self.task = 'Create index.js file'
self.regenerate = 'Recreate index.js file'

self.shouldRun = function (ctx, opts, done) {
  done(null, !pathExists.sync(ctx.destinationPath('index.js')))
}
