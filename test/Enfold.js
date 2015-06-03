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
  runPack([entry], bundle, done)

  function done (err, result) {
    t.error(err)
    t.equal(result, 'test')
    t.end()
  }
})

test('invalidate file', function (t) {
  var parse = mockParse()
  var entry = path.join(__dirname, 'entry.js')
  parse.set(entry, 'console.log("foo")')

  var bundle = new Enfold({ parse: parse })
  runPack([entry], bundle, first)

  function first (err, result) {
    t.error(err)
    t.equal(result, 'foo')

    parse.set(entry, 'console.log("bar")')
    bundle.invalidate(entry)
    runPack([entry], bundle, second)
  }

  function second (err, result) {
    t.error(err)
    t.equal(result, 'bar')
    t.end()
  }
})

test('invalidate with different dependencies', function (t) {
  var parse = mockParse()
  var entry = path.join(fixtures, 'entry.js')
  parse.set(entry, 'console.log(require("./foo"))')
  parse.set(path.join(fixtures, 'foo.js'), 'module.exports = "foo"')
  parse.set(path.join(fixtures, 'bar.js'), 'module.exports = "bar"')

  var bundle = new Enfold({ parse: parse })
  runPack([entry], bundle, first)

  function first (err, result) {
    t.error(err)
    t.equal(result, 'foo')

    parse.set(entry, 'console.log(require("./bar"))')
    bundle.invalidate(entry)
    runPack([entry], bundle, second)
  }

  function second (err, result) {
    t.error(err)
    t.equal(result, 'bar')
    t.end()
  }
})

test('invalid non-entry dependency', function (t) {
  var parse = mockParse()
  var entry = path.join(fixtures, 'entry.js')
  var a = path.join(fixtures, 'a.js')
  parse.set(entry, 'console.log(require("./a"))')
  parse.set(a, 'module.exports = "a"')

  var bundle = new Enfold({ parse: parse })
  runPack([entry], bundle, first)

  function first (err, result) {
    t.error(err)
    t.equal(result, 'a')
    parse.set(a, 'module.exports = "b"')
    bundle.invalidate(a)
    runPack([entry], bundle, second)
  }

  function second (err, result) {
    t.error(err)
    t.equal(result, 'b')
    t.end()
  }
})

test('invalidate removed file', function (t) {
  var parse = mockParse()
  var entry = path.join(fixtures, 'entry.js')
  var a = path.join(fixtures, 'a.js')
  parse.set(entry, 'console.log(require("./a"))')
  parse.set(a, 'module.exports = "a"')

  var bundle = new Enfold({ parse: parse })
  runPack([entry], bundle, first)

  function first (err, result) {
    t.error(err)
    t.equal(result, 'a')
    parse.remove(a)
    bundle.invalidate(a)

    runPack([entry], bundle, second)
  }

  function second (err) {
    t.ok(err)
    t.end()
  }
})

function runPack (entry, bundle, cb) {
  bundle.pack(entry, packed)

  function packed (err, result) {
    if (err) {
      return cb(err)
    }

    var results = []
    try {
      vm.runInNewContext(result, {
        console: {
          log: function (value) { results.push(value) }
        }
      })
    } catch (e) {
      return cb(e)
    }

    return cb(null, results.join('\n'))
  }
}
