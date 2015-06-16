var pack = require('../lib/pack')
var vm = require('vm')
var acorn = require('acorn')
var escodegen = require('escodegen')
var test = require('tap').test

test('pack into one bundle', function (t) {
  var graph = {
    entry: [0],
    include: [
      { id: 0, file: 'entry', ast: acorn.parse('__require__(1)') },
      { id: 1, file: 'lib', ast: acorn.parse('console.log("test")') }
    ]
  }

  var bundle = pack(graph)
  t.equal(bundle.type, 'Program')
  t.ok(escodegen.generate(bundle))
  t.end()
})

test('run pack', function (t) {
  var graph = {
    entry: [0],
    include: [
      { id: 0, file: 'entry', ast: acorn.parse('__require__(1)') },
      { id: 1, file: 'lib', ast: acorn.parse('test("in lib")') }
    ]
  }

  var bundle = pack(graph)
  var code = escodegen.generate(bundle)
  var result
  var sandbox = {
    test: function (value) { result = value }
  }

  vm.runInNewContext(code, sandbox)
  t.equal(result, 'in lib')
  t.end()
})
