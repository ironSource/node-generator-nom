'use strict'

<% if (esm) { -%>
export default function () {

}
<% } else { -%>
module.exports = function () {

}
<% } -%>
