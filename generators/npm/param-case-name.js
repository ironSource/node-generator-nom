'use strict'

const paramCase = require('param-case')

module.exports = function (name) {
  if (name[0] === '@') {
    const a = name.split('/')
    const scope = a.shift().slice(1)
    const rest = a.join('/')

    if (!scope || !rest) {
      return paramCase(name)
    }

    return '@' + paramCase(scope) + '/' + paramCase(rest)
  } else {
    return paramCase(name)
  }
}
