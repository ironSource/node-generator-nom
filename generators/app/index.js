'use strict'

const after = require('after')
const Generator = require('yeoman-generator')

const subgenerators =
  [ { name: 'npm', generator: require('../npm'), resolved: require.resolve('../npm') }
  , { name: 'entrypoint', generator: require('../entrypoint'), resolved: require.resolve('../entrypoint') }
  , { name: 'git', generator: require('../git'), resolved: require.resolve('../git') }
  , { name: 'gitignore', generator: require('../gitignore'), resolved: require.resolve('../gitignore') }
  , { name: 'github', generator: require('../github'), resolved: require.resolve('../github') }
  , { name: 'travis', generator: require('../travis'), resolved: require.resolve('../travis') }
  , { name: 'appveyor', generator: require('../appveyor'), resolved: require.resolve('../appveyor') }
  , { name: 'cli', generator: require('../cli'), resolved: require.resolve('../cli') }
  , { name: 'readme', generator: require('../readme'), resolved: require.resolve('../readme') }
  , { name: 'gulp', generator: require('../gulp'), resolved: require.resolve('../gulp') } ]

const self = module.exports = class NomGenerator extends Generator {
  constructor(args, options, config) {
    super(args, options, config)

    // "--name beep", "--description boop"
    ;['name', 'description'].forEach(option => {
      this.option(option, {
        type: String,
        desc: 'Module option passed to every subgenerator'
      })
    })

    // "--esm"
    this.option('esm', {
      type: Boolean,
      desc: 'Use ECMAScript Modules instead of CommonJS',
      default: false
    })

    // "--enable a --enable b" or "--enable a b"
    ;['enable', 'disable'].forEach( (option, i) => {
      let action = option[0].toUpperCase() + option.slice(1)
      let example = i===0 ? ' (e.g. "git,gulp")' : ''

      this.option(option, {
        type: String,
        desc: `${action} subgenerators${example} and skip questions.`
      })

      let value = this.options[option]

      if (typeof value === 'string') {
        value = value.split(/[ ,;\/|]+/)
      } else if (!Array.isArray(value)) {
        value = []
      }

      this.options[option] = value.map(g => g.trim().toLowerCase())
    })

    subgenerators.forEach(subgen => {
      // Note: not supported on command line
      this.option(subgen.name, { type: (v) => v || {}, default: {}, hide: true })
    })
  }

  collectTasks() {
    this.tasksToRun = []

    let primary = []
      , secondary = []
      , done = this.async()
      , next = after(subgenerators.length, err => {
        if (err) return done(err)
        this._promptForTasks(primary, secondary, done)
      })

    subgenerators.forEach(subgen => {
      let Generator = subgen.generator
      let task = Generator.task
      let shouldRun = Generator.shouldRun
      let regenerate = Generator.regenerate
      let runByDefault = Generator.runByDefault == null ? true : !!Generator.runByDefault

      let generatorOptions = this._getGeneratorOptions(subgen.name)

      shouldRun(this, generatorOptions, (err, should) => {
        if (err) return next(err)

        // TODO: maybe save these in rc too? So when nom (or a subgen) is executed
        // instead of the parent, these options aren't lost.
        let enable = this.options.enable.indexOf(subgen.name) >= 0
        let disable = this.options.disable.indexOf(subgen.name) >= 0

        if (disable) return next() // Skip subgen, no matter what

        if (should && enable) { // Skip question, subgen is required by parent
          this.tasksToRun.push(subgen.name)
          return next()
        }

        if (!should) {
          if (!regenerate) return next()
          task = regenerate
        }

        // TODO: remember choices independent of `should`
        ;(should ? primary : secondary).push({
          value: subgen.name,
          name: task,
          short: subgen.name,
          checked: should ? runByDefault : false
        })

        next()
      })
    })
  }

  // TODO: promisify
  _promptForTasks(primary, secondary, done) {
    let questions = []

    if (primary.length) questions.push({
      type: 'checkbox',
      name: 'primary',
      message: 'Tasks:',
      choices: primary
    })

    if (secondary.length) questions.push({
      type: 'checkbox',
      name: 'secondary',
      message: 'Additional tasks:',
      choices: secondary
    })

    if (!questions.length) return done()

    this.prompt(questions).then((answers) => {
      let primary = answers.primary || []
      let secondary = answers.secondary || []

      this.tasksToRun = this.tasksToRun.concat(primary).concat(secondary)
      done()
    })
  }

  _sub(subgen) {
    if (this.tasksToRun.indexOf(subgen.name) < 0) return
    const options = this._getGeneratorOptions(subgen.name)
    this.composeWith(subgen.resolved, options)
  }

  _getGeneratorOptions(generator) {
    return Object.assign({
      name: this.options.name,
      description: this.options.description,
      esm: this.options.esm,
      skipInstall: this.options.skipInstall,
      skipCache: this.options.skipCache
    }, this.options[generator])
  }
}

// Add subgens in same order, regardless of which the user picked
subgenerators.forEach(subgen => {
  self.prototype['run_' + subgen.name] = function() {
    this._sub(subgen)
  }
})
