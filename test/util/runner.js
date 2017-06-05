const { resolve } = require('path')
    , { test: helpers } = require('yeoman-generator')
    , omit = require('lodash.omit')

// Because Yeoman changes working directory, get it early
const CWD = process.cwd()

function unhandled(err) {
  if (err) throw err
}

module.exports = function runner(opts) {
  if (typeof opts === 'string') opts = { root: opts }
  else if (!opts) opts = {}

  const root = opts.root || '.'
  const queue = opts.queue || []
  const sharedSpec = omit(opts, ['root', 'queue'])

  function next(fn = queue.shift()) {
    if (fn) setImmediate(fn)
    else queue.running = false
  }

  return function run(generator = '.', spec = {}, done = unhandled) {
    if (typeof generator === 'function') { // (done)
      done = generator, generator = '.'
    } else if (typeof generator !== 'string') { // (spec[, done])
      done = spec || unhandled, spec = generator, generator = '.'
    } else if (typeof spec === 'function') { // (generator, done)
      done = spec, spec = {}
    }

    const merged = Object.assign({}, sharedSpec, spec)
      , { options, prompts, args, config, generators } = merged
        , path = resolve(CWD, root, generator)

    function start() {
      const ctx = helpers.run(path)
          , end = (err) => { next(), done(err) }

      if (options) ctx.withOptions(options)
      if (prompts) ctx.withPrompts(prompts)
      if (args) ctx.withArguments(args)
      if (config) ctx.withLocalConfig(config)
      if (generators) ctx.withGenerators(generators)

      ctx.on('end', end).on('error', end)
      if (start.init) start.init(ctx, merged)
    }

    if (!queue.running) {
      queue.running = true
      next(start)
    } else {
      queue.push(start)
    }

    return (fn) => { start.init = fn }
  }
}
