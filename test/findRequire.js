var findRequire = require('../lib/findRequire')
var acorn = require('acorn')
var test = require('tap').test

test('find literal require', function (t) {
  var ast = acorn.parse('require("a/module")')
  var node = ast.body[0].expression
  t.equal(findRequire(node), 'a/module')
  t.end()
})

test('ignore non-literal require', function (t) {
  var ast = acorn.parse('require("a" + b)')
  var node = ast.body[0].expression
  t.equal(findRequire(node), undefined)
  t.end()
})

test('ignore non-require nodes', function (t) {
  var ast = acorn.parse('console.log("test")')
  var node = ast.body[0].expression
  t.equal(findRequire(node), undefined)
  t.end()
})
