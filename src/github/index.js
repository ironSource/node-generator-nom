'use strict';

const Conditional = require('../conditional-subgen')
    , git = require('gift')
    , octo = require('octonode')
    , pathExists = require('path-exists')

const self = module.exports = class GithubGenerator extends Conditional {
  // Should run after nom:npm.configuring
  configuring() {
    let done = this.async()

    self.shouldRun(this, this.options, (err, should, repo) => {
      if (err) return done(err)

      if (!repo) {
        this.log.error('Could not find local git repository')
        return done()
      }

      if (!should) {
        this.log.skip('GitHub - because local repository has existing remote origin')
        return done()
      }

      let { name: moduleName, description } = this.fs.readJSON('package.json', {})

      if (!moduleName) {
        return done(new Error(
          'Package.json or module name is missing. Please describe how you got into this '+
          'situation here: ' + this.moduleBugs()
        ))
      }

      this.prompt([{
        name: 'repositoryName',
        message: 'What would you like to call the repository?',
        type: 'list',
        default: moduleName,
        choices: [
          moduleName,
          'node-' + moduleName
        ]
      }], answers => {
        let { repositoryName } = answers

        this._create(repo, repositoryName, description, 0, (err, qualifiedName) => {
          this.qualifiedName = qualifiedName
          done(err)
        })
      })
    })
  }

  _create(localRepo, repositoryName, description, retries, done) {
    if (retries > 2) {
      this.log.error('Failed to create GitHub repository after 2 retries')
      return done()
    }

    this._getToken((err, token) => {
      if (err || !token) return done(err)

      let client = octo.client(token)
        , ghme = client.me()

      // Get username
      ghme.info((err, data) => {
        if (err) {
          if (err.statusCode == 401) {
            // Clear token and try again
            this.settings.del('github_oauth')
            this.log.error('Could not authorize with github using your token. Have you revoked it?')
            return this._create(localRepo, repositoryName, description, retries + 1, done)
          }

          return done(err)
        }

        let defaultOwner = data.login

        // Prompt for repository owner (default to username)
        this.prompt([{
          name: 'owner',
          message: 'Who should be the repository owner?',
          default: defaultOwner,
          filter: (v) => (typeof v === 'string' ? v.trim() : '')
        }], answers => {
          let { owner } = answers
          let isDefaultOwner = owner.toLowerCase() === defaultOwner.toLowerCase()

          if (!owner) {
            this.log.skip('Will not create GitHub project, owner name is empty')
            return done()
          }

          let qualifiedName = `${owner}/${repositoryName}`

          let register = () => {
            // Add remote origin
            let origin = `git@github.com:${qualifiedName}.git`
            localRepo.remote_add('origin', origin, err => {
              if (err) this.log.error('Failed to add remote: ' + err)
              else this.log.create('Remote origin: ' + origin)

              // Lastly, schedule to update package.json
              done(null, qualifiedName)
            })
          }

          // Check if repository exists
          client.repo(qualifiedName).info( (err, data) => {
            if (data && data.name) {
              this.log.skip('GitHub project already exists: ' + qualifiedName)
              return register()
            }

            // If not, create
            let api = isDefaultOwner ? ghme : client.org(owner)

            this._createGitHubProject(api, repositoryName, description, err => {
              if (err) {
                this.log.error('Failed to create GitHub project: "' + err + '"')
                return done()
              }

              register()
            })
          })
        })
      })
    })
  }

  _getToken(done) {
    let token = this.settings.get('github_oauth');
    if (token) return setImmediate(done.bind(null, null, token))

    this.log('\nPlease create a new access token for Github at'+
               'https://github.com/settings/tokens/new - with'+
               'the "public_repo" and/or "repo" scopes.\n')

    this.prompt([{
      type: 'input',
      name: 'token',
      message: 'What is your GitHub token?' ,
    }], props => {
      let { token } = props

      if (!token) {
        this.log.error (
          'Github personal token is required to access GitHub on your behalf. '+
          'If you have any concerns about their security, please refer to '+
          'https://help.github.com/articles/creating-an-access-token-for-command-line-use'
        )
        return done()
      }

      this.settings.set('github_oauth', token)
      done(null, token)
    })
  }

  _createGitHubProject(api, name, description, done) {
    this.prompt([{
      name: 'pub',
      message: 'Do you want to make this repository public?',
      type: 'confirm',
      default: true
    }], answers => {
      api.repo({ name, description, 'private': !answers.pub }, (err, body, headers) => {
        if (err) return done(err)

        let type = answers.pub ? 'Public' : 'Private'
        this.log.create(`${type} GitHub repository ${body.full_name}`)
        done()
      })
    })
  }

  writing() {
    let { qualifiedName } = this

    if (!qualifiedName) {
      return this.log.skip('Update URLs of package.json - no GitHub repository name set')
    }

    let pkg = this.fs.readJSON('package.json', false)

    if (pkg) {
      if (!pkg.repository) pkg.repository = qualifiedName
      if (!pkg.bugs) pkg.bugs = 'https://github.com/' + qualifiedName + '/issues'
      if (!pkg.homepage) pkg.homepage = 'https://github.com/' + qualifiedName

      this.fs.writeJSON('package.json', pkg)
      this.log.info('Updated URLs of package.json')
    } else {
      this.log.error('Cannot update URLs: could not find package.json')
    }
  }
}

self.task = 'Host this project on GitHub'
self.regenerate = false
self.runByDefault = false

self.shouldRun = function (ctx, opts, done) {
  let repo = self.getRepo(ctx)
  if (!repo) return done(null, true)

  repo.config((err, cfg) => {
    if (err) return done(err)

    let origin = cfg.items && cfg.items['remote.origin.url']
    return done(null, !origin, repo)
  })
}

self.getRepo = function (ctx) {
  // Must use real fs to check existence, not yeoman's virtual fs
  return pathExists.sync(ctx.destinationPath('.git')) ? git(ctx.destinationRoot()) : null
}
