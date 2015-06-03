var Enfold = require('../lib/Enfold')
var mockParse = require('./mockParse')
var path = require('path')
var vm = require('vm')
var test = require('tap').test

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
