var path = require('path')
var resolve = require('../lib/resolve')
var test = require('tap').test

test('resolve index.js from module', function (t) {
  var parent = path.join(__dirname, 'fixtures', 'a.js')
  resolve({ id: 'a', parent: parent }, resolved)

  function resolved (err, file) {
    t.error(err)
    t.equal(file, path.join(__dirname, 'fixtures', 'node_modules', 'a', 'index.js'))
    t.end()
  }
})

test('resolve index.js from module with node target', function (t) {
  var parent = path.join(__dirname, 'fixtures', 'a.js')
  resolve({ id: 'a', parent: parent, target: 'node' }, resolved)

  function resolved (err, file) {
    t.error(err)
    t.equal(file, path.join(__dirname, 'fixtures', 'node_modules', 'a', 'index.js'))
    t.end()
  }
})

test('process single file alias', function (t) {
  var parent = path.join(__dirname, 'fixtures', 'a.js')
  var alias = { myLib: path.join(__dirname, 'fixtures', 'b.js') }
  resolve({ id: 'myLib', parent: parent, alias: alias }, resolved)

  function resolved (err, file) {
    t.error(err)
    t.equal(file, path.join(__dirname, 'fixtures', 'b.js'))
    t.end()
  }
})

test('process directory alias', function (t) {
  var parent = path.join(__dirname, 'fixtures', 'a.js')
  var alias = { myLib: path.join(__dirname, 'fixtures', 'lib') }
  resolve({ id: 'myLib/hello', parent: parent, alias: alias }, resolved)

  function resolved (err, file) {
    t.error(err)
    t.equal(file, path.join(__dirname, 'fixtures', 'lib', 'hello.js'))
    t.end()
  }
})

test('use browser field in package.json by default', function (t) {
  var parent = path.join(__dirname, 'fixtures', 'a.js')
  resolve({ id: 'browser', parent: parent }, resolved)

  function resolved (err, file) {
    t.error(err)
    t.equal(file, path.join(__dirname, 'fixtures', 'node_modules', 'browser', 'browser.js'))
    t.end()
  }
})

test('use main field in package.json when target is node', function (t) {
  var parent = path.join(__dirname, 'fixtures', 'a.js')
  resolve({ id: 'browser', parent: parent, target: 'node' }, resolved)

  function resolved (err, file) {
    t.error(err)
    t.equal(file, path.join(__dirname, 'fixtures', 'node_modules', 'browser', 'node.js'))
    t.end()
  }
})
