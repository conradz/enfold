var enfold = require('../')
var vm = require('vm')
var path = require('path')
var test = require('tap').test

integration('react.js', '<div>test content</div>')
integration('circular.js', 'circular dependency')
integration('relative.js', 'relative require')
integration('buffer.js', 'buffer test')
integration('process.js', 'function')
integration('filename.js',
  path.join(__dirname, 'fixtures') + '\n' +
  path.join(__dirname, 'fixtures', 'filename.js'))

function integration (file, expected) {
  test('integration ' + file, function (t) {
    enfold([path.join(__dirname, 'fixtures', file)], done)

    function done (err, code) {
      t.error(err)
      var results = []
      vm.runInNewContext(code, {
        console: {
          log: function (value) { results.push(value) }
        }
      })

      t.equal(results.join('\n'), expected)
      t.end()
    }
  })
}
