var npmconf = require('npmconf')
  , parseAuthor = require('parse-author')
  , normalOrEmptyUrl = require('./normal-or-empty-url')

// Get author info from existing package, npm config or git
function guessAuthor(prevAuthor, gitUser, done) {
  let author = prevAuthor

  if (typeof author === 'string') author = parseAuthor(author)
  if (!author) author = {}

  let pick = (sources) => {
    for (let i=0, l=sources.length; i<l; i++) {
      let s = sources[i]

      if (typeof s === 'function') s = s()
      if (typeof s === 'string') {
        s = s.trim()
        if (s !== '') return s
      }
    }

    return ''
  }

  npmconf.load((err, conf) => {
    let npm = err ? (() => null) : (dashed) => {
      // Support dotted key, prefer dashed. See npm/npm#6642
      let dotted = dashed.replace(/-/g, '.')
      return pick([ conf.get(dashed), conf.get(dotted) ])
    }

    let name = pick
     ([ author.name
      , npm('init-author-name')
      , gitUser.name.bind(gitUser) ])

    let email = pick
     ([ author.email
      , author.mail
      , npm('init-author-email')
      , npm('email')
      , gitUser.email.bind(gitUser) ])

    let url = pick
     ([ author.url
      , author.website
      , author.web
      , npm('init-author-url') ])

    done(null, { name, email, url: normalOrEmptyUrl(url) })
  })
}

