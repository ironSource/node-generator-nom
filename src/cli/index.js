'use strict';

var Conditional = require('../conditional-subgen')
  , camelCase = require('camel-case')
  , paramCase = require('param-case')

function paramCasePath(path) {
  path = path.toLowerCase()
  if (path.slice(-3) === '.js') path = path.slice(0, -3)

  return path.split(/[\/\\]+/).map((k, i) => {
    if (k === '.') return i === 0 ? '.' : ''
    return paramCase(k)
  }).filter(k=>k).join('/')
}

module.exports = class CliGenerator extends Conditional {
  static task = 'Create CLI app'
  static regenerate = 'Recreate CLI app'
  static runByDefault = false
  static shouldRun(ctx, opts, done) {
    let { bin } = ctx.fs.readJSON('package.json', {})
    done(null, !bin)
  }

  prompting() {
    let pack = this.fs.readJSON('package.json', false)

    if (!pack) return this.log.error('Cannot create CLI app because package.json is missing')
    if (!pack.name) return this.log.error('Cannot create CLI app because package name is missing')

    let prevBinName = pack.bin
      , prevBinPath

    if (typeof prevBinName === 'object') {
      let names = Object.keys(pack.bin)

      if (names.length === 0) {
        prevBinName = null
      } if (names.length === 1) { // bin: { [binName]: 'file.js' }
        prevBinName = names[0]
        prevBinPath = pack.bin[prevBinName]
      } else {
        return this.log.error('Cannot create CLI app because multiple binaries are not supported')
      }
    } else if (typeof prevBinName === 'string') { // bin: 'file.js'
      prevBinPath = prevBinName
      prevBinName = pack.name
    } else {
      prevBinName = null
    }

    let questions = [{
      name: 'path',
      message: 'Where do you want to place the CLI source?',
      default: prevBinPath || 'cli.js',
      validate: (val) => paramCasePath(val).length ? true : 'You have to provide a CLI path',
      filter: (val) => paramCasePath(val) + '.js'
    }, {
      name: 'binName',
      message: 'What should be the executable name?',
      default: prevBinName || pack.name,
      validate: (val) => paramCase(val).length ? true : 'You have to provide a name',
      filter: (val) => paramCase(val)
    }]

    let done = this.async()

    this.prompt(questions, (answers) => {
      this.answers = answers
      this.pack = pack

      done()
    })
  }

  writing() {
    let pack = this.pack
    if (!pack) return

    let { path, binName } = this.answers
    let moduleName = pack.name
      , camelModuleName = camelCase(moduleName)

    this.fs.copyTpl
      ( this.templatePath('_cli.js')
      , this.destinationPath(path)
      , { camelModuleName, binName })

    let binField = binName === moduleName ? path : { [binName]: path }

    if (pack.bin) {  // Keep existing order
      pack.bin = binField
    } else {         // Add after description, or in the beginning
      let clone = {}
        , keys = Object.keys(pack)
        , added = false

      for(let i=0, last=keys.length-1; i <= last; i++) {
        let k = keys[i]
        clone[k] = pack[k]

        if (!added && (k.toLowerCase() === 'description' || i > 3 || i === last)) {
          added = true
          clone.bin = binField
        }
      }

      pack = clone
    }

    this.fs.writeJSON('package.json', pack)
    this.saveDependencies({ meow: null }, { dev: true }, this.async())
  }
}
