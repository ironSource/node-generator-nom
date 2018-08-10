'use strict'

const Conditional = require('../conditional-subgen')
    , parseAuthor = require('parse-author')
    , camel = require('camel-case')
    , stripScope = require('./strip-scope')

const self = module.exports = class ReadmeGenerator extends Conditional {
  // TODO: use new fs API
  writing() {
    let pkg = this.fs.readJSON('package.json', false)

    if (!pkg) {
      return this.log.error('Cannot create readme file because package.json is missing')
    }

    this.packageName = pkg.name
    this.camelCaseName = camel(stripScope(pkg.name))

    let author = pkg.author
      , copyrightHolder = this.config.get('copyrightHolder')

    if (typeof author === 'string') author = parseAuthor(author)
    if (!author) author = {}

    if (copyrightHolder && copyrightHolder !== author.name) {
      this.authorLink = copyrightHolder
    } else if (author.name && author.url) {
      this.authorLink = '['+author.name+']('+author.url+')'
    } else if (author.name) {
      this.authorLink = author.name
    } else {
      this.authorLink = ''
    }

    const licenseId = pkg.license || 'UNLICENSED'
    const licenseFile
      = this.fs.exists('LICENSE.md') ? 'LICENSE.md'
      : this.fs.exists('license.md') ? 'license.md'
      : this.fs.exists('LICENSE') ? 'LICENSE'
      : this.fs.exists('license') ? 'license'
      : null

    this.licenseLink = licenseFile
      ? '[' + licenseId + '](' + licenseFile + ')'
      : licenseId

    this.copyrightYear = new Date().getFullYear()
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

self.task = 'Create readme file'
self.regenerate = 'Recreate readme file'

self.shouldRun = function (ctx, opts, done) {
  done(null, !ctx.fs.exists('readme.md') && !ctx.fs.exists('readme.markdown') && !ctx.fs.exists('README.md'))
}
