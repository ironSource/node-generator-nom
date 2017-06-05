'use strict'

module.exports = function (name) {
  if (name[0] === '@') {
    const a = name.split('/')
    const scope = a.shift().slice(1)
    const rest = a.join('/')

    if (!scope || !rest) {
      return name
    }

    return rest
  } else {
    return name
  }
}
