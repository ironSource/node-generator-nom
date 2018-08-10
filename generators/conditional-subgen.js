'use strict'

const ConfigStore = require('configstore')
    , after = require('after')
    , latest = require('latest-version')
    , Generator = require('yeoman-generator')

const pkg = require('../package.json')
const moduleName = pkg.name
const bugs = pkg.bugs

const self = module.exports = class ConditionalGenerator extends Generator {
  constructor(args, options, config) {
    super(args, options, config)
    this.settings = self.getSettings()
  }

  saveDependencies(deps, opts, done) {
    if (typeof opts === 'function') done = opts, opts = {}

    let group = opts && opts.dev ? 'devDependencies' : 'dependencies'

    if (Array.isArray(deps)) {
      let obj = Object.create(null)
      deps.forEach(dep => obj[dep] = null)
      deps = obj
    }

    let pkg = this.fs.readJSON('package.json', {})

    // Will run during the 'install' phase of the run loop. Other
    // subgens have the opportunity to add dependencies before that.
    if (!self.hasInstallScheduled && !this.options.skipInstall) {
      self.hasInstallScheduled = true
      this.npmInstall()
    }

    let output = pkg[group] || {}
      , names = Object.keys(deps)

    let next = after(names.length, err => {
      if (err) return done(err)

      pkg[group] = output
      this.fs.writeJSON('package.json', pkg)

      done()
    })

    names.forEach(dep => {
      let wished = deps[dep]
      let installed = this.fs.readJSON(this.destinationPath(`node_modules/${dep}/package.json`), {}).version

      if (wished || installed) {
        output[dep] = wished || ('~' + installed)
        return setImmediate(next)
      }

      latest(dep, (err, version) => {
        if (err) this.log.error('Could not fetch version of %s, please save manually: %s', dep, err)
        else output[dep] = '~' + version
        next()
      })
    })
  }

  moduleName() {
    return moduleName
  }

  moduleBugs() {
    return bugs
  }

  prompt (questions) {
    return super.prompt(questions).then((answers) => {
      // Yeoman-generator stores config both globally and in the
      // destination directory. I don't care for that.
      this.fs.delete(this.destinationPath('.yo-rc.json'))
      return answers
    })
  }
}

self.getSettings = function () {
  return self.settings || (self.settings = new ConfigStore(moduleName))
}
