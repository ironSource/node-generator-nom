'use strict'

<% if (modules === 'es6') { -%>
export default function() {

}
<% } else { -%>
module.exports = function() {

}
<% } -%>
