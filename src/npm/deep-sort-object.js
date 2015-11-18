'use strict';

// Adapted from github.com/npm/npm/blob/master/lib/utils/deep-sort-object.js

const sortObject = require('sorted-object')
    , sortArray = require('stable')

module.exports = function deepSortObject(obj, cmp) {
  if (Array.isArray(obj)) return sortArray(obj, cmp)
  if (obj == null || typeof obj !== 'object') return obj

  obj = sortObject(obj)

  Object.keys(obj).forEach(key => {
    obj[key] = deepSortObject(obj[key], cmp)
  })

  return obj
}
