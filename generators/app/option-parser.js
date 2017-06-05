'use strict'

function looseBoolean(value, notSet) {
  if (typeof value === 'boolean') {
    return value
  } else if (typeof value === 'string') {
    value = value.toLowerCase()
    return value === 'true' || value === '1' || value[0] === 'y'
  } else if (typeof value === 'number') {
    return value === 1
  } else {
    return notSet
  }
}

// Yeoman's option parsing is not strict enough for
// our purposes. Don't allow empty strings, and take
// the first of "--name a --name b".
function strictString(value, notSet) {
  if (Array.isArray(value)) return strictString(value[0], notSet)
  if (typeof value !== 'string') return notSet

  value = value.trim()
  return value === '' ? notSet : value
}

exports.looseBoolean = looseBoolean
exports.strictString = strictString
