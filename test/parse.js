var parse = require('../lib/parse')
var path = require('path')
var test = require('tap').test

test('parse simple program', function (t) {
  var file = path.join(__dirname, 'fixtures', 'parse.js')
  var result = parse(file)
  t.equal(typeof result.source, 'string')
  var ast = result.ast
  t.equal(ast.type, 'Program')
  t.equal(ast.loc.source, file)
  t.equal(ast.body.length, 1)
  t.end()
})
