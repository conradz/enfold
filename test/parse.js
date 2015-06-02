var parse = require('../lib/parse')
var test = require('tap').test

test('parse simple program', function (t) {
  var ast = parse('a = 1', 'a.js')
  t.equal(ast.type, 'Program')
  t.equal(ast.loc.source, 'a.js')
  t.equal(ast.body.length, 1)
  t.end()
})
