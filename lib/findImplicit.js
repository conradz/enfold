var escope = require('escope')
var forEach = require('lodash/collection/forEach')

module.exports = findImplicit

function findImplicit (ast) {
  var scope = escope.analyze(ast)
  var implicit = []

  forEach(scope.scopes, function (s) {
    forEach(s.references, function (ref) {
      if (!s.set.has(ref.identifier.name)) {
        implicit.push(ref.identifier)
      }
    })
  })

  return implicit
}
