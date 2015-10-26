'use strict';

var Conditional = require('../conditional-subgen')
  , camelCase = require('camel-case')
  , paramCase = require('param-case')
  , normalOrEmptyUrl = require('./normal-or-empty-url')
  , guessAuthor = require('./guess-author')
  , mkdirp = require('mkdirp')
  , deepSortObject = require('./deep-sort-object')

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

const self = module.exports = class NpmGenerator extends Conditional {  
  static task = 'Create package.json and common files'
  static regenerate = 'Recreate package.json and common files'
  static shouldRun(ctx, opts, done) {
    done(null, !ctx.fs.readJSON('package.json', false))
  }

  _getDefaults(done) {
    let { name, description
        , author, license
        , devDependencies = {}
        , dependencies = {}
        , version, keywords, bin
        } = this.pack

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

      done(null, {
        dependencies,
        devDependencies,
        version: version || '0.0.1',
        moduleName: name ? paramCase(name) : paramCase(this.appname),
        description: description || 'my module',
        license: license || 'MIT',
        testFramework,
        name: author.name,
        copyrightHolder: this.config.get('copyrightHolder'),
        email: author.email,
        url: author.url,
        cli: !!bin,
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

  initializing() {
    let done = this.async()

    this.pack = this.fs.readJSON('package.json', {})

    this._getDefaults((err, defaults) => {
      if (err) return done(err)
      this.defaults = defaults
      done()
    })
  }

  prompting() {
    // Any question can be skipped by providing an option
    let { name: moduleName, description, ...rest } = this.options
    let override = { moduleName, description, ...rest }
    let defaults = this.defaults

    let questions = [{
      name: 'moduleName',
      message: 'What do you want to name your module?',
      default: defaults.moduleName,
      validate: val => val.length ? true : 'You have to provide a module name',
      filter: paramCase
    },
    {
      name: 'description',
      message: 'How would you like to describe your module?',
      default: defaults.description,
      validate: val => val.length ? true : 'You have to provide a description'
    },
    {
      type: 'list',
      name: 'license',
      store: true,
      message: 'Select a license',
      default: defaults.license,
      choices: this._getLicenses(defaults.license).map(k => {
        return { value: k, name: k === 'UNLICENSED' ? k + ' (meaning proprietary)' : k }
      })
    },
    {
      type: 'list',
      name: 'testFramework',
      message: 'Select a test framework',
      store: true,
      default: defaults.testFramework,
      choices: TEST_FRAMEWORKS
    },
    {
      name: 'name',
      message: 'What is your full name?',
      store: true,
      default: defaults.name,
      validate: val => val.length ? true : 'You have to provide a name'
    },
    {
      name: 'copyrightHolder',
      message: 'Who or what entity is the copyright holder?',
      default: answers => defaults.copyrightHolder || answers.name,
      validate: val => val.length ? true : 'You have to provide a copyright holder'
    },
    {
      name: 'email',
      message: 'What is your email address?',
      store: true,
      default: defaults.email,
      validate: val => val.length ? true : 'You have to provide an email address'
    },
    {
      name: 'enableUrl',
      message: 'Do you want to list a website?',
      type: 'confirm',
      store: true,
      default: true
    },
    {
      name: 'url',
      message: 'What is the URL of your website?',
      store: true,
      when: (answers) => answers.enableUrl,
      default: defaults.url,
      filter: normalOrEmptyUrl
    },
    {
      name: 'keywords',
      message: 'What are the space separated keywords for your module?',
      default: defaults.keywords,
      filter: val => (val || '').toLowerCase().split(/[ ,;\/|]+/).filter(k => k)
    },
    {
      name: 'cli',
      message: 'Do you need a CLI?',
      type: 'confirm',
      default: defaults.cli
    }]

    // Take existing dependencies
    this._askToKeepDeps(questions, 'dependencies', defaults.dependencies)
    this._askToKeepDeps(questions, 'devDependencies', defaults.devDependencies)

    // Skip prompting for overrides
    questions = questions.filter(q => override[q.name] == null || isDependencies(q.name))

    let done = this.async()

    this.prompt(questions, ctx => {
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

      ctx.camelModuleName = camelCase(ctx.moduleName)
      ctx.testFramework = ctx.testFramework === 'none' ? null : ctx.testFramework
      ctx.testCommand = ctx.testFramework ? ctx.testFramework + ' test/**/*.js' : ''

      ctx.dependencies || (ctx.dependencies = [])
      ctx.devDependencies || (ctx.devDependencies = [])

      if (ctx.testFramework && ctx.devDependencies.indexOf(ctx.testFramework) < 0) {
        ctx.devDependencies.push(ctx.testFramework)
      }
      
      if (ctx.cli) ctx.devDependencies.push('meow')

      let saveDeps = {}
      ;['dependencies', 'devDependencies'].forEach(group => {
        let save = saveDeps[group] = {}

        ctx[group].forEach(dep => {
          save[dep] = (override[group] && override[group][dep]) || defaults[group][dep] || null
        })
      })

      ctx.dependencies = saveDeps.dependencies
      ctx.devDependencies = saveDeps.devDependencies

      this.ctx = ctx
      this.config.set('copyrightHolder', ctx.copyrightHolder)

      done()
    })
  }

  _writePackage() {
    let { ctx, pack } = this

    pack.name = ctx.moduleName

    ;['version', 'description', 'license', 'dependencies', 'devDependencies', 'keywords'].forEach(key => {
      pack[key] = deepSortObject(ctx[key])
    })

    pack.author = { name: ctx.name, email: ctx.email }
    if (ctx.enableUrl && ctx.url) pack.author.url = ctx.url

    if (ctx.cli) pack.bin = "cli.js"

    if (!pack.scripts) pack.scripts = {}
    if (!pack.scripts.test && ctx.testCommand) pack.scripts.test = ctx.testCommand

    let { node = '>=0.10.0', npm = '>=2.0.0', ...restEngines } = pack.engines || {}
    pack.engines = { node, npm, ...restEngines }

    this.fs.writeJSON(this.destinationPath('package.json'), pack)
  }

  // Do this early in the run loop, b/c other subgens depend on it
  configuring() {
    let ctx = this.ctx
    let cp = (from, to) => this.fs.copyTpl(this.templatePath(from), this.destinationPath(to), ctx)

    this._writePackage()

    cp('_index.js', 'index.js')
    cp('_.gitignore', '.gitignore')

    if (ctx.cli) cp('_cli.js', 'cli.js')

    let license = ctx.license.toLowerCase()
    if (LICENSE_TEMPLATES.indexOf(license) >= 0) {
      cp('license/' + license, 'LICENSE')
    }

    let done = this.async()

    this.saveDependencies(ctx.dependencies, err => {
      if (err) return done(err)

      this.saveDependencies(ctx.devDependencies, { dev: true }, err => {
        if (err) done(err)
        else if (ctx.testCommand) {
          this.log.create('test directory')
          mkdirp(this.destinationPath('test'), done)
        } else done()
      })
    })
  }

  _askToKeepDeps(questions, group, deps) {
    let names = Object.keys(deps)

    if (names.length) questions.push({
      type: 'checkbox',
      name: group,
      message: `Which ${group} do you want to keep?`,
      choices: names.map(name => {
        return { name, value: name, checked: true }
      })
    })
  }
}

function isDependencies(key) {
  return key === 'dependencies' || key === 'devDependencies'
}
