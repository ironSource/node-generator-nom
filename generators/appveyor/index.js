'use strict'

const Conditional = require('../conditional-subgen')
    , AppVeyor = require('appveyor')

const self = module.exports = class AppVeyorGenerator extends Conditional {
  prompting() {
    this.appveyor = new WrappedAppVeyor()
    if (this.appveyor.hasToken()) return

    // TODO (after updating yo): return a promise
    let done = this.async()

    this.log('\nPlease create a token for AppVeyor at https://ci.appveyor.com/api-token\n')

    this.prompt([{
      type: 'input',
      name: 'token',
      message: 'What is your AppVeyor token?',
      filter: val => (typeof val === 'string' ? val.trim() : '')
    }]).then(answers => {
      let token = answers.token

      if (!token) {
        this.log.error('A token is required to access AppVeyor on your behalf.')
        this.canceled = true
        return done()
      }

      this.appveyor.auth({ token })
      done()
    })
  }

  writing() {
    if (this.canceled) return
    this.copy('_appveyor.yml', 'appveyor.yml')
  }

  // The appveyor tool needs git info, so we need to run this
  // after everything else has been written to disk.
  end() {
    if (this.canceled) return

    let done = this.async()
    this.appveyor.hookWithCallback(err => {
      if (err) this.log.error('Failed to create AppVeyor hook: ' + err)
      else this.log.create('AppVeyor hook')

      done()
    })
  }
}

self.task = 'Setup AppVeyor'
self.regenerate = 'Setup AppVeyor again'
self.runByDefault = false

self.shouldRun = function (ctx, opts, done) {
  done(null, !ctx.fs.exists('appveyor.yml'))
}

class WrappedAppVeyor extends AppVeyor {
  // AppVeyor._getToken is the most annoying API. It's synchronous,
  // but uses a callback. If the token is not set, it does not call
  // the callback, but emits an error. Yeah.. no.
  justGetToken() {
    return this.configstore.get('token') || undefined
  }

  hasToken() {
    return this.justGetToken() !== undefined
  }

  // And wrap hook() in callback style
  hookWithCallback(done) {
    let onError = (err) => {
      this.removeListener('hook', onHook)
      done(err)
    }

    let onHook = (data) => {
      this.removeListener('error', onError)
      done(null, data)
    }

    this.once('error', onError)
    this.once('hook', onHook)

    this.hook()
  }
}
