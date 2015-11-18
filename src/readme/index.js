'use strict';

const Conditional = require('../conditional-subgen')
    , parseAuthor = require('parse-author')
    , camel = require('camel-case')

const self = module.exports = class ReadmeGenerator extends Conditional {
  static task = 'Create readme file'
  static regenerate = 'Recreate readme file'
  static shouldRun(ctx, opts, done) {
    done(null, !ctx.fs.exists('readme.md') && !ctx.fs.exists('readme.markdown') && !ctx.fs.exists('README.md'))
  }

  // TODO: use new fs API
  writing() {
    let pkg = this.fs.readJSON('package.json', false)

    if (!pkg) {
      return this.log.error('Cannot create readme file because package.json is missing')
    }

    this.packageName = pkg.name
    this.camelCaseName = camel(pkg.name)

    let author = pkg.author
      , copyrightHolder = this.config.get('copyrightHolder')

    if (typeof author === 'string') author = parseAuthor(author) || {}

    if (copyrightHolder && (!author || copyrightHolder !== author.name)) {
      this.authorLink = copyrightHolder
    } else if (author) {
      if (author.url) this.authorLink = '['+author.name+']('+author.url+')'
      else this.authorLink = author.name
    } else {
      this.authorLink = ''
    }

    this.packageLicense = pkg.license
    this.packageDescription = pkg.description

    let repo = pkg.repository || ''
      , url = typeof repo == 'string' ? repo : repo.url || ''
      , match = url.match(/^(.*github.com\/)?([^\.#\/]+\/[^\.#\/$]+)/)

    this.repoName = (match && match[2]) || ''

    if (!this.repoName) {
      this.log.info('[readme] No repository name found')
    }

    this.hasTravis = this.fs.exists('.travis.yml')
    this.hasAppVeyor = this.fs.exists('appveyor.yml')

    this.template('_readme.md', 'readme.md')
  }
}
