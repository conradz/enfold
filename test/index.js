var enfold = require('../')
var vm = require('vm')
var path = require('path')
var test = require('tap').test

test('bundle react', function (t) {
  var entry = path.join(__dirname, 'fixtures', 'react.js')
  enfold([entry], done)

  function done (err, code) {
    t.error(err)

    var result
    vm.runInNewContext(code, {
      console: {
        log: function (value) { result = value }
      }
    })

    t.equal(result, '<div>test content</div>')
    t.end()
  }
})
