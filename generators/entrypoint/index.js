'use strict'

const Conditional = require('../conditional-subgen')
const pathExists = require('path-exists')

const self = module.exports = class EntrypointGenerator extends Conditional {
  // TODO: prompt for location
  // TODO: get default location from package.main (also use this in shouldRun)
  // TODO: save location to package.main (if not "index.js")

  constructor (args, options, config) {
    super(args, options, config)

    // "--esm"
    this.option('esm', {
      type: Boolean,
      desc: 'Use ECMAScript Modules instead of CommonJS',
      default: false
    })
  }

  configuring () {
    this.fs.copyTpl(
      this.templatePath('_index.js'),
      this.destinationPath('index.js'),
      { esm: this.options.esm }
    )
  }
}

self.task = 'Create index.js file'
self.regenerate = 'Recreate index.js file'

self.shouldRun = function (ctx, opts, done) {
  done(null, !pathExists.sync(ctx.destinationPath('index.js')))
}
