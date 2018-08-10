'use strict'

const Conditional = require('../conditional-subgen')
    , paramCase = require('param-case')
    , chalk = require('chalk')
    , omit = require('lodash.omit')
    , normalOrEmptyUrl = require('./normal-or-empty-url')
    , guessAuthor = require('./guess-author')
    , mkdirp = require('mkdirp')
    , deepSortObject = require('./deep-sort-object')
    , paramCaseName = require('./param-case-name')

const strictString = require('../app/option-parser').strictString

const LICENSE_TEMPLATES = [ 'mit', 'bsd2', 'bsd3' ]

const LICENSES = [
  'MIT',
  'UNLICENSED',
  'BSD2',
  'BSD3'
]

const TEST_FRAMEWORKS = [
  'none',
  'tape',
  'tap',
  'mocha',
  'grunt',
  'cake',
  'ava'
]

const DEFAULT_MAIN = 'index.js'
const CUSTOM_SPECIAL_VALUE = '__custom__'

function paramCasePath(path) {
  return path.split(/[\/\\]+/).map(paramCase).filter(k=>k).join('/')
}

const self = module.exports = class NpmGenerator extends Conditional {
  constructor(args, options, config) {
    super(args, options, config)

    // "--main" or "--no-main" or "--main lib/index.js"
    this.option('main', {
      type: 'Boolean',
      desc: `Relative path to main file or none (--no-main)`,
    })

    // "--modules es6"
    this.option('modules', {
      type: 'String',
      desc: 'Module format, case insensitive: ES6 or CommonJS',
      default: 'CommonJS'
    })
  }

  initializing() {
    let done = this.async()
    let main = this.options.main

    if (main === true || main == null) {
      this.options.main = undefined // Use default or package.main
    } else if (typeof main === 'string') {
      if (main.slice(-3).toLowerCase() === '.js') {
        main = main.slice(0, -3)
      }

      let cased = paramCasePath(main)

      if (cased === '') {
        let msg = `Main path must be param cased: "${main}"`
        return this.env.error(msg)
      }

      this.options.main = cased + '.js'
    } else {
      this.options.main = false
    }

    let modules
      = this.options.modules
      = strictString(this.options.modules, 'CommonJS').toLowerCase()

    if (modules !== 'es6' && modules !== 'commonjs') {
      let msg = 'Module format must be "es6", "commonjs" or undefined'
      return this.env.error(msg)
    }

    this.pack = this.fs.readJSON('package.json', {})

    this._getDefaults((err, defaults) => {
      if (err) return done(err)
      this.defaults = defaults
      done()
    })
  }

  _getDefaults(done) {
    let name = this.pack.name
    let description = this.pack.description
    let author = this.pack.author
    let license = this.pack.license
    let devDependencies = this.pack.devDependencies || {}
    let dependencies = this.pack.dependencies || {}
    let version = this.pack.version
    let keywords = this.pack.keywords
    let main = this.pack.main

    guessAuthor(author, this.user.git, (err, author) => {
      if (err) return done(err)

      // Find previous test framework
      let testFramework = 'tape'
      let deps = Object.keys(devDependencies)
      for(let i=0, l=TEST_FRAMEWORKS.length; i<l; i++) {
        if (deps.indexOf(TEST_FRAMEWORKS[i]) >=0 ) {
          testFramework = TEST_FRAMEWORKS[i]
          break
        }
      }

      if (this.options.main === false) {
        main = false
      } else {
        main = this.options.main || main || DEFAULT_MAIN
      }

      done(null, {
        dependencies,
        devDependencies,
        main,
        version: version || '0.0.1',
        moduleName: paramCaseName(name || this.appname),
        description: description || 'my module',
        license: license || 'MIT',
        testFramework,
        name: author.name,
        email: author.email,
        url: author.url,
        keywords: (keywords || []).filter(k => k).join(' ')
      })
    })
  }

  _getLicenses(defaultLicense) {
    // If unsupported license was set, add to choices
    let id = defaultLicense.toUpperCase().trim()
    if (LICENSES.indexOf(id) < 0) return [defaultLicense].concat(LICENSES)
    else return LICENSES
  }

  prompting() {
    // Any question can be skipped by providing an option
    let moduleName = this.options.name
    let description = this.options.description

    // Uh, what are we doing here? Refactor someday.
    let rest = omit(this.options, ['name', 'description'])
    let override = Object.assign({ moduleName, description }, rest)

    let defaults = this.defaults

    let questions = [{
      name: 'moduleName',
      message: 'Package name (including scope if any):',
      default: defaults.moduleName,
      validate: val => val.length ? true : 'You have to provide a package name',
      filter: paramCaseName
    },
    {
      name: 'description',
      message: 'Description:',
      default: defaults.description,
      validate: val => val.length ? true : 'You have to provide a description'
    },
    {
      type: 'list',
      name: 'license',
      store: true,
      message: 'Select a license:',
      default: defaults.license,
      choices: this._getLicenses(defaults.license).map(k => {
        return { value: k, name: k === 'UNLICENSED' ? k + ' (meaning proprietary)' : k }
      })
    },
    {
      type: 'list',
      name: 'testFramework',
      message: 'Select a test framework:',
      store: true,
      default: defaults.testFramework,
      choices: TEST_FRAMEWORKS
    },
    {
      name: 'name',
      message: 'Your full name:',
      store: true,
      default: defaults.name,
      validate: val => val.length ? true : 'You have to provide a name'
    },
    {
      name: 'enableEmail',
      message: 'Do you wish to publicize your email address?',
      type: 'confirm',
      store: true,
      default: !!defaults.email
    },
    {
      name: 'email',
      message: 'Email address:',
      store: true,
      when: (answers) => answers.enableEmail,
      default: defaults.email,
      validate: val => val.length ? true : 'You have to provide an email address'
    },
    {
      name: 'enableUrl',
      message: 'Do you wish to publicize your URL?',
      type: 'confirm',
      store: true,
      default: !!defaults.url
    },
    {
      name: 'url',
      message: 'URL:',
      store: true,
      when: (answers) => answers.enableUrl,
      default: defaults.url,
      filter: normalOrEmptyUrl
    },
    {
      name: 'copyrightHolder',
      message: 'Select a copyright holder:',
      default: (answers) => this._getDefaultCopyrightHolder(answers),
      type: 'list',
      choices: answers => this._getCopyrightHolderChoices(answers)
    },
    {
      name: 'customCopyrightHolder',
      message: 'Who or what entity is the copyright holder?',
      when: (answers) => answers.copyrightHolder === CUSTOM_SPECIAL_VALUE,
      validate: val => val.length && val !== CUSTOM_SPECIAL_VALUE ? true : 'You have to provide a copyright holder'
    },
    {
      name: 'keywords',
      message: 'Space separated keywords:',
      default: defaults.keywords,
      filter: val => (val || '').toLowerCase().split(/[ ,;\/|]+/).filter(k => k)
    }]

    // Take existing dependencies
    this._askToKeepDeps(questions, 'dependencies', defaults.dependencies)
    this._askToKeepDeps(questions, 'devDependencies', defaults.devDependencies)

    // Skip prompting for overrides
    questions = questions.filter(q => override[q.name] == null || isDependencies(q.name))

    // TODO (after updating yo): return a promise
    let done = this.async()

    this.prompt(questions).then(ctx => {
      // Add overrides to context
      Object.keys(override).forEach(key => {
        if (override[key] == null) return

        if (isDependencies(key)) {
          let deps = Array.isArray(override[key]) ? override[key] : Object.keys(override[key])
            , current = ctx[key] || []

          ctx[key] = current.concat(deps.filter(d => current.indexOf(d) < 0))
          ctx[key].sort()
        } else {
          ctx[key] = override[key]
        }
      })

      // Add defaults that we didn't ask about to context
      Object.keys(defaults).forEach(key => {
        if (isDependencies(key)) return
        if (ctx[key] == null) ctx[key] = defaults[key]
      })

      ctx.testFramework = ctx.testFramework === 'none' ? null : ctx.testFramework
      ctx.testCommand = ctx.testFramework ? ctx.testFramework + ' test' : ''

      ctx.dependencies || (ctx.dependencies = [])
      ctx.devDependencies || (ctx.devDependencies = [])

      if (ctx.testFramework && ctx.devDependencies.indexOf(ctx.testFramework) < 0) {
        ctx.devDependencies.push(ctx.testFramework)
      }

      let saveDeps = {}
      ;['dependencies', 'devDependencies'].forEach(group => {
        let save = saveDeps[group] = {}

        ctx[group].forEach(dep => {
          save[dep] = (override[group] && override[group][dep]) || defaults[group][dep] || null
        })
      })

      ctx.dependencies = saveDeps.dependencies
      ctx.devDependencies = saveDeps.devDependencies

      if (ctx.copyrightHolder === CUSTOM_SPECIAL_VALUE) {
        ctx.copyrightHolder = ctx.customCopyrightHolder
      }

      this._saveCopyrightHolder(ctx.copyrightHolder)
      this.ctx = ctx

      done()
    })
  }

  _getCopyrightHolderChoices (answers) {
    let choices = this.settings.get('copyrightHolderHistory') || []
    let def = this.settings.get('copyrightHolder')

    if (choices.indexOf(answers.name) < 0) choices.push(answers.name)
    if (def && choices.indexOf(def) < 0) choices.push(def)

    choices = choices.map(name => ({ name, value: name }))
    choices.push({ name: chalk.yellow('Custom..'), value: CUSTOM_SPECIAL_VALUE })

    return choices
  }

  _getDefaultCopyrightHolder (answers) {
    return this.settings.get('copyrightHolder') || answers.name
  }

  _saveCopyrightHolder (copyrightHolder) {
    const history = this.settings.get('copyrightHolderHistory') || []

    if (history.indexOf(copyrightHolder) < 0) {
      history.push(copyrightHolder)
      this.settings.set('copyrightHolderHistory', history)
    }

    this.settings.set('copyrightHolder', copyrightHolder)
  }

  // Note: the order in which we set fields matters for new packages.
  _writePackage() {
    let ctx = this.ctx
    let pack = this.pack

    pack.name = ctx.moduleName

    ;['version', 'description', 'license'].forEach(key => {
      pack[key] = ctx[key]
    })

    if (ctx.main === false) {
      delete pack.main
    } else if (ctx.main !== DEFAULT_MAIN) {
      pack.main = ctx.main
    }

    if (!ctx.enableEmail && !ctx.enableUrl) {
      pack.author = ctx.name
    } else {
      pack.author = { name: ctx.name }

      if (ctx.enableEmail && ctx.email) pack.author.email = ctx.email
      if (ctx.enableUrl && ctx.url) pack.author.url = ctx.url
    }

    if (!pack.scripts) pack.scripts = {}
    if (!pack.scripts.test && ctx.testCommand) pack.scripts.test = ctx.testCommand

    ;['dependencies', 'devDependencies', 'keywords'].forEach(key => {
      pack[key] = deepSortObject(ctx[key])
    })

    const engines = pack.engines || {}
    engines.node = engines.node || '>=6'
    pack.engines = deepSortObject(engines)

    this.fs.writeJSON(this.destinationPath('package.json'), pack)
  }

  // Do this early in the run loop, b/c other subgens depend on it
  configuring() {
    let ctx = this.ctx
    let cp = (from, to) => this.fs.copyTpl(this.templatePath(from), this.destinationPath(to), ctx)

    this._writePackage()

    if (ctx.main !== false) cp('_index.js', ctx.main)

    cp('_.gitignore', '.gitignore')

    let license = ctx.license.toLowerCase()
    if (LICENSE_TEMPLATES.indexOf(license) >= 0) {
      cp('license/' + license, 'LICENSE')
    }

    let done = this.async()

    this.saveDependencies(ctx.dependencies, err => {
      if (err) return done(err)

      this.saveDependencies(ctx.devDependencies, { dev: true }, err => {
        done(err)
      })
    })
  }

  _askToKeepDeps(questions, group, deps) {
    let names = Object.keys(deps)

    if (names.length) questions.push({
      type: 'checkbox',
      name: group,
      message: `Select ${group} to keep:`,
      choices: names.map(name => {
        return { name, value: name, checked: true }
      })
    })
  }
}

self.task = 'Create package.json and common files'
self.regenerate = 'Recreate package.json and common files'

self.shouldRun = function (ctx, opts, done) {
  done(null, !ctx.fs.readJSON('package.json', false))
}

function isDependencies(key) {
  return key === 'dependencies' || key === 'devDependencies'
}
