var Enfold = require('../lib/Enfold')
var mockParse = require('./mockParse')
var path = require('path')
var vm = require('vm')
var test = require('tap').test

var fixtures = path.join(__dirname, 'fixtures')

test('single entry', function (t) {
  var parse = mockParse()
  var entry = path.join(__dirname, 'entry.js')
  parse.set(entry, 'console.log("test")')

  var bundle = new Enfold({ parse: parse })
  var result = runPack([entry], bundle)
  t.equal(result, 'test')
  t.end()
})

test('invalidate file', function (t) {
  var parse = mockParse()
  var entry = path.join(__dirname, 'entry.js')
  parse.set(entry, 'console.log("foo")')

  var bundle = new Enfold({ parse: parse })
  var result = runPack([entry], bundle)
  t.equal(result, 'foo')

  parse.set(entry, 'console.log("bar")')
  bundle.invalidate(entry)

  result = runPack([entry], bundle)
  t.equal(result, 'bar')
  t.end()
})

test('invalidate with different dependencies', function (t) {
  var parse = mockParse()
  var entry = path.join(fixtures, 'entry.js')
  parse.set(entry, 'console.log(require("./foo"))')
  parse.set(path.join(fixtures, 'foo.js'), 'module.exports = "foo"')
  parse.set(path.join(fixtures, 'bar.js'), 'module.exports = "bar"')

  var bundle = new Enfold({ parse: parse })
  var result = runPack([entry], bundle)
  t.equal(result, 'foo')

  parse.set(entry, 'console.log(require("./bar"))')
  bundle.invalidate(entry)

  result = runPack([entry], bundle)
  t.equal(result, 'bar')
  t.end()
})

test('invalid non-entry dependency', function (t) {
  var parse = mockParse()
  var entry = path.join(fixtures, 'entry.js')
  var a = path.join(fixtures, 'a.js')
  parse.set(entry, 'console.log(require("./a"))')
  parse.set(a, 'module.exports = "a"')

  var bundle = new Enfold({ parse: parse })
  var result = runPack([entry], bundle)
  t.equal(result, 'a')

  parse.set(a, 'module.exports = "b"')
  bundle.invalidate(a)

  result = runPack([entry], bundle)
  t.equal(result, 'b')
  t.end()
})

test('invalidate removed file', function (t) {
  var parse = mockParse()
  var entry = path.join(fixtures, 'entry.js')
  var a = path.join(fixtures, 'a.js')
  parse.set(entry, 'console.log(require("./a"))')
  parse.set(a, 'module.exports = "a"')

  var bundle = new Enfold({ parse: parse })
  var result = runPack([entry], bundle)
  t.equal(result, 'a')

  parse.remove(a)
  bundle.invalidate(a)

  t.throws(function () { runPack([entry], bundle) })
  t.end()
})

function runPack (entry, bundle) {
  var code = bundle.pack(entry).code
  var results = []
  vm.runInNewContext(code, {
    console: {
      log: function (value) { results.push(value) }
    }
  })

  return results.join('\n')
}
