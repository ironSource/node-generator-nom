'use strict'

const after = require('after')
const Base = require('yeoman-generator').Base
const optParser = require('./option-parser')

const subgenerators =
  [ 'npm'
  , 'git'
  , 'github'
  , 'travis'
  , 'appveyor'
  , 'cli'
  , 'readme'
  , 'gulp' ]

const self = module.exports = class NomGenerator extends Base {
  constructor(args, options, config) {
    super(args, options, config)

    // "--name beep", "--description boop"
    ;['name', 'description'].forEach(option => {
      this.option(option, {
        type: 'String',
        desc: 'Module option passed to every subgenerator'
      })

      this.options[option] = optParser.strictString(this.options[option], undefined)
    })

    // "--esnext" or "--no-esnext" or "--esnext true"
    this.option('esnext', {
      type: 'Boolean',
      desc: `Use ES6 when possible or never (--no-esnext)`
    })

    this.options.esnext = optParser.looseBoolean(this.options.esnext, undefined)

    // "--modules es6"
    this.option('modules', {
      type: 'String',
      desc: 'Module format, case insensitive: ES6 or CommonJS'
    })

    let modules
      = this.options.modules
      = optParser.strictString(this.options.modules, undefined)

    if (modules !== undefined) {
      modules = this.options.modules = modules.toLowerCase()
      if (modules !== 'es6' && modules !== 'commonjs') {
        throw new Error('Module format must be "es6", "commonjs" or undefined')
      }
    }

    if (this.options.esnext === false) this.options.modules = 'commonjs'

    // "--enable a --enable b" or "--enable a b"
    ;['enable', 'disable'].forEach( (option, i) => {
      let action = option[0].toUpperCase() + option.slice(1)
      let example = i===0 ? ' (e.g. "git,gulp")' : ''

      this.option(option, {
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
      this.option(subgen, { type: 'Object', default: {}, hide: true })
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
      let path = require.resolve(`../${subgen}`)
        , Generator = require(path)

      let task = Generator.task
      let shouldRun = Generator.shouldRun
      let regenerate = Generator.regenerate
      let runByDefault = Generator.runByDefault == null ? true : !!Generator.runByDefault

      let generatorOptions = this._getGeneratorOptions(subgen)

      shouldRun(this, generatorOptions, (err, should) => {
        if (err) return next(err)

        // TODO: maybe save these in rc too? So when nom (or a subgen) is executed
        // instead of the parent, these options aren't lost.
        let enable = this.options.enable.indexOf(subgen) >= 0
        let disable = this.options.disable.indexOf(subgen) >= 0

        if (disable) return next() // Skip subgen, no matter what

        if (should && enable) { // Skip question, subgen is required by parent
          this.tasksToRun.push(subgen)
          return next()
        }

        if (!should) {
          if (!regenerate) return next()
          task = regenerate
        }

        // TODO: remember choices independent of `should`
        ;(should ? primary : secondary).push({
          value: subgen,
          name: task,
          checked: should ? runByDefault : false
        })

        next()
      })
    })
  }

  _promptForTasks(primary, secondary, done) {
    let questions = []

    if (primary.length) questions.push({
      type: 'checkbox',
      name: 'primary',
      message: 'Which module tasks would you like to run?',
      choices: primary
    })

    if (secondary.length) questions.push({
      type: 'checkbox',
      name: 'secondary',
      message: 'Which additional module tasks would you like to run?',
      choices: secondary
    })

    if (!questions.length) return done()

    this.prompt(questions, (answers) => {
      let primary = answers.primary || []
      let secondary = answers.secondary || []

      this.tasksToRun = this.tasksToRun.concat(primary).concat(secondary)
      done()
    })
  }

  _sub(generator) {
    if (this.tasksToRun.indexOf(generator) < 0) return

    let options = this._getGeneratorOptions(generator)

    this.composeWith(`nom:${generator}`, { options, args: [] }, {
      local: require.resolve(`../${generator}`),
      link: 'strong'
    })
  }

  _getGeneratorOptions(generator) {
    return Object.assign({
      name: this.options.name,
      description: this.options.description,
      esnext: this.options.esnext,
      modules: this.options.modules,
      skipInstall: this.options.skipInstall,
      skipCache: this.options.skipCache
    }, this.options[generator])
  }
}

// Add subgens in same order, regardless of which the user picked
subgenerators.forEach(sub => {
  self.prototype['run_' + sub] = function() {
    this._sub(sub)
  }
})
