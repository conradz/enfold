var parse = require('../lib/parse')
var path = require('path')
var test = require('tap').test

test('parse simple program', function (t) {
  var file = path.join(__dirname, 'fixtures', 'parse.js')
  parse(file, done)

  function done (err, ast) {
    t.error(err)
    t.equal(ast.type, 'Program')
    t.equal(ast.loc.source, file)
    t.equal(ast.body.length, 1)
    t.end()
  }
})
