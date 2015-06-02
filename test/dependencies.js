var dependencies = require('../lib/dependencies')
var acorn = require('acorn')
var test = require('tap').test

test('find require module', function (t) {
  var ast = acorn.parse('require("a")')
  t.deepEqual(dependencies(ast), ['a'])
  t.end()
})

test('find multiple requires', function (t) {
  var ast = acorn.parse('require("b")\nrequire("c")')
  t.deepEqual(dependencies(ast), ['b', 'c'])
  t.end()
})

test('find requires in other blocks', function (t) {
  var ast = acorn.parse('var a = require("a"); if (window) require("b");')
  t.deepEqual(dependencies(ast), ['a', 'b'])
  t.end()
})
