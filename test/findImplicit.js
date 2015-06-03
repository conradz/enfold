var findImplicit = require('../lib/findImplicit')
var acorn = require('acorn')
var test = require('tap').test

test('find implicit global reference', function (t) {
  var ast = acorn.parse('console.log("test")')
  var result = findImplicit(ast)
  t.equal(result.length, 1)
  t.equal(result[0].name, 'console')
  t.end()
})

test('find implicit reference in function', function (t) {
  var ast = acorn.parse('(function() { console.log("test") })()')
  var result = findImplicit(ast)
  t.equal(result.length, 1)
  t.equal(result[0].name, 'console')
  t.end()
})

test('ignore defined globals', function (t) {
  var ast = acorn.parse('var a = {}; a.toString()')
  var result = findImplicit(ast)
  t.equal(result.length, 0)
  t.end()
})
