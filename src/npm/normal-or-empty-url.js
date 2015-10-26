var normalizeUrl = require('normalize-url')

module.exports = function(url) {
  if (typeof url !== 'string' || url.trim() === '') return ''
  return normalizeUrl(url) || ''
}
