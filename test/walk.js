var walk = require('../lib/walk')
var Enfold = require('../lib/Enfold')
var test = require('tap').test
var path = require('path')

test('find all required files', function (t) {
  var entry = path.join(__dirname, 'fixtures', 'a.js')
  var aModule = path.join(__dirname, 'fixtures', 'node_modules', 'a', 'index.js')
  var enfold = new Enfold()
  walk([entry], enfold, done)

  function done (err, result) {
    t.error(err)
    t.deepEqual(result.entry, [entry])
    t.ok(result.include.hasOwnProperty(entry))
    t.ok(result.include.hasOwnProperty(aModule))

    var item = result.include[entry]
    t.ok(item.ast)
    t.equal(item.file, entry)
    t.deepEqual(item.dependencies, { 'a': aModule })
    t.end()
  }
})

test('duplicated requires', function (t) {
  var entry = path.join(__dirname, 'fixtures', 'ab.js')
  var aModule = path.join(__dirname, 'fixtures', 'node_modules', 'a', 'index.js')
  var bModule = path.join(__dirname, 'fixtures', 'node_modules', 'b', 'index.js')
  var enfold = new Enfold()
  walk([entry], enfold, done)

  function done (err, result) {
    t.error(err)

    var e = result.include[entry]
    t.equal(e.file, entry)
    t.deepEqual(e.dependencies, { a: aModule, b: bModule })

    var a = result.include[aModule]
    t.equal(a.file, aModule)
    t.deepEqual(a.dependencies, {})

    var b = result.include[bModule]
    t.equal(b.file, bModule)
    t.deepEqual(b.dependencies, { a: aModule })

    t.end()
  }
})
