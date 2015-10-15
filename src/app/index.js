'use strict';

var after = require('after')
var { Base } = require('yeoman-generator')

const subgenerators =
  [ 'npm'
  , 'git'
  , 'github'
  , 'travis'
  , 'appveyor'
  , 'readme'
  , 'gulp' ]

const self = module.exports = class NomGenerator extends Base {
  constructor(args, options, config) {
    super(args, options, config)

    // Yeoman's option parsing is not strict enough for
    // our purposes. Don't allow empty strings, and take
    // the first of "--name a --name b".
    ;['name', 'description'].forEach(option => {
      this.option(option, {
        type: 'String',
        desc: 'Module option passed to every subgenerator'
      })

      let value = this.options[option]

      if (Array.isArray(value)) value = value[0]
      if (typeof value !== 'string' || value.trim() === '') {
        this.options[option] = undefined
      }
    })

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
      this.option(subgen, { type: 'Object', defaults: {}, hide: true })
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

      let { task, shouldRun, regenerate, runByDefault = true } = Generator
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

    this.prompt(questions, answers => {
      let { primary = [], secondary = [] } = answers
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
    let { name, description, skipInstall, skipCache } = this.options
    return { name, description, skipInstall, skipCache, ...this.options[generator] }
  }
}

// Add subgens in same order, regardless of which the user picked
subgenerators.forEach(sub => {
  self.prototype['run_' + sub] = function() {
    this._sub(sub)
  }
})
