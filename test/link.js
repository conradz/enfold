var link = require('../lib/link')
var acorn = require('acorn')
var escodegen = require('escodegen')
var test = require('tap').test

test('link graph of dependencies', function (t) {
  var graph = {
    entry: ['entry'],
    include: {
      'entry': {
        file: 'entry',
        ast: acorn.parse('require("lib"); require("foo")'),
        dependencies: {
          lib: 'lib/index.js',
          foo: 'foo/index.js'
        }
      },
      'lib/index.js': {
        file: 'libModule',
        ast: acorn.parse('require("foo")'),
        dependencies: {
          foo: 'foo/index.js'
        }
      },
      'foo/index.js': {
        file: 'foo/index.js',
        ast: acorn.parse('console.log("foo")'),
        dependencies: {}
      }
    }
  }

  var result = link(graph)
  t.deepEqual(result.entry, [0])
  t.equal(result.include.length, 3)

  var entry = result.include[0]
  t.equal(entry.file, 'entry')
  t.equal(entry.id, 0)
  t.equal(escodegen.generate(entry.ast), '__require__(2);\n__require__(1);')

  var foo = result.include[1]
  t.equal(foo.file, 'foo/index.js')
  t.equal(foo.id, 1)
  t.equal(escodegen.generate(foo.ast), 'console.log(\'foo\');')

  var lib = result.include[2]
  t.equal(lib.file, 'lib/index.js')
  t.equal(lib.id, 2)
  t.equal(escodegen.generate(lib.ast), '__require__(1);')

  t.end()
})
